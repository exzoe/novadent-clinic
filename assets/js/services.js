document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector("#services-grid");
  const buttons = document.querySelectorAll(".filter-btn");
  let activeCategory = "all";

  function render() {
    const items = window.NOVADENT_DATA.services.filter((service) => {
      return activeCategory === "all" || service.category === activeCategory;
    });

    grid.innerHTML = items.map((service) => `
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

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      buttons.forEach((item) => item.classList.toggle("active", item === button));
      render();
    });
  });

  render();
});