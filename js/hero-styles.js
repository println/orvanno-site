const HOLD_MS = 7000;
const DISSOLVE_MS = 1500;

function prepare() {
  const stack = document.querySelector("[data-hero-styles]");
  const extra = stack && stack.querySelector("template[data-hero-styles-extra]");
  if (!extra || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  stack.append(extra.content.cloneNode(true));
  const images = [...stack.querySelectorAll(".hero-media-image")];
  const toggle = stack.querySelector(".hero-media-toggle");
  if (!toggle || images.length < 2) return;

  let current = 0;
  let remaining = images.length;
  let dissolving = false;
  let holdTimer = 0;

  function setPaused(paused) {
    toggle.setAttribute("aria-pressed", String(paused));
  }

  function isPaused() {
    return toggle.getAttribute("aria-pressed") === "true";
  }

  function scheduleNext() {
    holdTimer = window.setTimeout(showNext, HOLD_MS);
  }

  function commit(from, to) {
    from.classList.remove("is-active");
    from.setAttribute("aria-hidden", "true");
    to.classList.remove("is-entering");
    to.classList.add("is-active");
    to.removeAttribute("aria-hidden");
    current = images.indexOf(to);
    dissolving = false;
    remaining -= 1;

    if (remaining === 0) setPaused(true);
    else if (!isPaused()) scheduleNext();
  }

  async function showNext() {
    const from = images[current];
    const to = images[(current + 1) % images.length];
    dissolving = true;

    const loaded = await to.decode().then(() => true, () => false);
    if (!loaded) {
      dissolving = false;
      remaining = 0;
      setPaused(true);
      return;
    }

    to.classList.add("is-entering");
    window.setTimeout(() => commit(from, to), DISSOLVE_MS);
  }

  toggle.addEventListener("click", () => {
    if (isPaused()) {
      setPaused(false);
      remaining = images.length;
      if (!dissolving) scheduleNext();
      return;
    }
    setPaused(true);
    window.clearTimeout(holdTimer);
  });

  scheduleNext();
}

if (document.readyState === "complete") prepare();
else window.addEventListener("load", prepare, { once: true });
