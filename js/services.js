/* ==========================================================================
   DA INFOTECH — SERVICES REGISTER
   --------------------------------------------------------------------------
   Pointer-aware lighting for the service bands. Each band's accent wash
   follows the cursor and the band tilts a degree or two toward it.

   All of it is expressed as four custom properties that CSS already has
   sensible defaults for — --mx, --my, --tilt-x, --tilt-y. This module only
   sharpens an effect that works without it: with JavaScript off, or on a
   touch device, the wash simply sits at its resting position and the hover
   choreography in css/style.css runs unchanged.

   Skipped entirely on coarse pointers and under prefers-reduced-motion.

   Registers as DA.services; initialised by js/main.js.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var DA = window.DA = window.DA || {};

  /* Halved after review: at 2.4°/1.6° the tilt announced itself. Feedback
     should register without being noticed. */
  var TILT_Y_MAX = 1.2;   /* degrees, left ↔ right */
  var TILT_X_MAX = 0.8;   /* degrees, top ↔ bottom */

  var items = [];
  var bound = false;
  var frameId = null;
  var active = null;

  /* ---------------------------------------------------------------------- */
  /* Capability                                                              */
  /* ---------------------------------------------------------------------- */

  function isEligible() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ---------------------------------------------------------------------- */
  /* Tracking                                                                */
  /* ---------------------------------------------------------------------- */

  /* Reads happen on the event, writes on the next frame — the two are never
     interleaved, so moving across the register cannot thrash layout. */
  function flush() {
    frameId = null;
    if (!active) return;

    var el = active.el;
    var x = active.x;
    var y = active.y;

    el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    el.style.setProperty('--tilt-y', ((x - 0.5) * 2 * TILT_Y_MAX).toFixed(2) + 'deg');
    el.style.setProperty('--tilt-x', ((0.5 - y) * 2 * TILT_X_MAX).toFixed(2) + 'deg');
  }

  function onPointerMove(event) {
    if (event.pointerType && event.pointerType !== 'mouse') return;

    var el = event.currentTarget;
    var rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    active = {
      el: el,
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    };

    if (frameId === null) frameId = window.requestAnimationFrame(flush);
  }

  /* Hand the band back to its CSS defaults rather than freezing it mid-tilt. */
  function reset(el) {
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
    el.style.removeProperty('--tilt-x');
    el.style.removeProperty('--tilt-y');
  }

  function onPointerLeave(event) {
    if (active && active.el === event.currentTarget) active = null;
    reset(event.currentTarget);
  }

  /* ---------------------------------------------------------------------- */
  /* Lifecycle                                                               */
  /* ---------------------------------------------------------------------- */

  function bind() {
    if (bound || !items.length || !isEligible()) return;
    bound = true;

    items.forEach(function (el) {
      el.addEventListener('pointermove', onPointerMove, { passive: true });
      el.addEventListener('pointerleave', onPointerLeave, { passive: true });
    });
  }

  function unbind() {
    if (!bound) return;
    bound = false;

    items.forEach(function (el) {
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerleave', onPointerLeave);
      reset(el);
    });

    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }

    active = null;
  }

  function init() {
    if (!('PointerEvent' in window)) return;

    items = Array.prototype.slice.call(document.querySelectorAll('[data-service]'));
    if (!items.length) return;

    bind();

    /* A tablet docked to a mouse, or motion preferences changed mid-session. */
    var queries = [
      window.matchMedia('(hover: hover) and (pointer: fine)'),
      window.matchMedia('(prefers-reduced-motion: reduce)')
    ];

    var sync = function () {
      if (isEligible()) bind();
      else unbind();
    };

    queries.forEach(function (query) {
      if (typeof query.addEventListener === 'function') query.addEventListener('change', sync);
      else if (typeof query.addListener === 'function') query.addListener(sync);
    });
  }

  DA.services = {
    init: init,
    bind: bind,
    unbind: unbind,
    isBound: function () { return bound; }
  };

})(window, document);
