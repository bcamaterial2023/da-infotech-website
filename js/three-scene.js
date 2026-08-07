/* ==========================================================================
   DA INFOTECH — HERO SCENE: "DIGITAL TECHNOLOGY CORE"
   --------------------------------------------------------------------------
   An abstract technology core rather than a literal object. Reading outward:

     nucleus   a small emissive solid at the centre        — the product
     core      a translucent faceted shell with lit edges  — the software
     cage      a counter-rotating outer wireframe          — the system
     network   nodes on a sphere joined by proximity links — connectivity
     pulses    points travelling along those links         — data in motion
     rings     inclined orbital paths at differing speeds  — automation
     dust      a sparse depth field                        — scale

   Everything except the core shell is unlit and additively blended, so the
   composition reads the same regardless of how a browser resolves physical
   light units, and it glows without a post-processing pass.

   Quality scales across three tiers (see TIERS). Under prefers-reduced-motion
   the scene still builds and renders one frame, then stops — present, static.

   Registers as DA.threeScene; initialised by js/main.js.
   ========================================================================== */

(function (window, document) {
  'use strict';

  var DA = window.DA = window.DA || {};

  /* ---------------------------------------------------------------------- */
  /* Configuration                                                           */
  /* ---------------------------------------------------------------------- */

  /* Two accents and one near-white, matching --color-accent and
     --color-accent-soft exactly. The scene had drifted to six separate blue
     tints, which is how a palette stops reading as one decision. */
  var ACCENT = 0x2D7DFF;
  var ACCENT_SOFT = 0x6BA5FF;
  var HIGHLIGHT = 0xDCEAFF;

  var CORE_RADIUS = 1.24;
  var CAGE_RADIUS = 2.02;
  var NODE_RADIUS = 2.95;
  var COMPOSITION_RADIUS = 4.5;   /* what the camera framing tries to hold */

  var TIERS = {
    high:   { nodes: 82, links: 190, particles: 850, coreDetail: 2, cageDetail: 1, rings: 3, pulses: 26, maxDpr: 2.00, antialias: true },
    medium: { nodes: 54, links: 120, particles: 440, coreDetail: 1, cageDetail: 1, rings: 3, pulses: 15, maxDpr: 1.75, antialias: true },
    low:    { nodes: 30, links:  62, particles: 170, coreDetail: 1, cageDetail: 0, rings: 2, pulses:  8, maxDpr: 1.50, antialias: false }
  };

  /* Where the core sits in the viewport, as a fraction of width / height.
     Desktop pushes it into the right field; narrow screens centre it. */
  var LAYOUT_WIDE = { x: 0.685, y: 0.50, heightFill: 1.16 };
  var LAYOUT_NARROW = { x: 0.50, y: 0.40, heightFill: 1.45 };
  var NARROW_QUERY = '(max-width: 768px)';

  /* ---------------------------------------------------------------------- */
  /* State                                                                   */
  /* ---------------------------------------------------------------------- */

  var canvas = null;
  var renderer = null;
  var scene = null;
  var camera = null;
  var clock = null;

  var root = null;      /* reveal scale                                      */
  var world = null;     /* viewport offset, scroll offset, pointer rotation  */
  var spinner = null;   /* continuous rotation                               */
  var nodeField = null; /* counter-rotating network                          */
  var coreGroup = null; /* nucleus + shell + edges, breathes as one           */
  var ringGroup = null;
  var dust = null;
  var elapsed = 0;      /* own accumulator — THREE.Clock resets on start()   */

  var lights = {};
  var fadeables = [];   /* { material, opacity } — for reveal / scroll fades  */
  var pulseState = null;
  var linkPairs = [];

  var tier = 'high';
  var settings = TIERS.high;
  var narrowMQ = null;

  var frameId = null;
  var running = false;
  var onScreen = true;
  var staticMode = false;
  var observer = null;

  var camBaseZ = 10;
  var baseY = 0;

  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var revealValue = 0;
  var scrollValue = 0;

  /* ---------------------------------------------------------------------- */
  /* Capability detection                                                    */
  /* ---------------------------------------------------------------------- */

  function isSupported() {
    if (typeof window.THREE === 'undefined') return false;

    try {
      var test = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (test.getContext('webgl2') || test.getContext('webgl')));
    } catch (error) {
      return false;
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function detectTier() {
    var width = window.innerWidth;
    var cores = navigator.hardwareConcurrency || 4;
    var memory = navigator.deviceMemory || 4;

    if (width <= 768) return 'low';
    if (width <= 1200 || cores <= 4 || memory <= 4) return 'medium';
    return 'high';
  }

  function pixelRatio() {
    return Math.min(window.devicePixelRatio || 1, settings.maxDpr) * ratioScale;
  }

  function isNarrow() {
    return narrowMQ ? narrowMQ.matches : window.innerWidth <= 768;
  }

  /* ---------------------------------------------------------------------- */
  /* Helpers                                                                 */
  /* ---------------------------------------------------------------------- */

  /* Deterministic noise: the composition is identical on every load, which
     matters for something used as brand imagery. */
  function rand(seed) {
    var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  /* Frame-rate independent damping — the reason motion stays smooth on a
     144Hz monitor and on a throttled phone alike. */
  function damp(current, target, lambda, delta) {
    return current + (target - current) * (1 - Math.exp(-lambda * delta));
  }

  function track(material) {
    fadeables.push({ material: material, opacity: material.opacity });
    return material;
  }

  function fibonacciSphere(count, radius) {
    var points = [];
    var offset = 2 / count;
    var increment = Math.PI * (3 - Math.sqrt(5));

    for (var i = 0; i < count; i++) {
      var y = i * offset - 1 + offset / 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var phi = i * increment;
      var jitter = 0.88 + rand(i) * 0.26;

      points.push(new window.THREE.Vector3(
        Math.cos(phi) * r * radius * jitter,
        y * radius * jitter,
        Math.sin(phi) * r * radius * jitter
      ));
    }

    return points;
  }

  function makeDotTexture() {
    var size = 64;
    var element = document.createElement('canvas');
    element.width = size;
    element.height = size;

    var ctx = element.getContext('2d');
    var gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0.00, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.22, 'rgba(190,216,255,0.9)');
    gradient.addColorStop(0.55, 'rgba(110,165,255,0.25)');
    gradient.addColorStop(1.00, 'rgba(70,130,255,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    var texture = new window.THREE.CanvasTexture(element);
    if (window.THREE.SRGBColorSpace) texture.colorSpace = window.THREE.SRGBColorSpace;
    return texture;
  }

  /* ---------------------------------------------------------------------- */
  /* Scene construction                                                      */
  /* ---------------------------------------------------------------------- */

  function buildCore() {
    var THREE = window.THREE;
    var group = new THREE.Group();

    /* Nucleus — small, bright, always readable. */
    var nucleus = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.46, 1),
      track(new THREE.MeshBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }))
    );
    nucleus.renderOrder = 1;
    group.add(nucleus);

    /* Faceted translucent shell — the only lit surface in the scene. */
    var shellGeometry = new THREE.IcosahedronGeometry(CORE_RADIUS, settings.coreDetail);

    var shell = new THREE.Mesh(
      shellGeometry,
      track(new THREE.MeshStandardMaterial({
        color: 0x0B1220,
        emissive: 0x0C2A5E,
        emissiveIntensity: 0.85,
        metalness: 0.4,
        roughness: 0.42,
        flatShading: true,
        transparent: true,
        opacity: 0.66,
        depthWrite: false
      }))
    );
    shell.renderOrder = 2;
    group.add(shell);

    /* Lit edges over the facets. */
    var edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(shellGeometry, 0.1),
      track(new THREE.LineBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }))
    );
    edges.renderOrder = 3;
    group.add(edges);

    return group;
  }

  function buildCage() {
    var THREE = window.THREE;

    var cage = new THREE.LineSegments(
      new THREE.EdgesGeometry(
        new THREE.IcosahedronGeometry(CAGE_RADIUS, settings.cageDetail), 0.1
      ),
      track(new THREE.LineBasicMaterial({
        color: ACCENT_SOFT,
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      }))
    );

    cage.renderOrder = 2;
    return cage;
  }

  /* Nodes, the proximity graph between them, and the pulses that travel it. */
  function buildNetwork() {
    var THREE = window.THREE;
    var group = new THREE.Group();
    var points = fibonacciSphere(settings.nodes, NODE_RADIUS);
    var i;

    /* --- nodes --- */
    var nodePositions = new Float32Array(points.length * 3);
    var nodeColors = new Float32Array(points.length * 3);
    var accent = new THREE.Color(ACCENT);
    var soft = new THREE.Color(HIGHLIGHT);

    for (i = 0; i < points.length; i++) {
      nodePositions[i * 3] = points[i].x;
      nodePositions[i * 3 + 1] = points[i].y;
      nodePositions[i * 3 + 2] = points[i].z;

      var mix = new THREE.Color().copy(accent).lerp(soft, rand(i + 7) * 0.75);
      nodeColors[i * 3] = mix.r;
      nodeColors[i * 3 + 1] = mix.g;
      nodeColors[i * 3 + 2] = mix.b;
    }

    var nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    nodeGeometry.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

    var nodes = new THREE.Points(nodeGeometry, track(new THREE.PointsMaterial({
      size: 0.085,
      sizeAttenuation: true,
      map: makeDotTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })));
    nodes.renderOrder = 5;
    group.add(nodes);

    /* --- links: nearest neighbours only, shortest first --- */
    var threshold = NODE_RADIUS * 0.46;
    var candidates = [];
    var j;

    for (i = 0; i < points.length; i++) {
      for (j = i + 1; j < points.length; j++) {
        var distance = points[i].distanceTo(points[j]);
        if (distance < threshold) candidates.push({ a: i, b: j, d: distance });
      }
    }

    candidates.sort(function (m, n) { return m.d - n.d; });
    candidates = candidates.slice(0, settings.links);

    var linkPositions = new Float32Array(candidates.length * 6);
    var linkColors = new Float32Array(candidates.length * 6);
    linkPairs = [];

    for (i = 0; i < candidates.length; i++) {
      var a = points[candidates[i].a];
      var b = points[candidates[i].b];

      linkPositions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
      linkPairs.push([a, b]);

      /* Longer links fade out, so the graph reads as depth rather than mesh. */
      var strength = 1 - (candidates[i].d / threshold);
      var tint = new THREE.Color().copy(accent).multiplyScalar(0.45 + strength * 0.55);
      linkColors.set([tint.r, tint.g, tint.b, tint.r, tint.g, tint.b], i * 6);
    }

    var linkGeometry = new THREE.BufferGeometry();
    linkGeometry.setAttribute('position', new THREE.BufferAttribute(linkPositions, 3));
    linkGeometry.setAttribute('color', new THREE.BufferAttribute(linkColors, 3));

    var links = new THREE.LineSegments(linkGeometry, track(new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })));
    links.renderOrder = 4;
    group.add(links);

    /* --- pulses: bright points running along a subset of the links --- */
    var count = linkPairs.length ? Math.min(settings.pulses, linkPairs.length) : 0;

    if (count) {
      var pulsePositions = new Float32Array(count * 3);
      var edges = [];
      var progress = [];
      var speeds = [];

      for (i = 0; i < count; i++) {
        edges.push(Math.floor(rand(i + 91) * linkPairs.length) % linkPairs.length);
        progress.push(rand(i + 53));
        speeds.push(0.22 + rand(i + 17) * 0.4);
      }

      var pulseGeometry = new THREE.BufferGeometry();
      pulseGeometry.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));

      var pulses = new THREE.Points(pulseGeometry, track(new THREE.PointsMaterial({
        size: 0.15,
        sizeAttenuation: true,
        map: makeDotTexture(),
        color: HIGHLIGHT,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })));
      pulses.renderOrder = 6;
      group.add(pulses);

      pulseState = {
        geometry: pulseGeometry,
        positions: pulsePositions,
        edges: edges,
        progress: progress,
        speeds: speeds,
        count: count
      };
    }

    return group;
  }

  function buildRings() {
    var THREE = window.THREE;
    var group = new THREE.Group();
    var segments = tier === 'low' ? 72 : 128;

    for (var r = 0; r < settings.rings; r++) {
      var radius = 3.35 + r * 0.62;
      var positions = new Float32Array(segments * 3);

      for (var i = 0; i < segments; i++) {
        var angle = (i / segments) * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
      }

      var geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      var ring = new THREE.LineLoop(geometry, track(new THREE.LineBasicMaterial({
        color: r === 1 ? ACCENT : ACCENT_SOFT,
        transparent: true,
        opacity: 0.2 - r * 0.035,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })));

      /* Each ring gets its own inclination and its own drift rate. */
      ring.rotation.x = 1.05 + rand(r + 3) * 0.9;
      ring.rotation.z = rand(r + 11) * Math.PI;
      ring.userData.spin = (r % 2 === 0 ? 1 : -1) * (0.045 + rand(r + 23) * 0.05);
      ring.renderOrder = 3;

      group.add(ring);
    }

    return group;
  }

  function buildDust() {
    var THREE = window.THREE;
    var count = settings.particles;
    var positions = new Float32Array(count * 3);

    for (var i = 0; i < count; i++) {
      positions[i * 3] = (rand(i + 101) - 0.5) * 22;
      positions[i * 3 + 1] = (rand(i + 202) - 0.5) * 13;
      positions[i * 3 + 2] = (rand(i + 303) - 0.5) * 12 - 2;
    }

    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    var field = new THREE.Points(geometry, track(new THREE.PointsMaterial({
      size: 0.035,
      sizeAttenuation: true,
      color: ACCENT_SOFT,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })));

    field.renderOrder = 0;
    return field;
  }

  function buildLights() {
    var THREE = window.THREE;

    lights.ambient = new THREE.AmbientLight(0x1C2740, 2.4);
    lights.key = new THREE.PointLight(ACCENT, 26, 16, 2);
    lights.key.position.set(2.4, 1.6, 3.0);
    lights.rim = new THREE.PointLight(ACCENT_SOFT, 12, 16, 2);
    lights.rim.position.set(-3.2, -1.8, 1.4);
    lights.fill = new THREE.DirectionalLight(ACCENT_SOFT, 1.1);
    lights.fill.position.set(2, 3, 4);

    lights.keyBase = lights.key.intensity;
    lights.rimBase = lights.rim.intensity;

    scene.add(lights.ambient, lights.key, lights.rim, lights.fill);
  }

  function buildScene() {
    var THREE = window.THREE;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(0, 0, camBaseZ);
    clock = new THREE.Clock();

    root = new THREE.Group();
    world = new THREE.Group();
    spinner = new THREE.Group();

    nodeField = buildNetwork();
    ringGroup = buildRings();
    coreGroup = buildCore();

    spinner.add(coreGroup);
    spinner.add(buildCage());
    spinner.add(nodeField);
    spinner.add(ringGroup);

    world.add(spinner);
    root.add(world);

    dust = buildDust();
    root.add(dust);

    scene.add(root);
    buildLights();

    applyReveal();
  }

  /* ---------------------------------------------------------------------- */
  /* Reveal / scroll response                                                */
  /* ---------------------------------------------------------------------- */

  function applyReveal() {
    /* Scroll dims the whole composition as the hero hands over. */
    var factor = revealValue * (1 - scrollValue * 0.6);

    for (var i = 0; i < fadeables.length; i++) {
      fadeables[i].material.opacity = fadeables[i].opacity * factor;
    }

    if (root) root.scale.setScalar(0.84 + revealValue * 0.16);
  }

  function setReveal(value) {
    revealValue = Math.max(0, Math.min(1, value));
    if (spinner) spinner.rotation.y = (1 - revealValue) * 0.55;
    applyReveal();
    if (staticMode) renderOnce();
  }

  function setScroll(progress) {
    scrollValue = Math.max(0, Math.min(1, progress));
    if (!world) return;

    world.position.y = baseY - scrollValue * 1.9;
    world.rotation.z = scrollValue * 0.22;
    camera.position.z = camBaseZ + scrollValue * 2.6;

    /* Light intensity is applied per-frame in updateScene, which folds this
       scroll value together with its own drift — setting it here as well
       would mean two writers fighting over one property. Static mode has no
       per-frame pass, so it still needs the direct write. */
    if (staticMode) {
      if (lights.key) lights.key.intensity = lights.keyBase * (1 - scrollValue * 0.65);
      if (lights.rim) lights.rim.intensity = lights.rimBase * (1 + scrollValue * 0.5);
    }

    applyReveal();
  }

  function setPointer(x, y) {
    pointer.tx = Math.max(-1, Math.min(1, x));
    pointer.ty = Math.max(-1, Math.min(1, y));
  }

  /* ---------------------------------------------------------------------- */
  /* Per-frame update                                                        */
  /* ---------------------------------------------------------------------- */

  function updateScene(delta, elapsed) {
    var i;

    /* Pointer never drives rotation directly — it moves a target the scene
       eases towards, which is what keeps the motion feeling weighted. */
    pointer.x = damp(pointer.x, pointer.tx, 3.2, delta);
    pointer.y = damp(pointer.y, pointer.ty, 3.2, delta);

    world.rotation.y = pointer.x * 0.30;
    world.rotation.x = pointer.y * 0.20;
    root.position.x = pointer.x * 0.24;
    root.position.y = pointer.y * -0.14;

    spinner.rotation.y += delta * 0.055;
    spinner.rotation.x = Math.sin(elapsed * 0.14) * 0.06;

    /* The core breathes — a fraction of a percent, below conscious notice,
       but it stops the composition reading as a still image. */
    if (coreGroup) {
      var breath = 1 + Math.sin(elapsed * 0.55) * 0.018;
      coreGroup.scale.setScalar(breath);
    }

    nodeField.rotation.y -= delta * 0.028;
    nodeField.rotation.z = Math.sin(elapsed * 0.1) * 0.05;

    /* Lighting drifts rather than sitting fixed, and the key light leans
       toward the pointer so the facets catch differently as it moves. */
    if (lights.key) {
      lights.key.intensity = lights.keyBase *
        (1 - scrollValue * 0.65) * (0.88 + Math.sin(elapsed * 0.42) * 0.12);
      lights.key.position.x = 2.4 + pointer.x * 1.6;
      lights.key.position.y = 1.6 + pointer.y * 1.1;
    }

    if (lights.rim) {
      lights.rim.intensity = lights.rimBase *
        (1 + scrollValue * 0.5) * (0.9 + Math.cos(elapsed * 0.33) * 0.1);
    }

    dust.rotation.y = elapsed * 0.008 + pointer.x * -0.1;
    dust.position.y = Math.sin(elapsed * 0.12) * 0.22;

    /* Orbital rings, each at its own rate. */
    for (i = 0; i < ringGroup.children.length; i++) {
      ringGroup.children[i].rotation.y += delta * ringGroup.children[i].userData.spin;
    }

    /* Data pulses: advance along the current link, then jump to another. */
    if (pulseState) {
      for (i = 0; i < pulseState.count; i++) {
        pulseState.progress[i] += pulseState.speeds[i] * delta;

        if (pulseState.progress[i] > 1) {
          pulseState.progress[i] = 0;
          pulseState.edges[i] = (pulseState.edges[i] + 7) % linkPairs.length;
        }

        var pair = linkPairs[pulseState.edges[i]];
        var t = pulseState.progress[i];

        pulseState.positions[i * 3] = pair[0].x + (pair[1].x - pair[0].x) * t;
        pulseState.positions[i * 3 + 1] = pair[0].y + (pair[1].y - pair[0].y) * t;
        pulseState.positions[i * 3 + 2] = pair[0].z + (pair[1].z - pair[0].z) * t;
      }

      pulseState.geometry.attributes.position.needsUpdate = true;
    }
  }

  /* ---------------------------------------------------------------------- */
  /* Render loop                                                             */
  /* ---------------------------------------------------------------------- */

  function renderOnce() {
    if (renderer && scene && camera) renderer.render(scene, camera);
  }

  /* --- Adaptive quality ---------------------------------------------------
     Device tiers are a guess made from screen width and core count; this is
     the measurement. If the scene cannot hold a reasonable frame rate over a
     sustained window, the pixel ratio steps down — the cheapest large saving
     available, and invisible next to a stuttering canvas. It only ever steps
     down, so it cannot oscillate. */
  var DEGRADE_AFTER = 90;      /* frames of evidence before acting */
  var SLOW_FRAME = 1 / 40;     /* slower than 40fps counts as struggling */
  var MIN_RATIO = 0.75;

  var slowFrames = 0;
  var sampled = 0;
  var ratioScale = 1;

  function samplePerformance(delta) {
    if (ratioScale <= MIN_RATIO) return;

    sampled += 1;
    if (delta > SLOW_FRAME) slowFrames += 1;

    if (sampled < DEGRADE_AFTER) return;

    /* More than half the window was slow — take a step down. */
    if (slowFrames > DEGRADE_AFTER * 0.5) {
      ratioScale = Math.max(MIN_RATIO, ratioScale - 0.25);
      renderer.setPixelRatio(pixelRatio());
    }

    sampled = 0;
    slowFrames = 0;
  }

  function render() {
    frameId = window.requestAnimationFrame(render);
    if (!renderer || !scene || !camera) return;

    /* Clamped so a backgrounded tab or a GC pause resumes without a lurch.
       The clock is never stopped: THREE.Clock.start() zeroes elapsedTime,
       which would snap every sine-driven drift back to its origin. */
    var raw = clock.getDelta();
    var delta = Math.min(raw, 0.05);
    elapsed += delta;

    if (raw < 0.5) samplePerformance(raw);   /* ignore tab-switch outliers */

    updateScene(delta, elapsed);
    renderer.render(scene, camera);
  }

  function start() {
    if (running || !renderer || staticMode) return;
    running = true;
    clock.getDelta();   /* discard the idle gap */
    render();
  }

  function stop() {
    if (!running) return;
    running = false;
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId);
      frameId = null;
    }
  }

  function syncRunState() {
    if (staticMode) return;
    if (onScreen && document.visibilityState === 'visible') start();
    else stop();
  }

  /* ---------------------------------------------------------------------- */
  /* Sizing and framing                                                      */
  /* ---------------------------------------------------------------------- */

  /* Frames the composition rather than fixing the camera: the distance is
     solved so COMPOSITION_RADIUS fills the intended share of the viewport in
     both axes, which is what keeps a 21:9 monitor and a 375px phone from
     needing separate hand-tuned values. */
  function frameCamera(aspect) {
    var layout = isNarrow() ? LAYOUT_NARROW : LAYOUT_WIDE;
    var halfFov = window.THREE.MathUtils.degToRad(camera.fov) / 2;
    var tanHalf = Math.tan(halfFov);

    var distanceForHeight = COMPOSITION_RADIUS / (tanHalf * layout.heightFill);
    var distanceForWidth = COMPOSITION_RADIUS / (tanHalf * aspect * 0.98);

    camBaseZ = Math.max(distanceForHeight, distanceForWidth);
    camera.position.z = camBaseZ + scrollValue * 2.6;

    var visibleHeight = 2 * tanHalf * camBaseZ;
    var visibleWidth = visibleHeight * aspect;

    world.position.x = (layout.x - 0.5) * visibleWidth;
    baseY = (0.5 - layout.y) * visibleHeight;
    world.position.y = baseY - scrollValue * 1.9;
  }

  function resize() {
    if (!renderer || !camera || !canvas) return;

    var width = canvas.clientWidth;
    var height = canvas.clientHeight;
    if (!width || !height) return;

    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    frameCamera(camera.aspect);
    camera.updateProjectionMatrix();

    if (staticMode) renderOnce();
  }

  function observeSize() {
    if (typeof window.ResizeObserver === 'function') {
      new window.ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }
  }

  function observeVisibility() {
    document.addEventListener('visibilitychange', syncRunState);

    if (!('IntersectionObserver' in window)) return;

    observer = new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      syncRunState();
    }, { threshold: 0 });

    observer.observe(canvas);
  }

  function onContextLost(event) {
    event.preventDefault();
    stop();
  }

  /* Tracked across the whole window, not just the canvas, so the core
     responds to cursor movement over the headline as well. */
  function onPointerMove(event) {
    if (event.pointerType && event.pointerType === 'touch') return;

    setPointer(
      (event.clientX / window.innerWidth) * 2 - 1,
      -((event.clientY / window.innerHeight) * 2 - 1)
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Lifecycle                                                               */
  /* ---------------------------------------------------------------------- */

  function init(target) {
    canvas = typeof target === 'string' ? document.querySelector(target) : target;

    if (!canvas || !isSupported()) return false;

    var THREE = window.THREE;

    narrowMQ = window.matchMedia(NARROW_QUERY);
    tier = detectTier();
    settings = TIERS[tier];
    staticMode = prefersReducedMotion();

    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: settings.antialias,
        alpha: true,
        powerPreference: 'high-performance'
      });
    } catch (error) {
      renderer = null;
      return false;
    }

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(pixelRatio());

    buildScene();
    resize();
    observeSize();

    canvas.addEventListener('webglcontextlost', onContextLost, false);

    if (staticMode) {
      /* Present but still: one frame at a gentle resting angle. */
      setReveal(1);
      spinner.rotation.set(0.12, -0.45, 0);
      nodeField.rotation.y = 0.3;
      renderOnce();
    } else {
      observeVisibility();
      syncRunState();
      window.addEventListener('pointermove', onPointerMove, { passive: true });
    }

    /* Re-frame when crossing the narrow breakpoint. */
    var onLayoutChange = function () { resize(); };
    if (typeof narrowMQ.addEventListener === 'function') {
      narrowMQ.addEventListener('change', onLayoutChange);
    } else if (typeof narrowMQ.addListener === 'function') {
      narrowMQ.addListener(onLayoutChange);
    }

    return true;
  }

  function destroy() {
    stop();

    if (observer) { observer.disconnect(); observer = null; }
    document.removeEventListener('visibilitychange', syncRunState);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    if (canvas) canvas.removeEventListener('webglcontextlost', onContextLost);

    if (scene) {
      scene.traverse(function (object) {
        if (object.geometry) object.geometry.dispose();

        if (object.material) {
          var materials = Array.isArray(object.material)
            ? object.material
            : [object.material];

          materials.forEach(function (material) {
            Object.keys(material).forEach(function (key) {
              var value = material[key];
              if (value && value.isTexture && typeof value.dispose === 'function') {
                value.dispose();
              }
            });
            material.dispose();
          });
        }
      });
    }

    if (renderer) { renderer.dispose(); renderer = null; }

    scene = null;
    camera = null;
    clock = null;
    canvas = null;
    root = world = spinner = nodeField = coreGroup = ringGroup = dust = null;
    elapsed = 0;
    ratioScale = 1;
    slowFrames = 0;
    sampled = 0;
    fadeables = [];
    linkPairs = [];
    pulseState = null;
  }

  DA.threeScene = {
    init: init,
    start: start,
    stop: stop,
    resize: resize,
    destroy: destroy,
    setReveal: setReveal,
    setScroll: setScroll,
    setPointer: setPointer,
    isSupported: isSupported,
    isRunning: function () { return running; },
    isStatic: function () { return staticMode; },
    getTier: function () { return tier; }
  };

})(window, document);
