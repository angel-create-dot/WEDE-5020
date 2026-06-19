/* ============================================================
   FILE: js/main.js
   DESCRIPTION: Site-wide JavaScript for Booking.com (Part 3).
   Handles:
     1. Mobile navigation toggle (hamburger menu)
     2. Services accordion (services_and_products.html)
     3. Services search/filter (services_and_products.html)
     4. Gallery + lightbox (about_us.html)
     5. Interactive Leaflet office map (contact_us.html)
     6. Enquiry form validation + dynamic cost/availability
        response (enquiry.html)
     7. Contact form validation + mailto compilation
        (contact_us.html)
     8. Footer mini-form validation (all pages)
   Functions used directly in HTML (onsubmit="...") are
   declared in the global scope on purpose so inline HTML
   attributes can call them.
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ----------------------------------------------------------
     1. MOBILE NAVIGATION TOGGLE
     ---------------------------------------------------------- */
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector("nav ul");

  if (navToggle && navList) {
    navToggle.addEventListener("click", function () {
      navList.classList.toggle("open");
    });

    navList.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navList.classList.remove("open");
      });
    });
  }

  /* ----------------------------------------------------------
     2. SERVICES ACCORDION (services_and_products.html)
     Clicking a header toggles its panel open/closed. Only the
     panel clicked is affected — others stay in their current
     state, so visitors can open multiple panels at once.
     ---------------------------------------------------------- */
  const accordionTriggers = document.querySelectorAll(".accordion-trigger");

  accordionTriggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";
      const panel = document.getElementById(trigger.getAttribute("aria-controls"));

      trigger.setAttribute("aria-expanded", String(!isOpen));

      if (panel) {
        panel.hidden = isOpen;
      }
    });
  });

  /* ----------------------------------------------------------
     3. SERVICES SEARCH / FILTER (services_and_products.html)
     Filters accordion items live as the visitor types, matching
     against each service's title and description text. Shows a
     count of matching results and a "no matches" message.
     ---------------------------------------------------------- */
  const serviceSearchInput = document.getElementById("serviceSearch");
  const serviceSearchCount = document.getElementById("serviceSearchCount");

  if (serviceSearchInput) {
    const accordionItems = document.querySelectorAll(".accordion-item");

    serviceSearchInput.addEventListener("input", function () {
      const query = serviceSearchInput.value.trim().toLowerCase();
      let matches = 0;

      accordionItems.forEach(function (item) {
        const text = item.textContent.toLowerCase();
        const isMatch = query === "" || text.includes(query);

        item.style.display = isMatch ? "" : "none";

        // Auto-expand a matching panel so the visitor can see
        // why it matched, without them needing an extra click
        if (isMatch && query !== "") {
          const trigger = item.querySelector(".accordion-trigger");
          const panel = item.querySelector(".accordion-panel");
          if (trigger && panel) {
            trigger.setAttribute("aria-expanded", "true");
            panel.hidden = false;
          }
        }

        if (isMatch) matches++;
      });

      if (serviceSearchCount) {
        if (query === "") {
          serviceSearchCount.textContent = "";
        } else if (matches === 0) {
          serviceSearchCount.textContent = "No services match \"" + query + "\".";
        } else {
          serviceSearchCount.textContent = matches + " service" + (matches === 1 ? "" : "s") + " found.";
        }
      }
    });
  }

  /* ----------------------------------------------------------
     4. GALLERY + LIGHTBOX (about_us.html)
     Clicking a thumbnail opens a full-size overlay with
     Previous/Next/Close controls. Keyboard arrows and Escape
     also work once the lightbox is open.
     ---------------------------------------------------------- */
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentGalleryIndex = 0;

  function openLightbox(index) {
    if (!galleryItems.length) return;
    currentGalleryIndex = index;
    const img = galleryItems[currentGalleryIndex].querySelector("img");
    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt;
    lightboxCaption.textContent = img.alt;
    lightbox.hidden = false;
  }

  function closeLightbox() {
    lightbox.hidden = true;
  }

  function showNextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryItems.length;
    openLightbox(currentGalleryIndex);
  }

  function showPrevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryItems.length) % galleryItems.length;
    openLightbox(currentGalleryIndex);
  }

  if (lightbox && galleryItems.length) {
    galleryItems.forEach(function (item, index) {
      item.addEventListener("click", function () {
        openLightbox(index);
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxNext.addEventListener("click", showNextImage);
    lightboxPrev.addEventListener("click", showPrevImage);

    // Click on the dark overlay (outside the image) also closes it
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    // Keyboard support: Escape closes, arrow keys navigate
    document.addEventListener("keydown", function (event) {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") showNextImage();
      if (event.key === "ArrowLeft") showPrevImage();
    });
  }

  /* ----------------------------------------------------------
     5. INTERACTIVE OFFICE MAP (contact_us.html)
     Builds a single Leaflet map plotting all four global office
     locations with clickable markers and popups. Only runs if
     the #officeMap container and the Leaflet library are present
     on the current page.
     ---------------------------------------------------------- */
  const mapContainer = document.getElementById("officeMap");

  if (mapContainer && typeof L !== "undefined") {
    const offices = [
      { name: "Amsterdam — Head Office", lat: 52.37583, lng: 4.90738, address: "Oosterdokskade 163, 1011 DL Amsterdam" },
      { name: "Johannesburg — SA Office", lat: -26.11043, lng: 28.05677, address: "Sandton, Johannesburg, South Africa" },
      { name: "Jeddah — Middle East Office", lat: 21.56741, lng: 39.14065, address: "Jeddah, Saudi Arabia" },
      { name: "Seville — Europe Office", lat: 37.38906, lng: -6.00286, address: "Seville, Spain" }
    ];

    const officeMap = L.map("officeMap", { scrollWheelZoom: false }).setView([30, 15], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 18
    }).addTo(officeMap);

    offices.forEach(function (office) {
      L.marker([office.lat, office.lng])
        .addTo(officeMap)
        .bindPopup("<strong>" + office.name + "</strong><br>" + office.address);
    });
  }

  /* ----------------------------------------------------------
     8. FOOTER MINI-FORM VALIDATION (all pages)
     Validates the Quick Enquiry form found in the footer on
     every page. Shared logic since the form is identical
     site-wide. Defined here so it runs once DOM is ready and
     wires up automatically without needing per-page setup.
     ---------------------------------------------------------- */
  document.querySelectorAll(".footer-form").forEach(function (form) {
    form.addEventListener("submit", function () {
      // Validation itself happens in the global submitFooterForm
      // function below, called via the inline onsubmit attribute.
    });
  });

});

/* ================================================================
   GLOBAL HELPER FUNCTIONS
   These are called directly from inline HTML "onsubmit" attributes,
   so they must live in the global scope (outside DOMContentLoaded).
   ================================================================ */

/**
 * Generic field validator. Adds/removes the "input-error" class
 * and writes a message into the matching error <span>, if one
 * exists with the id "<fieldId>Error".
 */
function validateField(field, errorMessage) {
  const errorSpan = document.getElementById(field.id + "Error");
  let isValid = true;
  let message = "";

  if (field.hasAttribute("required") && field.value.trim() === "") {
    isValid = false;
    message = errorMessage || "This field is required.";
  } else if (field.type === "email" && field.value.trim() !== "") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(field.value.trim())) {
      isValid = false;
      message = "Please enter a valid email address.";
    }
  } else if (field.type === "tel" && field.value.trim() !== "") {
    const phonePattern = /^[0-9+\s()-]{7,15}$/;
    if (!phonePattern.test(field.value.trim())) {
      isValid = false;
      message = "Please enter a valid phone number.";
    }
  }

  field.classList.toggle("input-error", !isValid);
  if (errorSpan) errorSpan.textContent = isValid ? "" : message;

  return isValid;
}

