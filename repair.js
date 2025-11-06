import CONFIG from "./config.js";

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

      const text = "🔧 ЗАПИТ НА РЕМОНТ:\n"
        + "👤 Клієнт: " + surname + " " + name + "\n"
        + "📞 Телефон: " + phone + "\n"
        + "🛠️ Модель насоса / проблема: " + model;

      const BOT_TOKEN = CONFIG.BOT_TOKEN;
      const CHAT_ID = "-4954444533";
      const URL = "https://api.telegram.org/bot" + BOT_TOKEN + "/sendMessage";

      fetch(URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text
        })
      })
      .then(res => res.ok ? "Запит надіслано!" : Promise.reject())
      .then(msg => {
        document.getElementById("status").textContent = msg;
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = "Надіслати запит";
      })
      .catch(() => {
        document.getElementById("status").textContent = "Помилка надсилання. Спробуйте ще раз.";
        submitBtn.disabled = false;
        submitBtn.textContent = "Надіслати запит";
      });
    });