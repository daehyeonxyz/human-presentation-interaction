#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""이 덱의 팔레트를 실물 토큰과 검증된 밝기 사다리에서 되푼다.

  python qa/palette-solve.py

- 색상(hue)의 출처는 OpenAI 토큰이다.
  ~/projects/daehyeon-design/references/brand-tokens/openai/tokens.css 의 실측값
  --accent #10a37f 하나에서 OKLCh 색상각과 채도 사용률을 뽑는다.
- 밝기(상대 휘도)의 출처는 검증 덱 1호다. demos/subagents/tokens.css 의 값은
  ax-education 1교시 덱의 프로젝터 워시 모사를 통과한 사다리를 그대로 물려받았다.
- 두 출처를 겹쳐서 "OpenAI 색상각 + 통과한 밝기" 로 이 덱의 값을 푼다.
  1호가 Stripe 세 값을 그대로 쓸 수 있었던 것은 그 세 값의 휘도가 이미 목표와 맞아서다.
  OpenAI 청록은 #10a37f 의 휘도가 0.278 이라 강조색 자리에 그대로 쓰면
  캔버스 대비가 2.6:1 로 떨어진다. 그래서 색상각만 남기고 밝기를 옮긴다.
- 밝기를 옮길 때 색상각이 흔들리지 않도록 OKLCh 에서 푼다. 채도는 자리마다
  1호의 그 자리가 자기 밝기에서 쓸 수 있는 최대 채도의 몇 퍼센트를 썼는지를
  그대로 물려받고 sRGB 색역 밖으로 나가면 잘라 낸다. 색역 사용률을 한 값으로
  묶으면 청록이 밝은 쪽에서 쓸 수 있는 채도가 보라보다 훨씬 넓어서
  트랙 면과 배지 면이 형광 민트가 된다.
- 면 세 층과 글자 사다리는 1호와 같은 섞기로 낸다. 이 값들은 색이 아니라
  밝기 계단이고 색조는 강조색에서 조금만 물려받는다.

