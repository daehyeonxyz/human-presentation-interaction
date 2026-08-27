#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Pretendard Variable 을 이 덱이 실제로 쓰는 글자로 서브셋한다.

  python qa/subset-font.py

- 원본은 assets/webfonts/PretendardVariable.woff2 다. 없으면 레포 안의 다른 사본을
  찾고 그것도 없으면 jsDelivr 에서 받아 캐시한다.
- deliverables/*.html 의 모든 글자를 모아 그 글자만 남긴다. 원고가 바뀌면 다시 실행한다.
- 가변 축(wght 45~920)을 유지한다. 인스턴스로 굳히면 500 과 700 과 800 이 한 굵기가 된다.
- 결과는 assets/webfonts/PretendardVariable-subset.woff2 다.
  qa/inline-assets.mjs 가 이 파일을 base64 로 HTML 에 넣는다.

이 덱은 삼성 브랜드 자산을 쓰지 않는다. 라틴 전용 서체를 따로 두지 않으므로 서브셋도 하나다.
"""

import io
import os
import re
import sys
import shutil
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
REPO = os.path.dirname(os.path.dirname(ROOT))
FONTS = os.path.join(ROOT, "assets", "webfonts")
SRC = os.path.join(FONTS, "PretendardVariable.woff2")
OUT = os.path.join(FONTS, "PretendardVariable-subset.woff2")
URL = ("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9"
       "/packages/pretendard/dist/web/variable/woff2/PretendardVariable.woff2")
LOCAL = os.path.join(REPO, "ax-education", "assets", "webfonts", "PretendardVariable.woff2")

# 항상 담는 글자. 원고에 지금 없어도 손대는 순간 필요해지는 것들이다.
ALWAYS = (
    "".join(chr(c) for c in range(0x20, 0x7F))
    + "…·—–‘’“”※→←↑↓°％±×÷≤≥≠"
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
        # 이미 인라인된 base64 블록은 글자가 아니다. 서브셋 대상에서 뺀다.
        text = re.sub(r"data:[^)\"']{200,}", " ", text)
        chars |= set(text)
    return {c for c in chars if ord(c) > 0x1F}


def fetch_source():
    if os.path.exists(SRC):
        return
    os.makedirs(FONTS, exist_ok=True)
    if os.path.exists(LOCAL):
        sys.stdout.write("레포 안 사본을 쓴다  %s\n" % LOCAL)
        shutil.copyfile(LOCAL, SRC)
        return
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


if __name__ == "__main__":
    main()
