window.pumpsData = [];
let currentCategory = "all";
const pumptypeSet = new Set();

async function loadProducts() {
  try {
    const res = await fetch(
      "https://supabase-key.master-vodoley.workers.dev/all-products"
    );
    const data = await res.json();

    data.sort((a, b) => (a.sort_index || 0) - (b.sort_index || 0));

    window.pumpsData = data;

    data.forEach((p) => {
      if (p.category === "Занурювальні насоси" && p.pumptype) {
        pumptypeSet.add(p.pumptype);
      }
    });

    renderPumpSeriesButtons();
    renderProducts();
  } catch (err) {
    console.error(err);
  }
}

function renderPumpSeriesButtons() {
  const pumpSeriesButtons = document.getElementById("pumpSeriesButtons");
  pumpSeriesButtons.innerHTML = "";
  pumptypeSet.forEach((type) => {
    const btn = document.createElement("button");
    btn.textContent = type;
    btn.dataset.category = type;
    btn.onclick = () => filterCategory(type);
    pumpSeriesButtons.appendChild(btn);
  });
}

function renderProducts() {
  const container = document.getElementById("products");
  container.innerHTML = "";

  window.pumpsData.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.category = item.category || "Інше";
    card.dataset.pumptype = item.pumptype || "";

    card.innerHTML = `
      <img src="${item.img}" alt="${item.title}">
      <h3>${item.title}</h3>
      <p>${item.short || ""}</p>
      <p class="price">${item.price}</p>
      <button class="buy-btn" onclick="event.stopPropagation(); addToCart('${
        item.id
      }')">Купити</button>
    `;
    card.onclick = () =>
      (window.location.href = `/pumps/index.html#${item.slug}`);

    container.appendChild(card);
  });

  filterAndSearch();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.push(id);
  localStorage.setItem("cart", JSON.stringify(cart));
  showToast("Товар додано до кошика!");
}

function filterCategory(category) {
  currentCategory = category;
  filterAndSearch();
  const sidebar = document.getElementById("sidebarFilters");
  const overlay = document.getElementById("filterOverlay");
  if (window.innerWidth < 768) {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  }
  document
    .querySelectorAll("#sidebarFilters button, #pumpSeriesButtons button")
    .forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.category === category) btn.classList.add("active");
    });
  const pumpSeriesContainer = document.getElementById("pumpSeriesContainer");
  const isPumpType = [...pumptypeSet].includes(category);
  pumpSeriesContainer.style.display =
    category === "Занурювальні насоси" || isPumpType ? "block" : "none";
}

function normalize(str) {
  return str
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/-/g, "-")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/(\d)\s+(\d)/g, "$1$2")
    .trim();
}

function filterAndSearch() {
  const searchTerm = normalize(document.getElementById("searchInput").value);

  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    const title = normalize(card.querySelector("h3").innerText);
    const cardCategory = card.dataset.category;
    const cardPumptype = card.dataset.pumptype;

    const matchesSearch = title.includes(searchTerm);
    const matchesCategory =
      currentCategory === "all" ||
      cardCategory === currentCategory ||
      cardPumptype === currentCategory;

    card.style.display = matchesSearch && matchesCategory ? "" : "none";
  });
}

function toggleMobileFilters() {
  const sidebar = document.getElementById("sidebarFilters");
  const overlay = document.getElementById("filterOverlay");
  sidebar.classList.toggle("open");
  overlay.classList.toggle("active");
}

function closeMobileFilters() {
  document.getElementById("sidebarFilters").classList.remove("open");
  document.getElementById("filterOverlay").classList.remove("active");
}

const bg = document.querySelector(".parallax-bg");
window.addEventListener("scroll", () => {
  const offset = window.scrollY;
  bg.style.backgroundPositionY = -(offset * 0.4) + "px";
});

loadProducts();
