#!/usr/bin/env python3
"""
세로 공지 포스터 조립기.

content.json 을 읽어 1920 폭 세로 포스터 HTML 한 장을 만든다.
그림은 HTML 안에 넣고 서체는 웹 서체(Google Fonts, jsDelivr)로 불러오므로 파일 하나로 열린다.
제목 폭, 띠 개수, 그림 경로 같은 규칙을 검사해 어긴 곳이 있으면 목록을 출력하고 종료 코드 1을 낸다.

사용법 (Windows 는 python, macOS·Linux 는 python3):
  python scripts/build.py content.json out.html
  python scripts/build.py content.json out.html --css extra.css   # 서체 경로를 덧씌울 때

글자 서식 (모든 문장 칸에 쓴다):
  **굵게**   *강조색*   {마감일 배지}   [[아직 정하지 않은 값]]   줄바꿈은 \\n
"""
import base64
import html
import json
import re
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
WIDTH = 1760  # 1920 에서 좌우 여백 80 을 뺀 폭

FONTS = (
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@600;800&display=block">\n'
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">'
)

ICONS = '''<svg width="0" height="0" style="position:absolute">
  <symbol id="i-up" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M6 11l6-6 6 6"/></symbol>
  <symbol id="i-folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
  <symbol id="i-file" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></symbol>
  <symbol id="i-claude" viewBox="0 0 100 100"><path fill="#D97757" stroke="#D97757" stroke-width="2.4" stroke-linejoin="round" d="M50.02 42.85 L31.06 9.11 L28.45 9.47 L26.69 11.43 L44.06 46.02Z M54.22 44.23 L58.21 9.35 L55.88 8.18 L53.31 8.66 L47.53 43.29Z M56.54 47.11 L78.27 17.84 L76.85 15.64 L74.37 14.79 L51.22 42.96Z M57.03 51.26 L88.43 40.12 L88.42 37.52 L86.90 35.41 L54.95 44.84Z M55.91 54.02 L93.60 57.07 L94.74 54.70 L94.12 52.15 L56.62 47.30Z M53.55 56.20 L79.22 71.18 L81.14 69.46 L81.84 66.98 L57.13 50.48Z M50.48 57.13 L69.36 85.66 L71.89 85.03 L73.56 83.03 L56.20 53.55Z M45.78 55.77 L41.47 92.88 L43.80 94.09 L46.38 93.57 L52.47 56.71Z M43.68 53.34 L26.31 80.70 L27.93 82.73 L30.41 83.47 L49.28 57.11Z M42.86 49.73 L11.30 66.12 L11.63 68.71 L13.47 70.57 L45.82 55.80Z M43.82 46.41 L6.01 45.99 L5.05 48.43 L5.84 50.93 L43.59 53.15Z M46.45 43.80 L18.87 27.63 L16.91 29.33 L16.25 31.83 L42.87 49.52Z"/><circle cx="50" cy="50" r="10" fill="#D97757"/></symbol>
</svg>'''

# 시상대 그림(assets/podium.png, 1760x820)에서 블록 윗면 가운데의 좌표
PODIUM_TOPS = {1: (880, 111), 2: (442, 262), 3: (1313, 350)}

errors, warnings = [], []
BASE = Path(".")


# ---------- 글자 ----------
def em_width(s):
    """글자 폭 어림값(글자 크기 배수). Hahmlet 800 굵기 제목을 재서 맞춘 값이다."""
    w = 0.0
    for ch in str(s):
        o = ord(ch)
        if o >= 0x1F000 or 0x2600 <= o <= 0x27BF:
            w += 1.0
        elif 0xAC00 <= o <= 0xD7A3:
            w += 0.885
        elif ch == " ":
            w += 0.22
        else:
            w += 0.6
    return w


EMOJI = re.compile("([\U0001F000-\U0001FAFF☀-➿⬀-⯿]️?)")


def fmt(s):
    """문장 칸의 서식을 HTML 로 바꾼다."""
    if s is None:
        return ""
    t = html.escape(str(s), quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)
    t = re.sub(r"\*(.+?)\*", r"<em>\1</em>", t)
    t = re.sub(r"\[\[(.+?)\]\]", r'<span class="tbd">\1</span>', t)
    t = re.sub(r"\{(.+?)\}", r'<span class="due">\1</span>', t)
    t = EMOJI.sub(r'<span class="em">\1</span>', t)
    return t.replace("\n", "<br>")


