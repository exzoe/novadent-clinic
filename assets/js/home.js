document.addEventListener("DOMContentLoaded", () => {
  const data = window.NOVADENT_DATA;
  const serviceGrid = document.querySelector("#popular-services");
  const doctorGrid = document.querySelector("#popular-doctors");
  const reviewGrid = document.querySelector("#reviews-grid");

  if (serviceGrid) {
    serviceGrid.innerHTML = data.services.slice(0, 3).map((service) => `
      <article class="card service-card">
        <div class="service-icon" aria-hidden="true">${service.icon}</div>
        <span class="eyebrow">${service.categoryLabel}</span>
        <h3>${service.title}</h3>
        <p class="muted">${service.short}</p>
        <div class="card-meta">
          <span>от ${Novadent.money(service.price)}</span>
          <span>${service.duration}</span>
        </div>
        <a class="link-arrow" href="service.html?id=${service.id}">Подробнее</a>
      </article>
    `).join("");
  }

  if (doctorGrid) {
    doctorGrid.innerHTML = data.doctors.slice(0, 3).map((doctor) => `
      <article class="card doctor-card">
        <img src="${doctor.image}" alt="${doctor.name}" loading="lazy">
        <div class="doctor-card-body">
          <span class="rating">★ ${doctor.rating}</span>
          <h3>${doctor.shortName}</h3>
          <p class="muted">${doctor.role}</p>
          <div class="doctor-tags">
            <span class="tag">${doctor.experience} лет опыта</span>
          </div>
          <a class="link-arrow" href="doctor.html?id=${doctor.id}">О враче</a>
        </div>
      </article>
    `).join("");
  }

  if (reviewGrid) {
    reviewGrid.innerHTML = data.reviews.map((review) => `
      <article class="card review">
        <div class="review-stars" aria-label="${review.rating} из 5">★★★★★</div>
        <p>${review.text}</p>
        <strong>${review.name}</strong>
        <div class="small muted">${review.service} · ${review.doctor}</div>
      </article>
    `).join("");
  }

  setupCalculator();
});

function setupCalculator() {
  const form = document.querySelector("#calculator-form");
  if (!form) return;

  const serviceSelect = form.querySelector("#calc-service");
  const countInput = form.querySelector("#calc-count");
  const materialSelect = form.querySelector("#calc-material");
  const anesthesia = form.querySelector("#calc-anesthesia");
  const diagnostics = form.querySelector("#calc-diagnostics");
  const priceOutput = document.querySelector("#calc-price");
  const durationOutput = document.querySelector("#calc-duration");
  const titleOutput = document.querySelector("#calc-title");

  window.NOVADENT_DATA.services.forEach((service) => {
    const option = document.createElement("option");
    option.value = service.id;
    option.textContent = `${service.title} — от ${Novadent.money(service.price)}`;
    serviceSelect.append(option);
  });

  function calculate() {
    const service = Novadent.getService(serviceSelect.value);
    if (!service) return;

    const count = Math.max(1, Math.min(8, Number(countInput.value) || 1));
    const materialMultiplier = Number(materialSelect.value);
    let total = Math.round(service.price * count * materialMultiplier);

    if (anesthesia.checked) total += 1200;
    if (diagnostics.checked) total += 1800;

    titleOutput.textContent = service.title;
    priceOutput.textContent = Novadent.money(total);
    durationOutput.textContent = service.duration;

    localStorage.setItem("novadentCalculator", JSON.stringify({
      serviceId: service.id,
      count,
      materialMultiplier,
      anesthesia: anesthesia.checked,
      diagnostics: diagnostics.checked,
      total
    }));
  }

  const saved = JSON.parse(localStorage.getItem("novadentCalculator") || "null");
  if (saved) {
    serviceSelect.value = saved.serviceId || serviceSelect.value;
    countInput.value = saved.count || 1;
    materialSelect.value = String(saved.materialMultiplier || 1);
    anesthesia.checked = Boolean(saved.anesthesia);
    diagnostics.checked = Boolean(saved.diagnostics);
  }

  form.addEventListener("input", calculate);
  calculate();

  document.querySelector("#calc-booking")?.addEventListener("click", () => {
    const service = Novadent.getService(serviceSelect.value);
    window.location.href = `booking.html?service=${service.id}`;
  });
}