/* ----------------------------------------------------------
   6. ENQUIRY FORM (enquiry.html)
   Validates all fields, then generates a dynamic response with
   estimated cost and availability based on the keyword typed
   into the Subject field — this is the "process the input and
   present a response related to cost, availability, or another
   relevant aspect" requirement from the Part 3 brief.
   ---------------------------------------------------------- */
function submitEnquiry(event) {
  event.preventDefault();

  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const subject = document.getElementById("subject");
  const message = document.getElementById("message");

  const validName = validateField(fullName, "Please enter your full name.");
  const validEmail = validateField(email, "Please enter your email address.");
  const validSubject = validateField(subject, "Please enter a subject.");
  const validMessage = validateField(message, "Please describe your enquiry.");

  if (!validName || !validEmail || !validSubject || !validMessage) {
    return false;
  }

  // Build a dynamic response based on keywords in the Subject field
  const subjectText = subject.value.trim().toLowerCase();
  let serviceLabel = "your enquiry";
  let costLine = "Our team will calculate an exact quote based on your dates and preferences.";
  let availabilityLine = "Availability varies by date — we recommend booking early to secure your preferred option.";

  if (subjectText.includes("hotel") || subjectText.includes("accommodation") || subjectText.includes("stay") || subjectText.includes("room")) {
    serviceLabel = "accommodation";
    costLine = "Estimated cost: from R950 per night, depending on property and dates.";
    availabilityLine = "Availability: most listings show real-time availability, with free cancellation on the majority of bookings.";
  } else if (subjectText.includes("flight") || subjectText.includes("fly") || subjectText.includes("plane")) {
    serviceLabel = "flights";
    costLine = "Estimated cost: domestic flights from R1 200, international from R8 500, depending on route and class.";
    availabilityLine = "Availability: seats are confirmed instantly at checkout, subject to airline inventory.";
  } else if (subjectText.includes("activity") || subjectText.includes("activities") || subjectText.includes("tour") || subjectText.includes("excursion")) {
    serviceLabel = "activities and experiences";
    costLine = "Estimated cost: from R350 per person for half-day tours and excursions.";
    availabilityLine = "Availability: most experiences can be booked up to 24 hours in advance, subject to group size limits.";
  } else if (subjectText.includes("catering") || subjectText.includes("dining") || subjectText.includes("restaurant") || subjectText.includes("food")) {
    serviceLabel = "catering and dining";
    costLine = "Estimated cost: breakfast packages from R150 per person; full-board from R650 per person per day.";
    availabilityLine = "Availability: dining packages depend on the specific property selected during booking.";
  } else if (subjectText.includes("spa") || subjectText.includes("massage") || subjectText.includes("wellness")) {
    serviceLabel = "wellness and spa services";
    costLine = "Estimated cost: massage and spa treatments from R450 per session.";
    availabilityLine = "Availability: spa slots are limited per property and are best booked at least 48 hours ahead.";
  }

  const responseDiv = document.getElementById("enquiryResponse");
  if (responseDiv) {
    responseDiv.innerHTML =
      "<h3>&#10003; Enquiry Submitted!</h3>" +
      "<p>Thank you, " + escapeHtml(fullName.value.trim()) + ". We received your enquiry about " + serviceLabel + ".</p>" +
      "<p>" + costLine + "</p>" +
      "<p>" + availabilityLine + "</p>" +
      "<p>Our support team will follow up by email at <strong>" + escapeHtml(email.value.trim()) + "</strong> within 24 hours. " +
      "For urgent assistance, call <strong>086 020 9215</strong>.</p>";
    responseDiv.style.display = "block";
  }

  document.getElementById("enquiryForm").style.display = "none";
  if (responseDiv) responseDiv.scrollIntoView({ behavior: "smooth", block: "center" });

  return false;
}

