document.addEventListener("DOMContentLoaded", () => {
  const data = window.NOVADENT_DATA;
  const state = {
    step: 1,
    serviceId: Novadent.getParam("service") || "",
    doctorId: Novadent.getParam("doctor") || "",
    date: "",
    time: "",
    patient: {}
  };

  const saved = JSON.parse(localStorage.getItem("novadentBooking") || "null");
  if (saved && !state.serviceId && !state.doctorId) {
    Object.assign(state, saved, { step: 1 });
  }

  const stepElements = [...document.querySelectorAll(".booking-step")];
  const progress = [...document.querySelectorAll(".progress span")];
  const serviceOptions = document.querySelector("#booking-services");
  const doctorOptions = document.querySelector("#booking-doctors");
  const dateOptions = document.querySelector("#booking-dates");
  const timeOptions = document.querySelector("#booking-times");
  const bookingShell = document.querySelector(".booking-shell");

  function toLocalDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function getUpcomingSchedule(doctorId) {
    const templates = Object.values(data.schedule[doctorId] || {});
    if (!templates.length) return {};

    const upcoming = {};
    for (let offset = 1; offset <= 4; offset += 1) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() + offset);
      upcoming[toLocalDateKey(date)] = templates[(offset - 1) % templates.length];
    }
    return upcoming;
  }

  function sanitizeState() {
    const service = Novadent.getService(state.serviceId);
    const doctor = Novadent.getDoctor(state.doctorId);

    if (state.serviceId && !service) state.serviceId = "";
    if (state.doctorId && !doctor) state.doctorId = "";

    const selectedService = Novadent.getService(state.serviceId);
    if (selectedService && state.doctorId && !selectedService.doctorIds.includes(state.doctorId)) {
      state.doctorId = "";
      state.date = "";
      state.time = "";
    }
  }

  function renderServices() {
    serviceOptions.innerHTML = data.services.map((service) => `
      <button class="option-card ${state.serviceId === service.id ? "selected" : ""}" type="button" data-service="${service.id}" aria-pressed="${state.serviceId === service.id}">
        <strong>${service.title}</strong>
        <span>от ${Novadent.money(service.price)} · ${service.duration}</span>
      </button>
    `).join("");

    serviceOptions.querySelectorAll("[data-service]").forEach((button) => {
      button.addEventListener("click", () => {
        state.serviceId = button.dataset.service;
        const service = Novadent.getService(state.serviceId);
        if (state.doctorId && !service.doctorIds.includes(state.doctorId)) {
          state.doctorId = "";
          state.date = "";
          state.time = "";
        }
        renderServices();
        renderDoctors();
        renderDates();
        renderTimes();
        updateSummary();
      });
    });
  }

  function renderDoctors() {
    const service = Novadent.getService(state.serviceId);
    const doctors = service
      ? service.doctorIds.map(Novadent.getDoctor)
      : data.doctors;

    doctorOptions.innerHTML = doctors.map((doctor) => `
      <button class="option-card ${state.doctorId === doctor.id ? "selected" : ""}" type="button" data-doctor="${doctor.id}" aria-pressed="${state.doctorId === doctor.id}">
        <strong>${doctor.shortName}</strong>
        <span>${doctor.role} · ★ ${doctor.rating}</span>
      </button>
    `).join("");

    doctorOptions.querySelectorAll("[data-doctor]").forEach((button) => {
      button.addEventListener("click", () => {
        state.doctorId = button.dataset.doctor;
        state.date = "";
        state.time = "";
        renderDoctors();
        renderDates();
        renderTimes();
        updateSummary();
      });
    });
  }

  function renderDates() {
    if (!state.doctorId) {
      dateOptions.innerHTML = '<p class="muted">Сначала выберите врача.</p>';
      return;
    }

    const schedule = getUpcomingSchedule(state.doctorId);
    if (state.date && !schedule[state.date]) {
      state.date = "";
      state.time = "";
    }
    dateOptions.innerHTML = Object.keys(schedule).map((date) => {
      const label = new Date(`${date}T12:00:00`).toLocaleDateString("ru-RU", {
        weekday: "short",
        day: "numeric",
        month: "short"
      });
      return `<button type="button" class="slot-btn ${state.date === date ? "selected" : ""}" data-date="${date}" aria-pressed="${state.date === date}">${label}</button>`;
    }).join("");

    dateOptions.querySelectorAll("[data-date]").forEach((button) => {
      button.addEventListener("click", () => {
        state.date = button.dataset.date;
        state.time = "";
        renderDates();
        renderTimes();
        updateSummary();
      });
    });
  }

  function renderTimes() {
    if (!state.doctorId || !state.date) {
      timeOptions.innerHTML = '<p class="muted">Выберите дату, чтобы увидеть время.</p>';
      return;
    }

    const times = getUpcomingSchedule(state.doctorId)[state.date] || [];
    if (state.time && !times.includes(state.time)) {
      state.time = "";
    }
    timeOptions.innerHTML = times.map((time) => `
      <button type="button" class="slot-btn ${state.time === time ? "selected" : ""}" data-time="${time}" aria-pressed="${state.time === time}">${time}</button>
    `).join("");

    timeOptions.querySelectorAll("[data-time]").forEach((button) => {
      button.addEventListener("click", () => {
        state.time = button.dataset.time;
        renderTimes();
        updateSummary();
      });
    });
  }

  function showStep(step, shouldScroll = true) {
    state.step = Math.max(1, Math.min(stepElements.length, step));

    if (state.step === 2) renderDoctors();
    if (state.step === 3) {
      renderDates();
      renderTimes();
    }

    stepElements.forEach((element, index) => {
      element.hidden = index + 1 !== state.step;
    });
    progress.forEach((element, index) => {
      element.classList.toggle("active", index + 1 <= state.step);
    });
    updateSummary();
    if (shouldScroll) {
      bookingShell?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function getErrorElement(name) {
    return document.querySelector(`[data-error="${name}"]`);
  }

  function clearErrors() {
    document.querySelectorAll(".error-text").forEach((element) => {
      element.textContent = "";
    });
  }

  function validateStep() {
    clearErrors();

    if (state.step === 1 && !state.serviceId) {
      getErrorElement("service").textContent = "Выберите услугу.";
      return false;
    }

    if (state.step === 2 && !state.doctorId) {
      getErrorElement("doctor").textContent = "Выберите врача.";
      return false;
    }

    if (state.step === 3) {
      if (!state.date) {
        getErrorElement("date").textContent = "Выберите дату.";
        return false;
      }
      if (!state.time) {
        getErrorElement("time").textContent = "Выберите время.";
        return false;
      }
    }

    return true;
  }

  function collectPatient() {
    const form = document.querySelector("#patient-form");
    const formData = new FormData(form);
    state.patient = Object.fromEntries(formData.entries());

    clearErrors();
    let valid = true;

    if (!state.patient.name || state.patient.name.trim().length < 2) {
      getErrorElement("name").textContent = "Укажите имя.";
      valid = false;
    }

    const digits = (state.patient.phone || "").replace(/\D/g, "");
    if (digits.length < 10) {
      getErrorElement("phone").textContent = "Укажите корректный телефон.";
      valid = false;
    }

    if (!state.patient.consent) {
      getErrorElement("consent").textContent = "Нужно согласиться на обработку данных.";
      valid = false;
    }

    return valid;
  }

  function updateSummary() {
    const service = Novadent.getService(state.serviceId);
    const doctor = Novadent.getDoctor(state.doctorId);

    document.querySelector("#summary-service").textContent = service?.title || "Не выбрана";
    document.querySelector("#summary-doctor").textContent = doctor?.shortName || "Не выбран";
    document.querySelector("#summary-date").textContent = state.date
      ? new Date(`${state.date}T12:00:00`).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
      : "Не выбрана";
    document.querySelector("#summary-time").textContent = state.time || "Не выбрано";
    document.querySelector("#summary-price").textContent = service
      ? `от ${Novadent.money(service.price)}`
      : "—";

    localStorage.setItem("novadentBooking", JSON.stringify(state));
  }

  function buildMessage() {
    const service = Novadent.getService(state.serviceId);
    const doctor = Novadent.getDoctor(state.doctorId);
    const date = new Date(`${state.date}T12:00:00`).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    return [
      "Здравствуйте! Хочу записаться в NOVADENT.",
      "",
      `Услуга: ${service.title}`,
      `Врач: ${doctor.name}`,
      `Дата: ${date}`,
      `Время: ${state.time}`,
      "",
      `Пациент: ${state.patient.name}`,
      `Телефон: ${state.patient.phone}`,
      `Тип приёма: ${state.patient.visitType}`,
      state.patient.comment ? `Комментарий: ${state.patient.comment}` : ""
    ].filter(Boolean).join("\n");
  }

  document.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => {
      if (validateStep()) {
        showStep(state.step + 1);
      }
    });
  });

  document.querySelectorAll("[data-prev]").forEach((button) => {
    button.addEventListener("click", () => showStep(state.step - 1));
  });

  document.querySelector("#send-booking").addEventListener("click", () => {
    if (!collectPatient()) return;

    const message = buildMessage();
    localStorage.removeItem("novadentBooking");
    window.open(Novadent.createTelegramUrl(message), "_blank", "noopener");
  });

  sanitizeState();
  renderServices();
  renderDoctors();
  renderDates();
  renderTimes();
  showStep(1, false);
});