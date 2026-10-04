// Abre a conversa no WhatsApp.
// Celular: tenta o aplicativo direto (whatsapp://), sem a página intermediária;
// se o aplicativo não abrir em 1,5 s, cai no wa.me. Computador: wa.me em nova aba.

const FALLBACK_MS = 1500;

export function isMobile() {
  const ua = navigator.userAgent;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Focus/i.test(ua)) return true;
  // iPadOS recente se apresenta como Mac.
  return /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
}

export function openWhatsApp(phone, text) {
  const digits = String(phone).replace(/\D/g, "");
  const query = text ? `text=${encodeURIComponent(text)}` : "";
  const web = `https://wa.me/${digits}${query ? `?${query}` : ""}`;

  if (!isMobile()) {
    const tab = window.open(web, "_blank");
    if (tab) tab.opener = null;
    else window.location.href = web;
    return;
  }

  const app = `whatsapp://send?phone=${digits}${query ? `&${query}` : ""}`;
  let left = false;
  const onHide = () => {
    if (document.hidden) left = true;
  };
  const onBlur = () => {
    left = true;
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onBlur);
  window.addEventListener("blur", onBlur);
  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onHide);
    window.removeEventListener("pagehide", onBlur);
    window.removeEventListener("blur", onBlur);
    if (!left && !document.hidden) window.location.href = web;
  }, FALLBACK_MS);
  window.location.href = app;
}

// Links diretos para o WhatsApp (rodapé): mesma regra. Os botões que abrem o
// formulário (data-contact) ficam com o contact.js.
function setupLinks() {
  for (const link of document.querySelectorAll('a[href^="https://wa.me/"]:not([data-contact])')) {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href);
      event.preventDefault();
      openWhatsApp(url.pathname.slice(1), url.searchParams.get("text") || "");
    });
  }
}

setupLinks();
