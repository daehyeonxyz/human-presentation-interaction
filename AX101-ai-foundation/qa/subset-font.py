#!/usr/bin/env python3
"""Pretendard 가변 서체를 이 덱의 글자로 서브셋한다.

    pip install fonttools brotli
    python3 qa/extract-glyphs.py
    python3 qa/subset-font.py <PretendardVariable.woff2 또는 .ttf 경로>

가변 축(wght 45~920)을 유지한다. 인스턴스로 굳히면 500 과 700 과 800 이 한 굵기가 된다.
결과는 assets/webfonts/PretendardVariable-subset.woff2 에 쓴다.
원본 Pretendard 는 SIL OFL 이고 https://github.com/orioncactus/pretendard 에서 받는다.
"""
import sys, pathlib, subprocess

root = pathlib.Path(__file__).resolve().parent.parent
glyphs = root / "assets" / "webfonts" / "glyphs.txt"
out = root / "assets" / "webfonts" / "PretendardVariable-subset.woff2"

if len(sys.argv) < 2:
    sys.exit("usage: subset-font.py <PretendardVariable.woff2|ttf>")
src = pathlib.Path(sys.argv[1])
if not glyphs.exists():
    sys.exit("glyphs.txt 가 없다. 먼저 qa/extract-glyphs.py 를 돌린다")

cmd = [
    sys.executable, "-m", "fontTools.subset", str(src),
    f"--text-file={glyphs}",
    "--flavor=woff2",
    "--layout-features=*",
    "--no-hinting",
    "--desubroutinize",
    "--name-IDs=*",
    "--notdef-outline",
    f"--output-file={out}",
]
subprocess.run(cmd, check=True)
print(f"wrote {out} ({out.stat().st_size // 1024} KB)")
