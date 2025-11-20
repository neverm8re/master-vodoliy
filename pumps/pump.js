const WORKER_URL = "https://supabase-key.master-vodoley.workers.dev/products"; 

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const loader = document.getElementById("loader-wrapper");
const container = document.getElementById("product-container");

loader.style.display = "flex";
container.style.display = "none";

async function loadPump() {
  try {
    // Передаємо параметр ids, Worker повертає масив
    const res = await fetch(`${WORKER_URL}?ids=${id}`);
    
    if (!res.ok) throw new Error("Помилка при отриманні даних");
    
    const data = await res.json();

    if (!data || !data.length) {
      document.querySelector(".container").innerHTML =
        "<h2>Насос не знайдено 😢</h2>";
      return;
    }

    const pump = data[0]; // перший елемент масиву

    document.getElementById("pump-img").src = pump.img || "";
    document.getElementById("pump-title").textContent = pump.title || "";
    document.getElementById("pump-price").textContent = pump.price || "";
    document.getElementById("pump-brand").textContent = pump.brand || "";
    document.getElementById("pump-stock").textContent = pump.stock || "";
    document.getElementById("pump-desc").innerHTML = pump.desc || "";
    document.getElementById("pump-warranty").textContent = pump.warranty || "";

    loader.style.display = "none";
    container.style.display = "flex";

    document.querySelector(".buy-btn").addEventListener("click", () => {
      let cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cart.push(id);
      localStorage.setItem("cart", JSON.stringify(cart));
      showToast("Товар додано до кошика!");
    });

  } catch (err) {
    console.error(err);
    document.querySelector(".container").innerHTML =
      "<h2>Сталася помилка при завантаженні насоса</h2>";
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

loadPump();
