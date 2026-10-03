const DWELL = 6000;

function setup() {
  const hero = document.querySelector(".hero");
  const timeline = hero && hero.querySelector(".hero-timeline");
  if (!timeline) return;

  const slides = [...hero.querySelectorAll(".hero-slide")];
  const stops = [...timeline.querySelectorAll(".hero-stop")];
  const moments = [...hero.querySelectorAll(".hero-moment")];
  const persona = hero.querySelector(".hero-persona");
  const pause = timeline.querySelector(".hero-pause");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = { index: 0, taken: reduced.matches, userPaused: false, visible: true, timer: null };

  timeline.hidden = false;

  function load(slide) {
    if (!slide.dataset.src) return Promise.resolve();
    slide.srcset = slide.dataset.srcset;
    slide.src = slide.dataset.src;
    delete slide.dataset.src;
    delete slide.dataset.srcset;
    return slide.decode().catch(() => {});
  }

  async function show(index) {
    const slide = slides[index];
    await load(slide);
    state.index = index;
    slides.forEach((other, i) => {
      other.classList.toggle("is-active", i === index);
      other.toggleAttribute("aria-hidden", i !== index);
    });
    stops.forEach((stop, i) => stop.setAttribute("aria-pressed", String(i === index)));
    const list = timeline.querySelector(".hero-stops");
    const active = stops[index].parentElement;
    list.scrollTo({ left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
    moments.forEach((moment, i) => (moment.hidden = i !== index));
    if (slides[index + 1]) load(slides[index + 1]);
  }

  function running() {
    return !state.taken && !state.userPaused && state.visible && !document.hidden;
  }

  function schedule() {
    clearTimeout(state.timer);
    hero.classList.toggle("is-running", running());
    if (!running()) return;
    state.timer = setTimeout(async () => {
      const next = state.index + 1;
      if (next >= slides.length) {
        await show(0);
        state.taken = true;
        pause.hidden = true;
        schedule();
        return;
      }
      await show(next);
      restartFill();
      schedule();
    }, DWELL);
  }

  function restartFill() {
    hero.classList.remove("is-running");
    void hero.offsetWidth;
    hero.classList.toggle("is-running", running());
  }

  function takeOver() {
    if (state.taken) return;
    state.taken = true;
    pause.hidden = true;
    persona.setAttribute("aria-live", "polite");
    schedule();
  }

  stops.forEach((stop, i) => {
    stop.addEventListener("click", () => {
      takeOver();
      show(i);
    });
  });

  pause.addEventListener("click", () => {
    state.userPaused = !state.userPaused;
    pause.setAttribute("aria-pressed", String(state.userPaused));
    pause.setAttribute("aria-label", state.userPaused ? "Retomar a troca de momentos" : "Pausar a troca de momentos");
    schedule();
  });

  let start = null;
  const media = hero.querySelector(".hero-media");
  media.addEventListener("pointerdown", (event) => {
    start = event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY };
  });
  media.addEventListener("pointerup", (event) => {
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    const target = state.index + (dx < 0 ? 1 : -1);
    if (target < 0 || target >= slides.length) return;
    takeOver();
    show(target);
  });

  new IntersectionObserver(([entry]) => {
    state.visible = entry.isIntersecting;
    schedule();
  }, { threshold: 0.4 }).observe(hero);

  document.addEventListener("visibilitychange", schedule);

  if (state.taken) {
    pause.hidden = true;
    return;
  }

  const begin = () => {
    load(slides[1]);
    schedule();
  };
  if (document.readyState === "complete") begin();
  else window.addEventListener("load", begin, { once: true });
}

setup();
