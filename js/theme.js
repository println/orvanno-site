const STORAGE_KEY = "orvanno-theme";
const THEMES = ["light", "dark"];

const root = document.documentElement;
const toggle = document.querySelector(".nav-theme");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    return;
  }
}

function activeTheme() {
  return root.dataset.theme ?? (systemDark.matches ? "dark" : "light");
}

function showPressedState() {
  toggle.setAttribute("aria-pressed", String(activeTheme() === "dark"));
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  showPressedState();
}

if (toggle) {
  const storedTheme = readStoredTheme();
  if (storedTheme) {
    root.dataset.theme = storedTheme;
  }
  showPressedState();
  toggle.hidden = false;

  toggle.addEventListener("click", () => {
    const nextTheme = activeTheme() === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    storeTheme(nextTheme);
  });

  systemDark.addEventListener("change", showPressedState);
}
