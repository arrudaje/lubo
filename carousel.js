import { ref, getDownloadURL, list, getBlob, listAll } from "firebase/storage";
import { storage } from "./index.js";

let currentCategory = null;
let currentSlide = 0;

async function buildImage(img) {
  const imageElement = document.createElement("div");
  imageElement.className = "min-w-full h-full flex items-center justify-center";
  imageElement.innerHTML = `
    <img src="${await img.src}" alt="${img.alt}" class="max-w-full max-h-full object-contain rounded-2xl shadow-xl" />
  `;
  return imageElement;
}

function buildDot(index) {
  const dotElement = document.createElement("button");
  dotElement.className = `dot w-2 h-2 rounded-full transition-all ${index === 0 ? "bg-(--terracotta) w-8" : "bg-(--terracotta)/30"}`;
  dotElement.ariaLabel = `Ir para imagem ${index + 1}`;
  dotElement.addEventListener("click", () => goToSlide(index));
  return dotElement;
}

/**
 * Opens the carousel modal with the specified category
 */
async function openCarousel(category) {
  currentSlide = 0;

  if (!category) return;

  // Update title
  document.getElementById("carouselTitle").textContent = category.title;

  const images = await category.images;

  currentCategory = {
    ...category,
    images,
  };

  // Build images HTML
  for (const imageIndex in images) {
    const imagesContainer = document.getElementById("carouselImages");
    const image = images[imageIndex];
    buildImage(image).then((imageElement) => {
      imagesContainer.appendChild(imageElement);
    });

    const dotsContainer = document.getElementById("dotsContainer");
    dotsContainer.appendChild(buildDot(Number(imageIndex)));
  }

  // Show modal with animation
  const modal = document.getElementById("carouselModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex", "items-center", "justify-center");
  document.body.style.overflow = "hidden";

  // Trigger animation
  setTimeout(() => {
    modal.querySelector(".absolute.inset-4").classList.add("animate-in");
  }, 10);
}

/**
 * Closes the carousel modal
 */
function closeCarousel() {
  const modal = document.getElementById("carouselModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex", "items-center", "justify-center");
  document.body.style.overflow = "";
  currentCategory = null;
  currentSlide = 0;
}

/**
 * Changes to the next or previous slide
 */
export function changeSlide(direction) {
  if (!currentCategory) return;

  const totalSlides = currentCategory.images.length;
  currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
  updateCarousel();
}

/**
 * Goes to a specific slide
 */
function goToSlide(index) {
  currentSlide = index;
  updateCarousel();
}

/**
 * Updates the carousel display
 */
function updateCarousel() {
  // Update image position
  const imagesContainer = document.getElementById("carouselImages");
  imagesContainer.addEventListener("touchstart", handleTouchStart);
  imagesContainer.addEventListener("touchend", handleTouchEnd);
  imagesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Update dots
  const dots = document.querySelectorAll("#dotsContainer .dot");
  dots.forEach((dot, index) => {
    if (index === currentSlide) {
      dot.classList.add("bg-(--terracotta)", "w-8");
      dot.classList.remove("bg-(--terracotta)/30");
    } else {
      dot.classList.remove("bg-(--terracotta)", "w-8");
      dot.classList.add("bg-(--terracotta)/30");
    }
  });
}

// Keyboard navigation
document.addEventListener("keydown", (e) => {
  if (currentCategory) {
    if (e.key === "ArrowLeft") changeSlide(-1);
    if (e.key === "ArrowRight") changeSlide(1);
    if (e.key === "Escape") closeCarousel();
  }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].screenX;
}

function handleTouchEnd(e) {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
}

function handleSwipe() {
  if (touchEndX < touchStartX - 50) changeSlide(1); // Swipe left
  if (touchEndX > touchStartX + 50) changeSlide(-1); // Swipe right
}

