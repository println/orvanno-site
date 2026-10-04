import { openWhatsApp } from "./whatsapp.js";

// Bairros por cidade: listas passadas por Proto.
const NEIGHBORHOODS = {
  "Volta Redonda": ["Açude", "Aero Clube", "Água Limpa", "Aterrado", "Barreira Cravo", "Bela Vista", "Belmonte", "Belo Horizonte", "Bom Jesus", "Casa de Pedra", "Centro", "Coqueiros", "Conforto", "Dom Bosco", "Eucaliptal", "Ilha Parque", "Jardim Amália", "Jardim Belmonte", "Jardim Belvedere", "Jardim Caroline", "Jardim Cidade do Aço", "Jardim Normândia", "Jardim Paraíba", "Laranjal", "Mariana Torres", "Monte Castelo", "Morada da Colina", "Niterói", "Nossa Senhora das Graças", "Nova Primavera", "Ortiz", "Paraíso", "Parque das Ilhas", "Ponte Alta", "Rústico", "Retiro", "Roma", "Santa Cruz", "Santa Rita do Zarur", "Santo Agostinho", "São Carlos", "São Cristóvão", "São Geraldo", "São João", "São Lucas", "Sessenta", "Três Poços", "Vila Americana", "Vila Brasília", "Vila Mury", "Vila Rica", "Voldac", "Candelária", "Forte Leme", "Jardim Primavera", "Minerlândia", "Osvaldo Cruz", "Padre Josimo", "Pinto da Serra", "São João Batista", "São Luiz", "Sidervile", "Vila Santa Cecília", "Siderlândia"],
  "Barra Mansa": ["Centro", "Estamparia", "Apóstolo Paulo", "Jardim Monte Cristo", "Abelhas", "Verbo Divino", "Cotiara", "São Silvestre", "Jardim Boa Vista", "Roberto Silveira", "Belo Horizonte", "Aiuruoca", "Loteamento Chinês", "Vista Alegre", "Jardim Vista Alegre", "Vila Nova", "Vila Coringa", "Vila Brígida (Nossa Senhora de Lourdes)", "Jardim Central", "Ano Bom", "Vila Orlandélia", "Santa Rosa", "Residencial Cristo Redentor", "Santa Izabel", "São Francisco de Assis", "Getúlio Vargas", "Vale do Paraíba", "Vila Delgado", "Vila Elmira", "Cajueiro", "Núcleo Residencial Ponte Alta", "Vila Natal", "Mangueira", "Paraíso", "Santa Inês", "Metalúrgico", "Assunção", "São Carlos", "Jardim Guanabara", "Santa Rita", "Jardim Redentor", "Malvinas", "Primeiro de Maio", "Nove de Abril", "São Sebastião", "Morada da Granja I", "Morada da Granja II", "Minerlândia", "Boa Vista I", "Boa Vista II", "Boa Vista III", "Vila Principal", "Jardim Alice", "São Judas Tadeu", "Barbará", "Piteiras", "Boa Sorte", "São Luíz", "Nova Esperança", "Roselândia", "Jardim Primavera", "Presidente Dutra", "Bela Vista", "Santa Clara", "Goiabal", "Jardim Marajoara", "São Pedro", "Jardim Marilu", "Santa Lúcia", "Vila Independência", "Jardim América", "Cantagalo", "Siderlândia", "São Domingos", "Colônia Santo Antônio", "Vila Ursulino", "Esperança", "Morada do Vale", "Morada da Colônia I", "Morada da Colônia II", "Nossa Senhora de Fátima", "Santa Maria II", "Vila Maria", "Saudade", "Bom Pastor", "Bocaininha", "São Vicente", "Km 4", "São Genaro", "São Paulo", "Jardim Monique", "Moinho de Vento", "Jardim Alvorada", "Anísio Braz", "Pombal", "Glicério", "Floriano", "Rialto", "Nossa Senhora do Amparo", "Antônio Rocha", "Ataulfo de Paiva", "Santa Rita de Cássia", "Loteamento São João", "Monte Cristo II", "Loteamento Morada São João", "Santa Ifigênia", "Morro do Cruzeiro", "Abelhas II", "Macuco", "Residencial Dilermando Brandão Caldas", "Loteamento Jurandir", "Loteamento Cascatinha", "Parque Independência", "Nossa Senhora Aparecida", "Paraíso de Baixo", "Paraíso de Cima", "Loteamento Jardim Amália", "Loteamento Tetrajol", "Loteamento Área Verde", "Roselândia II", "Loteamento Sampaio", "Loteamento Entanha", "Loteamento Bocaina", "Km 3", "Conjunto Moraes Antas", "Morada do Sol", "Loteamento Harmonia", "Village Primavera", "Loteamento Imperial Country Clube", "Geórgia", "Aymoré", "Conjunto Residencial 5", "Loteamento Ana Maria", "Pau D'Alho", "Jardim Paraíso I", "Jardim Paraíso II", "Loteamento Fátima", "Venda de Fora", "Vila Pepita", "Cafarnaum", "Loteamento da Chácara", "Loteamento Sofia", "Água Comprida", "Estância Orlandélia", "Santa Helena", "Jardim Ponte Alta", "Recanto do Sol", "São Luíz II", "Morada Verde", "Santa Maria I", "Santa Maria III", "Village do Sol", "Jardim Santo Antônio", "São Lucas", "Nossa Senhora dos Remédios", "Primavera"],
  "Pinheiral": ["Centro", "Chalet", "Colina", "Cruzeiro I", "Cruzeiro II", "Fração", "Ipê", "Jardim Bela Vista", "Jardim Real", "Jardim Três Poços", "Km 2", "Km 5", "Km 7", "Km 9", "Oriente", "Palmeiras", "Paraíso", "Parque Maíra", "Parque Maíra II", "Rolamão", "São Jorge", "Três Poços", "Vale do Sol", "Varjão", "Vila Pinheiro", "Jardim dos Pinhais", "Parque Industrial", "Planalto do Sol", "Pôr do Sol", "Serrinha", "Vale do Cruzeiro", "Vale Verde"],
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
    openWhatsApp(form.dataset.whatsapp, message(data));
    dialog.close();
  });
}

setup();
