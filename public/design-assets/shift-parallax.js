(() => {
  const section = document.querySelector('.shift');
  if (!section) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const current = { x: 0, y: 0, scroll: 0 };
  const target = { x: 0, y: 0, scroll: 0 };
  let visible = false;
  let frame = 0;

  function schedule() {
    if (visible && !reduced.matches && !frame) frame = requestAnimationFrame(render);
  }

  function render() {
    frame = 0;
    if (!visible || reduced.matches) return;
    const rect = section.getBoundingClientRect();
    target.scroll = Math.max(-1, Math.min(1,
      (innerHeight / 2 - rect.top - rect.height / 2) / ((innerHeight + rect.height) / 2)
    ));
    let moving = false;
    for (const key of Object.keys(current)) {
      current[key] += (target[key] - current[key]) * 0.14;
      if (Math.abs(target[key] - current[key]) > 0.001) moving = true;
    }
    const strength = innerWidth <= 600 ? 0.55 : 1;
    const s = current.scroll * strength;
    section.style.setProperty('--shift-island-x', `${(current.x * -12).toFixed(2)}px`);
    section.style.setProperty('--shift-island-y', `${(s * -26 + current.y * -8).toFixed(2)}px`);
    section.style.setProperty('--shift-cloud-x', `${(current.x * 18).toFixed(2)}px`);
    section.style.setProperty('--shift-cloud-y', `${(s * -48 + current.y * 12).toFixed(2)}px`);
    if (moving) schedule();
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (!visible) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else schedule();
    }, { rootMargin: '80px' }).observe(section);
  } else {
    visible = true;
    schedule();
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  section.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || reduced.matches) return;
    const rect = section.getBoundingClientRect();
    target.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1));
    target.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / rect.height * 2 - 1));
    schedule();
  }, { passive: true });
  section.addEventListener('pointerleave', () => {
    target.x = target.y = 0;
    schedule();
  });
  reduced.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    for (const key of Object.keys(current)) current[key] = target[key] = 0;
    for (const property of ['island-x', 'island-y', 'cloud-x', 'cloud-y']) {
      section.style.removeProperty(`--shift-${property}`);
    }
    schedule();
  });
})();
