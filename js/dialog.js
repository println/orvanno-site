function setupDialogs() {

  for (const opener of document.querySelectorAll("[data-dialog-open]")) {

    const dialog = document.getElementById(opener.dataset.dialogOpen);

    if (!dialog) continue;

    opener.hidden = false;

    opener.addEventListener("click", () => dialog.showModal());

  }



  for (const dialog of document.querySelectorAll("dialog")) {

    dialog.addEventListener("click", (event) => {

      if (event.target === dialog || event.target.closest("[data-dialog-close]")) dialog.close();

    });

  }

}



function makeButton(figure, label) {

  const source = figure.querySelector("img");

  const button = document.createElement("button");

  button.type = "button";

  button.className = "swatch-zoom";

  button.setAttribute("aria-label", `${label}: ${source.alt}`);

  source.replaceWith(button);

  button.append(source);

  return button;

}



function setupShowroom(id, sources, label) {

  const dialog = document.getElementById(id);

  const preview = dialog && dialog.querySelector(".finishes-preview");

  if (!preview) return;

  const body = dialog.querySelector(".finishes-dialog-body");

  const image = preview.querySelector("img");

  const caption = preview.querySelector("figcaption");

  const links = [...dialog.querySelectorAll(".finishes-tab")];

  const sections = links.map((link) => document.getElementById(link.hash.slice(1)));

  const bySrc = new Map();

  let current = null;



  function select(button) {

    const figure = button.closest(".details-swatch");

    const source = figure.querySelector("img");

    image.src = source.currentSrc || source.src;

    image.alt = source.alt;

    image.width = source.naturalWidth || source.width;

    image.height = source.naturalHeight || source.height;

    image.classList.toggle("is-product", figure.classList.contains("details-swatch-square"));

    caption.innerHTML = figure.querySelector("figcaption").innerHTML;

    if (current) current.setAttribute("aria-pressed", "false");

    button.setAttribute("aria-pressed", "true");

    current = button;

  }



  function stickyOffset() {

    return getComputedStyle(preview).position === "sticky" && preview.offsetWidth === body.clientWidth

      ? preview.offsetHeight

      : 0;

  }



  function sectionTop(section) {

    return section.getBoundingClientRect().top - body.getBoundingClientRect().top + body.scrollTop;

  }



  function markActive() {

    const line = body.scrollTop + stickyOffset() + 8;

    const atEnd = body.scrollTop + body.clientHeight >= body.scrollHeight - 2;

    let active = 0;

    sections.forEach((section, index) => {

      if (sectionTop(section) <= line) active = index;

    });

    if (atEnd) active = sections.length - 1;

    links.forEach((link, index) => {

      if (index === active) link.setAttribute("aria-current", "true");

      else link.removeAttribute("aria-current");

    });

  }



  links.forEach((link, index) => {

    link.addEventListener("click", (event) => {

      event.preventDefault();

      body.scrollTo({ top: sectionTop(sections[index]) - stickyOffset(), behavior: "smooth" });

    });

  });



  body.addEventListener("scroll", markActive, { passive: true });



  for (const figure of dialog.querySelectorAll(".details-swatch")) {

    const button = makeButton(figure, "Ver");

    button.setAttribute("aria-pressed", "false");

    bySrc.set(figure.querySelector("img").getAttribute("src"), button);

    button.addEventListener("click", () => select(button));

  }



  select(dialog.querySelector(".swatch-zoom"));

  if (dialog.classList.contains("store-dialog")) {
    const buttons = [...dialog.querySelectorAll(".swatch-zoom")];
    let startX = 0;
    let startY = 0;
    preview.addEventListener("touchstart", (event) => {
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
    }, { passive: true });
    preview.addEventListener("touchend", (event) => {
      const dx = event.changedTouches[0].clientX - startX;
      const dy = event.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      const step = dx < 0 ? 1 : -1;
      const next = buttons[(buttons.indexOf(current) + step + buttons.length) % buttons.length];
      select(next);
      next.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }



  for (const figure of document.querySelectorAll(sources)) {

    const target = bySrc.get(figure.querySelector("img").getAttribute("src"));

    if (!target) continue;

    const button = makeButton(figure, label);

    button.addEventListener("click", () => {

      select(target);

      dialog.showModal();

      target.scrollIntoView({ block: "center" });

      target.focus({ preventScroll: true });

      markActive();

    });

  }

}



if (typeof HTMLDialogElement === "function") {

  setupDialogs();

  setupShowroom("finishes-dialog", ".finishes .details-swatch", "Ver no mostruário");

  setupShowroom("store-dialog", ".store-gallery .store-photo", "Ampliar foto");

}