def plain(s):
    return re.sub(r"[*{}\[\]]", "", str(s or ""))


def check_lines(where, s, size, limit=WIDTH):
    for line in plain(s).split("\n"):
        if em_width(line) * size > limit:
            errors.append(f"{where}: 한 줄이 {em_width(line) * size:.0f}px 로 {limit}px 를 넘음 ({line})")


def icon(i):
    return f'<svg><use href="#{i}"/></svg>'


# ---------- 그림 ----------
def img_size(data):
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return struct.unpack(">II", data[16:24])
    if data[:2] == b"\xff\xd8":
        i = 2
        while i < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            m = data[i + 1]
            if m in (0xC0, 0xC1, 0xC2):
                h, w = struct.unpack(">HH", data[i + 5:i + 9])
                return w, h
            i += 2 + struct.unpack(">H", data[i + 2:i + 4])[0]
    return None


def load_img(path, where):
    p = (BASE / path) if not str(path).startswith("asset:") else ROOT / "assets" / str(path)[6:]
    if not p.exists():
        errors.append(f"{where}: 그림 파일이 없음 ({path})")
        return "", (1, 1)
    data = p.read_bytes()
    mime = "image/png" if p.suffix.lower() == ".png" else "image/jpeg" if p.suffix.lower() in (".jpg", ".jpeg") else "image/" + p.suffix.lower()[1:]
    return f"data:{mime};base64," + base64.b64encode(data).decode(), img_size(data) or (1, 1)


# ---------- 블록 ----------
def b_text(b, where):
    check_lines(where, b.get("text", ""), 32)
    return f'<p class="para">{fmt(b.get("text"))}</p>'


def b_subhead(b, where):
    return f'<div class="h2">{fmt(b.get("text"))}</div>'


def b_facts(b, where):
    items = b.get("items", [])
    if b.get("style") == "card":
        rows = "".join(f"<dt>{fmt(k)}</dt><dd>{fmt(v)}</dd>" for k, v in items)
        note = f'<p>{fmt(b["note"])}</p>' if b.get("note") else ""
        return f'<div class="factcard"><dl>{rows}</dl>{note}</div>'
    if len(items) % 2:
        warnings.append(f"{where}: 개요 칸이 홀수({len(items)})라 마지막 줄이 한 칸만 찬다")
    return '<div class="facts">' + "".join(f'<div><div class="l">{fmt(k)}</div><div>{fmt(v)}</div></div>' for k, v in items) + "</div>"


def tiles(groups):
    cols = len(groups)
    out = f'<div class="tiles" style="grid-template-columns:repeat({cols},1fr)">'
    for g in groups:
        tone = g.get("tone", "ink")
        out += f'<div class="t-{tone}"><div class="tl">{fmt(g.get("label"))}</div>' + "".join(f'<div class="ti">{fmt(x)}</div>' for x in g.get("items", [])) + "</div>"
    return out + "</div>"


def b_cards(b, where):
    items = b.get("items", [])
    cols = b.get("cols", len(items) if len(items) <= 4 else 3)
    if cols not in (2, 3, 4):
        errors.append(f"{where}: cols 는 2, 3, 4 중 하나 ({cols})")
        cols = 3
    out = f'<div class="cards c{cols}">'
    for i, c in enumerate(items):
        head = ""
        if c.get("title") or c.get("accent"):
            ac = f'<span class="ac">{fmt(c["accent"])}</span>' if c.get("accent") else ""
            rt = f'<span class="rt">{fmt(c["right"])}</span>' if c.get("right") else ""
            head = f'<div class="ct">{ac}{fmt(c.get("title"))}{rt}</div>'
        body = f'<div class="tx">{fmt(c["text"])}</div>' if c.get("text") else ""
        tl = tiles(c["tiles"]) if c.get("tiles") else ""
        chips = '<div class="chips">' + "".join(f"<span>{fmt(x)}</span>" for x in c["chips"]) + "</div>" if c.get("chips") else ""
        msg = f'<p class="msg">{fmt(c["msg"])}</p>' if c.get("msg") else ""
        out += f'<div class="card">{head}{body}{tl}{chips}{msg}</div>'
    return out + "</div>"


