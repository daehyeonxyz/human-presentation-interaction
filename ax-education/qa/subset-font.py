#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Pretendard Variable 을 이 덱이 실제로 쓰는 글자로 서브셋한다.

  python qa/subset-font.py

- 원본은 assets/webfonts/PretendardVariable.woff2 다. 없으면 jsDelivr 에서 받아 캐시한다.
- deliverables/*.html 의 모든 글자를 모아 그 글자만 남긴다. 원고가 바뀌면 다시 실행한다.
- 가변 축(wght 45~920)을 유지한다. 인스턴스로 굳히면 500 과 700 과 800 이 한 굵기가 된다.
- 결과는 assets/webfonts/PretendardVariable-subset.woff2 다.
  qa/inline-assets.mjs 가 이 파일을 base64 로 HTML 에 넣는다.
"""

import io
import os
import re
import sys
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FONTS = os.path.join(ROOT, "assets", "webfonts")
SRC = os.path.join(FONTS, "PretendardVariable.woff2")
OUT = os.path.join(FONTS, "PretendardVariable-subset.woff2")
URL = ("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9"
       "/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2")

# 항상 담는 글자. 원고에 지금 없어도 손대는 순간 필요해지는 것들이다.
ALWAYS = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "…·—–‘’“”※→←↑↓°％±×÷≤≥≠"
    + "¹²³⁴⁵⁶⁷⁸⁹⁰"
    + "가나다라마바사아자차카타파하"
)


def deck_chars():
    chars = set(ALWAYS)
    deliv = os.path.join(ROOT, "deliverables")
    for name in sorted(os.listdir(deliv)):
        if not name.endswith(".html"):
            continue
        with io.open(os.path.join(deliv, name), encoding="utf-8") as f:
            text = f.read()
        # base64 블록은 글자가 아니다. 서브셋 대상에서 뺀다.
        text = re.sub(r"data:[^)\"']{200,}", " ", text)
        chars |= set(text)
    return {c for c in chars if ord(c) > 0x1F}


def fetch_source():
    if os.path.exists(SRC):
        return
    os.makedirs(FONTS, exist_ok=True)
    sys.stdout.write("원본 내려받는 중\n")
    with urllib.request.urlopen(URL) as r, open(SRC, "wb") as f:
        f.write(r.read())


def run(src, out, chars):
    from fontTools import subset

    subset.main([
        src,
        "--output-file=" + out,
        "--flavor=woff2",
        "--unicodes=" + ",".join("U+%04X" % ord(c) for c in sorted(chars)),
        "--layout-features=kern,liga,calt,ccmp,locl",
        "--no-hinting",
        "--desubroutinize",
        "--drop-tables+=DSIG",
        "--name-IDs=1,2,3,4,5,6",
    ])
    sys.stdout.write("  %s  %.0f KB -> %.0f KB\n" % (
        os.path.basename(out),
        os.path.getsize(src) / 1024.0, os.path.getsize(out) / 1024.0))


def main():
    fetch_source()
    chars = deck_chars()
    hangul = sum(1 for c in chars if 0xAC00 <= ord(c) <= 0xD7A3)
    sys.stdout.write("덱이 쓰는 글자 %d 자 (한글 %d 자)\n" % (len(chars), hangul))

    run(SRC, OUT, chars)

    # SamsungSharpSans 는 영문 전용 서체다. --font-display 자리에는 한글을 넣지 않으므로
    # 라틴과 숫자와 부호만 남긴다. 세 굵기 모두 tokens.css 가 선언하므로 셋 다 만든다.
    latin = {c for c in chars if ord(c) < 0x2E80}
    for weight in ("Regular", "Medium", "Bold"):
        src = os.path.join(FONTS, "SamsungSharpSans-%s.woff2" % weight)
        if not os.path.exists(src):
            continue
        run(src, os.path.join(FONTS, "SamsungSharpSans-%s-subset.woff2" % weight), latin)


if __name__ == "__main__":
    main()
