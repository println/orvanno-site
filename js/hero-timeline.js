const DWELL = 6000;
const RESUME = 10000;
const LOOP_PAUSE = 12000;
const LEAVE = 1700;

function setup() {
  const hero = document.querySelector(".hero");
  const timeline = hero && hero.querySelector(".hero-timeline");
  if (!timeline) return;

  const slides = [...hero.querySelectorAll(".hero-slide")];
  const stops = [...timeline.querySelectorAll(".hero-stop")];
  const moments = [...hero.querySelectorAll(".hero-moment")];
  const persona = hero.querySelector(".hero-persona");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = { index: 0, taken: reduced.matches, held: false, visible: true, timer: null, hold: null };

  hero.style.setProperty("--count", slides.length);
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
    const previous = slides.find((other) => other.classList.contains("is-active"));
    slides.forEach((other, i) => {
      other.classList.remove("is-leaving");
      other.classList.toggle("is-active", i === index);
      other.toggleAttribute("aria-hidden", i !== index);
    });
    if (previous && previous !== slide) {
      previous.classList.add("is-leaving");
      clearTimeout(state.leave);
      state.leave = setTimeout(() => previous.classList.remove("is-leaving"), LEAVE);
    }
    stops.forEach((stop, i) => stop.setAttribute("aria-pressed", String(i === index)));
    hero.style.setProperty("--step", index);
    const list = timeline.querySelector(".hero-stops");
    const active = stops[index].parentElement;
    list.scrollTo({ left: active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
    moments.forEach((moment, i) => (moment.hidden = i !== index));
    if (slides[index + 1]) load(slides[index + 1]);
  }

  function running() {
    return !state.taken && !state.held && state.visible && !document.hidden;
  }

  function schedule() {
    clearTimeout(state.timer);
    hero.classList.toggle("is-running", running());
    if (!running()) return;
    state.timer = setTimeout(async () => {
      const next = state.index + 1;
      if (next >= slides.length) {
        await show(0);
        hold(LOOP_PAUSE);
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
    persona.setAttribute("aria-live", "polite");
    if (state.taken) return;
    hold(RESUME);
  }

  function hold(duration) {
    state.held = true;
    clearTimeout(state.hold);
    state.hold = setTimeout(() => {
      state.held = false;
      restartFill();
      schedule();
    }, duration);
    schedule();
  }

  stops.forEach((stop, i) => {
    stop.addEventListener("click", () => {
      takeOver();
      show(i);
    });
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

  const begin = () => {
    slides.slice(1).reduce((chain, slide) => chain.then(() => load(slide)), Promise.resolve());
    if (!state.taken) schedule();
  };
  if (document.readyState === "complete") begin();
  else window.addEventListener("load", begin, { once: true });
}

setup();