def flow_part(p):
    if "caption" in p:
        return f'<div class="sc">{fmt(p["caption"])}</div>'
    if "table" in p:
        t = p["table"]
        n = len(t["head"])
        cells = "".join(f'<span class="hd">{fmt(h)}</span>' for h in t["head"])
        cells += "".join(f"<span>{fmt(c)}</span>" for r in t["rows"] for c in r)
        cols = t.get("cols", " ".join(["1fr"] + ["1.5fr"] * (n - 1)))
        return f'<div class="sheet" style="grid-template-columns:{cols}">{cells}</div>'
    if "rows" in p:
        out = '<div class="rows">'
        for i, r in enumerate(p["rows"], 1):
            if isinstance(r, dict):
                sub = f'<span class="sub">{fmt(r["sub"])}</span>' if r.get("sub") else ""
                out += f'<span><span>{fmt(r.get("text"))}{sub}</span></span>'
            else:
                num = f"<i>{i}</i>" if p.get("numbered", True) else ""
                out += f"<span>{num}{fmt(r)}</span>"
        return out + "</div>"
    return ""


def b_flow(b, where):
    items = b.get("items", [])
    if not 2 <= len(items) <= 4:
        errors.append(f"{where}: 단계는 2~4개 ({len(items)}개)")
    cols = " 72px ".join(["1fr"] * len(items))
    out = f'<div class="flow" style="grid-template-columns:{cols}">'
    for i, st in enumerate(items, 1):
        if i > 1:
            out += f'<div class="arr"><span>{icon("i-arrow")}</span></div>'
        check_lines(f"{where}.items[{i - 1}].text", st.get("text", ""), 26, 480 if len(items) == 3 else 760)
        parts = "".join(flow_part(p) for p in st.get("parts", []))
        out += (f'<div class="fp"><div class="fh"><span class="no">{i}</span>{fmt(st.get("title"))}</div>'
                f'<p>{fmt(st.get("text"))}</p><div class="fv">{parts}</div></div>')
    return out + "</div>"


def b_stats(b, where):
    items = b.get("items", [])
    out = f'<div class="stats" style="grid-template-columns:repeat({len(items)},1fr)">'
    for s in items:
        rows = "".join(f'<div class="sr"><span class="lb">{fmt(r[0])}</span><span class="nm">{fmt(r[1])}<small>{fmt(r[2] if len(r) > 2 else "")}</small></span></div>' for r in s.get("rows", []))
        out += f'<div><div class="sn">{fmt(s.get("name"))}</div>{rows}</div>'
    return out + "</div>"


BANDS = [0]


def b_band(b, where):
    BANDS[0] += 1
    check_lines(f"{where}.title", b.get("title", ""), 56, 1600)
    sub = f'<div class="lead">{fmt(b["text"])}</div>' if b.get("text") else ""
    return f'<div class="band"><div class="bt">{fmt(b.get("title"))}</div>{sub}</div>'


def b_stack(b, where):
    imgs = b.get("images", [])
    if not imgs:
        errors.append(f"{where}: images 가 비어 있음")
        return ""
    w = b.get("width", 820 if len(imgs) <= 2 else 660)
    n = len(imgs)
    side = n * w + (n - 1) * 40 <= WIDTH
    dx = b.get("dx", w + 40 if side else (WIDTH - w) / max(n - 1, 1))
    dy = b.get("dy", 140 if side else 70)
    left0 = (1920 - (w + dx * (n - 1))) / 2
    out = ""
    if b.get("label"):
        out += f'<div class="stack-label">{fmt(b["label"])}</div>'
    tags, heights = "", []
    for i, path in enumerate(imgs):
        src, (iw, ih) = load_img(path, f"{where}.images[{i}]")
        heights.append(w * ih / iw + dy * i)
        tags += f'<img src="{src}" alt="" style="left:{left0 + dx * i:.0f}px;top:{20 + dy * i}px;width:{w}px;z-index:{n - i}">'
    height = b.get("height", int(min(max(heights) * 0.7, 1680)))
    return out + f'<div class="stack" style="height:{height}px">{tags}</div>'


def b_files(b, where):
    def fi(path):
        return "i-folder" if path.endswith("/") else "i-file"
    rows = "".join(f'<div class="fi">{icon(fi(p))}<code>{html.escape(p)}</code><span>{fmt(r)}</span></div>' for p, r in b.get("items", []))
    return f'<div class="fcard"><div class="fn">{icon("i-folder")}{html.escape(b.get("name", ""))}</div>{rows}</div>'


