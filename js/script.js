/* Himalayan Taste — COM109 coursework demonstration
   JavaScript + jQuery interactions. No server-side booking is performed. */
document.addEventListener("DOMContentLoaded", () => {
  // Footer year and mobile navigation
  document.querySelectorAll(".current-year").forEach(el => el.textContent = new Date().getFullYear());
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });
  }

  // Prevent booking dates in the past and restore temporary progress from sessionStorage
  const dateInput = document.getElementById("booking-date");
  if (dateInput) {
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = localToday;
    const form = document.getElementById("booking-form");
    const saved = sessionStorage.getItem("himalayanBookingDraft");
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        Object.entries(draft).forEach(([key, value]) => {
          const field = form.elements.namedItem(key);
          if (field && field.type !== "checkbox") field.value = value;
        });
      } catch (error) { sessionStorage.removeItem("himalayanBookingDraft"); }
    }
    form.addEventListener("input", () => {
      const draft = {};
      ["name", "email", "phone", "guests", "date", "time", "notes"].forEach(key => {
        const field = form.elements.namedItem(key);
        if (field) draft[key] = field.value;
      });
      sessionStorage.setItem("himalayanBookingDraft", JSON.stringify(draft));
    });
  }

  // Reusable client-side validation and DOM feedback
  function showError(field, message) {
    field.classList.toggle("invalid", Boolean(message));
    const group = field.closest(".form-group");
    const output = group ? group.querySelector(".error-message") : null;
    if (output) output.textContent = message;
  }
  function validateForm(form) {
    let valid = true;
    const fields = [...form.querySelectorAll("input[required], select[required], textarea[required]")];
    fields.forEach(field => {
      let message = "";
      if (field.type === "checkbox" && !field.checked) message = "Please confirm this box.";
      else if (!field.checkValidity()) {
        if (field.validity.valueMissing) message = "This field is required.";
        else if (field.validity.typeMismatch) message = "Please enter a valid email address.";
        else if (field.validity.tooShort) message = `Please enter at least ${field.minLength} characters.`;
        else if (field.validity.patternMismatch) message = "Please enter a valid phone number.";
        else if (field.validity.rangeUnderflow) message = "Please choose today or a future date.";
        else message = "Please check this field.";
      }
      showError(field, message);
      if (message) valid = false;
    });
    return valid;
  }
  const bookingForm = document.getElementById("booking-form");
  if (bookingForm) {
    bookingForm.addEventListener("submit", event => {
      event.preventDefault();
      const result = document.getElementById("booking-result");
      if (!validateForm(bookingForm)) {
        result.className = "form-result error";
        result.textContent = "Please correct the highlighted fields and try again.";
        const firstInvalid = bookingForm.querySelector(".invalid, input:invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(bookingForm).entries());
      result.className = "form-result success";
      result.innerHTML = `<strong>Thank you, ${escapeHTML(data.name)}!</strong><br>Your demonstration reservation request is ready: ${escapeHTML(data.guests)} guest(s), ${escapeHTML(data.date)} at ${escapeHTML(data.time)}. No real booking has been sent.`;
      sessionStorage.removeItem("himalayanBookingDraft");
      bookingForm.reset();
    });
  }
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", event => {
      event.preventDefault();
      const result = document.getElementById("contact-result");
      if (!validateForm(contactForm)) {
        result.className = "form-result error";
        result.textContent = "Please correct the highlighted fields and try again.";
        const firstInvalid = contactForm.querySelector(".invalid, :invalid");
        if (firstInvalid) firstInvalid.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(contactForm).entries());
      result.className = "form-result success";
      result.innerHTML = `<strong>Thank you, ${escapeHTML(data.name)}.</strong><br>Your message has been prepared for this demonstration. It has not been sent to a server.`;
      contactForm.reset();
    });
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }

  // jQuery: category filtering and small reveal effect
  if (window.jQuery) {
    $(".filter-button").on("click", function () {
      const category = $(this).data("filter");
      $(".filter-button").removeClass("active").attr("aria-pressed", "false");
      $(this).addClass("active").attr("aria-pressed", "true");
      let visible = 0;
      $(".menu-card").each(function () {
        const show = category === "all" || $(this).data("category") === category;
        $(this).stop(true, true);
        if (show) { $(this).fadeIn(180); visible++; } else { $(this).hide(); }
      });
      $(".empty-menu").prop("hidden", visible !== 0);
    });

    // Accessible favourite list stored in localStorage
    const KEY = "himalayanTasteFavourites";
    function getFavourites() {
      try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (error) { return []; }
    }
    function updateFavourites() {
      const favourites = getFavourites();
      $("#favourite-count").text(favourites.length);
      $(".favourite-button").each(function () {
        const name = $(this).data("favourite");
        const saved = favourites.includes(name);
        $(this).attr("aria-pressed", String(saved)).text(saved ? "♥ Saved" : "♡ Save favourite");
      });
    }
    $(document).on("click", ".favourite-button", function () {
      const name = $(this).data("favourite");
      let favourites = getFavourites();
      favourites = favourites.includes(name) ? favourites.filter(item => item !== name) : [...favourites, name];
      localStorage.setItem(KEY, JSON.stringify(favourites));
      updateFavourites();
    });
    updateFavourites();
  }
});