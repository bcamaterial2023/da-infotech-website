/* ==========================================================================
   DA INFOTECH — TECHNOLOGY ECOSYSTEM
   --------------------------------------------------------------------------
   Positions the technology list on concentric orbits.

   ⚠ THE LIST BELOW IS UNCONFIRMED.
   It is the candidate list supplied in the brief, not a verified inventory
   of what DA Infotech works with. Prune it before launch — listing a
   technology the team does not actually use is a claim the site cannot back.

   Editing TECHNOLOGIES rebuilds the markup. Set it to null to keep whatever
   is already written in index.html instead.

   Layout notes:
     • Chips do not orbit. The rings rotate and the chips breathe on the
       spot, so a hover target never moves out from under the pointer.
     • Orbital placement is applied only after coordinates are assigned, via
       .is-orbital. Without this script the list stays a plain, readable
       register — nothing is hidden behind JavaScript.
     • Below the narrow breakpoint the register is the better layout, so no
       orbit is applied at all.

   Registers as DA.technologies; initialised by js/main.js.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var DA = window.DA = window.DA || {};

  /* ---- EDIT ME ---------------------------------------------------------- */
  var TECHNOLOGIES = [
    'JavaScript',
    'React',
    'Next.js',
    'Node.js',
    'Python',
    'Flutter',
    'React Native',
    'AI / LLM APIs',
    'Cloud',
    'Databases'
  ];
  /* ----------------------------------------------------------------------- */

  /* Ring radii as a percentage of half the container. Items are spread over
     these from the inside out. */
  var ORBITS = [30, 41, 50];
  var ORBIT_QUERY = '(min-width: 900px)';

  var system = null;
  var list = null;
  var orbitMQ = null;

  /* ---------------------------------------------------------------------- */
  /* Rendering                                                               */
  /* ---------------------------------------------------------------------- */

  function render(names) {
    list.textContent = '';

    names.forEach(function (name) {
      var item = document.createElement('li');
      item.className = 'tech__item';

      var chip = document.createElement('span');
      chip.className = 'tech__chip';
      chip.textContent = name;

      item.appendChild(chip);
      list.appendChild(item);
    });
  }

  function items() {
    return Array.prototype.slice.call(list.querySelectorAll('.tech__item'));
  }

  /* ---------------------------------------------------------------------- */
  /* Placement                                                               */
  /* ---------------------------------------------------------------------- */

  /* Spreads n items across the rings, weighting the outer rings so the
     spacing stays even as the circumference grows. */
  function distribute(count) {
    var weights = ORBITS.map(function (radius) { return radius; });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    var counts = weights.map(function (w) { return Math.floor(count * w / total); });

    var placed = counts.reduce(function (a, b) { return a + b; }, 0);
    var ring = ORBITS.length - 1;

    while (placed < count) {          /* remainder goes to the outer rings */
      counts[ring] += 1;
      placed += 1;
      ring = ring > 0 ? ring - 1 : ORBITS.length - 1;
    }

    return counts;
  }

  function place() {
    var all = items();
    if (!all.length) return;

    var counts = distribute(all.length);
    var index = 0;

    counts.forEach(function (count, ring) {
      if (!count) return;

      var step = 360 / count;
      /* Offset each ring so items never line up into spokes. */
      var offset = ring * (step / 2) - 90;

      for (var i = 0; i < count; i++) {
        var item = all[index];
        item.style.setProperty('--a', (offset + i * step).toFixed(2) + 'deg');
        item.style.setProperty('--r', ORBITS[ring] + '%');
        item.style.setProperty('--i', index);
        index += 1;
      }
    });

    system.classList.add('is-orbital');
  }

  function clear() {
    items().forEach(function (item) {
      item.style.removeProperty('--a');
      item.style.removeProperty('--r');
      item.style.removeProperty('--i');
    });

    system.classList.remove('is-orbital');
  }

  function sync() {
    if (orbitMQ && orbitMQ.matches) place();
    else clear();
  }

  /* ---------------------------------------------------------------------- */
  /* Lifecycle                                                               */
  /* ---------------------------------------------------------------------- */

  function set(names) {
    if (!list || !Array.isArray(names) || !names.length) return;
    render(names);
    sync();
  }

  function init() {
    system = document.querySelector('[data-tech-system]');
    list = document.querySelector('[data-tech-list]');
    if (!system || !list) return;

    if (Array.isArray(TECHNOLOGIES) && TECHNOLOGIES.length) render(TECHNOLOGIES);

    orbitMQ = window.matchMedia(ORBIT_QUERY);
    sync();

    if (typeof orbitMQ.addEventListener === 'function') orbitMQ.addEventListener('change', sync);
    else if (typeof orbitMQ.addListener === 'function') orbitMQ.addListener(sync);
  }

  DA.technologies = {
    init: init,
    set: set,
    list: function () { return TECHNOLOGIES.slice(); }
  };

})(window, document);
