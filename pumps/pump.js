const WORKER_URL = "https://supabase-key.master-vodoley.workers.dev/products";
const slug = window.location.hash.substring(1);

const loader = document.getElementById("loader-wrapper");
const container = document.getElementById("product-container");

loader.style.display = "flex";
container.style.display = "none";

async function loadPump() {
  try {
    const allRes = await fetch("https://supabase-key.master-vodoley.workers.dev/all-products");
    const allData = await allRes.json();
    const pump = allData.find(p => p.slug === slug);

    if (!pump) {
      document.querySelector(".container").innerHTML =
        `<h2>Товар не знайдено 😢</h2>`;
      return;
    }

    const res = await fetch(`${WORKER_URL}?ids=${pump.id}`);
    const data = await res.json();

    if (!data || data.length === 0) {
      document.querySelector(".container").innerHTML =
        `<h2>Товар не знайдено 😢</h2>`;
      return;
    }

    const fullPump = data[0];

    document.getElementById("pump-img").src = fullPump.img || "";
    document.getElementById("pump-title").textContent = fullPump.title;
    document.getElementById("pump-price").textContent = fullPump.price;
    document.getElementById("pump-brand").textContent = fullPump.brand;
    document.getElementById("pump-stock").textContent = fullPump.stock;
    document.getElementById("pump-desc").innerHTML = fullPump.desc;
    document.getElementById("pump-warranty").textContent = fullPump.warranty;

    document.getElementById("meta-title").textContent =
      `${fullPump.title} — Купити`;
    document
      .getElementById("meta-description")
      .setAttribute("content", fullPump.short || fullPump.title);

    document
      .getElementById("meta-canonical")
      .setAttribute("href", window.location.href);

    loader.style.display = "none";
    container.style.display = "flex";

    document.querySelector(".buy-btn").addEventListener("click", () => {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.push(fullPump.id);
      localStorage.setItem("cart", JSON.stringify(cart));
      showToast("Товар додано до кошика!");
    });

  } catch (err) {
    console.error(err);
  }
}

loadPump();
