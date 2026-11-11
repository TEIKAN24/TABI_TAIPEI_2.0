/* TABI TAIPEI v2.0.43 — 01 旅支度 / 注意事項, as settled in Figma (1-1 更新案).
 * Presentation only; the notes stay native <details> and js/figma-travel-notes-v236.js keeps
 * animating them.
 *  - an intro line (v2.0.46: the group labels 滞在 / 移動・お金 are gone)
 *  - each title gets its number (01–07, grey) and, while closed, a one-line gist
 *  - inside, the key sentence is set in gold (wrapped in place, the text is unchanged)
 * Gists and key sentences are excerpts of each note's own text; a note whose title or text
 * changes simply goes without them. */
(() => {
  'use strict';
  const pane = document.getElementById('tt2-notes-pane');
  const list = pane?.querySelector('.tt2-note-list');
  if (!list || list.dataset.tt2n) return;
  list.dataset.tt2n = '1';
  const NOTES = {
    '宿泊先のアメニティ事情': ['2025年から使い捨てアメニティは置かれていません', '歯ブラシ・くし・カミソリなどは、フロントで頼めばもらえます（無料または有料）。'],
    'トイレの紙事情': ['紙を流せる場所と、ゴミ箱に捨てる場所があります', '水に流せるティッシュがあると安心です。'],
    '水道水': ['そのまま飲むのは避けましょう', '飲み水はコンビニなどで買えるボトル入りの水がいちばん安心です。'],
    'コンセント・電圧': ['日本と同じA型、電圧は110V。変換プラグは不要です', 'スマホやPCの充電器はそのまま使えます。'],
    '交通・移動': ['MRTは改札内と車内で飲食禁止。水やガムもNG', 'MRT（地下鉄）は改札内の黄色い線から先と車内で飲食禁止。水やガムもNGです。'],
    'お金・支払い・交通系IC': ['夜市やローカル店は現金のみの店も多い', '夜市やローカル店は現金のみの店も多いので、少額の現金を持っておくと安心。'],
    'レシートは宝くじ': ['2か月に1回抽選、最高賞金はNT$1,000万', '2か月に1回抽選があり、最高賞金はNT$1,000万。']
  };
  const el = (tag, cls, text) => { const n = document.createElement(tag); n.className = cls; if (text) n.textContent = text; return n; };
  const notes = [...list.querySelectorAll(':scope > .tt2-note')];
  list.before(el('p', 'tt2n-intro', `旅行前に知っておきたい ${notes.length}項目`));
  // v2.0.44: the bottom fade is a sticky strip at the end of the pane (no mask while animating).
  pane.append(el('div', 'tt2n-fade'));
  notes.forEach((note, i) => {
    const summary = note.querySelector(':scope > .tt2-note-summary');
    const title = summary?.querySelector('.tt2-note-title');
    if (!summary || !title) return;
    const [gist, key] = NOTES[title.textContent.trim()] || [];
    summary.prepend(el('span', 'tt2n-num', String(i + 1).padStart(2, '0')));
    const text = el('span', 'tt2n-text');
    title.replaceWith(text);
    text.append(title);
    if (gist) text.append(el('span', 'tt2n-gist', gist));
    if (!key) return;
    for (const p of note.querySelectorAll('.tt2-note-copy')) {
      const node = [...p.childNodes].find(n => n.nodeType === 3 && n.nodeValue.includes(key));
      if (!node) continue;
      const at = node.nodeValue.indexOf(key);
      const rest = node.splitText(at);
      rest.splitText(key.length);
      const mark = el('span', 'tt2n-key');
      rest.replaceWith(mark);
      mark.append(rest);
      break;
    }
  });
})();
