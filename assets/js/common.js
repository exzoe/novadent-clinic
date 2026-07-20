(function () {
  const data = window.NOVADENT_DATA;

  function money(value) {
    return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
  }

  function getParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function getService(id) {
    return data.services.find((item) => item.id === id);
  }

  function getDoctor(id) {
    return data.doctors.find((item) => item.id === id);
  }

  function createTelegramUrl(message) {
    return `https://t.me/${data.clinic.telegram}?text=${encodeURIComponent(message)}`;
  }

  function setActiveNavigation() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const href = link.getAttribute("href").split("?")[0];
      if (
        href === currentPage ||
        (currentPage === "service.html" && href === "services.html") ||
        (currentPage === "doctor.html" && href === "doctors.html")
      ) {
        link.classList.add("active");
      }
    });
  }

  function setupMenu() {
    const button = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".main-nav");
    if (!button || !nav) return;

    button.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      document.body.classList.toggle("menu-open", isOpen);
      button.setAttribute("aria-expanded", String(isOpen));
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        nav.classList.remove("open");
        document.body.classList.remove("menu-open");
        button.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupFaq() {
    document.querySelectorAll(".faq-question").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        const willOpen = !item.classList.contains("open");
        document.querySelectorAll(".faq-item").forEach((faq) => {
          faq.classList.remove("open");
          faq.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
        });
        if (willOpen) {
          item.classList.add("open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function updateYear() {
    document.querySelectorAll("[data-year]").forEach((element) => {
      element.textContent = new Date().getFullYear();
    });
  }

  window.Novadent = {
    money,
    getParam,
    getService,
    getDoctor,
    createTelegramUrl
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupMenu();
    setupFaq();
    setActiveNavigation();
    updateYear();
  });
})();