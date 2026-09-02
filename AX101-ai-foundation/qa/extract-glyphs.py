#!/usr/bin/env python3
"""AX101-index.md 의 [text] 블록에서 화면에 인쇄될 글자를 전부 모아 glyphs.txt 를 만든다.

원고의 글자만 서브셋에 넣으면 서체 파일이 작아진다. 원고가 바뀌면 다시 돌린다.

    python3 qa/extract-glyphs.py            # AX101-index.md -> assets/webfonts/glyphs.txt

대본(> 인용)은 화면에 오르지 않으므로 넣지 않는다. 다만 발표 중 즉흥으로 화면에 글자를
띄울 일은 없으므로 이것으로 충분하다. 안전 여유로 한글 완성형 자주 쓰는 글자와
숫자·기호·라틴 전부를 함께 넣는다.
"""
import re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
src = root / "AX101-index.md"
out = root / "assets" / "webfonts" / "glyphs.txt"

text = src.read_text(encoding="utf-8")
chars = set()

# [text] 다음에 오는 ```plain text ... ``` 블록과 표(| ... |) 안의 글자를 모은다
for block in re.findall(r"```plain text\n(.*?)```", text, flags=re.S):
    chars.update(block)
for line in text.splitlines():
    if line.startswith("|"):
        chars.update(line)

# 덱 원본이 있으면 화면 글자를 그대로 더한다 (JS 문자열 포함)
for extra in [root / "qa" / "build" / "body.html", root / "qa" / "build" / "deck.js"]:
    if extra.exists():
        chars.update(extra.read_text(encoding="utf-8"))

# 화면 공통 글자: 숫자, 라틴, 문장 부호, 단위, 화살표
chars.update("0123456789")
chars.update("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
chars.update(" .,:;!?()[]{}<>/\\-–—_+=*&%#@\"'`~^|·•→←↔×÷°℃₩$")
chars.update("만천억원회번곳벌군데분초시간일월년")

# 발표자가 즉석에서 넣을 수 있는 자주 쓰는 한글 음절 안전 여유
common = "가각간감갑강같개거건걸검것게격견결경계고곡공과관광교구국군굴권귀규균그극근글금급기긴길김까깨꼭끝나난날남낮내너널넘네년노논놓누눈뉴는능니다단달담답당대더덕던데도독돈돌동두둘뒤드득든들등디따딱때또뜻라락란람래랑러런럼레려력련령로록론료루류률르름리린립마막만많말맛망매맥맨머먹메며면명몇모목못무문물뭐미민및바박반받발밝방배백버번벌범법베변별병보복본볼봄부분불브비빈빠뿐사산살삼상새색생서석선설성세센셋소속손솔송수순술숫쉬스습승시식신실심십싱싸쓰씨아안알암앞애액야약양어언얼업없엇에여역연열염엽영예오온올옷와완왕외요욕용우운울움웃워원월위유율으은을음응의이익인일읽임입있잊자작잔잘잠잡장재저적전절점접정제조족존종좋좌주준줄중즉증지직진질집짧쪽차착찬찰참창찾책처천철첫청체초총최추출충취측층치친칠침카캐컨케코콘큰클키타태택터테토통투트특틀티파판팔패퍼페편평포표품풀풍프플피필하학한할함합항해핵행향허현형호혹혼홀화확환활황회획효후훈휘흐흔흘힘"
chars.update(common)

chars.discard("\n")
out.write_text("".join(sorted(chars)), encoding="utf-8")
print(f"{len(chars)} glyphs -> {out}")