async function buildButton(category) {
  const image = await getDownloadURL(
    ref(storage, `portfolio/${category.key}/${category.cover}.webp`)
  );
  const button = document.createElement("button");
  button.className =
    "group relative overflow-hidden rounded-2xl bg-(--white) shadow-sm ring-1 ring-black/5 cursor-pointer transition-all hover:shadow-lg flex-0 basis-1/4";
  button.dataset.order = category.order;
  button.addEventListener("click", () => openCarousel(category));
  button.innerHTML = `<div class="aspect-[3/4]">
              <img
                src="${image}"
                alt="Categoria ${category.title} - Lubô Confeitaria"
                class="h-full w-full object-cover transition group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0"
            ></div>
            <div
              class="absolute bottom-3 left-3 rounded-full bg-(--cream)/70 px-3 py-1 text-base font-semibold text-(--deep)"
            >
              ${category.title}
            </div>`;
  return button;
}

async function initCategory(category) {
  const portfolioButtons = document.getElementById("portfolio-buttons");
  if (portfolioButtons) {
    const button = await buildButton(category);
    const existingBefore = Array.from(portfolioButtons.children).filter(
      (child) => Number(child.dataset.order) < category.order
    ).sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    const existingAfter = Array.from(portfolioButtons.children).filter(
      (child) => Number(child.dataset.order) > category.order
    ).sort((a, b) => Number(a.dataset.order) - Number(b.dataset.order));
    if (existingBefore.length) {
      existingBefore.at(-1).after(button);
    } else if (existingAfter.length) {
      existingAfter.at(0).before(button);
    } else {
      portfolioButtons.appendChild(button);
    }
  }
}

function isImage(path) {
  return (
    path.endsWith(".webp") || path.endsWith(".png") || path.endsWith(".jpg")
  );
}

async function getMetadata(categoryName) {
  return getBlob(ref(storage, `portfolio/${categoryName}/index.json`))
    .then((blob) => blob.text())
    .then(JSON.parse);
}

