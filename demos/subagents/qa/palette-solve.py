#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""이 덱의 팔레트를 실물 토큰과 검증된 밝기 사다리에서 되푼다.

  python qa/palette-solve.py

- 색상(hue)의 출처는 Stripe 토큰이다.
  ~/projects/daehyeon-design/references/brand-tokens/stripe/tokens.css 의 실측값
  --accent #533afd, --accent-hover #4434d4, --accent-active #2e2b8c 를 그대로 쓴다.
- 밝기(상대 휘도)의 출처는 ax-education 1교시 덱이다. 프로젝터 워시 모사로 통과한
  면 세 층과 데이터 다섯 단과 글자 네 단의 상대 휘도를 목표값으로 삼는다.
- 두 출처를 겹쳐서 "Stripe 색상 + 검증된 밝기" 로 이 덱의 값을 푼다.
  손으로 적은 색은 하나도 없고 전부 이 스크립트가 낸 값이다.

출력을 tokens.css 에 옮긴다. 값을 바꾸려면 목표 휘도를 바꾸고 다시 돌린다.
"""

import sys


def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb):
    r, g, b = (srgb_to_linear(v) for v in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return "#%02X%02X%02X" % tuple(int(round(v)) for v in rgb)


def mix(a, b, t):
    return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))


def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def solve(base, toward, target_y, cast=None, cast_t=0.0):
    """base 에서 toward 로 섞어 목표 휘도를 맞추는 색을 이분법으로 찾는다.
    cast 가 있으면 섞은 결과에 그 색을 cast_t 만큼 더 섞어 색조를 준다."""
    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        c = mix(base, toward, mid)
        if cast is not None:
            c = mix(c, cast, cast_t)
        y = luminance(c)
        if (luminance(base) > luminance(toward)) == (y > target_y):
            lo = mid
        else:
            hi = mid
    c = mix(base, toward, (lo + hi) / 2)
    if cast is not None:
        c = mix(c, cast, cast_t)
    return tuple(int(round(v)) for v in c)


WHITE = (255, 255, 255)
BLACK = (0, 0, 0)

# Stripe 실측 (references/brand-tokens/stripe/tokens.css)
ACCENT = hex_to_rgb("#533afd")
ACCENT_HOVER = hex_to_rgb("#4434d4")
ACCENT_DEEP = hex_to_rgb("#2e2b8c")

# ax-education 1교시 실측. 이 값들의 상대 휘도가 목표다
REF = {
    "canvas": "#E5E9F1",
    "sunken": "#D7DDE8",
    "divider": "#CBD3E0",
    "divider-strong": "#AEB9CB",
    "line": "#CFD9E5",
    "tint": "#DCE8FB",
    "hl": "#C1D8F8",
    "data-3": "#3A8FFF",
    "data-4": "#89BCFF",
    "ink-support": "#5B5B5B",
    "ink-meta": "#737373",
    "ink-muted": "#B2B2B2",
    "canvas-dark": "#020820",
}

INK_CAST = 0.10   # 글자 사다리에 넣는 보랏빛. 면과 같은 색 계열로 묶는다
SURF_CAST = 1.00  # 면은 흰색에서 --accent-deep 쪽으로만 섞는다


def main():
    out = []
    sys.stdout.write("기준 휘도 (ax-education 1교시 실측)\n")
    for name, hx in REF.items():
        sys.stdout.write("  %-14s %s  Y=%.4f\n" % (name, hx, luminance(hex_to_rgb(hx))))

    sys.stdout.write("\n푼 값\n")

    def emit(name, rgb, note=""):
        out.append((name, rgb_to_hex(rgb)))
        sys.stdout.write("  %-14s %s  Y=%.4f  %s\n"
                         % (name, rgb_to_hex(rgb), luminance(rgb), note))

    # 면 세 층. 흰색에서 --accent-deep 쪽으로 섞어 목표 휘도를 맞춘다
    surface = WHITE
    canvas = solve(WHITE, ACCENT_DEEP, luminance(hex_to_rgb(REF["canvas"])))
    sunken = solve(WHITE, ACCENT_DEEP, luminance(hex_to_rgb(REF["sunken"])))
    emit("surface", surface)
    emit("canvas", canvas)
    emit("sunken", sunken)
    # 표지의 어두운 캔버스. 검정에서 --accent-deep 쪽으로 섞는다
    emit("canvas-dark", solve(BLACK, ACCENT_DEEP,
                              luminance(hex_to_rgb(REF["canvas-dark"]))))

    divider = solve(WHITE, ACCENT_DEEP, luminance(hex_to_rgb(REF["divider"])))
    divider_s = solve(WHITE, ACCENT_DEEP, luminance(hex_to_rgb(REF["divider-strong"])))
    emit("divider", divider)
    emit("divider-strong", divider_s)

    # 강조 층. 색상은 Stripe 실측을 그대로 두고 파생 두 가지만 푼다
    emit("accent", ACCENT, "Stripe --accent 실측")
    emit("accent-hover", ACCENT_HOVER, "Stripe --accent-hover 실측")
    emit("accent-deep", ACCENT_DEEP, "Stripe --accent-active 실측")
    line = solve(WHITE, ACCENT, luminance(hex_to_rgb(REF["line"])))
    tint = solve(WHITE, ACCENT, luminance(hex_to_rgb(REF["tint"])))
    hl = solve(WHITE, ACCENT, luminance(hex_to_rgb(REF["hl"])))
    emit("accent-line", line)
    emit("accent-tint", tint)
    emit("accent-hl", hl)

    # 데이터 다섯 단. 1 과 2 는 Stripe 실측이고 3~5 는 밝기만 맞춰 푼다
    d3 = solve(ACCENT, WHITE, luminance(hex_to_rgb(REF["data-3"])))
    d4 = solve(ACCENT, WHITE, luminance(hex_to_rgb(REF["data-4"])))
    emit("data-1", ACCENT_DEEP)
    emit("data-2", ACCENT)
    emit("data-3", d3)
    emit("data-4", d4)
    emit("data-5", line)

    # 글자 사다리. 검정에서 흰색으로 가는 중립 사다리에 보랏빛을 10% 만 넣는다
    emit("ink", BLACK)
    for key in ("ink-support", "ink-meta", "ink-muted"):
        emit(key, solve(BLACK, WHITE, luminance(hex_to_rgb(REF[key])),
                        cast=ACCENT_DEEP, cast_t=INK_CAST))

    d = dict((n, hex_to_rgb(h)) for n, h in out)
    sys.stdout.write("\n대비 (WCAG)\n")
    pairs = [
        ("ink / canvas", "ink", "canvas"),
        ("ink / surface", "ink", "surface"),
        ("ink / sunken", "ink", "sunken"),
        ("ink-support / canvas", "ink-support", "canvas"),
        ("ink-support / surface", "ink-support", "surface"),
        ("ink-meta / canvas", "ink-meta", "canvas"),
        ("accent / canvas", "accent", "canvas"),
        ("accent / surface", "accent", "surface"),
        ("accent / accent-tint", "accent", "accent-tint"),
        ("surface / data-1", "surface", "data-1"),
        ("surface / data-2", "surface", "data-2"),
        ("ink / data-4", "ink", "data-4"),
        ("ink / data-5", "ink", "data-5"),
    ]
    for label, a, b in pairs:
        sys.stdout.write("  %-24s %.2f:1\n" % (label, contrast(d[a], d[b])))

    sys.stdout.write("\n면 층 사이 휘도 차\n")
    sys.stdout.write("  surface - canvas  %.4f\n" % (luminance(d["surface"]) - luminance(d["canvas"])))
    sys.stdout.write("  canvas  - sunken  %.4f\n" % (luminance(d["canvas"]) - luminance(d["sunken"])))

    sys.stdout.write("\ntokens.css 에 옮길 줄\n")
    for name, hx in out:
        sys.stdout.write("  --%s: %s;\n" % (name, hx))


if __name__ == "__main__":
    main()
