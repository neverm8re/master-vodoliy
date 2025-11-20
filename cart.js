const WORKER_URL = "https://send-order.master-vodoley.workers.dev/";
let cart = JSON.parse(localStorage.getItem("cart") || "[]");
if (!Array.isArray(cart)) cart = [];

const tbody = document.querySelector("#cart-table tbody");
const totalEl = document.getElementById("total");
const statusEl = document.getElementById("status");

async function getProductsByIds(ids) {
  if (!ids.length) return {};
  try {
    const res = await fetch(`https://supabase-key.master-vodoley.workers.dev/products?ids=${ids.join(",")}`);
    const data = await res.json();
    const result = {};
    data.forEach(row => result[row.id] = row);
    return result;
  } catch (err) {
    console.error(err);
    return {};
  }
}

function parsePriceToNumber(priceStr) {
  if (!priceStr) return 0;
  const n = parseInt(String(priceStr).replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

async function renderCart() {
  tbody.innerHTML = "";
  let total = 0;
  if (!cart.length) {
    tbody.innerHTML = `<tr><td colspan="3">Кошик порожній</td></tr>`;
    totalEl.textContent = `Разом: 0 грн`;
    return;
  }

  const productMap = await getProductsByIds(cart);

  cart.forEach((id, index) => {
    const item = productMap[id];
    const row = document.createElement("tr");

    if (!item) {
      row.innerHTML = `
        <td>Товар не знайдено (${id})</td>
        <td>—</td>
        <td><button class="remove-btn" data-index="${index}">Видалити</button></td>
      `;
      tbody.appendChild(row);
      return;
    }

    const priceNum = parsePriceToNumber(item.price);
    total += priceNum;

    row.innerHTML = `
      <td class="cart-title">
        <div class="cart-item">
          <img src="${item.img || ""}" alt="${escapeHtml(item.title)}" class="cart-img">
          <div class="cart-text">${escapeHtml(item.title)}</div>
        </div>
      </td>
      <td class="cart-price">${escapeHtml(item.price || "")}</td>
      <td class="cart-action"><button class="remove-btn" data-index="${index}">Видалити</button></td>
    `;
    tbody.appendChild(row);
  });

  totalEl.textContent = `Разом: ${total} грн`;

  tbody.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.index);
      removeItem(idx);
    });
  });

  localStorage.setItem("cart", JSON.stringify(cart));
}

function removeItem(index) {
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// надсилання замовлення через Worker
document.getElementById("order-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  statusEl.textContent = "";

  if (!cart.length) {
    statusEl.textContent = "Ваш кошик порожній. Додайте товари перед замовленням.";
    return;
  }

  const submitBtn = this.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Надсилається...";

  const surname = this.elements["surname"].value.trim();
  const name = this.elements["name"].value.trim();
  const patronymic = this.elements["patronymic"].value.trim();
  const phone = this.elements["phone"].value.trim();
  const city = this.elements["city"].value.trim();
  const warehouse = this.elements["warehouse"].value.trim();

  if (!/^\+380\d{9}$/.test(phone)) {
    statusEl.textContent = "Введіть коректний номер у форматі +380XXXXXXXXX";
    submitBtn.disabled = false;
    submitBtn.textContent = "Надіслати замовлення";
    return;
  }

  try {
    const productMap = await getProductsByIds(cart);
    const itemsText = cart.map(id => {
      const it = productMap[id];
      return it ? `• ${it.title} — ${it.price}` : `• ${id} — (невідомий товар)`;
    }).join("\n");

    const total = cart.reduce((acc, id) => {
      const it = productMap[id];
      return acc + (it ? parsePriceToNumber(it.price) : 0);
    }, 0);

    const message = `🛒 НОВЕ ЗАМОВЛЕННЯ:
👤 Клієнт: ${surname} ${name} ${patronymic}
📞 Телефон: ${phone}
🏙️ Місто: ${city}
🏤 Адреса/№ відділення: ${warehouse}
📦 Товари:
${itemsText}
💰 Разом: ${total} грн`;

    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "order", text: message })
    });

    if (res.ok) {
      statusEl.textContent = "Замовлення надіслано!";
      cart = [];
      localStorage.removeItem("cart");
      renderCart();
      this.reset();
    } else {
      throw new Error(`Помилка від сервера: ${res.status}`);
    }
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Помилка надсилання. Спробуйте ще раз.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Надіслати замовлення";
  }
});

renderCart();
