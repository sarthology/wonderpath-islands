(() => {
  const page = document.querySelector("#page"),
    track = document.querySelector("#track"),
    panels = [...track.children],
    motionPreference = matchMedia("(prefers-reduced-motion:reduce)");
  let reduced = motionPreference.matches;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  let active = 0,
    px = 0,
    py = 0,
    mx = 0,
    my = 0,
    zoom = 1,
    last = 0,
    frame = 0,
    hidden = false;
  const zooms = panels.map(() => 1),
    frames = panels.map((p) => p.querySelector(".art-frame"));
  const MAX_ZOOM = 3.2;
  const pans = panels.map(() => ({ x: 0, y: 0 }));
  const note = document.querySelector(".gesture-note");
  const reset = document.createElement("button");
  reset.className = "reset-camera";
  reset.textContent = "Reset view";
  reset.addEventListener("click", () => {
    pans[active] = { x: 0, y: 0 };
    setZoom(1);
  });
  page.append(reset);
  function updateCameraUI() {
    const close = zooms[active] > 1.3;
    page.classList.toggle("has-zoom", close);
    panels.forEach((panel, i) => {
      const close = zooms[i] > 1.3;
      if (close && !panel.classList.contains("is-close")) {
        frames[i].style.setProperty(
          "--overview-width",
          `${frames[i].offsetWidth}px`,
        );
      }
      panel.classList.toggle("is-close", close);
      panel.querySelector(".copy").setAttribute("aria-hidden", String(close));
    });
    const touch = matchMedia("(pointer:coarse)").matches || innerWidth <= 700;
    note.textContent = close
      ? touch
        ? "Pinch to zoom · Two fingers to look around"
        : "Move your pointer to look around · 0 to reset"
      : touch
        ? "Swipe sideways to explore · Swipe up to zoom in"
        : "Scroll sideways to explore · Scroll up to zoom in";
  }
  // Crop coordinates within the unchanged 1448 × 1086 debris atlas.
  const boxes = [
    [225, 828, 62, 69],
    [1105, 861, 68, 62],
    [340, 903, 43, 38],
    [1007, 919, 34, 32],
    [861, 970, 72, 70],
    [507, 991, 48, 46],
  ];
  const rocks = frames.map((f, k) =>
    boxes.map(([x, y, w, h], j) => {
      const el = document.createElement("span");
      el.className = "debris";
      el.setAttribute("aria-hidden", "true");
      el.style.cssText = `left:${(x / 1448) * 100}%;top:${(y / 1086) * 100}%;width:${(w / 1448) * 100}%;height:${(h / 1086) * 100}%`;
      const face = document.createElement("span");
      face.className = "rock-face";
      const img = document.createElement("img");
      img.src = "assets/debris-atlas.webp";
      img.alt = "";
      img.draggable = false;
      img.style.cssText = `width:${(1448 / w) * 100}%;height:${(1086 / h) * 100}%;left:${(-x / w) * 100}%;top:${(-y / h) * 100}%`;
      face.append(img);
      el.append(face);
      f.append(el);
      return {
        el,
        phase: j * 1.73 + k * 0.37,
        depth: 0.65 + j * 0.22,
        speed: 0.32 + j * 0.071,
      };
    }),
  );
  // Separate cloud planes stay in front of the island, outside its zoom transform.
  const foreground = panels.map((panel) => {
    const stage = panel.querySelector(".art-stage");
    return [0, 1].map((i) => {
      const cloud = document.createElement("img");
      cloud.className = `foreground-cloud foreground-cloud-${i + 1}`;
      cloud.src = "assets/foreground-cloud.png";
      cloud.alt = "";
      cloud.draggable = false;
      cloud.setAttribute("aria-hidden", "true");
      stage.append(cloud);
      return cloud;
    });
  });
  const third = document.createElement("div");
  third.className = "cloud cloud-three";
  third.setAttribute("aria-hidden", "true");
  third.innerHTML = '<img src="assets/foreground-cloud.png" alt="">';
  page.append(third);
  const clouds = [...document.querySelectorAll(".cloud")];
  const set = (e, k, v) => e.style.setProperty(k, v);
  function updateActive() {
    const previous = active;
    active = clamp(
      Math.round(track.scrollLeft / track.clientWidth),
      0,
      panels.length - 1,
    );
    if (previous !== active) {
      zoom = zooms[active];
      document.querySelector(".zoom-readout").textContent =
        Math.round(zoom * 100) + "%";
    }
    updateCameraUI();
    panels.forEach((p, i) =>
      p.classList.toggle("is-near", Math.abs(i - active) < 2),
    );
  }
  // Animate only the current island and its two neighbors.
  function tick(t) {
    frame = 0;
    if (hidden) return;
    const dt = Math.min(t - last || 16, 64);
    last = t;
    px += (mx - px) * Math.min(1, dt * 0.006);
    py += (my - py) * Math.min(1, dt * 0.006);
    zoom = reduced
      ? zooms[active]
      : zoom + (zooms[active] - zoom) * Math.min(1, dt * 0.009);
    const time = reduced ? 0 : t * 0.001;
    const progress = track.scrollLeft / track.clientWidth;
    const motion = reduced ? 0 : 1;
    set(page, "--horizon-x", `${-progress * 2 - px * 7 * motion}px`);
    set(page, "--horizon-y", `${py * 3 * motion}px`);
    set(page, "--near-x", `${-progress * 5 - px * 15 * motion}px`);
    set(page, "--near-y", `${py * 6 * motion}px`);
    set(page, "--sun-x", `${-px * 5 * motion}px`);
    set(page, "--sky-zoom", 1 + Math.max(0, zoom - 1) * 0.045);
    clouds.forEach((c, i) => {
      const d = [1.4, 2.1, 0.4][i];
      set(c, "--cloud-zoom", 1 + Math.max(0, zoom - 1) * d * 0.13);
      set(
        c,
        "--cx",
        `${(-progress * d * 8 - px * 22 * d + Math.sin(time * 0.045 + i * 2) * 35 * d) * motion}px`,
      );
      set(
        c,
        "--cy",
        `${(py * -9 * d + Math.sin(time * 0.09 + i) * 7) * motion}px`,
      );
    });
    for (
      let k = Math.max(0, active - 1);
      k <= Math.min(panels.length - 1, active + 1);
      k++
    ) {
      const f = frames[k],
        z = k === active ? zoom : zooms[k];
      const art = f.querySelector(".island-layer");
      const size =
        (innerWidth > 950 ? Math.round(64 * z) : Math.round(94 * z)) + "vw";
      if (art.sizes !== size) art.sizes = size;
      set(f, "--zoom", z);
      const stage = f.parentElement;
      const overflowX = Math.max(
        0,
        (f.offsetWidth * z - stage.clientWidth) / 2 + 32,
      );
      const overflowY = Math.max(
        0,
        (f.offsetHeight * z - stage.clientHeight) / 2 + 32,
      );
      // Phone overview is bottom-aligned; center the inspection camera as it zooms in.
      const recenter = clamp((z - 1) / 0.3, 0, 1);
      const centerX =
        (stage.clientWidth / 2 - f.offsetLeft - f.offsetWidth / 2) * recenter;
      const centerY =
        (stage.clientHeight / 2 - f.offsetTop - f.offsetHeight / 2) * recenter;
      const cameraX =
        centerX +
        clamp(pans[k].x - px * overflowX * 2 * motion, -overflowX, overflowX);
      const cameraY =
        centerY +
        clamp(pans[k].y - py * overflowY * 2 * motion, -overflowY, overflowY);
      set(f, "--camera-x", `${cameraX}px`);
      set(f, "--camera-y", `${cameraY}px`);
      foreground[k].forEach((cloud, i) => {
        const depth = i === 0 ? 1 : 1.65;
        set(cloud, "--cloud-zoom", 1 + Math.max(0, z - 1) * depth * 0.36);
        set(
          cloud,
          "--fx",
          `${cameraX * depth * 0.22 + (-px * 65 * depth + Math.sin(time * 0.12 + i * 3) * 19) * motion}px`,
        );
        set(
          cloud,
          "--fy",
          `${cameraY * depth * 0.16 + (py * -24 * depth + Math.sin(time * 0.16 + i) * 7) * motion}px`,
        );
      });
      set(f, "--ix", `${px * 5 * motion}px`);
      set(f, "--iy", `${(py * 3 + Math.sin(time * 0.6 + k) * 3) * motion}px`);
      rocks[k].forEach((r) => {
        set(
          r.el,
          "--rx",
          `${(px * 17 * r.depth + Math.sin(time * r.speed + r.phase) * 4 * r.depth) * motion}px`,
        );
        set(
          r.el,
          "--ry",
          `${(py * 12 * r.depth + Math.sin(time * r.speed * 1.2 + r.phase) * 7 * r.depth) * motion}px`,
        );
        set(
          r.el,
          "--rr",
          `${Math.sin(time * r.speed * 0.7 + r.phase) * 3 * motion}deg`,
        );
      });
    }
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (!frame && !hidden) frame = requestAnimationFrame(tick);
  }
  track.addEventListener(
    "scroll",
    () => {
      updateActive();
      start();
    },
    { passive: true },
  );
  // Lock the wheel axis for each trackpad gesture.
  let axis = null,
    wheelAt = 0,
    total = 0,
    armed = true,
    zoomTimer;
  // Every zoom input shares the same bounds and readout.
  function setZoom(value) {
    zooms[active] = clamp(value, 0.75, MAX_ZOOM);
    if (zooms[active] <= 1) pans[active] = { x: 0, y: 0 };
    updateCameraUI();
    page.classList.add("is-zooming", "explored");
    document.querySelector(".zoom-readout").textContent =
      Math.round(zooms[active] * 100) + "%";
    clearTimeout(zoomTimer);
    zoomTimer = setTimeout(() => page.classList.remove("is-zooming"), 1000);
    start();
  }
  function changeZoom(delta) {
    setZoom(zooms[active] * Math.exp(-delta * 0.0014));
  }
  function go(i) {
    i = clamp(i, 0, panels.length - 1);
    track.scrollTo({
      left: i * track.clientWidth,
      behavior: reduced ? "instant" : "smooth",
    });
    page.classList.add("explored");
  }
  track.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const now = performance.now(),
        unit =
          e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? track.clientHeight : 1;
      const x =
          (e.shiftKey && Math.abs(e.deltaX) < 1 ? e.deltaY : e.deltaX) * unit,
        y = e.deltaY * unit;
      if (now - wheelAt > 200) {
        axis = null;
        total = 0;
        armed = true;
      }
      wheelAt = now;
      if (!axis)
        axis = e.shiftKey || Math.abs(x) > Math.abs(y) * 1.1 ? "x" : "y";
      if (axis === "y" || e.ctrlKey) {
        changeZoom(y);
        return;
      }
      total += x;
      if (armed && Math.abs(total) > 45) {
        armed = false;
        go(active + Math.sign(total));
      }
    },
    { passive: false },
  );
  if (matchMedia("(pointer:coarse)").matches || innerWidth <= 700)
    document.querySelector(".gesture-note").innerHTML =
      "Swipe sideways to explore <span>·</span> Swipe up to zoom in";
  const pointers = new Map();
  let drag = null,
    pinch = null;
  track.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    track.setPointerCapture(e.pointerId);
    if (pointers.size === 2) {
      const a = [...pointers.values()];
      pinch = {
        distance: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y),
        zoom: zooms[active],
        centerX: (a[0].x + a[1].x) / 2,
        centerY: (a[0].y + a[1].y) / 2,
        panX: pans[active].x,
        panY: pans[active].y,
      };
      drag = null;
      track.classList.remove("is-dragging");
    } else {
      drag = {
        x: e.clientX,
        y: e.clientY,
        lastY: e.clientY,
        scroll: track.scrollLeft,
        axis: null,
      };
      track.classList.add("is-dragging");
    }
  });
  track.addEventListener("pointermove", (e) => {
    updatePointer(e);
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const a = [...pointers.values()];
      const f = frames[active],
        stage = f.parentElement;
      const ox = Math.max(
        0,
        (f.offsetWidth * zooms[active] - stage.clientWidth) / 2 + 32,
      );
      const oy = Math.max(
        0,
        (f.offsetHeight * zooms[active] - stage.clientHeight) / 2 + 32,
      );
      pans[active].x = clamp(
        pinch.panX + (a[0].x + a[1].x) / 2 - pinch.centerX,
        -ox,
        ox,
      );
      pans[active].y = clamp(
        pinch.panY + (a[0].y + a[1].y) / 2 - pinch.centerY,
        -oy,
        oy,
      );
      setZoom(
        (pinch.zoom * Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y)) /
          Math.max(1, pinch.distance),
      );
      start();
    } else if (drag) {
      const dx = e.clientX - drag.x,
        dy = e.clientY - drag.y;
      if (!drag.axis && Math.hypot(dx, dy) > 9)
        drag.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (drag.axis === "x") track.scrollLeft = drag.scroll - dx;
      else if (drag.axis === "y") changeZoom((e.clientY - drag.lastY) * 3);
      drag.lastY = e.clientY;
    }
  });
  function finish(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (!pointers.size) {
      if (drag && drag.axis === "x")
        go(Math.round(track.scrollLeft / track.clientWidth));
      drag = null;
      pinch = null;
      track.classList.remove("is-dragging");
    }
  }
  track.addEventListener("pointerup", finish);
  track.addEventListener("pointercancel", finish);
  track.addEventListener("lostpointercapture", finish);
  track.addEventListener("dragstart", (e) => e.preventDefault());
  function updatePointer(e) {
    if (e.pointerType === "touch") {
      mx = 0;
      my = 0;
      return;
    }
    const rect = frames[active].parentElement.getBoundingClientRect();
    mx = clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
    my = clamp((e.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);
  }
  window.addEventListener("pointermove", updatePointer, { passive: true });
  track.tabIndex = 0;
  track.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      go(
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? panels.length - 1
            : active + (e.key === "ArrowRight" ? 1 : -1),
      );
    } else if (["+", "=", "-", "0", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      if (e.key === "0") setZoom(1);
      else changeZoom(["+", "=", "ArrowUp"].includes(e.key) ? -100 : 100);
    }
  });
  window.addEventListener("resize", () => {
    // Re-measure the overview layout at the new screen size, then restore immersion.
    panels.forEach((panel) => panel.classList.remove("is-close"));
    updateCameraUI();
    track.scrollTo({ left: active * track.clientWidth, behavior: "instant" });
    updateActive();
  });
  document.addEventListener("visibilitychange", () => {
    hidden = document.hidden;
    if (hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else start();
  });
  motionPreference.addEventListener("change", (e) => {
    reduced = e.matches;
    start();
  });
  updateActive();
  start();
})();
