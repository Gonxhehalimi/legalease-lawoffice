document.addEventListener("DOMContentLoaded", () => {

  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const headerRight = document.querySelector(".header-right");
  
  if (mobileMenuToggle && headerRight) {
    mobileMenuToggle.addEventListener("click", () => {
      const isExpanded = mobileMenuToggle.getAttribute("aria-expanded") === "true";
      mobileMenuToggle.setAttribute("aria-expanded", !isExpanded);
      headerRight.classList.toggle("menu-open");
    });

    const navLinks = headerRight.querySelectorAll("nav a");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        headerRight.classList.remove("menu-open");
      });
    });

   
    document.addEventListener("click", (e) => {
      if (!headerRight.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mobileMenuToggle.setAttribute("aria-expanded", "false");
        headerRight.classList.remove("menu-open");
      }
    });
  }

  // ===== API Form Submissions =====
  // API_BASE_URL comes from js/config.js, loaded before this file.

  function getText(key, fallback) {
    if (typeof t === "function") return t(key);
    return fallback;
  }

  function showFormStatus(successEl, errorEl, type, message) {
    if (successEl) {
      successEl.classList.remove("visible");
      successEl.textContent = "";
    }
    if (errorEl) {
      errorEl.classList.remove("visible");
      errorEl.textContent = "";
    }

    if (type === "success" && successEl) {
      successEl.textContent = message;
      successEl.classList.add("visible");
    }
    if (type === "error" && errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
  }

  async function postJson(url, payload) {
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      throw new Error("Backend is offline. Please start the server and try again.");
    }

    let data = {};
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(data.error || "Request failed. Please try again.");
    }
    return data;
  }

  const consultationForm = document.getElementById("consultationForm");
  if (consultationForm) {
    const submitBtn = document.getElementById("consultationSubmitBtn");
    const successEl = document.getElementById("consultationSuccess");
    const errorEl = document.getElementById("consultationError");

    consultationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const full_name = consultationForm.full_name.value.trim();
      const email = consultationForm.email.value.trim();
      const phone = consultationForm.phone.value.trim();
      const legal_service = consultationForm.legal_service.value.trim();
      const preferred_date = consultationForm.preferred_date.value;
      const preferred_time = consultationForm.preferred_time.value;
      const message = consultationForm.message.value.trim();
      // Honeypot field: real users never see or fill this in (hidden via CSS).
      const website = consultationForm.website ? consultationForm.website.value.trim() : "";

      if (!full_name || !email || !phone || !legal_service || !preferred_date || !preferred_time) {
        showFormStatus(
          successEl,
          errorEl,
          "error",
          getText("contact.formError", "Please fill in all required fields.")
        );
        return;
      }

      const originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = getText("contact.submitLoading", "Sending...");
      }

      try {
        await postJson(`${API_BASE_URL}/api/consultations`, {
          full_name,
          email,
          phone,
          legal_service,
          preferred_date,
          preferred_time,
          message,
          website
        });

        showFormStatus(
          successEl,
          errorEl,
          "success",
          getText(
            "contact.formSuccess",
            "Thank you! Your consultation request has been submitted. We'll contact you shortly."
          )
        );
        consultationForm.reset();
      } catch (error) {
        showFormStatus(successEl, errorEl, "error", error.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    const submitBtn = document.getElementById("contactSubmitBtn");
    const successEl = document.getElementById("contactSuccess");
    const errorEl = document.getElementById("contactError");

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = contactForm.name.value.trim();
      const email = contactForm.email.value.trim();
      const phone = contactForm.phone.value.trim();
      const subject = contactForm.subject.value.trim();
      const message = contactForm.message.value.trim();
      const website = contactForm.website ? contactForm.website.value.trim() : "";

      if (!name || !email || !subject || !message) {
        showFormStatus(
          successEl,
          errorEl,
          "error",
          getText("contact.formError", "Please fill in all required fields.")
        );
        return;
      }

      const originalText = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = getText("contact.submitLoading", "Sending...");
      }

      try {
        await postJson(`${API_BASE_URL}/api/contact`, {
          name,
          email,
          phone,
          subject,
          message,
          website
        });

        showFormStatus(
          successEl,
          errorEl,
          "success",
          getText(
            "contact.contactSuccess",
            "Thank you! Your contact message has been sent. We will reply shortly."
          )
        );
        contactForm.reset();
      } catch (error) {
        showFormStatus(successEl, errorEl, "error", error.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // ===== Hero Slider =====
  const heroSection = document.querySelector(".hero");
  const slider = heroSection ? heroSection.querySelector(".slider") : null;
  const slides = heroSection ? heroSection.querySelectorAll(".slide") : [];
  let currentSlide = 0;

  if (slider && slides.length > 0) {
    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }

    setInterval(nextSlide, 5000); // Slide every 5 seconds
  }

  // ===== Testimonials Slider =====
  const testimonialsSection = document.querySelector(".testimonials");
  if (testimonialsSection) {
    const track = testimonialsSection.querySelector(".testimonials-track");
    const cards = testimonialsSection.querySelectorAll(".testimonial-card");
    const prevBtn = testimonialsSection.querySelector(".testimonial-prev");
    const nextBtn = testimonialsSection.querySelector(".testimonial-next");
    const dots = testimonialsSection.querySelectorAll(".testimonials-dots .dot");

    let currentTestimonial = 0;
    let autoPlayInterval;

    // Get visible cards based on current language
    function getVisibleCards() {
      const currentLang = document.body.getAttribute("data-lang") || "en";
      return Array.from(cards).filter(card => card.getAttribute("data-lang") === currentLang);
    }

    // Update slider position
    function updateSlider() {
      const visibleCards = getVisibleCards();
      if (visibleCards.length === 0) return;
      
      // Ensure currentTestimonial is within bounds
      if (currentTestimonial >= visibleCards.length) {
        currentTestimonial = 0;
      }
      if (currentTestimonial < 0) {
        currentTestimonial = visibleCards.length - 1;
      }

      const offset = -currentTestimonial * 100;
      track.style.transform = `translateX(${offset}%)`;

      // Update dots
      dots.forEach((dot, index) => {
        if (index === currentTestimonial) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }

    // Navigate to specific testimonial
    function goToTestimonial(index) {
      const visibleCards = getVisibleCards();
      if (index >= 0 && index < visibleCards.length) {
        currentTestimonial = index;
        updateSlider();
        resetAutoPlay();
      }
    }

    // Next testimonial
    function nextTestimonial() {
      const visibleCards = getVisibleCards();
      currentTestimonial = (currentTestimonial + 1) % visibleCards.length;
      updateSlider();
      resetAutoPlay();
    }

    // Previous testimonial
    function prevTestimonial() {
      const visibleCards = getVisibleCards();
      currentTestimonial = (currentTestimonial - 1 + visibleCards.length) % visibleCards.length;
      updateSlider();
      resetAutoPlay();
    }

    // Auto-play functionality
    function startAutoPlay() {
      autoPlayInterval = setInterval(() => {
        nextTestimonial();
      }, 6000); // Change testimonial every 6 seconds
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    // Event listeners
    if (nextBtn) {
      nextBtn.addEventListener("click", nextTestimonial);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", prevTestimonial);
    }

    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => goToTestimonial(index));
    });

    // Pause auto-play on hover
    testimonialsSection.addEventListener("mouseenter", stopAutoPlay);
    testimonialsSection.addEventListener("mouseleave", startAutoPlay);

    // Handle language changes
    const languageObserver = new MutationObserver(() => {
      currentTestimonial = 0;
      updateSlider();
    });

    if (document.body) {
      languageObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ["data-lang"]
      });
    }

    // Initialize
    updateSlider();
    startAutoPlay();

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    if (track) {
      track.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      track.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });
    }

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextTestimonial();
        } else {
          prevTestimonial();
        }
      }
    }
  }
});