function initModal() {
  const modal = document.createElement("div");
  modal.id = "carouselModal";
  modal.className = "fixed inset-0 z-[100] hidden";

  const modalBackdrop = document.createElement("div");
  modalBackdrop.className = "absolute inset-0 bg-black/60 backdrop-blur-sm";
  modalBackdrop.addEventListener("click", closeCarousel);
  modal.appendChild(modalBackdrop);

  const modalContent = document.createElement("div");
  modalContent.className = "absolute inset-4 sm:inset-10 lg:inset-20";
  modal.appendChild(modalContent);

  const modalContentWrapper = document.createElement("div");
  modalContentWrapper.className =
    "relative h-full bg-(--white) rounded-3xl shadow-2xl overflow-hidden";
  modalContent.appendChild(modalContentWrapper);

  const modalContentHeader = document.createElement("div");
  modalContentHeader.className =
    "absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-(--white) via-(--white)/95 to-transparent p-6 pb-12";
  modalContentWrapper.appendChild(modalContentHeader);

  const modalContentHeaderWrapper = document.createElement("div");
  modalContentHeaderWrapper.className = "flex items-center justify-between";
  modalContentHeader.appendChild(modalContentHeaderWrapper);

  const modalContentHeaderTitle = document.createElement("h3");
  modalContentHeaderTitle.id = "carouselTitle";
  modalContentHeaderTitle.className = "text-2xl font-semibold text-(--deep)";
  modalContentHeaderTitle.textContent = "Categoria";
  modalContentHeaderWrapper.appendChild(modalContentHeaderTitle);

  const modalContentHeaderClose = document.createElement("button");
  modalContentHeaderClose.className =
    "rounded-full bg-(--white) p-2 shadow-md hover:shadow-lg transition-shadow";
  modalContentHeaderClose.ariaLabel = "Fechar";
  modalContentHeaderClose.addEventListener("click", closeCarousel);
  modalContentHeaderClose.innerHTML = `
    <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6 text-(--deep)"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
        />
    </svg>
    `;
  modalContentHeaderWrapper.appendChild(modalContentHeaderClose);

  const modalCarouselContainer = document.createElement("div");
  modalCarouselContainer.className =
    "relative h-full flex items-center justify-center px-6 py-10";
  modalContentWrapper.appendChild(modalCarouselContainer);

  const modalCarouselContainerPrevious = document.createElement("button");
  modalCarouselContainerPrevious.className =
    "absolute left-6 z-10 rounded-full bg-(--white)/90 p-3 shadow-lg hover:bg-(--white) transition-all hover:scale-110";
  modalCarouselContainerPrevious.ariaLabel = "Anterior";
  modalCarouselContainerPrevious.innerHTML = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-(--deep)"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
            />
        </svg>
    `;
  modalCarouselContainerPrevious.addEventListener("click", () =>
    changeSlide(-1)
  );
  modalCarouselContainer.appendChild(modalCarouselContainerPrevious);

  const modalCarouselContainerImages = document.createElement("div");
  modalCarouselContainerImages.className =
    "relative w-full max-w-4xl h-full overflow-hidden py-10";
  modalCarouselContainerImages.innerHTML = `
        <div
            id="carouselImages"
            class="flex h-full transition-transform duration-500 ease-out"
        >
            <!-- Images will be dynamically inserted here -->
        </div>
    `;
  modalCarouselContainer.appendChild(modalCarouselContainerImages);

  const modalCarouselContainerNext = document.createElement("button");
  modalCarouselContainerNext.className =
    "absolute right-6 z-10 rounded-full bg-(--white)/90 p-3 shadow-lg hover:bg-(--white) transition-all hover:scale-110";
  modalCarouselContainerNext.ariaLabel = "Próximo";
  modalCarouselContainerNext.innerHTML = `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-(--deep)"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
            />
        </svg>
    `;
  modalCarouselContainerNext.addEventListener("click", () => changeSlide(1));
  modalCarouselContainer.appendChild(modalCarouselContainerNext);

  const modalCarouselContainerDots = document.createElement("div");
  modalCarouselContainerDots.className =
    "absolute bottom-6 left-0 right-0 flex justify-center gap-2";
  modalCarouselContainerDots.id = "dotsContainer";
  modalContentWrapper.appendChild(modalCarouselContainerDots);

  const modalCarouselContainerCTA = document.createElement("div");
  modalCarouselContainerCTA.className =
    "absolute bottom-16 left-0 right-0 flex justify-center";
  const modalCarouselContainerCTALink = document.createElement("a");
  modalCarouselContainerCTALink.href = "#pedido";
  modalCarouselContainerCTALink.addEventListener("click", closeCarousel);
  modalCarouselContainerCTALink.className =
    "rounded-full bg-(--terracotta) px-6 py-3 text-(--cream) hover:bg-(--deep) transition shadow-lg";
  modalCarouselContainerCTALink.innerHTML = "Fazer pedido";
  modalCarouselContainerCTA.appendChild(modalCarouselContainerCTALink);
  modalContentWrapper.appendChild(modalCarouselContainerCTA);

  return modal;
}

async function getPortfolioImages(category) {
  const images = [];
  const imageRefs = await list(category).then((res) => res.items);
  for (const imageRef of imageRefs) {
    if (isImage(imageRef.name)) {
      const image = await getDownloadURL(imageRef);
      images.push({
        src: image,
        alt: imageRef.name,
      });
    }
  }
  return images;
}

// Add touch listeners to carousel when it exists
document.addEventListener("DOMContentLoaded", async () => {
  const categories = [];
  const portfolio = await list(ref(storage, "portfolio"));

  for (const category of portfolio.prefixes) {
    const categoryMeta = await getMetadata(category.name);

    const cat = {
      images: getPortfolioImages(category),
      key: category.name,
      ...categoryMeta,
    };

    categories.push(cat);

    initCategory(cat);
  }

  document.body.appendChild(initModal());
});
