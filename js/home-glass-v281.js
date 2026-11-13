/* TABI TAIPEI v2.0.81 — home background: 長虹玻璃 (fluted glass) under the sage band.
   From experiments/home-background A2 v2, approved by the user:
   - 12px ribs; the glass starts at the top of the home index (under the header), nothing above.
   - Both ends fade out like the sage band; how much glass you see follows the band's light:
     clear just under it, barely there toward the floor.
   - The only light behind the glass is the sage band.
   Built as one inline SVG (the light refracted by feDisplacementMap, crossfaded over the plain
   light with the same fade) plus two CSS rib layers: the rib shadow, and the rib highlight.

   Tilt: the rib highlight slides a few px inside each rib as the phone tilts left/right, the
   way light runs along real fluted glass. Only that CSS layer moves (a transform), so the SVG
   filter is computed once, never per frame. The baseline follows the hand slowly, so the
   highlight returns to rest when the phone is held still.
   Android: on by default (off again by itself if no sensor data arrives). iPhone / iPad: Safari
   needs a tap to grant motion access, so it is off until
   「背景を動かす」 in the side menu is turned on. Not offered with prefers-reduced-motion, or on
   devices without touch. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var PITCH = 12, SCALE = 30, LIGHT_H = 150;
  var KEY = 'tabi-tilt-v2.0.81';
  var layer, svgHost, glint, hero, size = '';

  function enc(s) { return 'data:image/svg+xml;utf8,' + encodeURIComponent(s); }
  // one rib of the displacement map: red 0→255 across the rib (a cylindrical lens), green 128
  var RIB = enc("<svg xmlns='http://www.w3.org/2000/svg' width='" + PITCH + "' height='16'>" +
    "<linearGradient id='g'><stop offset='0' stop-color='rgb(0,128,0)'/><stop offset='1' stop-color='rgb(255,128,0)'/></linearGradient>" +
    "<rect width='" + PITCH + "' height='16' fill='url(#g)'/></svg>");

  function markup(W, H) {
    var light = "<rect width='" + W + "' height='" + H + "' fill='#000'/>" +
      "<g filter='url(#tt281-b)' mask='url(#tt281-mx)'><rect width='" + W + "' height='" + LIGHT_H + "' fill='url(#tt281-gl)'/></g>";
    return "<svg xmlns='http://www.w3.org/2000/svg' width='" + W + "' height='" + H + "' viewBox='0 0 " + W + ' ' + H + "' aria-hidden='true' focusable='false'><defs>" +
      "<linearGradient id='tt281-gl' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='rgb(138,158,122)' stop-opacity='.32'/><stop offset='1' stop-color='rgb(138,158,122)' stop-opacity='0'/></linearGradient>" +
      "<linearGradient id='tt281-fx' x1='0' y1='0' x2='1' y2='0'><stop offset='0' stop-color='#fff' stop-opacity='0'/><stop offset='.16' stop-color='#fff'/><stop offset='.84' stop-color='#fff'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></linearGradient>" +
      "<linearGradient id='tt281-fy' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#fff'/><stop offset='.3' stop-color='#fff' stop-opacity='.55'/><stop offset='.62' stop-color='#fff' stop-opacity='.16'/><stop offset='1' stop-color='#fff' stop-opacity='.08'/></linearGradient>" +
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
    var shade = doc.createElement('div');
    shade.className = 'tt281-ribs';
    var gwrap = doc.createElement('div');
    gwrap.className = 'tt281-glint';
    glint = doc.createElement('i');
    gwrap.appendChild(glint);
    layer.appendChild(svgHost); layer.appendChild(shade); layer.appendChild(gwrap);
    doc.body.insertBefore(layer, doc.body.firstChild);
    place();
    if (window.ResizeObserver) new ResizeObserver(place).observe(hero);
    addEventListener('resize', place);
    // the route lives in a class on <html>: place the glass again when home comes back
    new MutationObserver(place).observe(root, {attributes: true, attributeFilter: ['class']});
  }

  /* ---------- tilt ---------- */
  var reduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  var coarse = window.matchMedia ? matchMedia('(pointer: coarse)').matches : false;
  var hasDO = 'DeviceOrientationEvent' in window;
  var needsPerm = hasDO && typeof DeviceOrientationEvent.requestPermission === 'function';
  // newer Chrome also has requestPermission (it grants without asking), so the default is
  // decided by platform: iPhone / iPad off, others on
  var isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  var on = false, base = null, tilt = 0, target = 0, raf = 0, seen = 0, btn = null;

  function apply() {
    if (!glint) return;
    glint.style.transform = 'translate3d(' + (tilt * 2.5).toFixed(2) + 'px,0,0)';
    glint.style.opacity = (0.55 + 0.45 * Math.min(1, Math.abs(tilt))).toFixed(3);
  }
  function step() {
    raf = 0;
    tilt += (target - tilt) * 0.12;
    if (Math.abs(target - tilt) < 0.002) tilt = target; else raf = requestAnimationFrame(step);
    apply();
  }
  function kick() { if (!raf) raf = requestAnimationFrame(step); }
  function portrait() {
    var a = screen.orientation ? screen.orientation.angle : (window.orientation || 0);
    return !a;
  }
  function onOrient(e) {
    if (e.gamma == null) return;
    seen = Date.now();
    if (doc.hidden || !root.classList.contains('tt-route-home') || !portrait()) return;
    var g = e.gamma;
    if (base == null || Math.abs(g - base) > 45) base = g;
    base += (g - base) * 0.015; // follows the hand in about a second and a half
    target = Math.max(-1, Math.min(1, (g - base) / 12));
    kick();
  }
  function setBtn() {
    if (!btn) return;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.querySelector('.tt281-tilt-state').textContent = on ? 'オン' : 'オフ';
  }
  function start() {
    if (on) return;
    on = true; base = null; seen = 0;
    addEventListener('deviceorientation', onOrient);
    setBtn();
    // no sensor, or no permission (iPhone: a stored 「オン」 only works while Safari still holds
    // it): nothing arrives, so show 「オフ」 again
    setTimeout(function () { if (on && !seen) stop(); }, 2000);
  }
  // start without a tap: just listen. Chrome delivers the events without asking (its
  // requestPermission answers 'denied' outside a tap even so); Safari delivers them only while
  // it holds the permission. Either way the 2 s check above settles the switch.
  function startQuiet() { start(); }
  function stop() {
    on = false;
    removeEventListener('deviceorientation', onOrient);
    target = 0; kick();
    setBtn();
  }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }

  function toggle() {
    if (on) { stop(); store('off'); return; }
    // only Safari's answer means anything (Chrome's 'denied' does not stop the events)
    if (needsPerm && isIOS) {
      DeviceOrientationEvent.requestPermission().then(function (r) {
        if (r === 'granted') { store('on'); start(); }
      }).catch(function () {});
    } else { store('on'); start(); }
  }

  function addButton() {
    var extras = doc.querySelector('.tt-side-extras');
    if (!extras) return;
    btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'tt281-tilt';
    btn.setAttribute('aria-pressed', 'false');
    btn.innerHTML = '<span class="tt281-tilt-label">背景を動かす</span><span class="tt281-tilt-state">オフ</span>';
    btn.addEventListener('click', toggle);
    extras.appendChild(btn);
  }

  function initTilt() {
    if (!hasDO || !coarse || (reduce && reduce.matches)) return;
    addButton();
    var s = stored();
    if (s === 'on' || (s == null && !isIOS)) startQuiet();
    setBtn();
    if (reduce && reduce.addEventListener) reduce.addEventListener('change', function () { if (reduce.matches) stop(); });
    doc.addEventListener('visibilitychange', function () { if (doc.hidden) { target = 0; tilt = 0; apply(); } });
  }

  function init() { build(); initTilt(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
