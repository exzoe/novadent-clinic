document.addEventListener("DOMContentLoaded", () => {
  const doctor = Novadent.getDoctor(Novadent.getParam("id")) || window.NOVADENT_DATA.doctors[0];
  document.title = `${doctor.name} — NOVADENT`;

  document.querySelector("#doctor-image").src = doctor.image;
  document.querySelector("#doctor-image").alt = doctor.name;
  document.querySelector("#doctor-name").textContent = doctor.name;
  document.querySelector("#doctor-role").textContent = doctor.role;
  document.querySelector("#doctor-bio").textContent = doctor.bio;
  document.querySelector("#doctor-rating").textContent = `★ ${doctor.rating}`;
  document.querySelector("#doctor-experience").textContent = `${doctor.experience} лет опыта`;
  document.querySelector("#doctor-education").innerHTML = doctor.education.map((item) => `<li>${item}</li>`).join("");

  document.querySelector("#doctor-services").innerHTML = doctor.serviceIds.map((serviceId) => {
    const service = Novadent.getService(serviceId);
    return `
      <article class="card service-card">
        <div class="service-icon">${service.icon}</div>
        <span class="eyebrow">${service.categoryLabel}</span>
        <h3>${service.title}</h3>
        <p class="muted">${service.short}</p>
        <div class="card-meta">
          <span>от ${Novadent.money(service.price)}</span>
          <span>${service.duration}</span>
        </div>
        <a class="link-arrow" href="service.html?id=${service.id}">Подробнее</a>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-book-doctor]").forEach((link) => {
    link.href = `booking.html?doctor=${doctor.id}`;
  });
});