/* ==========================================================================
   DA INFOTECH — NAVIGATION
   --------------------------------------------------------------------------
   Header scroll state, collapsed mobile panel, scroll-spy, and anchor
   scrolling that respects the header offset and the user's motion setting.

   Registers as DA.navigation; initialised by js/main.js.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var DA = window.DA = window.DA || {};

  var SELECTORS = {
    header:      '[data-header]',
    toggle:      '[data-nav-toggle]',
    nav:         '#site-nav',
    navLinks:    '.site-nav__link',
    body:        'body'
  };

  var CLASSES = {
    scrolled: 'is-scrolled',
    open:     'is-open',
    active:   'is-active',
    navOpen:  'is-nav-open'
  };

  /* Below this width the nav is a collapsed panel — keep in sync with the
     1024px breakpoint in css/responsive.css. */
  var COLLAPSE_QUERY = '(max-width: 1024px)';
  var SCROLL_THRESHOLD = 12;

  var header, toggle, nav, links, collapseMQ, progress;
  var sections = [];
  var isOpen = false;
  var ticking = false;
  var scrollRange = 0;

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                */
  /* ---------------------------------------------------------------------- */

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isCollapsed() {
    return collapseMQ ? collapseMQ.matches : false;
  }

  function headerOffset() {
    var raw = getComputedStyle(document.documentElement)
      .getPropertyValue('--header-height');
    var value = parseInt(raw, 10);
    return isNaN(value) ? 76 : value;
  }

  /* ---------------------------------------------------------------------- */
  /* Header scroll state                                                    */
  /* ---------------------------------------------------------------------- */

  function updateHeaderState() {
    if (!header) return;
    header.classList.toggle(CLASSES.scrolled, window.scrollY > SCROLL_THRESHOLD);

    if (!progress) return;

    /* Written as a custom property driving a scaleX — no layout, no paint of
       a changing width, just a composited transform. The document height is
       read from a cache: touching scrollHeight here would force a layout on
       every scroll frame, which is exactly the cost this is meant to avoid. */
    var ratio = scrollRange > 0 ? window.scrollY / scrollRange : 0;
    progress.style.setProperty('--progress', Math.min(1, Math.max(0, ratio)).toFixed(4));
  }

  function measureScrollRange() {
    scrollRange = document.documentElement.scrollHeight - window.innerHeight;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeaderState();
      ticking = false;
    });
  }

  /* ---------------------------------------------------------------------- */
  /* Collapsed panel                                                        */
  /* ---------------------------------------------------------------------- */

  function openNav() {
    if (isOpen || !nav || !toggle) return;
    isOpen = true;
    nav.classList.add(CLASSES.open);
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    document.body.classList.add(CLASSES.navOpen);

    /* Move into the panel once the wipe has run, so a keyboard user lands on
       the first destination rather than on whatever was behind the overlay. */
    window.setTimeout(function () {
      if (!isOpen) return;
      var first = nav.querySelector('.site-nav__link');
      if (first) first.focus({ preventScroll: true });
    }, prefersReducedMotion() ? 0 : 300);
  }

  function closeNav(returnFocus) {
    if (!isOpen || !nav || !toggle) return;
    isOpen = false;
    nav.classList.remove(CLASSES.open);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove(CLASSES.navOpen);
    if (returnFocus) toggle.focus();
  }

  function toggleNav() {
    if (isOpen) closeNav(false);
    else openNav();
  }

  function onDocumentKeydown(event) {
    if (event.key === 'Escape' && isOpen) closeNav(true);
  }

  function onDocumentClick(event) {
    if (!isOpen) return;
    if (nav.contains(event.target) || toggle.contains(event.target)) return;
    closeNav(false);
  }

  /* Keep focus inside the panel while it is open and covering the page. */
  function onNavKeydown(event) {
    if (event.key !== 'Tab' || !isOpen) return;

    var focusable = nav.querySelectorAll('a[href], button:not([disabled])');
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      toggle.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      toggle.focus();
    }
  }

  function onBreakpointChange() {
    if (!isCollapsed()) closeNav(false);
  }

  /* ---------------------------------------------------------------------- */
  /* Anchor scrolling                                                       */
  /* ---------------------------------------------------------------------- */

  function scrollToTarget(target) {
    var top = target.getBoundingClientRect().top + window.scrollY - headerOffset();

    window.scrollTo({
      top: Math.max(top, 0),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });

    /* Move focus so keyboard and screen-reader users follow the jump. */
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  function onAnchorClick(event) {
    var link = event.currentTarget;
    var hash = link.getAttribute('href');
    if (!hash || hash.charAt(0) !== '#' || hash === '#') return;

    var target = document.getElementById(hash.slice(1));
    if (!target) return;

    event.preventDefault();
    if (isOpen) closeNav(false);
    scrollToTarget(target);

    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', hash);
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Mobile quick actions                                                   */
  /* ---------------------------------------------------------------------- */

  /* Shows once the hero has been read and hides again when the contact
     section arrives — by then the real form and the real phone number are on
     screen and a floating copy of them is just noise. Driven by observers,
     not a scroll handler, so it costs nothing while idle. */
  function initQuickCta() {
    var bar = document.querySelector('[data-quick-cta]');
    if (!bar || !('IntersectionObserver' in window)) return;

    var hero = document.querySelector('[data-hero]');
    var contact = document.getElementById('contact');
    var footer = document.getElementById('footer');

    var pastHero = false;
    var atDestination = false;

    var sync = function () {
      bar.classList.toggle('is-visible', pastHero && !atDestination);
    };

    if (hero) {
      new IntersectionObserver(function (entries) {
        pastHero = !entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(hero);
    } else {
      pastHero = true;
    }

    var destinations = [contact, footer].filter(Boolean);

    if (destinations.length) {
      var visible = {};
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting; });
        atDestination = destinations.some(function (el) { return visible[el.id]; });
        sync();
      }, { threshold: 0 });

      destinations.forEach(function (el) { observer.observe(el); });
    }

    sync();
  }

  /* ---------------------------------------------------------------------- */
  /* Scroll spy                                                             */
  /* ---------------------------------------------------------------------- */

  function setActiveLink(id) {
    for (var i = 0; i < links.length; i++) {
      var match = links[i].getAttribute('href') === '#' + id;
      links[i].classList.toggle(CLASSES.active, match);
      if (match) links[i].setAttribute('aria-current', 'true');
      else links[i].removeAttribute('aria-current');
    }
  }

  function initScrollSpy() {
    if (!('IntersectionObserver' in window) || !sections.length) return;

    var observer = new IntersectionObserver(function (entries) {
      /* Pick the entry closest to the top of the viewport that is visible. */
      var best = null;

      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!best || entry.boundingClientRect.top < best.boundingClientRect.top) {
          best = entry;
        }
      });

      if (best) setActiveLink(best.target.id);
    }, {
      rootMargin: '-35% 0px -55% 0px',
      threshold: 0
    });

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------------------------------------------------------------------- */
  /* Init                                                                    */
  /* ---------------------------------------------------------------------- */

  function init() {
    header = document.querySelector(SELECTORS.header);
    toggle = document.querySelector(SELECTORS.toggle);
    nav    = document.querySelector(SELECTORS.nav);
    progress = document.querySelector('[data-scroll-progress]');
    links  = Array.prototype.slice.call(document.querySelectorAll(SELECTORS.navLinks));

    collapseMQ = window.matchMedia(COLLAPSE_QUERY);

    /* Sections the nav points at — the only ones scroll-spy tracks. */
    sections = links
      .map(function (link) {
        var href = link.getAttribute('href') || '';
        return href.charAt(0) === '#' ? document.getElementById(href.slice(1)) : null;
      })
      .filter(Boolean);

    measureScrollRange();
    updateHeaderState();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measureScrollRange, { passive: true });

    /* Reveals and late fonts change the document height after first paint. */
    window.addEventListener('load', measureScrollRange);
    if (typeof window.ResizeObserver === 'function') {
      new window.ResizeObserver(measureScrollRange).observe(document.body);
    }

    if (toggle && nav) {
      toggle.addEventListener('click', toggleNav);
      nav.addEventListener('keydown', onNavKeydown);
      document.addEventListener('keydown', onDocumentKeydown);
      document.addEventListener('click', onDocumentClick);

      if (typeof collapseMQ.addEventListener === 'function') {
        collapseMQ.addEventListener('change', onBreakpointChange);
      } else if (typeof collapseMQ.addListener === 'function') {
        collapseMQ.addListener(onBreakpointChange);   /* Safari < 14 */
      }
    }

    /* Every in-page anchor, not just the nav — covers brand and CTA links. */
    document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(function (link) {
      link.addEventListener('click', onAnchorClick);
    });

    initScrollSpy();
    initQuickCta();
  }

  DA.navigation = {
    init: init,
    open: openNav,
    close: closeNav
  };

})(window, document);
