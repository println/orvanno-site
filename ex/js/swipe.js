const scene = document.querySelector(".hero-scene");

if (scene) {
  const threshold = 40;
  let start = null;

  scene.addEventListener("pointerdown", (event) => {
    start = event.pointerType === "mouse" ? null : { x: event.clientX, y: event.clientY };
  });

  scene.addEventListener("pointercancel", () => {
    start = null;
  });

  scene.addEventListener("pointerup", (event) => {
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) < threshold || Math.abs(dx) < Math.abs(dy)) return;
    const current = document.querySelector(".hero input[name='moment']:checked");
    const group = current && current.closest(".timeline, .chips");
    if (!group) return;
    const radios = [...group.querySelectorAll("input[name='moment']")];
    const target = radios[radios.indexOf(current) + (dx < 0 ? 1 : -1)];
    if (!target) return;
    target.checked = true;
    target.dispatchEvent(new Event("change", { bubbles: true }));
  });
}
