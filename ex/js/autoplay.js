const hero = document.querySelector(".hero");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

if (hero && !reduced.matches && CSS.supports("selector(:has(*))")) {
  const radios = [...hero.querySelectorAll(".timeline input")];
  const pause = hero.querySelector(".timeline-pause");
  const persona = hero.querySelector(".persona");
  const scene = hero.querySelector(".hero-scene");
  const state = { taken: false, userPaused: false, visible: false, hover: false };

  const sync = () => {
    hero.classList.toggle("is-running", !state.taken);
    hero.classList.toggle(
      "is-paused",
      state.userPaused || state.hover || !state.visible || document.hidden
    );
    hero.classList.toggle("is-user-paused", state.userPaused);
  };

  const takeOver = (event) => {
    if (state.taken || (event.target.closest && event.target.closest(".timeline-pause"))) return;
    state.taken = true;
    persona.setAttribute("aria-live", "polite");
    pause.hidden = true;
    sync();
  };

  persona.setAttribute("aria-live", "off");
  pause.hidden = false;

  pause.addEventListener("click", () => {
    state.userPaused = !state.userPaused;
    pause.setAttribute(
      "aria-label",
      state.userPaused ? "Retomar a troca de momentos" : "Pausar a troca de momentos"
    );
    sync();
  });

  hero.addEventListener("animationend", (event) => {
    if (event.animationName !== "stop-fill" || state.taken) return;
    const next = radios[radios.findIndex((radio) => radio.checked) + 1];
    if (next) next.checked = true;
  });

  hero.addEventListener("change", takeOver);
  for (const type of ["pointerdown", "keydown", "focusin"]) {
    hero.querySelector(".timeline").addEventListener(type, takeOver);
    hero.querySelector(".chips").addEventListener(type, takeOver);
  }
  scene.addEventListener("pointerdown", takeOver);

  scene.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "mouse") return;
    state.hover = true;
    sync();
  });
  scene.addEventListener("pointerleave", () => {
    state.hover = false;
    sync();
  });

  new IntersectionObserver(
    ([entry]) => {
      state.visible = entry.isIntersecting;
      sync();
    },
    { threshold: 0.5 }
  ).observe(scene);

  document.addEventListener("visibilitychange", sync);
  reduced.addEventListener("change", () => {
    if (reduced.matches) takeOver({ target: document });
  });
  sync();
}