def chat_msg(m):
    done = " done" if m.get("done") else ""
    chip = f'<span class="chip">{icon("i-file")}{html.escape(m["attach"])}</span><br>' if m.get("attach") else ""
    text = re.sub(r"(^|\s)(/[A-Za-z0-9_-]+)", r'\1<span class="skc">\2</span>', fmt(m.get("text")))
    if m.get("role") == "user":
        return f'<div class="u{done}">{chip}{text}</div>'
    trow = f'<div class="trow"><b>{html.escape(m["skill"])}</b> 스킬 사용{icon("i-chev")}</div>' if m.get("skill") else ""
    file = f'<div class="file">{icon("i-file")}<b>{html.escape(m["file"])}</b></div>' if m.get("file") else ""
    return f'<div class="a{done}"><svg class="av"><use href="#i-claude"/></svg>{trow}{text}{file}</div>'


def b_chat(b, where):
    if not b.get("model"):
        errors.append(f"{where}: model 이 비어 있음. 이 요청을 실제로 쓸 때 고르는 모델 이름을 넣는다")
    msgs = "".join(chat_msg(m) for m in b.get("messages", []))
    inp = b.get("input", {})
    hot = " hot" if inp.get("hot") else ""
    chip = f'<span class="chip">{icon("i-file")}{html.escape(inp["attach"])}</span>' if inp.get("attach") else ""
    body = f'<div class="typed">{fmt(inp["text"])}<i></i></div>' if inp.get("text") else '<div class="ph">Claude에게 메시지 보내기</div>'
    row = (f'<div class="row"><span class="plus">{icon("i-plus")}</span><span class="model">{html.escape(b.get("model", ""))} {icon("i-chev")}</span>'
           f'<span class="send">{icon("i-up")}</span></div>')
    h = b.get("height", 620)
    title = f'<div class="h2">{fmt(b["title"])}</div>' if b.get("title") else ""
    return f'{title}<div class="k" style="height:{h}px"><div class="k-msgs">{msgs}</div><div class="k-in{hot}">{chip}{body}{row}</div></div>'


def b_chats(b, where):
    cols = "".join(f'<div class="col">{b_chat(c, f"{where}.items[{i}]")}</div>' for i, c in enumerate(b.get("items", [])))
    return f'<div class="split">{cols}</div>'


def b_html(b, where):
    return b.get("html", "")


BLOCKS = {"text": b_text, "subhead": b_subhead, "facts": b_facts, "cards": b_cards, "flow": b_flow, "stats": b_stats,
          "band": b_band, "stack": b_stack, "files": b_files, "chat": b_chat, "chats": b_chats, "html": b_html}


def blocks(lst, where):
    out = ""
    for i, b in enumerate(lst or []):
        fn = BLOCKS.get(b.get("type"))
        if not fn:
            errors.append(f"{where}[{i}]: 모르는 블록 종류 ({b.get('type')})")
            continue
        out += fn(b, f"{where}[{i}]({b.get('type')})")
    return out


