/* ==========================================================================
   DA INFOTECH — ANIMATION CONTROLLER
   --------------------------------------------------------------------------
   Reveals elements marked [data-animate] as they enter the viewport.

   Reveals run on a single IntersectionObserver — cheap, off the main thread,
   and identical with or without GSAP, because the CSS transition owns the
   motion either way. GSAP + ScrollTrigger are reserved for the sequences
   that are genuinely scrubbed against scroll position.

   Under prefers-reduced-motion nothing animates: every element is revealed
   immediately and no observers or triggers are created.

   Registers as DA.animations; initialised by js/main.js.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var DA = window.DA = window.DA || {};

  var REVEAL_SELECTOR = '[data-animate]';
  var VISIBLE_CLASS = 'is-visible';

  var engine = 'none';
  var reduceMQ = null;

  /* ---------------------------------------------------------------------- */
  /* Capability checks                                                      */
  /* ---------------------------------------------------------------------- */

  function prefersReducedMotion() {
    if (!reduceMQ) reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    return reduceMQ.matches;
  }

  function hasGsap() {
    return typeof window.gsap !== 'undefined' &&
           typeof window.ScrollTrigger !== 'undefined';
  }

  /* ---------------------------------------------------------------------- */
  /* Reveal                                                                 */
  /* ---------------------------------------------------------------------- */

  function reveal(element) {
    if (element) element.classList.add(VISIBLE_CLASS);
  }

  function revealAll() {
    document.querySelectorAll(REVEAL_SELECTOR).forEach(reveal);
  }

  /* ---------------------------------------------------------------------- */
  /* Path 1 — GSAP ScrollTrigger                                            */
  /* ---------------------------------------------------------------------- */

  /* Registers GSAP's shared defaults for the scrubbed sequences. It no longer
     creates a trigger per reveal: there were 54 of them, each recomputing its
     start and end on every scroll and every refresh, all to add one class.
     An IntersectionObserver does that off the main thread, and the CSS
     transition was doing the actual animation either way. ScrollTrigger now
     earns its keep only where something is genuinely scrubbed. */
  function initGsapDefaults() {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out', duration: 0.9 });

    ScrollTrigger.defaults({
      start: 'top 82%',
      toggleActions: 'play none none none'
    });

    /* Late fonts and images change layout — recalculate scrub positions. */
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  /* ---------------------------------------------------------------------- */
  /* Path 2 — IntersectionObserver fallback                                 */
  /* ---------------------------------------------------------------------- */

  function initObserver() {
    var elements = document.querySelectorAll(REVEAL_SELECTOR);
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      revealAll();
      engine = 'immediate';
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        obs.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -18% 0px',
      threshold: 0.05
    });

    elements.forEach(function (element) { observer.observe(element); });

    engine = 'observer';
  }

  /* ---------------------------------------------------------------------- */
  /* Hero — intro sequence and scroll hand-off                              */
  /* ---------------------------------------------------------------------- */

  /* Clearing data-intro hands the elements back to normal styling. Called on
     every path, so the hero is never left in its pre-animation state. */
  function settleIntro(hero, header) {
    if (hero) hero.setAttribute('data-intro', 'done');
    if (header) header.setAttribute('data-intro', 'done');
  }

  function heroParts(hero, header) {
    return {
      bar: header ? header.querySelector('[data-header-bar]') : null,
      label: hero.querySelector('[data-hero-el="label"]'),
      lines: toArray(hero.querySelectorAll('[data-hero-line]')),
      lead: hero.querySelector('[data-hero-el="lead"]'),
      actions: hero.querySelector('[data-hero-el="actions"]'),
      proof: hero.querySelector('[data-hero-el="proof"]'),
      cue: hero.querySelector('[data-hero-el="scroll"]'),
      content: hero.querySelector('.hero__content'),
      foot: hero.querySelector('.hero__foot')
    };
  }

  function toArray(nodeList) {
    return Array.prototype.slice.call(nodeList);
  }

  /* Load sequence: navigation, label, headline line by line, copy, buttons,
     and the core scaling into place alongside them. Roughly 1.5s end to end
     — cinematic, but never a loading screen. */
  function playIntro(parts, hero, header, hasScene) {
    var gsap = window.gsap;
    var stack = [parts.label, parts.lead, parts.actions, parts.proof, parts.cue]
      .filter(Boolean);

    /* Take ownership of the start state before releasing the CSS pre-state,
       otherwise there is a frame where everything is visible. */
    if (parts.bar) gsap.set(parts.bar, { autoAlpha: 0, y: -14 });
    gsap.set(stack, { autoAlpha: 0, y: 18 });
    gsap.set(parts.lines, { yPercent: 105, autoAlpha: 0 });

    settleIntro(hero, header);

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (parts.bar) {
      tl.to(parts.bar, { autoAlpha: 1, y: 0, duration: 0.7 }, 0);
    }

    tl.to(parts.label, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.12)
      .to(parts.lines, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.0,
        stagger: 0.085,
        ease: 'expo.out'
      }, 0.2)
      .to(parts.lead, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.58)
      .to(parts.actions, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.7)
      .to(parts.proof, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.82)
      .to(parts.cue, { autoAlpha: 1, y: 0, duration: 0.6 }, 0.9);

    if (hasScene && DA.threeScene) {
      var proxy = { v: 0 };
      tl.to(proxy, {
        v: 1,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: function () { DA.threeScene.setReveal(proxy.v); }
      }, 0.1);
    }

    /* The bar must not keep a transform: it would become the containing
       block for the fixed full-screen menu nested inside it. */
    if (parts.bar) tl.set(parts.bar, { clearProps: 'transform' });

    hero.classList.add('is-scene-ready');
  }

  /* Scroll hand-off: type drifts up and dims, the core sinks and cools, and
     the ambient wash fades into the next section. Deliberately restrained. */
  function initHeroScroll(parts, hero, hasScene) {
    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: function (self) {
        hero.style.setProperty('--hero-glow', (1 - self.progress * 0.9).toFixed(3));
        if (hasScene && DA.threeScene) DA.threeScene.setScroll(self.progress);
      }
    });

    if (parts.content) {
      gsap.to(parts.content, {
        y: -72,
        autoAlpha: 0.12,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.4
        }
      });
    }

    if (parts.foot) {
      gsap.to(parts.foot, {
        autoAlpha: 0,
        y: 24,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: '30% top',
          scrub: 0.3
        }
      });
    }
  }

  function initHero(options) {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;

    var header = document.querySelector('[data-header]');
    var hasScene = !!(options && options.scene);

    /* Reduced motion, or GSAP unavailable: show the hero as it finally is. */
    if (prefersReducedMotion() || !hasGsap()) {
      settleIntro(hero, header);
      hero.classList.add('is-scene-ready');
      if (hasScene && DA.threeScene) DA.threeScene.setReveal(1);
      return;
    }

    var parts = heroParts(hero, header);

    playIntro(parts, hero, header, hasScene);
    initHeroScroll(parts, hero, hasScene);
  }

  /* ---------------------------------------------------------------------- */
  /* Portfolio — scrubbed case-study choreography                           */
  /* ---------------------------------------------------------------------- */

  function initWork() {
    var section = document.querySelector('[data-work]');
    if (!section) return;

    var projects = toArray(section.querySelectorAll('[data-project]'));
    if (!projects.length) return;

    /* Reduced motion or no GSAP: the rails simply read as complete, and the
       reveal system has already shown everything. */
    if (prefersReducedMotion() || !hasGsap()) {
      toArray(section.querySelectorAll('[data-project-rail]')).forEach(function (rail) {
        rail.style.transform = 'scaleX(1)';
      });
      return;
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    projects.forEach(function (project, index) {
      var media = project.querySelector('[data-project-media]');
      var meta = project.querySelector('[data-project-meta]');
      var rail = project.querySelector('[data-project-rail]');
      var num = project.querySelector('[data-project-num]');

      var travel = {
        trigger: project,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.5
      };

      /* The frame settles out of a slight over-scale as it crosses the
         viewport. Hover zoom lives on a child, so the two never collide. */
      if (media) {
        gsap.fromTo(media,
          { scale: 1.09 },
          { scale: 1, ease: 'none', scrollTrigger: travel });
      }

      /* Counter-drift between the two columns — enough to feel layered,
         well short of the parallax that makes a page feel unmoored. */
      if (meta) {
        gsap.fromTo(meta,
          { y: 38 },
          { y: -38, ease: 'none', scrollTrigger: {
            trigger: project, start: 'top bottom', end: 'bottom top', scrub: 0.65
          } });
      }

      /* The rail measures the case study's own passage, not the section's. */
      if (rail) {
        gsap.fromTo(rail,
          { scaleX: 0 },
          { scaleX: 1, ease: 'none', scrollTrigger: {
            trigger: project, start: 'top 72%', end: 'bottom 45%', scrub: 0.3
          } });
      }

      /* The numeral rises out of its mask once, when the row arrives. */
      if (num) {
        gsap.from(num, {
          yPercent: 110,
          duration: 0.85,
          ease: 'expo.out',
          scrollTrigger: { trigger: project, start: 'top 78%', once: true }
        });
      }

    });
  }

  /* ---------------------------------------------------------------------- */
  /* About — the mark draws itself in                                       */
  /* ---------------------------------------------------------------------- */

  /* One constant longer than any frame's perimeter (the largest is 4 × 296 =
     1184). Using a fixed dash rather than getTotalLength() keeps this working
     on engines where SVGGeometryElement measurement is unreliable. */
  var FRAME_DASH = 1400;

  function initAbout() {
    var frames = toArray(document.querySelectorAll('[data-about-draw]'));
    if (!frames.length) return;

    if (prefersReducedMotion() || !hasGsap()) {
      frames.forEach(function (frame) { frame.style.strokeDasharray = 'none'; });
      return;
    }

    var gsap = window.gsap;

    frames.forEach(function (frame, index) {
      gsap.set(frame, { strokeDasharray: FRAME_DASH, strokeDashoffset: FRAME_DASH });

      /* Inner frames complete earlier, so the mark reads as growing outward. */
      gsap.to(frame, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: frame.closest('.about__visual') || frame,
          start: 'top 85%',
          end: 'bottom 45%',
          scrub: 0.6 + index * 0.25
        }
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Why — the spine fills as principles arrive                             */
  /* ---------------------------------------------------------------------- */

  function initPrinciples() {
    var track = document.querySelector('[data-why]');
    if (!track) return;

    var spine = track.querySelector('[data-why-spine]');
    var principles = toArray(track.querySelectorAll('.principle'));

    if (prefersReducedMotion() || !hasGsap()) {
      if (spine) spine.style.transform = 'scaleY(1)';
      principles.forEach(function (p) { p.classList.add('is-reached'); });
      return;
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;

    if (spine) {
      gsap.fromTo(spine,
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: {
          trigger: track, start: 'top 72%', end: 'bottom 65%', scrub: 0.4
        } });
    }

    /* Each node lights when the spine reaches it, and stays lit — scrolling
       back up should not unmake progress the reader already saw. */
    principles.forEach(function (principle) {
      ScrollTrigger.create({
        trigger: principle,
        start: 'top 72%',
        once: true,
        onEnter: function () { principle.classList.add('is-reached'); }
      });
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Process — path draws, stage activates, counter turns                   */
  /* ---------------------------------------------------------------------- */

  function initProcess() {
    var section = document.querySelector('[data-process]');
    if (!section) return;

    var path = section.querySelector('[data-process-path]');
    var stages = toArray(section.querySelectorAll('[data-stage]'));
    if (!stages.length) return;

    /* Without motion the path reads as complete and every stage sits at its
       resting state — no stage is singled out, none is dimmed. */
    if (prefersReducedMotion() || !hasGsap()) {
      if (path) path.style.setProperty('--path-progress', '1');
      stages.forEach(function (stage) { stage.classList.add('is-done'); });
      return;
    }

    var ScrollTrigger = window.ScrollTrigger;
    var active = -1;

    /* One trigger drives both responses. The path progress goes out as a
       custom property rather than a transform, so the same 0→1 value works
       for the horizontal desktop path and the vertical mobile one — the axis
       is CSS's decision, not this module's. */
    ScrollTrigger.create({
      trigger: section,
      start: 'top 62%',
      end: 'bottom 78%',
      onUpdate: function (self) {
        if (path) path.style.setProperty('--path-progress', self.progress.toFixed(4));

        var index = Math.min(
          stages.length - 1,
          Math.max(0, Math.floor(self.progress * stages.length))
        );
        if (index === active) return;
        active = index;

        stages.forEach(function (stage, i) {
          stage.classList.toggle('is-active', i === index);
          stage.classList.toggle('is-done', i < index);
        });
      }
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Public helpers                                                         */
  /* ---------------------------------------------------------------------- */

  /* Later phases inject markup (portfolio filters, loaded cards). Call this
     to register anything added after init. */
  function refresh() {
    if (prefersReducedMotion()) {
      revealAll();
      return;
    }
    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
    if (engine === 'observer') initObserver();
  }

  function init() {
    reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion()) {
      revealAll();
      engine = 'reduced';
    } else {
      /* One observer for every reveal on the page, regardless of GSAP. */
      initObserver();
      if (hasGsap()) initGsapDefaults();
    }

    /* If the user turns motion down mid-session, resolve everything at once. */
    var onChange = function () {
      if (prefersReducedMotion()) revealAll();
    };

    if (typeof reduceMQ.addEventListener === 'function') {
      reduceMQ.addEventListener('change', onChange);
    } else if (typeof reduceMQ.addListener === 'function') {
      reduceMQ.addListener(onChange);
    }
  }

  DA.animations = {
    init: init,
    initHero: initHero,
    initWork: initWork,
    initAbout: initAbout,
    initPrinciples: initPrinciples,
    initProcess: initProcess,
    reveal: reveal,
    revealAll: revealAll,
    refresh: refresh,
    prefersReducedMotion: prefersReducedMotion,
    getEngine: function () { return engine; }
  };

})(window, document);
