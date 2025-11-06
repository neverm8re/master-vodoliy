const supabaseUrl = 'https://aaxvtwqktggbjmxsmtyl.supabase.co';  
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheHZ0d3FrdGdnYmpteHNtdHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTYyMzksImV4cCI6MjA3MzA5MjIzOX0.y-DbmKs1r-o4uPq66Yqwcg1a4_0dbtaEmbdeL6VIKZY';                   // заміни на свій anon-key
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  let productsData = [];
  let currentCategory = 'all';
  const pumptypeSet = new Set();

  async function loadProducts() {
    const { data, error } = await supabase.from('products').select('*');
    if (error) { console.error(error); return; }
    productsData = data;
    data.forEach(p => {
      if (p.category === "Занурювальні насоси" && p.pumptype) {
        pumptypeSet.add(p.pumptype);
      }
    });
    renderPumpSeriesButtons();
    renderProducts();
  }

  function renderPumpSeriesButtons() {
    const pumpSeriesButtons = document.getElementById("pumpSeriesButtons");
    pumpSeriesButtons.innerHTML = '';
    pumptypeSet.forEach(type => {
      const btn = document.createElement("button");
      btn.textContent = type;
      btn.dataset.category = type;
      btn.onclick = () => filterCategory(type);
      pumpSeriesButtons.appendChild(btn);
    });
  }

  function renderProducts() {
    const container = document.getElementById("products");
    container.innerHTML = '';
    productsData.forEach(item => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.category = item.category || 'Інше';
      card.dataset.pumptype = item.pumptype || '';

      card.innerHTML = `
        <img src="${item.img}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p>${item.short || ''}</p>
        <p class="price">${item.price}</p>
        <button class="buy-btn" onclick="event.stopPropagation(); addToCart('${item.id}')">Купити</button>
      `;
      card.onclick = () => window.location.href = `pumps/pump.html?id=${item.id}`;
      container.appendChild(card);
    });
    filterAndSearch();
  }

  function addToCart(id) {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(id);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Товар додано до кошика!");
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
    document.querySelectorAll('#sidebarFilters button, #pumpSeriesButtons button').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.category === category) btn.classList.add('active');
    });
    const pumpSeriesContainer = document.getElementById("pumpSeriesContainer");
    const isPumpType = [...pumptypeSet].includes(category);
    pumpSeriesContainer.style.display = (category === "Занурювальні насоси" || isPumpType) ? "block" : "none";
  }

  function filterAndSearch() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const cards = document.querySelectorAll(".card");
    cards.forEach(card => {
      const title = card.querySelector("h3").innerText.toLowerCase();
      const cardCategory = card.dataset.category;
      const cardPumptype = card.dataset.pumptype;
      const matchesSearch = title.includes(searchTerm);
      const matchesCategory = currentCategory === 'all' || cardCategory === currentCategory || cardPumptype === currentCategory;
      card.style.display = (matchesSearch && matchesCategory) ? "" : "none";
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

  const bg = document.querySelector('.parallax-bg');
  window.addEventListener('scroll', () => {
    const offset = window.scrollY;
    bg.style.backgroundPositionY = -(offset * 0.4) + 'px';
  });

  loadProducts();