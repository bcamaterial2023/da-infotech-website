/* ==========================================================================
   DA INFOTECH — CUSTOM CURSOR
   --------------------------------------------------------------------------
   A dot that tracks the pointer exactly and a ring that trails behind it.
   The ring reacts to what is underneath: it opens over links, and fills and
   shows an arrow over a call to action.

   Runs only where it makes sense — a fine pointer, hover capability, and
   motion not reduced. Everywhere else the module never builds its markup and
   the native cursor is left completely alone. The elements it does build are
   aria-hidden and pointer-events: none, so nothing about the accessibility
   tree or hit testing changes.

   Registers as DA.cursor; initialised by js/main.js.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var DA = window.DA = window.DA || {};

  /* Higher = tighter tracking. The dot is near-instant, the ring lags. */
  var DOT_LAMBDA = 42;
  var RING_LAMBDA = 13;

  var CTA_SCALE = 2.35;
  var LINK_SCALE = 1.55;
  var TEXT_SCALE = 2.75;
  var DOWN_SCALE = 0.86;

  /* A CTA says GO unless the element names its own word. */
  var CTA_LABEL = 'Go';

  var root = null;
  var dot = null;
  var ring = null;
  var label = null;

  var enabled = false;
  var frameId = null;
  var lastTime = 0;

  var target = { x: 0, y: 0 };
  var dotPos = { x: 0, y: 0 };
  var ringPos = { x: 0, y: 0 };
  var scale = 1;
  var targetScale = 1;
  var hasMoved = false;

  /* ---------------------------------------------------------------------- */
  /* Capability                                                              */
  /* ---------------------------------------------------------------------- */

  function isEligible() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function damp(current, goal, lambda, delta) {
    return current + (goal - current) * (1 - Math.exp(-lambda * delta));
  }

  /* ---------------------------------------------------------------------- */
  /* Build                                                                   */
  /* ---------------------------------------------------------------------- */

  function build() {
    root = document.createElement('div');
    root.className = 'cursor';
    root.setAttribute('aria-hidden', 'true');

    dot = document.createElement('div');
    dot.className = 'cursor__dot';

    ring = document.createElement('div');
    ring.className = 'cursor__ring';

    /* Sibling of the ring, not a child: the ring scales up to 2.75x and any
       text inside it would scale with it. Kept outside, the label stays at
       its true size and stays crisp. */
    label = document.createElement('span');
    label.className = 'cursor__label';

    root.appendChild(ring);
    root.appendChild(label);
    root.appendChild(dot);
    document.body.appendChild(root);

    document.documentElement.classList.add('has-cursor');
  }

  function teardown() {
    if (root && root.parentNode) root.parentNode.removeChild(root);
    document.documentElement.classList.remove('has-cursor');
    root = dot = ring = label = null;
  }

  /* ---------------------------------------------------------------------- */
  /* State from what is under the pointer                                    */
  /* ---------------------------------------------------------------------- */

  function resolveState(element) {
    if (!element || !element.closest) return null;

    var flagged = element.closest('[data-cursor]');
    if (flagged) {
      return {
        state: flagged.getAttribute('data-cursor'),
        text: flagged.getAttribute('data-cursor-text') || ''
      };
    }

    if (element.closest('a, button, [role="button"], label, summary')) {
      return { state: 'link', text: '' };
    }

    return null;
  }

  function applyState(info) {
    var state = info ? info.state : null;

    root.classList.toggle('is-cta', state === 'cta');
    root.classList.toggle('is-link', state === 'link');
    root.classList.toggle('is-text', state === 'text');

    /* Both worded states read from the same slot: an explicit
       data-cursor-text wins, a call to action falls back to GO. */
    var word = '';
    if (state === 'text') word = info.text || 'View';
    else if (state === 'cta') word = info.text || CTA_LABEL;

    /* Only touch the DOM when the wording actually changes. */
    if (word && label.textContent !== word) label.textContent = word;

    if (state === 'text') targetScale = TEXT_SCALE;
    else if (state === 'cta') targetScale = CTA_SCALE;
    else if (state === 'link') targetScale = LINK_SCALE;
    else targetScale = 1;
  }

  /* ---------------------------------------------------------------------- */
  /* Events                                                                  */
  /* ---------------------------------------------------------------------- */

  function onPointerMove(event) {
    if (event.pointerType && event.pointerType !== 'mouse') return;

    target.x = event.clientX;
    target.y = event.clientY;

    if (!hasMoved) {
      hasMoved = true;
      dotPos.x = ringPos.x = target.x;
      dotPos.y = ringPos.y = target.y;
      root.classList.add('is-visible');
    }

    wake();
  }

  function onPointerOver(event) {
    applyState(resolveState(event.target));
    wake();
  }

  function onPointerDown() { root.classList.add('is-down'); wake(); }
  function onPointerUp() { root.classList.remove('is-down'); wake(); }

  function onPointerLeave() { root.classList.remove('is-visible'); }
  function onPointerEnter() { if (hasMoved) root.classList.add('is-visible'); }

  /* Keyboard users are not tracking a pointer — get it out of the way. */
  function onKeydown(event) {
    if (event.key === 'Tab') root.classList.remove('is-visible');
  }

  /* ---------------------------------------------------------------------- */
  /* Loop                                                                    */
  /* ---------------------------------------------------------------------- */

  /* Everything has caught up with the pointer and there is nothing left to
     interpolate — sub-pixel and sub-percent, so stopping is invisible. */
  function settled(goal) {
    return Math.abs(dotPos.x - target.x) < 0.05 &&
      Math.abs(dotPos.y - target.y) < 0.05 &&
      Math.abs(ringPos.x - target.x) < 0.05 &&
      Math.abs(ringPos.y - target.y) < 0.05 &&
      Math.abs(scale - goal) < 0.001;
  }

  function frame(now) {
    var delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
    lastTime = now;

    dotPos.x = damp(dotPos.x, target.x, DOT_LAMBDA, delta);
    dotPos.y = damp(dotPos.y, target.y, DOT_LAMBDA, delta);
    ringPos.x = damp(ringPos.x, target.x, RING_LAMBDA, delta);
    ringPos.y = damp(ringPos.y, target.y, RING_LAMBDA, delta);

    var goal = targetScale * (root.classList.contains('is-down') ? DOWN_SCALE : 1);
    scale = damp(scale, goal, 16, delta);

    dot.style.transform = 'translate3d(' + dotPos.x + 'px,' + dotPos.y + 'px,0)';
    ring.style.transform = 'translate3d(' + ringPos.x + 'px,' + ringPos.y + 'px,0) ' +
      'scale(' + scale.toFixed(3) + ')';
    label.style.transform = 'translate3d(' + ringPos.x + 'px,' + ringPos.y + 'px,0) ' +
      'translate(-50%,-50%)';

    /* Idle out rather than spinning a frame loop over a motionless cursor.
       A pointer that is not moving cost 60 wasted frames a second before. */
    if (settled(goal)) {
      frameId = null;
      lastTime = 0;
      return;
    }

    frameId = window.requestAnimationFrame(frame);
  }

  function wake() {
    if (frameId === null && enabled) frameId = window.requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------------- */
  /* Lifecycle                                                               */
  /* ---------------------------------------------------------------------- */

  function enable() {
    if (enabled || !isEligible()) return;
    enabled = true;

    build();

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerover', onPointerOver, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.documentElement.addEventListener('pointerenter', onPointerEnter);
    document.addEventListener('keydown', onKeydown);

    wake();
  }

  function disable() {
    if (!enabled) return;
    enabled = false;

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerover', onPointerOver);
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointerup', onPointerUp);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    document.documentElement.removeEventListener('pointerenter', onPointerEnter);
    document.removeEventListener('keydown', onKeydown);

    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }

    lastTime = 0;
    hasMoved = false;
    teardown();
  }

  function init() {
    if (!('PointerEvent' in window)) return;

    enable();

    /* A tablet docked to a mouse, or motion preferences changed mid-session. */
    var pointerMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
    var motionMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

    var sync = function () {
      if (isEligible()) enable();
      else disable();
    };

    [pointerMQ, motionMQ].forEach(function (query) {
      if (typeof query.addEventListener === 'function') query.addEventListener('change', sync);
      else if (typeof query.addListener === 'function') query.addListener(sync);
    });
  }

  DA.cursor = {
    init: init,
    enable: enable,
    disable: disable,
    isEnabled: function () { return enabled; }
  };

})(window, document);
