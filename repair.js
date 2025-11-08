document.getElementById("repair-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const form = this;
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Надсилається...";
  document.getElementById("status").textContent = "";

  const data = new FormData(form);
  const surname = data.get("surname");
  const name = data.get("name");
  const phone = data.get("phone");
  const model = data.get("model") || "не вказано";

  const text = 
    `🔧 ЗАПИТ НА РЕМОНТ:\n` +
    `👤 Клієнт: ${surname} ${name}\n` +
    `📞 Телефон: ${phone}\n` +
    `🛠️ Модель насоса / проблема: ${model}`;

  const WORKER_URL = "https://send-order.master-vodoley.workers.dev/";

  fetch(WORKER_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    type: "repair",
    text: text
  })
})

  .then(res => {
    if (!res.ok) throw new Error();
    return res.json();
  })
  .then(() => {
    document.getElementById("status").textContent = "Запит надіслано!";
    form.reset();
  })
  .catch(() => {
    document.getElementById("status").textContent = "Помилка надсилання. Спробуйте ще раз.";
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Надіслати запит";
  });
});
