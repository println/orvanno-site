const OBSERVER_MARGIN = "-56px 0px -64px 0px";

function prepare() {
  const bar = document.querySelector(".sticky-action");
  const actions = document.querySelectorAll("[data-primary-action]");
  if (!bar || !actions.length || !("IntersectionObserver" in window)) return;

  const inView = new Set();

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) inView.add(entry.target);
      else inView.delete(entry.target);
    }
    bar.classList.toggle("is-visible", inView.size === 0);
  }, { rootMargin: OBSERVER_MARGIN });

  document.body.classList.add("has-sticky-action");
  for (const action of actions) observer.observe(action);
}

prepare();
