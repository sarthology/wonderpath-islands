(() => {
  const section = document.querySelector('#how');
  if (!section) return;
  const steps = [...section.querySelectorAll('.step')];
  const scenes = [...section.querySelectorAll('.journey-scene')];
  const controls = [...section.querySelectorAll('[data-journey-step]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const count = section.querySelector('.journey-count');
  const summary = section.querySelector('.journey-summary');
  const summaries = [
    'Your experience. Your interests. Your starting point.',
    'See the industries and opportunities beyond the familiar.',
    'Connect the skills you have to paths you could take.',
    'Build the skills that bring your next move within reach.',
    'Turn the people you know into meaningful conversations.'
  ];
  let active = -1;
  let visible = false;
  let frame = 0;

  function activate(index) {
    if (index === active) return;
    active = index;
    section.dataset.activeStep = String(index + 1);
    steps.forEach((step, i) => {
      step.classList.toggle('current', i === index);
      const number = step.querySelector('.step-number');
      if (i === index) number.setAttribute('aria-current', 'step');
      else number.removeAttribute('aria-current');
    });
    scenes.forEach((scene, i) => {
      scene.classList.toggle('is-active', i === index);
      scene.setAttribute('aria-hidden', String(i !== index));
    });
    controls.forEach(control => {
      if (control.classList.contains('step-number')) return;
      control.setAttribute('aria-pressed', String(Number(control.dataset.journeyStep) === index));
    });
    count.textContent = `0${index + 1} / 05`;
    summary.textContent = summaries[index];
  }

  function render() {
    frame = 0;
    const navHeight = document.querySelector('.navigation').getBoundingClientRect().height;
    const panel = section.querySelector('.how-heading');
    const narrow = innerWidth <= 900;
    const readingTop = navHeight + (narrow ? panel.getBoundingClientRect().height : 0);
    const anchor = readingTop + Math.max(80, (innerHeight - readingTop) * 0.43);
    const bounds = steps.map(step => step.getBoundingClientRect());
    let nearest = 0;
    let distance = Infinity;
    bounds.forEach((rect, i) => {
      const delta = Math.abs(rect.top + rect.height / 2 - anchor);
      if (delta < distance) { nearest = i; distance = delta; }
    });
    activate(nearest);
    const rail = section.querySelector('.steps').getBoundingClientRect();
    const marker = steps[nearest].querySelector('.step-number').getBoundingClientRect();
    section.style.setProperty('--journey-progress', `${marker.top + marker.height / 2 - rail.top}px`);
  }

  function schedule() {
    if (visible && !frame) frame = requestAnimationFrame(render);
  }
  controls.forEach(control => control.addEventListener('click', () => {
    const index = Number(control.dataset.journeyStep);
    const rect = steps[index].getBoundingClientRect();
    const navHeight = document.querySelector('.navigation').getBoundingClientRect().height;
    const panelHeight = innerWidth <= 900 ? section.querySelector('.how-heading').getBoundingClientRect().height : 0;
    const readingTop = navHeight + panelHeight;
    const anchor = readingTop + Math.max(80, (innerHeight - readingTop) * 0.43);
    window.scrollTo({ top: scrollY + rect.top + rect.height / 2 - anchor, behavior: reduced.matches ? 'instant' : 'smooth' });
  }));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, { rootMargin: '100px' }).observe(section);
  } else visible = true;
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('load', schedule, { once: true });
  reduced.addEventListener('change', schedule);
  activate(0);
  schedule();
})();
