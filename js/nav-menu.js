function setup() {
  const menu = document.querySelector(".nav-menu");
  if (!menu) return;

  menu.addEventListener("click", (event) => {
    if (event.target.closest(".nav-menu-panel a")) menu.open = false;
  });

  const brand = document.querySelector(".nav-brand");
  if (brand) brand.addEventListener("click", () => (menu.open = false));

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !menu.open) return;
    menu.open = false;
    menu.querySelector("summary").focus();
  });
}

setup();
