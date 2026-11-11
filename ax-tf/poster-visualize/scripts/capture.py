#!/usr/bin/env python3
"""
포스터 HTML 을 1920 폭 PNG 로 캡처하고, 제목이나 칸이 넘친 곳을 찾는다.

Python playwright 가 있으면 그것을 쓰고, 없으면 Node 의 playwright 를 찾는다.
둘 다 없으면 캡처하지 않고 안내만 출력한다. 그때는 HTML 을 브라우저로 열어 전체 화면 캡처를 쓴다.

사용법:
  python scripts/capture.py out.html out.png
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

CHECK_JS = """() => {
  const bad = [];
  document.querySelectorAll('.decl, .label, .h, .fh, .sn, .tl, .stats .nm, .sheet span').forEach(e => {
    if (e.scrollWidth > e.clientWidth + 1) bad.push((e.className || e.tagName) + ': ' + e.textContent.trim().slice(0, 30));
  });
  const p = document.getElementById('poster');
  return { height: p.offsetHeight, overflow: bad };
}"""


def with_python(src, out):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={"width": 1920, "height": 1200})
        pg.goto(Path(src).resolve().as_uri())
        pg.evaluate("async () => { await document.fonts.ready; }")
        pg.wait_for_timeout(1500)
        info = pg.evaluate(CHECK_JS)
        pg.locator("#poster").screenshot(path=out)
        b.close()
        return info


def with_node(src, out):
    node = shutil.which("node")
    if not node:
        raise RuntimeError("node 없음")
    root = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True, shell=sys.platform == "win32").stdout.strip()
    js = f"""
const {{ chromium }} = require({json.dumps(str(Path(root) / 'playwright'))});
(async () => {{
  const b = await chromium.launch(); const p = await b.newPage({{ viewport: {{ width: 1920, height: 1200 }} }});
  await p.goto({json.dumps(Path(src).resolve().as_uri())});
  await p.evaluate(async () => {{ await document.fonts.ready; }}); await p.waitForTimeout(1500);
  const info = await p.evaluate({CHECK_JS});
  await p.locator('#poster').screenshot({{ path: {json.dumps(str(Path(out).resolve()))} }});
  console.log(JSON.stringify(info)); await b.close();
}})();"""
    r = subprocess.run([node, "-e", js], capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(r.stderr.strip()[-300:])
    return json.loads(r.stdout.strip().splitlines()[-1])


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(2)
    src, out = sys.argv[1], sys.argv[2]
    info = None
    for fn in (with_python, with_node):
        try:
            info = fn(src, out)
            break
        except Exception as e:  # 다음 방법으로 넘어간다
            last = e
    if info is None:
        print("캡처하지 못했습니다. playwright 가 없습니다 (" + str(last)[:120] + ").")
        print("HTML 을 브라우저로 열어 전체 화면 캡처를 쓰세요.")
        sys.exit(1)
    print(f"OK  {out}  (1920 x {info['height']})")
    for b in info["overflow"]:
        print("  넘침:", b)
    sys.exit(1 if info["overflow"] else 0)


if __name__ == "__main__":
    main()
