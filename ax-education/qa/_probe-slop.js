/* slop · 면 · 어포던스 검사

   화면에 인쇄되는 글자만 본다. <style> 과 <script> 의 내용은 화면에 나오지 않으므로
   검사 대상에서 뺀다. 이것을 빼지 않으면 CSS 주석의 "누르면" 같은 말이 오탐으로 잡힌다.

   면과 커서의 관계는 한 방향이다 (디자인시스템 · 어포던스 공통 규칙).
   "누를 수 있으면 흰 면이거나 파란 버튼이다" 는 성립하고, 그 역은 성립하지 않는다.
   그래서 흰 면인데 pointer 가 아닌 것을 세지 않는다. 규격이 그런 것을 셋이나 허용한다
   (도구 재현 화면의 껍데기, 입력창, 이미 붙어 조작 대상이 아닌 자료 카드).
   재는 방향은 반대다. pointer 인 것이 전부 흰 면이거나 파란 버튼 위에 있는가를 본다.

   면 없이 pointer 를 갖는 것은 규격이 이름을 대어 허용한 다섯뿐이다.
     .bub / [data-tie]  서로를 가리키는 조작이 걸린 말풍선 (교차 강조)
     .lg                그 짝인 범례
     .pick              가리킬 수 있는 낱말. 면 대신 --blue-hl 밑줄을 단다
     .fn                각주가 달린 줄. 보이는 표시는 위첨자뿐이다
     .item--flat        고르기 목록. 고른 하나만 흰 면을 얻고 나머지는 배경 위의 글줄이다
*/
(function () {
  const stage = document.getElementById('stage');

  // 인쇄 글자만 뽑는다
  const clone = stage.cloneNode(true);
  clone.querySelectorAll('style, script').forEach(function (n) { n.remove(); });
  const text = clone.textContent;

  const banned = ['누르면', '클릭', '마우스를 올리', '눌러 보', '예시입니다', '설명을 위해', '실제와 다를 수 있'];
  const hits = banned.filter(function (w) { return text.indexOf(w) >= 0; });
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text);
  const emdash = text.indexOf('—') >= 0;

  const k = stage.getBoundingClientRect().width / 1920;

  const WHITE = 'rgb(255, 255, 255)';
  // 파란 버튼 면. 기본 --blue-accent, hover --blue-mark, 잠김과 소진 --blue-line
  const BTN = ['rgb(3, 97, 228)', 'rgb(20, 40, 160)', 'rgb(207, 217, 229)'];

  // 규격이 이름을 대어 면 없이 pointer 를 허용한 것들
  const FREE = ['bub', 'lg', 'pick', 'fn', 'item--flat'];
  function isFree(el) {
    if (el.hasAttribute && el.hasAttribute('data-tie')) return true;
    return FREE.some(function (c) { return el.classList.contains(c); });
  }
  // 흰 면이거나 파란 버튼 위에 있는가. 반투명 흰 면(--surface-hover, 파란 말풍선 안 카드)도 흰 면이다
  function onSurface(el) {
    let p = el;
    while (p && p !== stage) {
      const bg = getComputedStyle(p).backgroundColor;
      if (bg === WHITE) return true;
      if (bg.indexOf('rgba(255, 255, 255') === 0 && bg.indexOf(', 0)') < 0) return true;
      if (BTN.indexOf(bg) >= 0) return true;
      p = p.parentElement;
    }
    return false;
  }
  // 누를 수 있는 항목 안에 들어 있는가
  function insidePressable(el) {
    let p = el.parentElement;
    while (p && p !== stage) {
      if (getComputedStyle(p).cursor === 'pointer') return true;
      p = p.parentElement;
    }
    return false;
  }

  const badPointer = [], badSunken = [], shadows = [], hits72 = [], btns = [];
  stage.querySelectorAll('.slide *').forEach(function (el) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const r = el.getBoundingClientRect();
    if (cs.cursor === 'pointer' && r.width > 0 && r.height > 0) {
      // 안쪽 요소는 부모에게서 커서를 물려받은 것이라 한 번만 센다
      if (!insidePressable(el) && !isFree(el) && !onSurface(el)) {
        badPointer.push(String(el.className).slice(0, 34));
      }
    }
    if (bg === 'rgb(215, 221, 232)' && cs.cursor === 'pointer') {
      // 서로를 가리키는 조작이 걸린 말풍선은 우물 면 그대로 pointer 를 얻는다
      const own = el.classList.contains('blocked') || el.classList.contains('outrow');
      const tie = el.classList.contains('bub') || el.hasAttribute('data-tie');
      if (!own && !tie && !insidePressable(el)) badSunken.push(String(el.className).slice(0, 34));
    }
    const sh = cs.boxShadow;
    if (sh && sh !== 'none') {
      const blur = (sh.match(/(-?\d+(?:\.\d+)?)px/g) || []).map(Number);
      if (blur.length >= 3 && Math.abs(blur[2]) > 4 && sh.indexOf('inset') < 0) shadows.push(sh.slice(0, 40));
    }
    if (el.classList.contains('item') && r.height > 0 && r.height / k < 71.5) {
      hits72.push([String(el.className).slice(0, 24), Math.round(r.height / k)]);
    }
    if (el.classList.contains('btn')) {
      btns.push([el.textContent.trim(), Math.round(r.height / k), Math.round(r.width / k)]);
    }
  });
  return JSON.stringify({
    bannedWords: hits, emoji: emoji, emdash: emdash,
    pointerWithoutSurface: badPointer, sunkenWithPointer: badSunken,
    blurryShadows: shadows, itemsUnder72: hits72,
    buttons: btns
  }, null, 1);
})();
