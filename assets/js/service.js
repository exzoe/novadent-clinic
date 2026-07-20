document.addEventListener("DOMContentLoaded", () => {
  const service = Novadent.getService(Novadent.getParam("id")) || window.NOVADENT_DATA.services[0];
  document.title = `${service.title} — NOVADENT`;

  document.querySelector("#service-category").textContent = service.categoryLabel;
  document.querySelector("#service-title").textContent = service.title;
  document.querySelector("#service-short").textContent = service.short;
  document.querySelector("#service-details").textContent = service.details;
  document.querySelector("#service-price").textContent = `от ${Novadent.money(service.price)}`;
  document.querySelector("#service-duration").textContent = service.duration;

  document.querySelector("#service-suitable").innerHTML = service.suitable.map((item) => `<li>${item}</li>`).join("");
  document.querySelector("#service-stages").innerHTML = service.stages.map((item) => `
    <div class="step"><div><strong>${item}</strong></div></div>
  `).join("");

  document.querySelector("#service-doctors").innerHTML = service.doctorIds.map((doctorId) => {
    const doctor = Novadent.getDoctor(doctorId);
    return `
      <article class="card doctor-card">
        <img src="${doctor.image}" alt="${doctor.name}">
        <div class="doctor-card-body">
          <span class="rating">★ ${doctor.rating}</span>
          <h3>${doctor.shortName}</h3>
          <p class="muted">${doctor.role}</p>
          <a class="link-arrow" href="doctor.html?id=${doctor.id}">О враче</a>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-book-service]").forEach((link) => {
    link.href = `booking.html?service=${service.id}`;
  });
});