const REVEAL_LINE = 0.9;

function revealSection(entries, observer) {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.remove("is-pending");
    observer.unobserve(entry.target);
  }
}

function prepare() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(revealSection, { rootMargin: "0px 0px -10% 0px" });
  const sections = document.querySelectorAll("main > section:not(.hero), .footer");

  for (const section of sections) {
    if (section.getBoundingClientRect().top < window.innerHeight * REVEAL_LINE) continue;
    section.classList.add("is-pending");
    observer.observe(section);
  }
}

prepare();
