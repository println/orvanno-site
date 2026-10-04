import PhotoSwipeLightbox from "./vendor/photoswipe/photoswipe-lightbox.esm.min.js";

const wide = window.matchMedia("(min-width: 64em)");
const CAPTION_GAP = 8;

function rem() {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
}

function padding() {
  const unit = rem();
  if (wide.matches) return { top: 4 * unit, bottom: 4.5 * unit, left: 1.5 * unit, right: 10 * unit };
  const thumb = window.matchMedia("(min-width: 40em)").matches ? 7 : 5.5;
  return { top: 3.5 * unit, bottom: (thumb + 2 + 3.5) * unit, left: unit, right: unit };
}

function makeZoom(image, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "gallery-zoom";
  button.setAttribute("aria-label", `${label}: ${image.alt}`);
  image.replaceWith(button);
  button.append(image);
  return button;
}

function registerThumbs(pswp, items) {
  pswp.ui.registerElement({
    name: "thumbs",
    appendTo: "root",
    tagName: "div",
    onInit: (element) => {
      element.className = "gallery-thumbs";
      const buttons = items.map((item, index) => {
        const button = document.createElement("button");
        const image = document.createElement("img");
        button.type = "button";
        button.className = "gallery-thumb";
        button.setAttribute("aria-label", `Ver foto ${index + 1}: ${item.caption}`);
        image.src = item.thumb;
        image.alt = "";
        button.append(image);
        button.addEventListener("click", () => pswp.goTo(index));
        element.append(button);
        return button;
      });

      pswp.on("change", () => {
        buttons.forEach((button, index) => button.setAttribute("aria-pressed", String(index === pswp.currIndex)));
        const active = buttons[pswp.currIndex];
        const box = element.getBoundingClientRect();
        const item = active.getBoundingClientRect();
        element.scrollBy({
          left: item.left + item.width / 2 - (box.left + box.width / 2),
          top: item.top + item.height / 2 - (box.top + box.height / 2),
          behavior: "instant",
        });
      });
    },
  });
}

function registerCaption(pswp) {
  pswp.ui.registerElement({
    name: "caption",
    appendTo: "root",
    tagName: "p",
    onInit: (element) => {
      element.className = "gallery-caption";
      element.setAttribute("aria-live", "polite");
      pswp.element.classList.add("tone-dark");

      function place() {
        const slide = pswp.currSlide;
        if (!slide || !slide.zoomLevels) return;
        const pad = padding();
        const area = pswp.viewportSize.y - pad.top - pad.bottom;
        const height = slide.height * slide.zoomLevels.initial;
        element.textContent = slide.data.caption || "";
        element.style.left = `${pad.left}px`;
        element.style.right = `${pad.right}px`;
        element.style.top = `${pad.top + (area + height) / 2 + CAPTION_GAP}px`;
        element.hidden = slide.currZoomLevel > slide.zoomLevels.initial + 0.01;
      }

      pswp.on("change", place);
      pswp.on("resize", place);
      pswp.on("afterInit", place);
      pswp.on("zoomPanUpdate", place);
    },
  });
}

function setupGallery(sources) {
  const figures = [...document.querySelectorAll(sources)];
  if (!figures.length) return;

  const items = figures.map((figure) => {
    const image = figure.querySelector("img");
    const caption = figure.querySelector("figcaption");
    return {
      src: image.dataset.full || image.getAttribute("src"),
      width: Number(image.dataset.fullWidth || image.getAttribute("width")),
      height: Number(image.dataset.fullHeight || image.getAttribute("height")),
      alt: image.alt,
      caption: image.dataset.caption || (caption ? caption.textContent.trim() : ""),
      thumb: image.getAttribute("src"),
      element: image,
      thumbCropped: true,
    };
  });

  const lightbox = new PhotoSwipeLightbox({
    dataSource: items,
    pswpModule: () => import("./vendor/photoswipe/photoswipe.esm.min.js"),
    paddingFn: padding,
    bgOpacity: 1,
    showHideAnimationType: "zoom",
    indexIndicatorSep: " / ",
    closeTitle: "Fechar",
    zoomTitle: "Ampliar",
    arrowPrevTitle: "Foto anterior",
    arrowNextTitle: "Próxima foto",
    errorMsg: "A foto não pôde ser carregada.",
  });

  lightbox.on("uiRegister", () => {
    registerThumbs(lightbox.pswp, items);
    registerCaption(lightbox.pswp);
  });
  lightbox.init();

  figures.forEach((figure, index) => {
    const opener = makeZoom(figure.querySelector("img"), "Ampliar foto");
    opener.addEventListener("click", () => {
      items.forEach((item) => {
        item.msrc = item.element.currentSrc || item.thumb;
      });
      lightbox.loadAndOpen(index);
    });
  });
}

setupGallery(".showcase .media");
setupGallery(".store-gallery .store-photo");
