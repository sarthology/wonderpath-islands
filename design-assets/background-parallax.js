(() => {
  const sections = [...document.querySelectorAll('.hero, .shift, .waitlist')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  let frame = 0;

  function schedule() {
    if (!frame && !reduced.matches && visible.size) frame = requestAnimationFrame(render);
  }

  function render() {
    frame = 0;
    if (reduced.matches) return;
    // Measure together, then write: the sky travels at 28% of scroll distance,
    // making its apparent movement 72% of the foreground's speed.
    const measurements = [...visible].map(section => ({ section, rect: section.getBoundingClientRect() }));
    for (const { section, rect } of measurements) {
      const travel = (innerHeight + rect.height) * 0.14;
      const distance = (innerHeight / 2 - rect.top - rect.height / 2) * 0.28;
      section.style.setProperty('--sky-overscan', `${Math.ceil(travel + 2)}px`);
      section.style.setProperty('--background-y', `${Math.max(-travel, Math.min(travel, distance)).toFixed(2)}px`);
      if (section.classList.contains('waitlist')) {
        section.style.setProperty('--closing-cloud-near-y', `${(-distance * 0.4).toFixed(2)}px`);
        section.style.setProperty('--closing-cloud-far-y', `${(-distance * 0.22).toFixed(2)}px`);
      }
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      schedule();
    }, { rootMargin: '80px' });
    sections.forEach(section => observer.observe(section));
  } else sections.forEach(section => visible.add(section));

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  reduced.addEventListener('change', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    sections.forEach(section => {
      section.style.removeProperty('--background-y');
      section.style.removeProperty('--sky-overscan');
      section.style.removeProperty('--closing-cloud-near-y');
      section.style.removeProperty('--closing-cloud-far-y');
    });
    schedule();
  });
  schedule();
})();
