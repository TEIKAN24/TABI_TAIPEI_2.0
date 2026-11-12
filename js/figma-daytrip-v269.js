/* TABI TAIPEI v2.0.69 — 遠出, Figma 「遠出 試作 D-4（写真＋紹介が主）」 九份 / 十分 / 基隆 / 野柳.
 * Under the destination tabs, one scrolling page per destination: the photo fading into the page
 * with the place name over its bottom, 見どころ / 食べ歩き as bubbles (十分 also its festival),
 * then 行き方: one row per way to go; a tap opens a small horizontal route and 「経路を見る」
 * (Google Maps). Every route detail (stops, fares, times, notes, map links) comes from
 * js/figma-daytrip-route-v225.js (window.tabiDaytrip), whose route stage stays in the page, hidden.
 * The intro words are the site's own (index.html taglines and 見どころ, data/sights.json,
 * food/nearby.json, data/events.js) as laid out by the user in Figma. */
(() => {
  'use strict';
  const section = document.querySelector('#guide .sights-day-trips');
  const api = window.tabiDaytrip;
  if (!section || !api) return;
  const destinations = [...section.querySelectorAll('.daytrip-destination-buttons > button')];
  if (destinations.length !== 4) return;

  // [mode, option] of the route in js/figma-daytrip-route-v225.js, and the row title
  const PAGES = [
    {ro: 'JIUFEN', name: '九份', photo: 'jiufen', tagline: '赤い提灯が灯る、山あいのレトロな街',
     sections: [{label: '見どころ', bubbles: ['赤い提灯の街並み', '九份水心月茶坊']},
                {label: '食べ歩き', bubbles: ['阿蘭草仔粿', '阿柑姨芋圓', '安迪藥燉排骨', 'hima cafe']}],
     ways: [{label: '台北市内から', rows: [[0, 0, '直通バス 965番'], [0, 1, '直通バス 1062番'], [1, 0, '台鉄 ＋ 路線バス'], [1, 1, '台鉄 ＋ タクシー']]},
            {label: '九份から十分へ', rows: [[2, 0, 'タクシー']]}]},
    {ro: 'SHIFEN', name: '十分', photo: 'shifen', tagline: '願いを込めて、天燈を空へ',
     sections: [{label: '見どころ', bubbles: ['ランタン上げ体験', '十分老街'],
                 event: {label: 'イベント・祭り', name: '平渓天燈祭 2027｜十分会場', sub: '2027.2.20 · 十分廣場'}},
                {label: '食べ歩き', bubbles: ['平溪街']}],
     ways: [{label: '台北市内から', rows: [[0, 0, '台鉄 ＋ 平渓線']]},
            {label: '十分から九份へ', rows: [[1, 0, 'タクシー']]}]},
    {ro: 'KEELUNG', name: '基隆', photo: 'keelung', tagline: '港町の夜景とローカルグルメ',
     sections: [{label: '見どころ', bubbles: ['基隆塔', '海洋広場', '彩色屋', '阿根納造船廠遺構']},
                {label: '市場・ローカルグルメ', bubbles: ['仁愛市場', '基隆廟口夜市', '三角窗麵攤', '正老牌咖哩麵', '天天鮮排骨飯']}],
     ways: [{label: '台北市内から', rows: [[0, 0, '台鉄']]}]},
    {ro: 'YEHLIU', name: '野柳', photo: 'yehliu', tagline: '海がつくり出した、不思議な奇岩群',
     sections: [{label: '見どころ', bubbles: ['野柳地質公園', '女王頭']}],
     ways: [{label: '台北市内から', rows: [[0, 0, '國光客運 1815番']]}]},
  ];
  // v2.0.70: each bubble opens its place on Google Maps — the site's own links (index.html 見どころ,
  // data/sights.json, food/nearby.json; a 見どころ tag uses its place's link). 平溪街 has none: a search.
  const MAPS = {
    "赤い提灯の街並み": "https://maps.app.goo.gl/SFfyAkZZEXnvVTHz6",
    "九份水心月茶坊": "https://www.google.com/maps/place/%E6%B0%B4%E5%BF%83%E6%9C%88%E8%8C%B6%E5%9D%8A/@25.1099702,121.8408406,15.23z/data=!4m6!3m5!1s0x345d453e35f7e561:0x6dda51c9bd244c7e!8m2!3d25.1086616!4d121.8429576!16s%2Fg%2F1txflwt_?entry=ttu&g_ep=EgoyMDI2MTAyOC4wIKXMDSoASAFQAw%3D%3D",
    "阿蘭草仔粿": "https://www.google.com/maps/place/%E9%98%BF%E8%98%AD%E8%8D%89%E4%BB%94%E7%B2%BF/@25.1086255,121.8429626,17.71z/data=!4m6!3m5!1s0x345d4517fc03e1df:0xa3885d84203fd449!8m2!3d25.1087507!4d121.8443753!16s%2Fg%2F1tgxr84b?authuser=0&entry=ttu&g_ep=EgoyMDI2MTAyNy4wIKXMDSoASAFQAw%3D%3D",
    "阿柑姨芋圓": "https://www.google.com/maps/place/%E9%98%BF%E6%9F%91%E5%A7%A8%E8%8A%8B%E5%9C%93/@25.1076525,121.8436521,17z/data=!3m1!4b1!4m6!3m5!1s0x345d457dceb05b61:0xeb811525d65c479!8m2!3d25.1076525!4d121.8436521!16s%2Fg%2F11rs9g1sq4?entry=ttu&g_ep=EgoyMDI2MTEwOS4wIKXMDSoASAFQAw%3D%3D",   // v2.0.72: the user's link
    "安迪藥燉排骨": "https://www.google.com/maps/place/%E5%AE%89%E8%BF%AA%E8%97%A5%E7%87%89%E6%8E%92%E9%AA%A8/@25.109127,121.8444248,18z/data=!4m15!1m8!3m7!1s0x345d450011a9e74f:0x9894cadfcf468da8!2z5a6J6L-q6Jel54eJ5o6S6aqo!8m2!3d25.109127!4d121.8444248!10e5!16s%2Fg%2F11lcc_jyhw!3m5!1s0x345d450011a9e74f:0x9894cadfcf468da8!8m2!3d25.109127!4d121.8444248!16s%2Fg%2F11lcc_jyhw?authuser=0&entry=ttu&g_ep=EgoyMDI2MTAyNy4wIKXMDSoASAFQAw%3D%3D",
    "hima cafe": "https://www.google.com/maps/place/hima+cafe+%7C+%E6%9A%87+%E2%80%A2+%E5%92%96%E5%95%A1%EF%BC%88%E7%84%A1%E9%A0%90%E7%B4%84%E3%80%81%E5%85%AC%E4%BC%91%E8%AB%8B%E7%9C%8Big)/@25.105649,121.8448328,15.72z/data=!4m6!3m5!1s0x345d45a0390fbe2f:0x48c69d0512703b52!8m2!3d25.1094547!4d121.8435214!16s%2Fg%2F11vwhnb1lf?entry=ttu&g_ep=EgoyMDI2MTAyNy4wIKXMDSoASAFQAw%3D%3D",
    "ランタン上げ体験": "https://maps.app.goo.gl/g8Br214v6ceNJJLo8",
    "十分老街": "https://maps.app.goo.gl/ARU4F2Qn7DccN7uQA",
    "平溪街": "https://www.google.com/maps/search/?api=1&query=%E6%96%B0%E5%8C%97%E5%B8%82%E5%B9%B3%E6%BA%AA%E5%8D%80%E5%B9%B3%E6%BA%AA%E8%A1%97",
    "基隆塔": "https://maps.app.goo.gl/xrD9bvDm6dvEMeMNA",
    "海洋広場": "https://maps.app.goo.gl/AZRq7bKhZWk7nMQF8",
    "彩色屋": "https://maps.app.goo.gl/fRKGYwE38P8zrp4fA",
    "阿根納造船廠遺構": "https://maps.app.goo.gl/kFdNnEFCKET48jWL6",
    "仁愛市場": "https://maps.app.goo.gl/kPmushGka9MxiL486",
    "基隆廟口夜市": "https://maps.app.goo.gl/FasxHrd7GgTPYDKT7",
    "三角窗麵攤": "https://maps.app.goo.gl/nr8dcsvUbo18Xf2bA",
    "正老牌咖哩麵": "https://maps.app.goo.gl/oE5pZWoZLLgPCpPc8",
    "天天鮮排骨飯": "https://maps.app.goo.gl/uyjr6oJqY4pa94jt9",
    "野柳地質公園": "https://maps.app.goo.gl/7e8YHHJxRTdjTUtk6",
    "女王頭": "https://maps.app.goo.gl/SezQNPeF6oapcS349",
  };
  const safe = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // 「片道 NT$90」 → 「NT$90」, 「台鉄 NT$73＋タクシー代」 → 「NT$73＋タクシー代」 (the row is already named)
  const price = p => String(p || '').replace(/^片道\s*/, '').replace(/^台鉄\s+(?=NT\$)/, '');
  const facts = r => [r.time, price(r.price)].filter(Boolean).join(' · ');

  const page = document.createElement('div');
  page.className = 'tt269-page';
  section.querySelector('.tt221-stage')?.after(page);
  section.classList.add('tt269-ready');

  function sketch(r) {
    const n = r.stops.length, at = i => (i / (n - 1)) * 100;
    const segs = r.legs.map((l, i) => `<span class="tt269-seg tt269-seg--${l.kind}" style="left:${at(i)}%;width:${at(i + 1) - at(i)}%"><span class="tt269-seg-label">${safe(l.head.replace(/　/g, ' '))}</span></span>`);
    const stops = r.stops.map((s, i) => {
      const kind = i === 0 ? 'start' : i === n - 1 ? 'end' : 'xfer';
      const name = s.url ? `<a href="${safe(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${safe(s.name)}の場所を地図で見る">${safe(s.name)}</a>` : safe(s.name);
      return `<li class="tt269-stop tt269-stop--${kind}" style="left:${at(i)}%"><span class="tt269-dot" aria-hidden="true"></span>
        <span class="tt269-stop-name">${name}</span>${kind === 'xfer' ? '<span class="tt269-stop-sub">乗換</span>' : s.sub ? `<span class="tt269-stop-sub">${safe(s.sub)}</span>` : ''}</li>`;
    });
    const notes = r.legs.map(l => [l.head.replace(/　/g, ' '), l.dir, l.detail].filter(Boolean).join(' · '));
    return `<div class="tt269-sketch" role="img" aria-label="${safe(r.stops.map(s => s.name).join('→'))}">${segs.join('')}<ol>${stops.join('')}</ol></div>
      <ul class="tt269-notes">${notes.map(t => `<li>${safe(t)}</li>`).join('')}</ul>`;
  }

  function render(d) {
    const P = PAGES[d];
    if (!P) return;
    let first = null;
    const ways = P.ways.map(g => `<p class="tt269-group">${safe(g.label)}</p>` + g.rows.map(([m, o, title]) => {
      const r = api.describe(d, m, o);
      if (!r) return '';
      first ??= r;
      return `<div class="tt269-way">
        <button type="button" class="tt269-way-head" aria-expanded="false"><span class="tt269-way-name">${safe(title)}</span><span class="tt269-way-facts">${safe(facts(r))}</span><span class="tt269-chev" aria-hidden="true"></span></button>
        <a class="tt269-map" href="${safe(r.mapUrl)}" target="_blank" rel="noopener noreferrer">経路を見る</a>
        <div class="tt269-way-body" hidden><p class="tt269-way-sum">${safe(facts(r))}</p>${sketch(r)}</div></div>`;
    }).join('')).join('');
    const sections = P.sections.map(s => `<section class="tt269-sec"><h4 class="tt269-label">${safe(s.label)}</h4>
      <ul class="tt269-bubbles">${s.bubbles.map(b => MAPS[b] ? `<li><a href="${safe(MAPS[b])}" target="_blank" rel="noopener noreferrer" aria-label="${safe(b)}を地図で見る">${safe(b)}</a></li>` : `<li>${safe(b)}</li>`).join('')}</ul>
      ${s.event ? `<h4 class="tt269-label tt269-label--sub">${safe(s.event.label)}</h4><p class="tt269-event"><strong>${safe(s.event.name)}</strong><span>${safe(s.event.sub)}</span></p>` : ''}</section>`).join('');
    page.dataset.dest = String(d);
    page.innerHTML = `<div class="tt269-hero"><img src="assets/daytrips/photo/${P.photo}.jpg" alt="" decoding="async">
        <div class="tt269-hero-text"><span class="tt269-ro">${P.ro}</span><h3 class="tt269-place">${P.name}</h3><p class="tt269-tagline">${safe(P.tagline)}</p></div></div>
      ${sections}
      <section class="tt269-access"><h3 class="tt269-access-title">行き方</h3>${ways}</section>
      <p class="tt269-hint">タップで路線図と「経路を見る」（Google Maps）を表示</p>
      <p class="tt269-caution">${safe((first?.warning || '').replace(/\n/g, ''))}</p>
      <p class="tt269-foot">運賃・所要時間は目安です。時刻は「経路を見る」（Google Maps）で確認。</p>`;
    page.scrollTop = 0;
  }

  // one way open at a time
  page.addEventListener('click', e => {
    const head = e.target.closest('.tt269-way-head');
    if (!head) return;
    const way = head.parentElement, open = head.getAttribute('aria-expanded') !== 'true';
    for (const w of page.querySelectorAll('.tt269-way.is-open')) {
      w.classList.remove('is-open'); w.querySelector('.tt269-way-head').setAttribute('aria-expanded', 'false'); w.querySelector('.tt269-way-body').hidden = true;
    }
    if (!open) return;
    way.classList.add('is-open'); head.setAttribute('aria-expanded', 'true'); way.querySelector('.tt269-way-body').hidden = false;
  });

  const current = () => Math.max(0, destinations.findIndex(b => b.getAttribute('aria-expanded') === 'true'));
  destinations.forEach((b, i) => b.addEventListener('click', () => requestAnimationFrame(() => render(i))));
  document.addEventListener('tt:viewchange', () => requestAnimationFrame(() => requestAnimationFrame(() => render(current()))));
  render(current());
})();
