const EASE = 0.08;
const STOP = 0.5;

function scrollsInside(node) {
  for (let el = node; el && el !== document.body; el = el.parentElement) {
    if (el.matches("dialog[open], dialog[open] *")) return true;
    const style = getComputedStyle(el);
    if (/(auto|scroll)/.test(style.overflowY) && el.scrollHeight > el.clientHeight) return true;
  }
  return false;
}

function setup() {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return;

  const root = document.documentElement;
  let target = window.scrollY;
  let current = window.scrollY;
  let frame = null;
  let last = 0;
  let applied = null;

  function max() {
    return root.scrollHeight - window.innerHeight;
  }

  function step(now) {
    const dt = last ? Math.min(now - last, 50) : 16.7;
    last = now;
    current += (target - current) * (1 - Math.pow(1 - EASE, dt / 16.7));
    if (Math.abs(target - current) < STOP) current = target;
    window.scrollTo(0, current);
    applied = window.scrollY;
    frame = current === target ? null : requestAnimationFrame(step);
    if (!frame) {
      last = 0;
      root.style.scrollBehavior = "";
    }
  }

  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey || event.defaultPrevented || scrollsInside(event.target)) return;
      if (document.querySelector("dialog[open]")) return;
      event.preventDefault();
      if (!frame) current = target = window.scrollY;
      const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? window.innerHeight : 1;
      target = Math.max(0, Math.min(max(), target + event.deltaY * unit));
      root.style.scrollBehavior = "auto";
      if (!frame) frame = requestAnimationFrame(step);
    },
    { passive: false },
  );

  window.addEventListener(
    "scroll",
    () => {
      if (applied !== null && Math.abs(window.scrollY - applied) < 2) return;
      applied = null;
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      root.style.scrollBehavior = "";
      current = target = window.scrollY;
    },
    { passive: true },
  );
}

setup();
