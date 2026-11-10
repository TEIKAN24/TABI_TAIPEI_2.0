/* TABI TAIPEI v2.0.36 — 01 旅支度 / 注意事項: animated open and close.
 * The notes stay native <details> (keyboard, find-in-page, screen readers unchanged).
 * A tap on a title now slides its text open (height + fade); opening one slides the
 * open one shut at the same time. figma-stage1.js's own "only one open" listener is
 * kept out of the way for these taps, so the other note is not snapped shut. */
(() => {
  'use strict';
  const pane = document.getElementById('tt2-notes-pane');
  const list = pane?.querySelector('.tt2-note-list');
  if (!list) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const EASE = 'cubic-bezier(.22,1,.36,1)';
  const OPEN_MS = 320, CLOSE_MS = 260;
  const running = new WeakMap();
  const ours = new WeakSet(); // notes whose next toggle event we caused

  const contentOf = note => note.querySelector(':scope > .tt2-note-content');
  function stop(note) {
    const anim = running.get(note);
    if (anim) { anim.onfinish = null; anim.cancel(); running.delete(note); }
  }
  function setOpen(note, value) { if (note.open === value) return; ours.add(note); note.open = value; }

  function open(note) {
    const content = contentOf(note);
    stop(note);
    note.classList.remove('is-closing');
    setOpen(note, true);
    if (!content || reduce.matches) return;
    const h = content.getBoundingClientRect().height;
    content.style.overflow = 'hidden';
    const anim = content.animate(
      [{height: '0px', opacity: 0}, {height: h + 'px', opacity: 1}],
      {duration: OPEN_MS, easing: EASE});
    running.set(note, anim);
    anim.onfinish = () => { content.style.overflow = ''; running.delete(note); };
  }
  function close(note) {
    const content = contentOf(note);
    if (!note.open || note.classList.contains('is-closing')) return;
    stop(note);
    if (!content || reduce.matches) { setOpen(note, false); return; }
    const h = content.getBoundingClientRect().height;
    note.classList.add('is-closing');
    content.style.overflow = 'hidden';
    const anim = content.animate(
      [{height: h + 'px', opacity: 1}, {height: '0px', opacity: 0}],
      {duration: CLOSE_MS, easing: EASE, fill: 'forwards'});
    running.set(note, anim);
    anim.onfinish = () => {
      setOpen(note, false);
      note.classList.remove('is-closing');
      content.style.overflow = '';
      anim.cancel();
      running.delete(note);
    };
  }

  list.addEventListener('click', event => {
    const summary = event.target.closest('.tt2-note-summary');
    if (!summary || !list.contains(summary)) return;
    const note = summary.parentElement;
    event.preventDefault();
    // guide.js toggles every <summary> on .site-content itself; these notes are handled here.
    event.stopPropagation();
    if (note.open && !note.classList.contains('is-closing')) { close(note); return; }
    for (const other of list.querySelectorAll(':scope > .tt2-note[open]')) if (other !== note) close(other);
    open(note);
  });
  // Our own toggles must not reach figma-stage1.js's capture listener on the list
  // (it would snap the other note shut). This capture listener sits above it.
  pane.addEventListener('toggle', event => { if (ours.has(event.target)) { ours.delete(event.target); event.stopPropagation(); } }, true);
})();
