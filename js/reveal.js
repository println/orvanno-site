const ITEMS = [
  ".eyebrow",
  "h2",
  "h3",
  ".lead",
  ".rating",
  ".curation-summary",
  ".curation-link",
  ".curation-step",
  ".finishes-preview",
  ".trust-item",
  ".showcase-head",
  "figure",
  ".showcase-more",
  ".fit-group",
  ".faq-item",
  ".partners-list li",
  ".cta-inner > *",
  ".footer-inner > *",
].join(", ");
const STEP = 90;
const MAX_DELAY = 360;

function reveal(entries, observer) {
  const entering = entries.filter((entry) => entry.isIntersecting);
  entering.forEach((entry, i) => {
    entry.target.style.setProperty("--reveal-delay", `${Math.min(i * STEP, MAX_DELAY)}ms`);
    entry.target.classList.remove("is-pending");
    observer.unobserve(entry.target);
  });
}

function prepare() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(reveal, { rootMargin: "0px 0px -8% 0px" });
  const scope = document.querySelectorAll("main > section:not(.hero), .footer");
  const seen = new Set();

  for (const section of scope) {
    for (const item of section.querySelectorAll(ITEMS)) {
      if ([...seen].some((parent) => parent.contains(item))) continue;
      seen.add(item);
      if (item.getBoundingClientRect().top < window.innerHeight) continue;
      item.classList.add("reveal", "is-pending");
      if (item.matches("figure")) item.classList.add("reveal-media");
      observer.observe(item);
    }
  }
}

prepare();
