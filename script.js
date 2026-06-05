let couriers = [];

/* =========================
   LOAD DATA
========================= */

fetch("couriers.json")
  .then(res => res.json())
  .then(data => {
    couriers = data;
    loadHistory();
  });

/* =========================
   MAIN CALCULATOR
========================= */

function compareCouriers() {
  
  const pickup = document.getElementById("pickup").value;
  const delivery = document.getElementById("delivery").value;
  const weight = Number(document.getElementById("weight").value);
  const cod = document.getElementById("cod").value;
  
  if (!pickup || !delivery) {
    alert("Please select pickup & delivery location");
    return;
  }
  
  if (!weight || weight < 1) {
    alert("Please enter valid weight (min 1kg)");
    return;
  }
  
  saveSearch(pickup, delivery, weight);
  
  let results = [];
  
  couriers.forEach(courier => {
    
    const available =
      courier.coverage.includes(pickup) &&
      courier.coverage.includes(delivery);
    
    if (!available) return;
    
    const baseCost =
      pickup === delivery ?
      courier.inside_dhaka :
      courier.outside_dhaka;
    
    const extraWeightCost =
      weight > 1 ?
      (weight - 1) * courier.extra_kg_charge :
      0;
    
    const codCharge =
      cod === "yes" ? courier.cod_charge : 0;
    
    const total = baseCost + extraWeightCost + codCharge;
    
    results.push({
      ...courier,
      total
    });
  });
  
  if (results.length === 0) {
    document.getElementById("summary").innerHTML = `
      <div class="summary">
        <h3>❌ No courier available for this route</h3>
      </div>
    `;
    document.getElementById("results").innerHTML = "";
    return;
  }
  
  /* =========================
     SORTING ENGINE
  ========================= */
  
  const sortedByPrice = [...results].sort((a, b) => a.total - b.total);
  const cheapest = sortedByPrice[0];
  
  const fastest = [...results].sort(
    (a, b) => a.delivery_time - b.delivery_time
  )[0];
  
  /* =========================
     SUMMARY UI
  ========================= */
  
  document.getElementById("summary").innerHTML = `
    <div class="summary">

      <h3>🏆 Cheapest: <strong>${cheapest.name}</strong> (৳${cheapest.total})</h3>

      <h3>⚡ Fastest: <strong>${fastest.name}</strong> (${fastest.delivery_time} Days)</h3>

      <h3>📦 Available: ${results.length}</h3>

    </div>
  `;
  
  /* =========================
     RESULTS UI
  ========================= */
  
  document.getElementById("results").innerHTML =
    sortedByPrice.map(c => {
      
      const isCheapest = c.name === cheapest.name;
      const isFastest = c.name === fastest.name;
      
      return `
      <div class="courier-card">

        ${isCheapest ? `<div class="badge cheapest-badge">🏆 Cheapest</div>` : ""}
        ${isFastest ? `<div class="badge fastest-badge">⚡ Fastest</div>` : ""}

        <div class="courier-header">

          <div>
            <h3>${c.name}</h3>
            <p class="courier-subtitle">⭐ ${c.rating} Rating • Bangladesh Coverage</p>
          </div>

          <div class="price">
            ৳${c.total}
          </div>

        </div>

        <div class="features">

          <div class="feature">
            <span>🚚 Delivery Time</span>
            <strong>${c.delivery_time} Days</strong>
          </div>

          <div class="feature">
            <span>💰 COD Charge</span>
            <strong>৳${c.cod_charge}</strong>
          </div>

          <div class="feature">
            <span>⚖ Extra KG</span>
            <strong>৳${c.extra_kg_charge}</strong>
          </div>

          <div class="feature">
            <span>📍 Coverage</span>
            <strong>All Major Areas</strong>
          </div>

        </div>

        <div class="card-actions">


          <button class="website-btn"
            onclick="openWebsite('${c.website}')">
            🌐 Website
          </button>

        </div>

      </div>
      `;
    }).join("");
}

/* =========================
   ACTIONS
========================= */

function selectCourier(name, price) {
  alert(`Selected: ${name} (৳${price})`);
}

function openWebsite(url) {
  window.open(url, "_blank");
}

/* =========================
   HISTORY SYSTEM
========================= */

function saveSearch(pickup, delivery, weight) {
  
  let history =
    JSON.parse(localStorage.getItem("searchHistory")) || [];
  
  history.unshift({
    pickup,
    delivery,
    weight,
    time: new Date().toLocaleString()
  });
  
  history = history.slice(0, 10);
  
  localStorage.setItem("searchHistory", JSON.stringify(history));
  
  loadHistory();
}

function loadHistory() {
  
  let history =
    JSON.parse(localStorage.getItem("searchHistory")) || [];
  
  const box = document.getElementById("history");
  
  if (!history.length) {
    box.innerHTML = `<p>No recent searches</p>`;
    return;
  }
  
  box.innerHTML = history.map(item => `
    <div class="history-item">
      ${item.pickup} → ${item.delivery}
      (${item.weight}kg)
    </div>
  `).join("");
}

function clearHistory() {
  localStorage.removeItem("searchHistory");
  loadHistory();
}
