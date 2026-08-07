/* ==========================================================================
   DA INFOTECH — ENTRY POINT
   --------------------------------------------------------------------------
   Boots the site modules in order and handles page-level concerns: the load
   gate, the footer year, and small environment flags other modules read.

   Loaded last (all scripts are `defer`, so execution order matches markup
   order): navigation → cursor → services → technologies → contact →
   animations → three-scene → main.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var DA = window.DA = window.DA || {};

  /* Failsafe: never leave the page faded out if fonts or the load event
     stall. Halved from 1200ms — the fonts already use display=swap, so all
     this gate buys is avoiding a reflow mid-intro, and a longer wait is a
     longer blank screen. */
  var LOAD_TIMEOUT = 600;

  var loadResolved = false;
  var loadCallbacks = [];
  var booted = false;

  /* ---------------------------------------------------------------------- */
  /* Environment                                                            */
  /* ---------------------------------------------------------------------- */

  var env = {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    touch: window.matchMedia('(hover: none)').matches,
    webgl: false,         /* resolved once THREE has finished loading */
    sceneTier: null,
    sceneSkipped: false   /* true when save-data / 2G / low memory skipped it */
  };

  /* ---------------------------------------------------------------------- */
  /* Load gate                                                              */
  /* ---------------------------------------------------------------------- */

  function markLoaded() {
    if (loadResolved) return;
    loadResolved = true;
    document.documentElement.classList.add('is-loaded');

    /* One frame later, so the body fade is already under way when the hero
       sequence starts — the two overlap instead of queueing. */
    window.requestAnimationFrame(function () {
      while (loadCallbacks.length) loadCallbacks.shift()();
    });
  }

  function onLoaded(callback) {
    if (loadResolved) callback();
    else loadCallbacks.push(callback);
  }

  function initLoadState() {
    /* Fonts first — swapping Space Grotesk in mid-animation causes reflow. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(markLoaded).catch(markLoaded);
    } else {
      markLoaded();
    }

    window.setTimeout(markLoaded, LOAD_TIMEOUT);
  }

  /* ---------------------------------------------------------------------- */
  /* Small page-level details                                               */
  /* ---------------------------------------------------------------------- */

  function initFooterYear() {
    var nodes = document.querySelectorAll('[data-current-year]');
    var year = String(new Date().getFullYear());
    nodes.forEach(function (node) { node.textContent = year; });
  }

  /* Browsers restore the previous scroll position on reload, which fights
     the hero intro. Anchored loads are left alone. */
  function initScrollRestoration() {
    if ('scrollRestoration' in window.history && !window.location.hash) {
      window.history.scrollRestoration = 'manual';
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Hero                                                                   */
  /* ---------------------------------------------------------------------- */

  /* No WebGL, or the context could not be created: drop a soft light into
     the right field so the composition still reads as intentional. */
  function addHeroFallback() {
    var hero = document.querySelector('[data-hero]');
    var canvas = document.querySelector('[data-hero-canvas]');
    if (!hero || hero.querySelector('.hero__fallback')) return;

    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);

    var glow = document.createElement('div');
    glow.className = 'hero__fallback';
    glow.setAttribute('aria-hidden', 'true');
    hero.insertBefore(glow, hero.firstChild);
  }

  /* ---------------------------------------------------------------------- */
  /* Three.js — fetched off the critical path                               */
  /* ---------------------------------------------------------------------- */

  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';

  /* Same integrity guarantee the markup gives GSAP. Verified against jsDelivr;
     regenerate if the pinned version changes, or the script will be refused. */
  var THREE_SRI = 'sha384-qOkzR5Ke/XkQxuGVJ9hpFEpDlcoLtWwVYhnJf06cLIZa2vaIptSqaubivErzmD5O';

  /* The low-performance path. Motion preference is deliberately NOT a reason
     to skip: someone who asked for less movement still gets the composition,
     just still. Bandwidth and memory are the axes that justify dropping a
     654KB decorative asset entirely. */
  function shouldLoadScene() {
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      if (connection.saveData) return false;
      if (/(^|-)2g$/.test(connection.effectiveType || '')) return false;
    }

    if ((navigator.deviceMemory || 4) < 2) return false;
    if (!document.querySelector('[data-hero-canvas]')) return false;

    return true;
  }

  function loadScript(src, integrity, onDone, onFail) {
    var element = document.createElement('script');
    element.async = true;
    element.onload = onDone;
    element.onerror = onFail;

    if (integrity) {
      element.integrity = integrity;
      element.crossOrigin = 'anonymous';
    }

    element.src = src;   /* set last: attributes must be in place first */
    document.head.appendChild(element);
  }

  /* The scene reveals itself rather than riding the hero timeline: it may
     arrive well after the intro has finished, and the intro must never wait
     on a network request. */
  function revealScene() {
    var hero = document.querySelector('[data-hero]');
    if (hero) hero.classList.add('is-scene-ready');

    if (!DA.threeScene) return;

    if (env.reducedMotion || typeof window.gsap === 'undefined') {
      DA.threeScene.setReveal(1);
      return;
    }

    var proxy = { v: 0 };
    window.gsap.to(proxy, {
      v: 1,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: function () { DA.threeScene.setReveal(proxy.v); }
    });
  }

  function startScene() {
    if (!DA.threeScene || !DA.threeScene.isSupported()) {
      addHeroFallback();
      return;
    }

    env.webgl = true;

    if (!DA.threeScene.init('[data-hero-canvas]')) {
      addHeroFallback();
      return;
    }

    env.sceneTier = DA.threeScene.getTier();
    revealScene();
  }

  function initScene() {
    if (!shouldLoadScene()) {
      env.sceneSkipped = true;
      addHeroFallback();
      return;
    }

    /* Idle time if the browser offers it, otherwise just after load — either
       way, never before the page is usable. */
    var begin = function () {
      loadScript(THREE_URL, THREE_SRI, startScene, addHeroFallback);
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(begin, { timeout: 2500 });
    } else {
      window.setTimeout(begin, 200);
    }
  }

  /* The hero's own sequence runs on the load gate and never waits for WebGL. */
  function initHero() {
    onLoaded(function () {
      if (DA.animations && DA.animations.initHero) {
        DA.animations.initHero({ scene: false });
        return;
      }

      /* The animation module never arrived — present the hero unsequenced
         rather than leaving it in its pre-intro state. */
      revealHeroWithoutSequence(false);
    });
  }

  /* Scroll-linked sections. Registered after the reveal system so
     ScrollTrigger is already initialised when these attach. */
  function initSections() {
    if (!DA.animations) return;

    ['initWork', 'initAbout', 'initPrinciples', 'initProcess'].forEach(function (name) {
      if (DA.animations[name]) DA.animations[name]();
    });
  }

  function revealHeroWithoutSequence(sceneReady) {
    var hero = document.querySelector('[data-hero]');
    var header = document.querySelector('[data-header]');

    if (hero) hero.setAttribute('data-intro', 'done');
    if (header) header.setAttribute('data-intro', 'done');
  }

  /* ---------------------------------------------------------------------- */
  /* Boot                                                                   */
  /* ---------------------------------------------------------------------- */

  /* Idempotent on purpose. A second boot would double-bind every listener and
     fetch Three.js twice — which the browser reports as "Multiple instances of
     Three.js being imported". DOMContentLoaded cannot fire twice, but a script
     included twice by mistake can, and this is a one-line guarantee. */
  function init() {
    if (booted) return;
    booted = true;

    initScrollRestoration();
    initFooterYear();

    if (DA.navigation) DA.navigation.init();
    if (DA.cursor) DA.cursor.init();
    if (DA.services) DA.services.init();
    if (DA.technologies) DA.technologies.init();
    if (DA.contact) DA.contact.init();
    if (DA.animations) DA.animations.init();

    initHero();
    initSections();
    initLoadState();
    initScene();

    DA.env = env;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})(window, document);
