document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#doctors-grid");
  const buttons = document.querySelectorAll(".filter-btn");
  let activeRole = "all";

  function matchesRole(doctor) {
    if (activeRole === "all") return true;
    return doctor.role.toLowerCase().includes(activeRole);
  }

  function render() {
    const doctors = window.NOVADENT_DATA.doctors.filter(matchesRole);
    grid.innerHTML = doctors.map((doctor) => `
      <article class="card doctor-card">
        <img src="${doctor.image}" alt="${doctor.name}">
        <div class="doctor-card-body">
          <span class="rating">★ ${doctor.rating}</span>
          <h3>${doctor.shortName}</h3>
          <p class="muted">${doctor.role}</p>
          <div class="doctor-tags">
            <span class="tag">${doctor.experience} лет опыта</span>
            <span class="tag">${doctor.serviceIds.length} направления</span>
          </div>
          <a class="link-arrow" href="doctor.html?id=${doctor.id}">О враче</a>
        </div>
      </article>
    `).join("");
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeRole = button.dataset.role;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      render();
    });
  });

  render();
});