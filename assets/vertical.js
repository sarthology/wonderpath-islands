(() => {
  const page = document.querySelector('#page');
  const track = document.querySelector('#track');
  const panels = [...track.querySelectorAll('.panel')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const previous = document.querySelector('.previous-island');
  const next = document.querySelector('.next-island');
  const count = document.querySelector('.island-count');
  const zoomReadout = document.querySelector('.vertical-zoom');
  const zoomIn = document.querySelector('.zoom-in');
  const zoomOut = document.querySelector('.zoom-out');
  const reset = document.querySelector('.vertical-reset');
  const note = document.querySelector('.gesture-note');
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const set = (element, key, value) => element.style.setProperty(key, value);
  const layoutAnimations = new WeakMap();
  let reduced = preference.matches;
  let active = -1;
  let pointerX = 0, pointerY = 0, px = 0, py = 0;
  let frame = 0, lastTime = 0;
  let offsets = [], heights = [];

  // A panel can contain one scene or an approved old/new comparison.
  const scenes = panels.flatMap((panel, index) => [...panel.querySelectorAll('.art-frame')].map(art => ({
    panel, index, art, stage: art.parentElement,
    view: art.closest('.comparison-view'), zoom: 1, renderedZoom: 1,
    foreground: [], rocks: [],
  })));
  const selected = panels.map((panel, i) => scenes.find(scene => scene.index === i && scene.view?.dataset.version === 'new')
    || scenes.find(scene => scene.index === i));
  const current = () => selected[active];
  const boxes = [
    [225, 828, 62, 69], [1105, 861, 68, 62], [340, 903, 43, 38],
    [1007, 919, 34, 32], [861, 970, 72, 70], [507, 991, 48, 46],
  ];
  scenes.forEach((scene, k) => {
    // Keep legacy decorative rocks off the new illustration: its terrain is different.
    scene.rocks = scene.view?.dataset.version === 'new' ? [] : boxes.map(([x, y, w, h], j) => {
      const rock = document.createElement('span');
      rock.className = 'debris';
      rock.setAttribute('aria-hidden', 'true');
      rock.style.cssText = `left:${x / 1448 * 100}%;top:${y / 1086 * 100}%;width:${w / 1448 * 100}%;height:${h / 1086 * 100}%`;
      const face = document.createElement('span');
      face.className = 'rock-face';
      const image = document.createElement('img');
      image.src = 'assets/debris-atlas.webp'; image.alt = ''; image.draggable = false;
      image.style.cssText = `width:${1448 / w * 100}%;height:${1086 / h * 100}%;left:${-x / w * 100}%;top:${-y / h * 100}%`;
      face.append(image); rock.append(face); scene.art.append(rock);
      return { element: rock, phase: j * 1.73 + k * .37, depth: .65 + j * .22, speed: .32 + j * .071 };
    });
    scene.foreground = [0, 1].map(i => {
      const cloud = document.createElement('img');
      cloud.className = `foreground-cloud foreground-cloud-${i + 1}`;
      cloud.src = 'assets/foreground-cloud.png'; cloud.alt = ''; cloud.draggable = false;
      cloud.setAttribute('aria-hidden', 'true'); scene.stage.append(cloud);
      return cloud;
    });
  });
  const third = document.createElement('div');
  third.className = 'cloud cloud-three'; third.setAttribute('aria-hidden', 'true');
  third.innerHTML = '<img src="assets/foreground-cloud.png" alt="">'; page.append(third);
  const clouds = [...page.querySelectorAll('.cloud')];

  function measure() {
    offsets = panels.map(panel => panel.offsetTop);
    heights = panels.map(panel => panel.offsetHeight);
  }
  function updateZoomUI() {
    const scene = current(), zoom = scene.zoom;
    zoomReadout.value = `${Math.round(zoom * 100)}%`;
    zoomIn.disabled = zoom >= 3.2; zoomOut.disabled = zoom <= .75;
    reset.disabled = Math.abs(zoom - 1) < .001;
    const name = scene.view ? scene.view.querySelector('.comparison-choice').textContent.trim().toLowerCase() : 'island';
    zoomIn.setAttribute('aria-label', `Zoom in ${name}`);
    zoomOut.setAttribute('aria-label', `Zoom out ${name}`);
    zoomReadout.setAttribute('aria-label', `${name} zoom`);
    note.textContent = scene.view
      ? 'Scroll over either island to zoom · Scroll outside the artwork to explore'
      : 'Scroll up or down to explore · Use + / − to zoom';
  }
  function updateActive() {
    const center = track.scrollTop + track.clientHeight / 2;
    let closest = 0, distance = Infinity;
    panels.forEach((panel, i) => {
      const candidate = Math.abs(offsets[i] + heights[i] / 2 - center);
      if (candidate < distance) { closest = i; distance = candidate; }
      panel.classList.toggle('is-near', Math.abs(offsets[i] - track.scrollTop) < track.clientHeight + heights[i]);
    });
    if (closest !== active) {
      active = closest;
      count.value = `${String(active + 1).padStart(2, '0')} / ${panels.length}`;
      count.setAttribute('aria-label', `Island ${active + 1} of ${panels.length}: ${panels[active].querySelector('.sector-name').textContent.trim()}`);
      previous.disabled = active === 0; next.disabled = active === panels.length - 1;
      page.classList.toggle('has-zoom', current().zoom > 1.3);
      updateZoomUI();
      panels[active + 1]?.querySelector('.island-layer').setAttribute('loading', 'eager');
    }
    set(page, '--journey-progress', track.scrollTop / Math.max(1, track.scrollHeight - track.clientHeight));
  }
  function go(index) {
    track.scrollTo({ top: offsets[clamp(index, 0, panels.length - 1)], behavior: reduced ? 'instant' : 'smooth' });
  }
  function choose(scene) {
    if (scene.index !== active || (scene.panel.classList.contains('is-close') && selected[active] !== scene)) return;
    selected[active] = scene;
    scenes.filter(item => item.index === active && item.view).forEach(item => {
      const chosen = item === scene;
      item.view.classList.toggle('is-selected', chosen);
      item.view.querySelector('.comparison-choice').setAttribute('aria-pressed', String(chosen));
    });
    updateZoomUI();
  }
  function setZoom(value) {
    const scene = current(), panel = scene.panel;
    const zoom = clamp(value, .75, 3.2), close = zoom > 1.3;
    const changed = close !== panel.classList.contains('is-close');
    const layers = changed ? [scene.art, ...scene.foreground] : [];
    const before = layers.map(layer => layer.getBoundingClientRect());
    layers.forEach(layer => layoutAnimations.get(layer)?.cancel());
    if (close && changed) {
      set(scene.art, '--overview-width', `${scene.art.offsetWidth}px`);
      const copy = panel.querySelector('.copy');
      set(copy, '--overview-top', `${copy.offsetTop}px`);
      set(copy, '--overview-left', `${copy.offsetLeft}px`);
      set(copy, '--overview-copy-width', `${copy.offsetWidth}px`);
    }
    scene.zoom = zoom;
    panel.classList.toggle('is-close', close);
    panel.querySelector('.copy').setAttribute('aria-hidden', String(close));
    page.classList.toggle('has-zoom', close);
    scenes.filter(item => item.index === active && item.view).forEach(item => {
      const hidden = close && item !== scene;
      item.view.classList.toggle('is-muted', hidden);
      item.view.inert = hidden;
      item.view.setAttribute('aria-hidden', String(hidden));
    });
    if (changed && !reduced) layers.forEach((layer, i) => {
      const after = layer.getBoundingClientRect(), old = before[i];
      if (!after.width || !after.height) return;
      const animation = layer.animate([
        { translate: `${old.x + old.width / 2 - after.x - after.width / 2}px ${old.y + old.height / 2 - after.y - after.height / 2}px`, scale: `${old.width / after.width} ${old.height / after.height}` },
        { translate: '0px 0px', scale: '1 1' },
      ], { duration: 520, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      layoutAnimations.set(layer, animation);
    });
    updateZoomUI(); start();
  }
  previous.addEventListener('click', () => go(active - 1));
  next.addEventListener('click', () => go(active + 1));
  zoomIn.addEventListener('click', () => setZoom(current().zoom + .25));
  zoomOut.addEventListener('click', () => setZoom(current().zoom - .25));
  reset.addEventListener('click', () => setZoom(1));
  track.addEventListener('keydown', event => {
    if (event.target.closest('button') && !['+', '=', '-', '0'].includes(event.key)) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      go(event.key === 'Home' ? 0 : event.key === 'End' ? panels.length - 1 : active + (['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1));
    } else if (['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault(); setZoom(event.key === '0' ? 1 : current().zoom + (event.key === '-' ? -.25 : .25));
    }
  });
  scenes.filter(scene => scene.view).forEach(scene => {
    const button = scene.view.querySelector('.comparison-choice');
    button.addEventListener('click', () => choose(scene));
    scene.view.addEventListener('pointerenter', () => choose(scene));
    scene.view.addEventListener('focusin', () => choose(scene));
    // Vertical scrolling over artwork retains the original camera gesture.
    // The header, margins, and navigation remain available for moving between panels.
    scene.stage.addEventListener('wheel', event => {
      if (event.ctrlKey || scene.index !== active || Math.abs(track.scrollTop - offsets[active]) > 8) return;
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      choose(scene);
      if (current() !== scene || !event.deltaY) return;
      if (scene.zoom <= .75 && event.deltaY > 0) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? track.clientHeight : 1;
      setZoom(scene.zoom * Math.exp(-event.deltaY * unit * .0014));
    }, { passive: false });
    let pinch = null;
    scene.stage.addEventListener('touchstart', event => {
      if (event.touches.length !== 2 || scene.index !== active) return;
      choose(scene);
      if (current() !== scene) return;
      const [a, b] = event.touches;
      pinch = { distance: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), zoom: scene.zoom };
    }, { passive: true });
    scene.stage.addEventListener('touchmove', event => {
      if (!pinch || event.touches.length !== 2) return;
      event.preventDefault();
      const [a, b] = event.touches;
      setZoom(pinch.zoom * Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY) / Math.max(1, pinch.distance));
    }, { passive: false });
    const endPinch = () => { pinch = null; };
    scene.stage.addEventListener('touchend', endPinch);
    scene.stage.addEventListener('touchcancel', endPinch);
  });
  window.addEventListener('pointermove', event => {
    pointerX = event.pointerType === 'touch' ? 0 : clamp(event.clientX / innerWidth - .5, -.5, .5);
    pointerY = event.pointerType === 'touch' ? 0 : clamp(event.clientY / innerHeight - .5, -.5, .5); start();
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  track.addEventListener('scroll', () => { updateActive(); start(); }, { passive: true });
  track.addEventListener('dragstart', event => event.preventDefault());

  function tick(now) {
    frame = 0;
    if (document.hidden) return;
    const dt = Math.min(now - lastTime || 16, 64); lastTime = now;
    const motion = reduced ? 0 : 1, time = reduced ? 0 : now * .001;
    px += (pointerX - px) * Math.min(1, dt * .006);
    py += (pointerY - py) * Math.min(1, dt * .006);
    const progress = track.scrollTop / Math.max(1, track.clientHeight);
    set(page, '--horizon-y', `${(-progress * 3 + py * 3) * motion}px`);
    set(page, '--sun-x', `${-px * 5 * motion}px`);
    set(page, '--sky-zoom', 1 + Math.max(0, current().renderedZoom - 1) * .045);
    clouds.forEach((cloud, i) => {
      const depth = [1.4, 2.1, .4][i];
      set(cloud, '--cx', `${(-px * 22 * depth + Math.sin(time * .045 + i * 2) * 35 * depth) * motion}px`);
      set(cloud, '--cy', `${(-progress * depth * 6 - py * 9 * depth + Math.sin(time * .09 + i) * 7) * motion}px`);
    });
    scenes.forEach(scene => {
      if (!scene.panel.classList.contains('is-near') || scene.view?.classList.contains('is-muted')) return;
      const art = scene.art, k = scene.index;
      scene.renderedZoom = reduced ? scene.zoom : scene.renderedZoom + (scene.zoom - scene.renderedZoom) * Math.min(1, dt * .009);
      const z = scene.renderedZoom;
      const travel = clamp((track.scrollTop - offsets[k]) / track.clientHeight, -1.5, 1.5);
      const close = scene.panel.classList.contains('is-close');
      const overflowX = Math.max(0, (art.offsetWidth * z - scene.stage.clientWidth) / 2 + 32);
      const overflowY = Math.max(0, (art.offsetHeight * z - scene.stage.clientHeight) / 2 + 32);
      const cameraX = px * (close ? -overflowX * 2 : 32) * motion;
      const cameraY = py * (close ? -overflowY * 2 : 22) * motion;
      set(art, '--zoom', z); set(art, '--scroll-y', `${travel * 85 * motion}px`);
      set(art, '--scroll-scale', 1 - Math.abs(travel) * .045 * motion);
      set(scene.panel, '--copy-y', `${travel * 28 * motion}px`);
      set(art, '--camera-x', `${cameraX}px`); set(art, '--camera-y', `${cameraY}px`);
      set(art, '--tilt-x', `${-py * 3 * motion}deg`); set(art, '--tilt-y', `${px * 4 * motion}deg`);
      set(art, '--ix', `${px * 5 * motion}px`); set(art, '--iy', `${(py * 3 + Math.sin(time * .6 + k) * 3) * motion}px`);
      const image = art.querySelector('.island-layer');
      const size = `${Math.round((scene.view && !close ? 48 : innerWidth > 950 ? 64 : 94) * z)}vw`;
      if (image.sizes !== size) image.sizes = size;
      scene.foreground.forEach((cloud, i) => {
        const depth = i === 0 ? 1 : 1.65;
        set(cloud, '--cloud-zoom', 1 + Math.max(0, z - 1) * depth * .36);
        set(cloud, '--fx', `${(cameraX * depth * .22 - px * 65 * depth + Math.sin(time * .12 + i * 3) * 19) * motion}px`);
        set(cloud, '--fy', `${(travel * 115 * depth + cameraY * depth * .16 - py * 24 * depth + Math.sin(time * .16 + i) * 7) * motion}px`);
      });
      scene.rocks.forEach(rock => {
        set(rock.element, '--rx', `${(px * 17 * rock.depth + Math.sin(time * rock.speed + rock.phase) * 4 * rock.depth) * motion}px`);
        set(rock.element, '--ry', `${(py * 12 * rock.depth + Math.sin(time * rock.speed * 1.2 + rock.phase) * 7 * rock.depth) * motion}px`);
        set(rock.element, '--rr', `${Math.sin(time * rock.speed * .7 + rock.phase) * 3 * motion}deg`);
      });
    });
    if (!reduced) start();
  }
  function start() { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); }
  window.addEventListener('resize', () => {
    const index = Math.max(0, active);
    panels.forEach((panel, i) => {
      if (!panel.classList.contains('is-close')) return;
      panel.classList.remove('is-close');
      set(selected[i].art, '--overview-width', `${selected[i].art.offsetWidth}px`);
      panel.classList.add('is-close');
    });
    measure(); track.scrollTo({ top: offsets[index], behavior: 'instant' }); updateActive(); start();
  });
  preference.addEventListener('change', event => {
    reduced = event.matches;
    if (reduced) scenes.flatMap(scene => [scene.art, ...scene.foreground]).forEach(layer => layoutAnimations.get(layer)?.cancel());
    start();
  });
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    if (!document.hidden) start();
  });
  measure(); updateActive(); start();
})();
