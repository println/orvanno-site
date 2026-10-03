function message(data) {
  const lines = ["Olá! Vim pelo site da Orvanno e gostaria de agendar um atendimento.", ""];
  lines.push(`Nome: ${data.get("name").trim()}`);
  lines.push(`Ambiente: ${data.get("room")}`);
  const neighborhood = (data.get("neighborhood") || "").trim();
  lines.push(`Cidade: ${data.get("city")}${neighborhood ? ` (${neighborhood})` : ""}`);
  if (data.get("home")) lines.push(`Imóvel: ${data.get("home")}`);
  return lines.join("\n");
}

function setup() {
  const dialog = document.getElementById("contact-dialog");
  if (!dialog || typeof HTMLDialogElement !== "function") return;
  const form = dialog.querySelector(".contact-form");
  const error = form.querySelector(".contact-error");

  for (const trigger of document.querySelectorAll("[data-contact]")) {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      dialog.showModal();
      form.elements.name.focus();
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const required = [...form.querySelectorAll("[required]")];
    const missing = required.filter((field) => !field.value.trim());
    required.forEach((field) => field.toggleAttribute("aria-invalid", missing.includes(field)));
    error.hidden = missing.length === 0;
    if (missing.length) {
      missing[0].focus();
      return;
    }
    const url = `https://wa.me/${form.dataset.whatsapp}?text=${encodeURIComponent(message(data))}`;
    const opened = window.open(url, "_blank", "noopener");
    if (!opened) window.location.href = url;
    dialog.close();
  });
}

setup();
