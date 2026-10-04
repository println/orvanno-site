// Bairros por cidade: listas passadas por Proto.
const NEIGHBORHOODS = {
  "Volta Redonda": ["Açude", "Aero Clube", "Água Limpa", "Aterrado", "Barreira Cravo", "Bela Vista", "Belmonte", "Belo Horizonte", "Centro", "Conforto", "Jardim Amália", "Jardim Normandia", "Laranjal", "Retiro", "Santo Agostinho", "São Geraldo", "Siderlândia", "Vila Mury", "Vila Santa Cecília"],
  "Barra Mansa": ["Ano Bom", "Água Comprida", "Antônio Rocha", "Assunção", "Boa Sorte", "Boa Vista", "Bocaininha", "Cajueiro", "Centro", "Cotiara", "Floriano", "Jardim Alice", "Jardim Guanabara", "Jardim Ponte Alta", "Jardim Redentor", "Malvinas", "Mangueira", "Metalúrgico", "Minerlândia", "Morada da Granja", "Nossa Senhora do Amparo", "Nove de Abril", "Paraíso", "Primeiro de Maio", "Rialto", "Santa Inês", "Santa Rita de Cássia", "São Carlos", "São Judas Tadeu", "São Sebastião", "Siderlândia", "Verbo Divino", "Vila Coringa", "Vila Elmira", "Vila Nova", "Vila Principal", "Vista Alegre"],
  "Pinheiral": ["Centro", "Chalet", "Colina", "Cruzeiro I", "Cruzeiro II", "Ipê", "Jardim Bela Vista", "Jardim dos Pinhais", "Jardim Real", "Oriente", "Palmeiras", "Paraíso", "Parque Industrial", "Parque Maíra", "Planalto do Sol", "Pôr do Sol", "Rolamão", "São Jorge", "Serrinha", "Três Poços", "Vale do Cruzeiro", "Vale do Sol", "Vale Verde", "Varjão"],
};
const OTHER_NEIGHBORHOOD = "Outro bairro";

function neighborhoodOf(data) {
  const choice = data.get("neighborhood_choice");
  if (choice && choice !== OTHER_NEIGHBORHOOD) return choice;
  return (data.get("neighborhood") || "").trim();
}

function message(data) {
  const lines = ["Olá! Vim pelo site da Orvanno e quero conversar com a especialista sobre o meu projeto.", ""];
  lines.push(`Nome: ${data.get("name").trim()}`);
  lines.push(`Ambiente: ${data.get("room")}`);
  const neighborhood = neighborhoodOf(data);
  lines.push(`Cidade: ${data.get("city")}${neighborhood ? ` (${neighborhood})` : ""}`);
  if (data.get("home")) lines.push(`Projeto para: ${data.get("home")}`);
  return lines.join("\n");
}

function setup() {
  const dialog = document.getElementById("contact-dialog");
  if (!dialog || typeof HTMLDialogElement !== "function") return;
  const form = dialog.querySelector(".contact-form");
  const error = form.querySelector(".contact-error");

  // Bairro: lista conforme a cidade; "Outro bairro" ou cidade "Outra" abrem o campo de texto.
  const city = form.elements.city;
  const choice = form.elements.neighborhood_choice;
  const listField = form.querySelector("[data-neighborhood-list]");
  const textField = form.querySelector("[data-neighborhood-text]");
  const text = form.elements.neighborhood;

  function showText(on) {
    textField.hidden = !on;
    text.required = on;
    if (!on) text.removeAttribute("aria-invalid");
  }

  city.addEventListener("change", () => {
    const list = NEIGHBORHOODS[city.value];
    choice.replaceChildren(new Option(list ? "Escolha" : "Escolha a cidade", ""));
    if (list) {
      for (const name of [...list].sort((a, b) => a.localeCompare(b, "pt-BR"))) choice.add(new Option(name));
      choice.add(new Option(OTHER_NEIGHBORHOOD));
    }
    const other = city.value === "Outra";
    listField.hidden = other;
    choice.required = !other;
    if (other) choice.removeAttribute("aria-invalid");
    showText(other);
  });

  choice.addEventListener("change", () => showText(choice.value === OTHER_NEIGHBORHOOD));

  // Opção opcional: tocar de novo no botão já escolhido desmarca.
  let chosen = null;
  for (const radio of form.querySelectorAll('input[name="home"]')) {
    radio.addEventListener("click", () => {
      if (chosen === radio) {
        radio.checked = false;
        chosen = null;
      } else {
        chosen = radio;
      }
    });
  }

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
