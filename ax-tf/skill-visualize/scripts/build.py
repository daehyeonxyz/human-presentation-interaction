#!/usr/bin/env python3
"""
스킬 설명서 조립기.

content.json 을 assets/template.html 에 넣어 1920x1080 설명서 HTML 한 장을 만든다.
칸마다 글자 수 상한을 검사하고, 넘치는 칸이 있으면 목록을 출력하고 종료 코드 1을 낸다.
글자 수는 한글 1자를 1로, 영문·숫자·공백을 0.5로 센다.

사용법 (Windows 는 python, macOS·Linux 는 python3):
  python scripts/build.py content.json out.html
  python scripts/build.py content.json out.html --css extra.css   # 폰트 등을 덧씌울 때
"""
import base64
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 칸 이름: (최대 개수, 항목당 최대 길이)
LIMITS = {
    "title": (None, 12),
    "when": (3, 26),
    "does_lead": (None, 34),
    "does.t": (4, 14),
    "does.d": (4, 32),
    "files.path": (4, 22),
    "files.role": (4, 10),
    "chat": (6, None),
    "chat.text": (None, 70),
    "chat.list": (4, 34),
    "preview.lines": (9, 48),
}


def width(s):
    w = 0.0
    for ch in str(s):
        w += 1.0 if ord(ch) > 0x2E7F else 0.5
    return w


def check(d):
    errs = []

    def one(key, val, where):
        lim = LIMITS[key][1]
        if lim and width(val) > lim:
            errs.append(f"{where}: {width(val):.1f} > {lim}  ({val})")

    def many(key, arr, where):
        cap = LIMITS[key][0]
        if cap and len(arr) > cap:
            errs.append(f"{where}: 항목 {len(arr)}개 > {cap}개")

    for k in ("name", "title"):
        if not d.get(k):
            errs.append(f"{k}: 비어 있음")
    one("title", d.get("title", ""), "title")

    many("when", d.get("when", []), "when")
    for i, w in enumerate(d.get("when", [])):
        one("when", w, f"when[{i}]")

    one("does_lead", d.get("does_lead", ""), "does_lead")
    many("does.t", d.get("does", []), "does")
    for i, x in enumerate(d.get("does", [])):
        one("does.t", x.get("t", ""), f"does[{i}].t")
        one("does.d", x.get("d", ""), f"does[{i}].d")

    # 왼쪽 열 높이 실측: 첫 줄 + 항목 + 파일 줄이 8을 넘으면 파일 카드가 잘린다
    rows = (1 if d.get("does_lead") else 0) + len(d.get("does", [])) + len(d.get("files", []))
    if rows > 8:
        errs.append(f"왼쪽 열: 첫 줄·항목·파일 줄 합 {rows} > 8. 항목이나 파일 줄을 줄이거나 묶는다")
    many("files.path", d.get("files", []), "files")
    for i, f in enumerate(d.get("files", [])):
        one("files.path", f.get("path", ""), f"files[{i}].path")
        one("files.role", f.get("role", ""), f"files[{i}].role")

    chat = d.get("chat", [])
    many("chat", chat, "chat")
    if chat and chat[0].get("role") != "user":
        errs.append("chat[0]: 첫 메시지는 user 여야 함")
    previews = 0
    for i, m in enumerate(chat):
        if m.get("role") not in ("user", "assistant"):
            errs.append(f"chat[{i}].role: user 또는 assistant 만 가능")
        one("chat.text", m.get("text", ""), f"chat[{i}].text")
        many("chat.list", m.get("list", []), f"chat[{i}].list")
        if len(m.get("md", [])) > 10:
            errs.append(f"chat[{i}].md: {len(m['md'])}줄 > 10줄")
        for j, l in enumerate(m.get("md", [])):
            one("chat.list", l, f"chat[{i}].md[{j}]")
        for j, l in enumerate(m.get("list", [])):
            one("chat.list", l, f"chat[{i}].list[{j}]")
        if m.get("preview"):
            previews += 1
            if m.get("role") != "assistant":
                errs.append(f"chat[{i}].preview: assistant 메시지에만 넣을 수 있음")
            if not m["preview"].get("lines") and not m["preview"].get("image"):
                errs.append(f"chat[{i}].preview: lines 나 image 중 하나가 필요함")
            lines = m["preview"].get("lines", [])
            # md 는 frontmatter 구분선과 제목 줄이 들어가 줄 수를 넉넉히 준다
            cap = 13 if m["preview"].get("style") == "md" else LIMITS["preview.lines"][0]
            if len(lines) > cap:
                errs.append(f"chat[{i}].preview.lines: 항목 {len(lines)}개 > {cap}개")
            for j, l in enumerate(lines):
                one("preview.lines", l, f"chat[{i}].preview.lines[{j}]")
    if previews > 1:
        errs.append("preview: 한 장에 하나만 가능")
    # 미리보기가 있으면 채팅창 높이가 빠듯하다. 실측 기준으로 메시지 5개, 목록 3줄까지만 들어간다
    if previews and len(chat) > 5:
        errs.append(f"chat: 미리보기가 있을 때는 메시지 5개까지 ({len(chat)}개)")
    if previews and any(len(m.get("list", [])) > 3 for m in chat):
        errs.append("chat.list: 미리보기가 있을 때는 목록 3줄까지")
    return errs


def embed_images(d, base):
    """preview.image 가 로컬 파일이면 data URI 로 바꿔 HTML 한 파일로 열리게 한다."""
    for m in d.get("chat", []):
        pv = m.get("preview") or {}
        img = pv.get("image")
        if not img or img.startswith(("data:", "http://", "https://")):
            continue
        path = (base / img) if not Path(img).is_absolute() else Path(img)
        if not path.exists():
            print(f"이미지 파일이 없습니다: {path}")
            sys.exit(1)
        mime = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp"}.get(path.suffix.lower(), "image/png")
        pv["image"] = f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def main():
    args = sys.argv[1:]
    if len(args) < 2:
        print(__doc__)
        sys.exit(2)
    src, out = Path(args[0]), Path(args[1])
    extra = ""
    if "--css" in args:
        extra = Path(args[args.index("--css") + 1]).read_text(encoding="utf-8")

    data = json.loads(src.read_text(encoding="utf-8"))
    embed_images(data, src.parent)
    errs = check(data)
    if errs:
        print("넘치는 칸이 있습니다. 문장을 줄인 뒤 다시 실행하세요.")
        for e in errs:
            print("  -", e)
        sys.exit(1)

    html = (ROOT / "assets" / "template.html").read_text(encoding="utf-8")
    payload = json.dumps(data, ensure_ascii=False).replace("</", "<\\/")
    html = html.replace("/*__DATA__*/", payload).replace("/*__EXTRA_CSS__*/", extra)
    out.write_text(html, encoding="utf-8")
    print(f"OK  {out}")


if __name__ == "__main__":
    main()