/* ----------------------------------------------------------
   7. CONTACT FORM (contact_us.html)
   Validates all fields, compiles the message, shows an on-page
   confirmation, and opens a pre-filled mailto link so the
   visitor's own email client sends the compiled message to
   Booking.com support — satisfying the brief's requirement
   that the customer be able to send the email to the recipient.
   ---------------------------------------------------------- */
function submitContact(event) {
  event.preventDefault();

  const name = document.getElementById("contactName");
  const email = document.getElementById("contactEmail");
  const phone = document.getElementById("contactPhone");
  const message = document.getElementById("contactMessage");

  const validName = validateField(name, "Please enter your name.");
  const validEmail = validateField(email, "Please enter your email address.");
  const validMessage = validateField(message, "Please enter a message.");

  if (!validName || !validEmail || !validMessage) {
    return false;
  }

  // Compile the validated input into an email and open the
  // visitor's mail client with the recipient and body pre-filled
  const recipient = "support@booking.com";
  const emailSubject = "Website Enquiry from " + name.value.trim();
  const emailBody =
    "Name: " + name.value.trim() + "\n" +
    "Email: " + email.value.trim() + "\n" +
    "Phone: " + (phone.value.trim() || "Not provided") + "\n\n" +
    "Message:\n" + message.value.trim();

  const mailtoLink =
    "mailto:" + recipient +
    "?subject=" + encodeURIComponent(emailSubject) +
    "&body=" + encodeURIComponent(emailBody);

  window.location.href = mailtoLink;

  const responseDiv = document.getElementById("contactResponse");
  if (responseDiv) {
    responseDiv.style.display = "block";
    responseDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  document.getElementById("contactForm").style.display = "none";

  return false;
}

/* ----------------------------------------------------------
   8. FOOTER MINI-FORM (all pages)
   Validates Name, Email and Message, then shows a small inline
   confirmation without leaving the page or reloading.
   ---------------------------------------------------------- */
function submitFooterForm(event, form) {
  event.preventDefault();

  const nameField = form.querySelector('[name="footerName"]');
  const emailField = form.querySelector('[name="footerEmail"]');
  const messageField = form.querySelector('[name="footerMessage"]');
  const responseEl = form.querySelector(".footer-form-response");

  let valid = true;

  if (!nameField.value.trim()) {
    valid = false;
    nameField.classList.add("input-error");
  } else {
    nameField.classList.remove("input-error");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailField.value.trim() || !emailPattern.test(emailField.value.trim())) {
    valid = false;
    emailField.classList.add("input-error");
  } else {
    emailField.classList.remove("input-error");
  }

  if (!messageField.value.trim()) {
    valid = false;
    messageField.classList.add("input-error");
  } else {
    messageField.classList.remove("input-error");
  }

  if (!valid) return false;

  if (responseEl) {
    responseEl.style.display = "block";
  }

  form.reset();
  return false;
}

/**
 * Escapes HTML special characters in user-entered text before it
 * is inserted into the page with innerHTML, preventing it from
 * being interpreted as markup.
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