출력을 tokens.css 에 옮긴다. 값을 바꾸려면 목표 휘도를 바꾸고 다시 돌린다.
"""

import sys


# ===== sRGB =====

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def linear_to_srgb(c):
    c = 0.0 if c < 0 else (1.0 if c > 1 else c)
    v = c * 12.92 if c <= 0.0031308 else 1.055 * (c ** (1 / 2.4)) - 0.055
    return v * 255.0


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


# ===== OKLab · OKLCh (Bjorn Ottosson) =====

def linear_to_oklab(r, g, b):
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l_, m_, s_ = [v ** (1 / 3.0) if v >= 0 else -((-v) ** (1 / 3.0)) for v in (l, m, s)]
    return (
        0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
        1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
        0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
    )


def oklab_to_linear(L, a, b):
    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3
    return (
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
    )


def rgb_to_oklch(rgb):
    import math
    L, a, b = linear_to_oklab(*[srgb_to_linear(v) for v in rgb])
    C = math.hypot(a, b)
    h = math.degrees(math.atan2(b, a)) % 360.0
    return L, C, h


def oklch_to_linear(L, C, h):
    import math
    a = C * math.cos(math.radians(h))
    b = C * math.sin(math.radians(h))
    return oklab_to_linear(L, a, b)


def in_gamut(lin):
    return all(-1e-4 <= v <= 1 + 1e-4 for v in lin)


def oklch_to_rgb(L, C, h):
    lin = oklch_to_linear(L, C, h)
    return tuple(linear_to_srgb(v) for v in lin)


def max_chroma(L, h):
    """그 밝기와 색상각에서 sRGB 안에 남는 최대 채도."""
    lo, hi = 0.0, 0.5
    for _ in range(50):
        mid = (lo + hi) / 2
        if in_gamut(oklch_to_linear(L, mid, h)):
            lo = mid
        else:
            hi = mid
    return lo


def solve_hue_at_luminance(target_y, h, c_ref):
    """색상각 h 를 고정하고 목표 상대 휘도를 맞추는 색을 찾는다.
    채도는 기준 색의 OKLCh 채도를 그대로 물려받고 색역 밖이면 잘라 낸다."""
    def at(L):
        return oklch_to_rgb(L, min(c_ref, max_chroma(L, h)), h)

    lo, hi = 0.0, 1.0
    for _ in range(60):
        mid = (lo + hi) / 2
        if luminance(at(mid)) < target_y:
            lo = mid
        else:
            hi = mid
    return tuple(int(round(v)) for v in at((lo + hi) / 2))


def solve_mix(base, toward, target_y, cast=None, cast_t=0.0):
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

# OpenAI 실측 (references/brand-tokens/openai/tokens.css)
BRAND = hex_to_rgb("#10a37f")

# 검증 덱 1호 실측 (demos/subagents/tokens.css). 이 값들의 상대 휘도가 목표다
REF = {
    "canvas": "#E8E8F2",
    "sunken": "#DCDBEC",
    "canvas-dark": "#080819",
    "divider": "#D1D1E6",
    "divider-strong": "#B6B5D7",
    "accent": "#533AFD",
    "accent-hover": "#4434D4",
    "accent-deep": "#2E2B8C",
    "accent-line": "#D9D3FF",
    "accent-tint": "#E8E4FF",
    "accent-hl": "#D7D1FF",
    "data-3": "#8E7EFE",
    "data-4": "#BAB0FE",
    "ink-support": "#5A5A64",
    "ink-meta": "#73727C",
    "ink-muted": "#B2B1BB",
}

INK_CAST = 0.10   # 글자 사다리에 넣는 청록빛. 면과 같은 색 계열로 묶는다


def main():
    L0, C0, H0 = rgb_to_oklch(BRAND)

    sys.stdout.write("색상각 출처 (OpenAI --accent %s)\n" % rgb_to_hex(BRAND))
    sys.stdout.write("  OKLCh  L=%.4f  C=%.4f  h=%.2f\n" % (L0, C0, H0))
    sys.stdout.write("  상대 휘도 %.4f (강조색 목표 %.4f 보다 밝아 그대로 못 쓴다)\n\n"
                     % (luminance(BRAND), luminance(hex_to_rgb(REF["accent"]))))

    sys.stdout.write("기준 휘도와 채도 (검증 덱 1호 실측)\n")
    for name, hx in REF.items():
        rgb = hex_to_rgb(hx)
        sys.stdout.write("  %-16s %s  Y=%.4f  C=%.4f\n"
                         % (name, hx, luminance(rgb), rgb_to_oklch(rgb)[1]))

    sys.stdout.write("\n푼 값\n")
    out = []

    def emit(name, rgb, note=""):
        out.append((name, rgb_to_hex(rgb)))
        sys.stdout.write("  %-16s %s  Y=%.4f  %s\n"
                         % (name, rgb_to_hex(rgb), luminance(rgb), note))

    def target(key):
        return luminance(hex_to_rgb(REF[key]))

    def slot(key):
        """1호의 그 자리가 쓴 밝기와 OKLCh 채도를 그대로 물려받아 청록으로 푼다."""
        ref = hex_to_rgb(REF[key])
        return solve_hue_at_luminance(luminance(ref), H0, rgb_to_oklch(ref)[1])

    # 강조 층을 먼저 푼다. 면 세 층이 이 색으로 섞이므로 순서가 정해져 있다
    accent = slot("accent")
    accent_hover = slot("accent-hover")
    accent_deep = slot("accent-deep")

    # 면 세 층. 흰색에서 --accent-deep 쪽으로 섞어 목표 휘도를 맞춘다
    surface = WHITE
    canvas = solve_mix(WHITE, accent_deep, target("canvas"))
    sunken = solve_mix(WHITE, accent_deep, target("sunken"))
    emit("surface", surface)
    emit("canvas", canvas)
    emit("sunken", sunken)
    emit("canvas-dark", solve_mix(BLACK, accent_deep, target("canvas-dark")))
    emit("divider", solve_mix(WHITE, accent_deep, target("divider")))
    emit("divider-strong", solve_mix(WHITE, accent_deep, target("divider-strong")))

    emit("accent", accent, "OpenAI 색상각 · 1호 강조색 자리")
    emit("accent-hover", accent_hover, "OpenAI 색상각 · 1호 호버 자리")
    emit("accent-deep", accent_deep, "OpenAI 색상각 · 1호 최심단 자리")
    line = slot("accent-line")
    emit("accent-line", line)
    emit("accent-tint", slot("accent-tint"))
    emit("accent-hl", slot("accent-hl"))

    # 데이터 다섯 단. 1 과 2 는 강조 층을 그대로 쓰고 3~5 는 자리별로 푼다
    emit("data-1", accent_deep)
    emit("data-2", accent)
    emit("data-3", slot("data-3"))
    emit("data-4", slot("data-4"))
    emit("data-5", line)

    # 글자 사다리. 검정에서 흰색으로 가는 중립 사다리에 청록빛을 10% 만 넣는다
    emit("ink", BLACK)
    for key in ("ink-support", "ink-meta", "ink-muted"):
        emit(key, solve_mix(BLACK, WHITE, target(key), cast=accent_deep, cast_t=INK_CAST))

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
