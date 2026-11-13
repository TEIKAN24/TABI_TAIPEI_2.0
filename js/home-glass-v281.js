/* TABI TAIPEI v2.0.83 — home background: 長虹玻璃 (fluted glass) under the sage band.
   From experiments/home-background A2 v2, then tuned on the site by the user:
   - 16px ribs (2.0.81: 12px); the glass starts at the top of the home index, nothing above.
   - Both ends fade out like the sage band; how much glass you see follows the light behind it.
   - The only light behind the glass is the sage band: 150px (2.0.83, back to the first height;
     eased since 2.0.82), then a faint tail to the floor so the glass is still just there at the
     bottom instead of gone on the black.
   - No tilt (removed in 2.0.82 with its side-menu switch). The lower edge of the light flows
     instead: two soft, irregular waves of the same sage (2.0.83: several harmonics each, was a
     sine) drift past each other, slowly, and rise and fall a little. They move by transform
     only (compositor), so the refracting SVG filter is computed once, never per frame. Still
     under prefers-reduced-motion.
   Built as one inline SVG (the light refracted by feDisplacementMap, crossfaded over the plain
   light with the same fade), the two wave layers, and a CSS rib-shading layer on top. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var PITCH = 16, SCALE = 40, LIGHT_H = 150, TAIL = 0.035;
  /* the waves: tile length, harmonics [k, amplitude, phase], baseline (px from the glass top),
     strength. A few unrelated harmonics over a tile longer than the screen make the edge
     irregular; the two tiles differ in length, so their sum never repeats in view. */
  var WAVES = [
    [820, [[1, 6, 0.4], [2, 3.5, 2.1], [3, 2.2, 4.0], [5, 1.3, 1.2], [8, 0.7, 5.3]], 112, 0.11],
    [610, [[1, 4.5, 3.3], [2, 2.6, 0.7], [4, 1.6, 2.6], [7, 0.8, 4.6]], 134, 0.07]
  ];
  var layer, svgHost, hero, size = '';

  function enc(s) { return 'data:image/svg+xml;utf8,' + encodeURIComponent(s); }
  // one rib of the displacement map: red 0→255 across the rib (a cylindrical lens), green 128
  var RIB = enc("<svg xmlns='http://www.w3.org/2000/svg' width='" + PITCH + "' height='16'>" +
    "<linearGradient id='g'><stop offset='0' stop-color='rgb(0,128,0)'/><stop offset='1' stop-color='rgb(255,128,0)'/></linearGradient>" +
    "<rect width='" + PITCH + "' height='16' fill='url(#g)'/></svg>");

  /* one tile of a wave: a lip of sage light whose lower edge is the sum of the harmonics,
     blurred. The path runs a whole tile past both sides, so the blur is periodic and the tiles
     meet without a seam. */
  function waveTile(L, hs, B, a) {
    var A = hs.reduce(function (s, h) { return s + h[1]; }, 0);
    var H = Math.ceil(B + A + 40), d = 'M' + (-L) + ',0', n = 160, x, y, i;
    for (i = 0; i <= n * 3; i++) {
      x = -L + i * L / n;
      y = B;
      hs.forEach(function (h) { y += h[1] * Math.sin(2 * Math.PI * h[0] * x / L + h[2]); });
      d += ' L' + x.toFixed(1) + ',' + y.toFixed(2);
    }
    d += ' L' + (2 * L) + ',0 Z';
    return enc("<svg xmlns='http://www.w3.org/2000/svg' width='" + L + "' height='" + H + "' viewBox='0 0 " + L + ' ' + H + "'>" +
      "<linearGradient id='w' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='rgb(138,158,122)' stop-opacity='0'/>" +
      "<stop offset='.55' stop-color='rgb(138,158,122)' stop-opacity='" + (a * 0.5) + "'/><stop offset='1' stop-color='rgb(138,158,122)' stop-opacity='" + a + "'/></linearGradient>" +
      "<filter id='f' x='-100%' y='-20%' width='300%' height='140%'><feGaussianBlur stdDeviation='7'/></filter>" +
      "<path d='" + d + "' fill='url(#w)' filter='url(#f)'/></svg>");
  }

  function markup(W, H) {
    var light = "<rect width='" + W + "' height='" + H + "' fill='#000'/>" +
      "<g filter='url(#tt281-b)' mask='url(#tt281-mx)'><rect width='" + W + "' height='" + H + "' fill='url(#tt281-gl)'/></g>";
    var e = LIGHT_H / H; // where the main light has faded, as a fraction of the glass height
    return "<svg xmlns='http://www.w3.org/2000/svg' width='" + W + "' height='" + H + "' viewBox='0 0 " + W + ' ' + H + "' aria-hidden='true' focusable='false'><defs>" +
      // eased fade over LIGHT_H, then a faint tail to the floor
      "<linearGradient id='tt281-gl' x1='0' y1='0' x2='0' y2='1'>" +
      "<stop offset='0' stop-color='rgb(138,158,122)' stop-opacity='.32'/>" +
      "<stop offset='" + (e * 0.22).toFixed(4) + "' stop-color='rgb(138,158,122)' stop-opacity='.25'/>" +
      "<stop offset='" + (e * 0.5).toFixed(4) + "' stop-color='rgb(138,158,122)' stop-opacity='.14'/>" +
      "<stop offset='" + (e * 0.78).toFixed(4) + "' stop-color='rgb(138,158,122)' stop-opacity='.06'/>" +
      "<stop offset='" + e.toFixed(4) + "' stop-color='rgb(138,158,122)' stop-opacity='" + TAIL + "'/>" +
      "<stop offset='1' stop-color='rgb(138,158,122)' stop-opacity='" + (TAIL * 0.6) + "'/></linearGradient>" +
      "<linearGradient id='tt281-fx' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#fff' stop-opacity='0'/><stop offset='.16' stop-color='#fff'/><stop offset='.84' stop-color='#fff'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></linearGradient>" +
      "<linearGradient id='tt281-fy' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#fff'/><stop offset='.3' stop-color='#fff' stop-opacity='.62'/><stop offset='.62' stop-color='#fff' stop-opacity='.3'/><stop offset='1' stop-color='#fff' stop-opacity='.2'/></linearGradient>" +
      "<mask id='tt281-mx' maskUnits='userSpaceOnUse' x='0' y='0' width='" + W + "' height='" + H + "'><rect width='" + W + "' height='" + H + "' fill='url(#tt281-fx)'/></mask>" +
      "<mask id='tt281-m' maskUnits='userSpaceOnUse' x='0' y='0' width='" + W + "' height='" + H + "'><rect width='" + W + "' height='" + H + "' fill='url(#tt281-fy)' mask='url(#tt281-mx)'/></mask>" +
      "<filter id='tt281-b' x='-10%' y='-10%' width='120%' height='120%'><feGaussianBlur stdDeviation='2'/></filter>" +
      "<filter id='tt281-r' filterUnits='userSpaceOnUse' x='0' y='0' width='" + W + "' height='" + H + "' color-interpolation-filters='sRGB'>" +
      '<feImage href="' + RIB + '" x="0" y="0" width="' + PITCH + '" height="16" preserveAspectRatio="none" result="rib"/>' +
      "<feTile in='rib' result='ribs'/><feDisplacementMap in='SourceGraphic' in2='ribs' scale='" + SCALE + "' xChannelSelector='R' yChannelSelector='G'/></filter>" +
      '</defs>' + light + "<g mask='url(#tt281-m)'><g filter='url(#tt281-r)'>" + light + '</g></g></svg>';
  }

  /* the glass spans the home column plus 16px each side (393px on a 393px phone), from the top
     of the index to the bottom of the screen */
  function place() {
    if (!layer || !hero || !root.classList.contains('tt-route-home')) return;
    var r = hero.getBoundingClientRect();
    if (r.width < 10) return;
    layer.style.top = r.top + 'px';
    layer.style.left = (r.left - 16) + 'px';
    layer.style.width = (r.width + 32) + 'px';
    var W = Math.round(r.width + 32), H = Math.round(layer.getBoundingClientRect().height);
    if (H < 10 || size === W + 'x' + H) return;
    size = W + 'x' + H;
    svgHost.innerHTML = markup(W, H);
  }

  function build() {
    hero = doc.querySelector('#top.hero');
    if (!hero) return;
    layer = doc.createElement('div');
    layer.className = 'tt281-glass';
    layer.setAttribute('aria-hidden', 'true');
    svgHost = doc.createElement('div');
    svgHost.className = 'tt281-svg';
    layer.appendChild(svgHost);
    WAVES.forEach(function (w, i) {
      var wrap = doc.createElement('div'), band = doc.createElement('i');
      wrap.className = 'tt281-wave tt281-wave-' + (i + 1);
      band.style.backgroundImage = 'url("' + waveTile(w[0], w[1], w[2], w[3]) + '")';
      band.style.setProperty('--L', w[0] + 'px');
      wrap.appendChild(band);
      layer.appendChild(wrap);
    });
    var shade = doc.createElement('div');
    shade.className = 'tt281-ribs';
    layer.appendChild(shade);
    doc.body.insertBefore(layer, doc.body.firstChild);
    place();
    if (window.ResizeObserver) new ResizeObserver(place).observe(hero);
    addEventListener('resize', place);
    // the route lives in a class on <html>: place the glass again when home comes back
    new MutationObserver(place).observe(root, {attributes: true, attributeFilter: ['class']});
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', build); else build();
})();
