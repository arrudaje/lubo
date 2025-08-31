// Filtro por texto
const filterInput = document.getElementById("filter");
const items = document.querySelectorAll(".flavor-item");
const matchCount = document.getElementById("matchCount");

function applyFilter() {
  const q = filterInput.value.trim().toLowerCase();
  let shown = 0;
  items.forEach((el) => {
    const name = el.textContent.toLowerCase();
    const match = !q || name.includes(q);
    el.parentElement.classList.toggle("hidden", !match);
    if (match) shown += 1;
  });
  matchCount.textContent = q ? shown + " resultados" : "";
}
filterInput.addEventListener("input", applyFilter);

// Pré visualização do combo
const massa = document.getElementById("massa");
const recheio = document.getElementById("recheio");
const preview = document.getElementById("preview");
const copyBtn = document.getElementById("copyBtn");

function updatePreview() {
  preview.textContent = `Sugestão, massa ${massa.value.toLowerCase()} com recheio de ${recheio.value.toLowerCase()}.`;
}
massa.addEventListener("change", updatePreview);
recheio.addEventListener("change", updatePreview);

copyBtn.addEventListener("click", async () => {
  const text = preview.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyBtn.textContent = "Copiado";
    setTimeout(() => (copyBtn.textContent = "Copiar sugestão"), 1200);
  } catch {
    copyBtn.textContent = "Selecione e copie";
  }
});

// Inicializa estados
applyFilter();
updatePreview();