# ---------- 머리와 장 ----------
def hero(d):
    out = '<div class="head">'
    if d.get("label"):
        out += f'<div class="label">{fmt(d["label"])}</div>'
    hl = d.get("headline", "")
    if not hl:
        errors.append("headline: 비어 있음")
    # 제목은 한 줄이다. 96px 에서 넘치면 84px 까지 줄이고, 그래도 넘치면 더 짧은 제목을 쓰게 한다
    size = min(96, int(WIDTH / max(em_width(plain(hl)), 1)))
    if size < 84:
        errors.append(f"headline: 84px 로 줄여도 한 줄에 들어가지 않음. 더 짧은 제목을 쓴다 ({plain(hl)})")
    style = f' style="font-size:{size}px;line-height:{size + 16}px"' if size < 96 else ""
    out += f'<div class="decl"{style}>{fmt(hl)}</div>'
    if d.get("intro"):
        check_lines("intro", d["intro"], 44)
        out += f'<div class="intro">{fmt(d["intro"])}</div>'
    out += "</div>"
    hv = d.get("hero") or {}
    if hv.get("type") == "podium":
        places = hv.get("places", [])
        has_rank = any(p.get("rank_label") for p in places)
        top = 140 if has_rank else 80
        src, _ = load_img("asset:podium.png", "hero.podium")
        out += f'<div class="podium" style="height:{top + 720}px"><img src="{src}" alt="" style="top:{top}px">'
        for p in places:
            r = p.get("rank")
            if r not in PODIUM_TOPS:
                errors.append(f"hero.places: rank 는 1, 2, 3 ({r})")
                continue
            x, y = PODIUM_TOPS[r]
            rk = f'<div class="rk">{fmt(p["rank_label"])}</div>' if p.get("rank_label") else ""
            unit = f'<small>{fmt(p["unit"])}</small>' if p.get("unit") else ""
            out += f'<div class="pl p{r}" style="left:{x}px;top:{y + top}px">{rk}<div class="mn">{fmt(p.get("main"))}{unit}</div></div>'
        out += "</div>"
    elif hv.get("type") == "stack":
        out += b_stack(hv, "hero")
    elif hv.get("type") == "image":
        src, (iw, ih) = load_img(hv.get("src", ""), "hero.image")
        out += f'<img src="{src}" alt="" style="width:{WIDTH}px;border-radius:var(--r-card)">'
    if d.get("hero_lead"):
        check_lines("hero_lead", d["hero_lead"], 48)
        out += f'<div class="hero-lead">{fmt(d["hero_lead"])}</div>'
    if d.get("facts"):
        out += b_facts({"items": d["facts"]}, "facts")
    out += blocks(d.get("hero_blocks"), "hero_blocks")
    return f'<section class="s hero">{out}</section>'


def section_head(s, no):
    num = f'<span class="no">{no}.</span> ' if no else ""
    lead = ""
    if s.get("lead"):
        check_lines("lead", s["lead"], 32)
        lead = f'<div class="lead">{fmt(s["lead"])}</div>'
    return f'<div class="head"><div class="h">{num}{fmt(s.get("title"))}</div>{lead}</div>'


def section(s, i, numbered):
    no = i + 1 if numbered else None
    if s.get("split"):
        cols = ""
        for j, c in enumerate(s["split"]):
            n = no + j if no else None
            cols += f'<div class="col">{section_head(c, n)}{blocks(c.get("blocks"), f"sections[{i}].split[{j}]")}</div>'
        return f'<section class="s"><div class="split">{cols}</div></section>', len(s["split"])
    return f'<section class="s">{section_head(s, no)}{blocks(s.get("blocks"), f"sections[{i}]")}</section>', 1


def build(d):
    numbered = d.get("numbered", True)
    body = hero(d)
    k = 0
    for i, s in enumerate(d.get("sections", [])):
        html_s, used = section(s, k, numbered)
        body += html_s
        k += used
    if d.get("foot"):
        body = body[: body.rfind("</section>")] + f'<div class="foot">{fmt(d["foot"])}</div></section>'
    if BANDS[0] > 1:
        errors.append(f"band: 띠가 {BANDS[0]}개. 한 장에 한 번만 쓴다")
    css = (ROOT / "assets" / "poster.css").read_text(encoding="utf-8")
    return (f'<!doctype html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n<title>{html.escape(d.get("title") or plain(d.get("headline")))}</title>\n'
            f'{FONTS}\n<style>\n{css}\nem {{ font-style: normal; color: var(--acc); }}\n/*__EXTRA_CSS__*/\n</style>\n</head>\n<body>\n{ICONS}\n'
            f'<div id="poster">\n{body}\n</div>\n</body>\n</html>\n')


def main():
    global BASE
    args = sys.argv[1:]
    if len(args) < 2:
        print(__doc__)
        sys.exit(2)
    src, out = Path(args[0]), Path(args[1])
    BASE = src.resolve().parent
    d = json.loads(src.read_text(encoding="utf-8"))
    page = build(d)
    if "--css" in args:
        extra = Path(args[args.index("--css") + 1]).read_text(encoding="utf-8")
        page = page.replace("/*__EXTRA_CSS__*/", extra)
    tbd = page.count('class="tbd"')
    if tbd:
        warnings.append(f"아직 정하지 않은 값 [[...]] 이 {tbd}곳 있다. 보내기 전에 채운다")
    for w in warnings:
        print("  주의:", w)
    if errors:
        print("고칠 곳이 있습니다.")
        for e in errors:
            print("  -", e)
        sys.exit(1)
    out.write_text(page, encoding="utf-8")
    print("OK ", out)


if __name__ == "__main__":
    main()
