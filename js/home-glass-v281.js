/* TABI TAIPEI v2.0.88 — home background: 長虹玻璃 (fluted glass) under the sage band.
   From experiments/home-background A2 v2, then tuned on the site by the user:
   - 24px ribs (2.0.86; 16px before); the glass starts at the top of the home index, nothing above.
   - Both ends fade out like the sage band; how much glass you see follows the light behind it.
   - The only light behind the glass is the sage band, 150px. 2.0.85: one smooth curve (the
     2.0.82 curve was four straight pieces, and each joint showed as a faint line), and a
     fainter tail to the floor (2.0.82 left the black greyish).
   - The lower edge of the light flows: three soft, irregular waves of the same sage (several
     harmonics each) flow left to right, the first crossing the screen in about 3 s. 2.0.85:
     softer (wider blur, lower strength, three layers instead of two) and less regular: each
     layer also sways, rises and fades on its own beats, so its speed and brightness keep
     changing instead of running on rails.
   - Colour (2.0.87): every filter works in sRGB. The blurs ran in the default linearRGB,
     which at 8 bits rounds the darkest sage into brownish steps; and each wave's blur was cut
     off at its filter region, leaving a hard horizontal edge. The 2.0.85 grain is gone (on
     phones it showed as a mesh).
   - 2.0.87, to read as glass:
     · each rib has a soft catchlight and a soft seam where ribs meet (css, .tt281-sheen),
       strongest under the band (2.0.88: softer and fainter);
     · the light behind the glass varies a little from side to side (soft brighter and darker
       zones), so each rib visibly compresses it into its own small gradient;
     · each wave is drawn twice, the two copies offset the way a rib's two halves bend light,
       and shown through alternating half-rib stripes, so the flowing edge breaks at the ribs.
   Everything that moves, moves by transform or opacity (compositor); the refracting SVG filter
   is computed once, never per frame. Still under prefers-reduced-motion.
   Built as one inline SVG (the light refracted by feDisplacementMap, crossfaded over the plain
   light with the same fade), the wave layers, and CSS rib-shading and sheen layers on top. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var PITCH = 24, SCALE = 60, LIGHT_H = 150, TOP = 0.32, TAIL = 0.02;
  var ZONES = [[0, 1], [.1, .74], [.22, 1], [.35, .7], [.5, 1], [.63, .76], [.78, 1], [.9, .72], [1, 1]];
  /* the waves: tile length, harmonics [k, amplitude, phase], baseline (px from the glass top),
     strength, and the beats in s / px: flow (one tile), sway (± px, s), rise (s), fade (s).
     A few unrelated harmonics over a tile longer than the screen make each edge irregular;
     the tiles and beats all differ, so the sum never repeats in view. */
  var WAVES = [
    {L: 820, hs: [[1, 6, 0.4], [2, 3.5, 2.1], [3, 2.2, 4.0], [5, 1.3, 1.2], [8, 0.7, 5.3]], B: 112, a: 0.085,
      flow: 6.3, sway: [60, 7.3], rise: 17, fade: 9.7},
    {L: 610, hs: [[1, 4.5, 3.3], [2, 2.6, 0.7], [4, 1.6, 2.6], [7, 0.8, 4.6]], B: 132, a: 0.06,
      flow: 5.6, sway: [45, 5.9], rise: 23, fade: 12.4},
    {L: 470, hs: [[1, 4, 1.7], [3, 2, 0.2], [5, 1.1, 3.9]], B: 96, a: 0.045,
      flow: 4.9, sway: [35, 4.6], rise: 13, fade: 7.1}
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
    var H = Math.ceil(B + A + 60), d = 'M' + (-L) + ',0', n = 160, x, y, i;
    for (i = 0; i <= n * 3; i++) {
      x = -L + i * L / n;
      y = B;
      hs.forEach(function (h) { y += h[1] * Math.sin(2 * Math.PI * h[0] * x / L + h[2]); });
      d += ' L' + x.toFixed(1) + ',' + y.toFixed(2);
    }
    d += ' L' + (2 * L) + ',0 Z';
    return enc("<svg xmlns='http://www.w3.org/2000/svg' width='" + L + "' height='" + H + "' viewBox='0 0 " + L + ' ' + H + "'>" +
      "<linearGradient id='w' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='rgb(138,158,122)' stop-opacity='0'/>" +
      "<stop offset='.5' stop-color='rgb(138,158,122)' stop-opacity='" + (a * 0.35) + "'/><stop offset='1' stop-color='rgb(138,158,122)' stop-opacity='" + a + "'/></linearGradient>" +
      // the blur needs room below the edge (3 sd): the region is the whole tile and more
      "<filter id='f' filterUnits='userSpaceOnUse' x='" + (-L) + "' y='-60' width='" + (3 * L) + "' height='" + (H + 120) + "' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='13'/></filter>" +
      "<path d='" + d + "' fill='url(#w)' filter='url(#f)'/></svg>");
  }

  // the light's fade: one smooth curve (1 - smoothstep) from TOP to TAIL over LIGHT_H
  function lightStops(H) {
    var e = LIGHT_H / H, out = '', i, t, o;
    for (i = 0; i <= 16; i++) {
      t = i / 16;
      o = TAIL + (TOP - TAIL) * (1 - t * t * (3 - 2 * t));
      out += "<stop offset='" + (e * t).toFixed(4) + "' stop-color='rgb(138,158,122)' stop-opacity='" + o.toFixed(4) + "'/>";
    }
    return out + "<stop offset='1' stop-color='rgb(138,158,122)' stop-opacity='" + (TAIL * 0.5) + "'/>";
  }

  function markup(W, H) {
    var light = "<rect width='" + W + "' height='" + H + "' fill='#000'/>" +
      "<g filter='url(#tt281-b)' mask='url(#tt281-mz)'><rect width='" + W + "' height='" + H + "' fill='url(#tt281-gl)'/></g>";
    return "<svg xmlns='http://www.w3.org/2000/svg' width='" + W + "' height='" + H + "' viewBox='0 0 " + W + ' ' + H + "' aria-hidden='true' focusable='false'><defs>" +
      "<linearGradient id='tt281-gl' x1='0' y1='0' x2='0' y2='1'>" + lightStops(H) + "</linearGradient>" +
      "<linearGradient id='tt281-fx' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#fff' stop-opacity='0'/><stop offset='.16' stop-color='#fff'/><stop offset='.84' stop-color='#fff'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></linearGradient>" +
      "<linearGradient id='tt281-fy' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#fff'/><stop offset='.3' stop-color='#fff' stop-opacity='.62'/><stop offset='.62' stop-color='#fff' stop-opacity='.3'/><stop offset='1' stop-color='#fff' stop-opacity='.2'/></linearGradient>" +
      "<mask id='tt281-mx' maskUnits='userSpaceOnUse' x='0' y='0' width='" + W + "' height='" + H + "'><rect width='" + W + "' height='" + H + "' fill='url(#tt281-fx)'/></mask>" +
      // the light's sideways zones (inside the end fade): about 50px apart, 70-100%
      "<linearGradient id='tt281-zx' x1='0' y1='0' x2='1' y2='0'>" + ZONES.map(function (z) {
        return "<stop offset='" + z[0] + "' stop-color='#fff' stop-opacity='" + z[1] + "'/>"; }).join('') + "</linearGradient>" +
      "<mask id='tt281-mz' maskUnits='userSpaceOnUse' x='0' y='0' width='" + W + "' height='" + H + "'><rect width='" + W + "' height='" + H + "' fill='url(#tt281-zx)' mask='url(#tt281-mx)'/></mask>" +
      "<mask id='tt281-m' maskUnits='userSpaceOnUse' x='0' y='0' width='" + W + "' height='" + H + "'><rect width='" + W + "' height='" + H + "' fill='url(#tt281-fy)' mask='url(#tt281-mx)'/></mask>" +
      "<filter id='tt281-b' x='-10%' y='-10%' width='120%' height='120%' color-interpolation-filters='sRGB'><feGaussianBlur stdDeviation='2'/></filter>" +
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
      var wrap = doc.createElement('div'), tile = 'url("' + waveTile(w.L, w.hs, w.B, w.a) + '")';
      wrap.className = 'tt281-wave';
      wrap.style.cssText = '--rise:' + w.rise + 's;--fade:' + w.fade + 's;--sa:' + w.sway[0] + 'px;--sd:' + w.sway[1] +
        's;--L:' + w.L + 'px;--flow:' + w.flow + 's;animation-delay:' + (-i * 4.3) + 's,' + (-i * 2.9) + 's';
      // two copies: the left and right half of every rib bend the light opposite ways
      ['a', 'b'].forEach(function (k) {
        var half = doc.createElement('div'), sway = doc.createElement('b'), band = doc.createElement('i');
        half.className = 'tt281-half tt281-half-' + k;
        band.style.backgroundImage = tile;
        sway.appendChild(band); half.appendChild(sway); wrap.appendChild(half);
      });
      layer.appendChild(wrap);
    });
    var shade = doc.createElement('div');
    shade.className = 'tt281-ribs';
    layer.appendChild(shade);
    var sheen = doc.createElement('div');
    sheen.className = 'tt281-sheen';
    layer.appendChild(sheen);
    doc.body.insertBefore(layer, doc.body.firstChild);
    place();
    if (window.ResizeObserver) new ResizeObserver(place).observe(hero);
    addEventListener('resize', place);
    // the route lives in a class on <html>: place the glass again when home comes back
    new MutationObserver(place).observe(root, {attributes: true, attributeFilter: ['class']});
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', build); else build();
})();
