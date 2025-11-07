const supabaseUrl = "https://aaxvtwqktggbjmxsmtyl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheHZ0d3FrdGdnYmpteHNtdHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTYyMzksImV4cCI6MjA3MzA5MjIzOX0.y-DbmKs1r-o4uPq66Yqwcg1a4_0dbtaEmbdeL6VIKZY";

const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

const loader = document.getElementById("loader-wrapper");
const container = document.getElementById("product-container");

loader.style.display = "flex";
container.style.display = "none";

async function loadPump() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    document.querySelector(".container").innerHTML =
      "<h2>Насос не знайдено 😢</h2>";
    return;
  }

  document.getElementById("pump-img").src = data.img;
  document.getElementById("pump-title").textContent = data.title;
  document.getElementById("pump-price").textContent = data.price;
  document.getElementById("pump-brand").textContent = data.brand;
  document.getElementById("pump-stock").textContent = data.stock;
  document.getElementById("pump-desc").innerHTML = data.desc;
  document.getElementById("pump-warranty").textContent = data.warranty;

  loader.style.display = "none";
  container.style.display = "flex";

  document.querySelector(".buy-btn").addEventListener("click", () => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(id);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Товар додано до кошика!");
  });
}

loadPump();
