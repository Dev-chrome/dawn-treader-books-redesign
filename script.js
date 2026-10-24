/* =========================================================
   DAWN TREADER BOOKS
   Interactive features
   Independent concept redesign
   ========================================================= */

"use strict";

/* ---------- 1. SHARED HELPERS ---------- */

const select = (selector, parent = document) =>
  parent.querySelector(selector);

const selectAll = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* ---------- 2. CURRENT YEAR ---------- */

const yearElement = select("#current-year");

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


/* ---------- 3. MOBILE NAVIGATION ---------- */

const menuToggle = select(".menu-toggle");
const navigationMenu = select("#navigation-menu");

function closeNavigation() {
  if (!menuToggle || !navigationMenu) return;

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");

  navigationMenu.classList.remove("is-open");
}

function openNavigation() {
  if (!menuToggle || !navigationMenu) return;

  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close navigation menu");

  navigationMenu.classList.add("is-open");
}

if (menuToggle && navigationMenu) {
  menuToggle.addEventListener("click", () => {
    const isExpanded =
      menuToggle.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      closeNavigation();
    } else {
      openNavigation();
    }
  });

  // Close the mobile menu after a navigation link is selected.
  selectAll("a", navigationMenu).forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  // Close the menu when tapping outside the navigation.
  document.addEventListener("click", (event) => {
    const isExpanded =
      menuToggle.getAttribute("aria-expanded") === "true";

    if (!isExpanded) return;

    if (
      !navigationMenu.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      closeNavigation();
    }
  });

  // Close the mobile menu with Escape.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
    }
  });

  // Prevent the mobile menu from remaining open on desktop.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeNavigation();
    }
  });
}


/* ---------- 4. SCROLL REVEAL ---------- */

// Reveal selected sections as they enter the viewport.
// If IntersectionObserver is unavailable, everything stays visible.

const revealSelectors = [
  ".intro-strip-inner",
  ".section-heading",
  ".category-card",
  ".product-card",
  ".editorial-art",
  ".editorial-copy",
  ".about-heading",
  ".about-copy",
  ".newsletter-copy",
  ".newsletter-form"
];

if (
  !prefersReducedMotion &&
  "IntersectionObserver" in window
) {
  const revealElements = revealSelectors.flatMap((selector) =>
    selectAll(selector)
  );

  revealElements.forEach((element) => {
    element.classList.add("reveal-pending");
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
}


/* ---------- 5. BOOK CATALOGUE ---------- */

// These are demonstration entries for the concept website.
// Verify actual titles, availability, and prices with the bookseller.

const bookCatalogue = {
  "book-one": {
    title: "The Art of Noticing",
    category: "Mind & Meaning",
    description: "A little more attention, every day."
  },

  "book-two": {
    title: "The Secret Garden",
    category: "Fiction & Literature",
    description: "A beloved story of renewal."
  },

  "book-three": {
    title: "The Boy, the Mole, the Fox and the Horse",
    category: "Giftable Reads",
    description: "A little wisdom for the journey."
  },

  "book-four": {
    title: "A Thousand Quiet Things",
    category: "Poetry & Prose",
    description: "For the words you cannot quite find."
  }
};


/* ---------- 6. BOOK SELECTION DRAWER ---------- */

const cartOverlay = select("#cart-overlay");
const cartPanel = select(".cart-panel");
const cartClose = select(".cart-close");
const cartItems = select("#cart-items");
const cartCount = select("#cart-count");
const cartClear = select(".cart-clear");

let selectedBooks = [];
let lastFocusedElement = null;

function openCart() {
  if (!cartOverlay) return;

  lastFocusedElement = document.activeElement;

  cartOverlay.hidden = false;
  document.body.style.overflow = "hidden";

  renderCart();

  if (cartClose) {
    cartClose.focus();
  }
}

function closeCart() {
  if (!cartOverlay || cartOverlay.hidden) return;

  cartOverlay.hidden = true;
  document.body.style.overflow = "";

  if (
    lastFocusedElement &&
    typeof lastFocusedElement.focus === "function"
  ) {
    lastFocusedElement.focus();
  }
}

function addBook(bookId) {
  const book = bookCatalogue[bookId];

  if (!book) return;

  if (selectedBooks.includes(bookId)) {
    announce(`${book.title} is already in your reading list.`);
    openCart();
    return;
  }

  selectedBooks.push(bookId);

  renderCart();
  announce(`${book.title} added to your reading list.`);

  openCart();
}

function removeBook(bookId) {
  selectedBooks = selectedBooks.filter((id) => id !== bookId);

  renderCart();

  announce("Book removed from your reading list.");
}

function renderCart() {
  if (!cartItems || !cartCount) return;

  cartItems.replaceChildren();

  selectedBooks.forEach((bookId) => {
    const book = bookCatalogue[bookId];

    if (!book) return;

    const item = document.createElement("li");
    item.className = "cart-item";

    const details = document.createElement("div");

    const title = document.createElement("h3");
    title.className = "cart-item-title";
    title.textContent = book.title;

    const description = document.createElement("p");
    description.className = "cart-item-meta";
    description.textContent = book.category;

    details.append(title, description);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "cart-remove";
    removeButton.textContent = "Remove";
    removeButton.setAttribute(
      "aria-label",
      `Remove ${book.title} from your reading list`
    );

    removeButton.addEventListener("click", () => {
      removeBook(bookId);
    });

    item.append(details, removeButton);
    cartItems.append(item);
  });

  const total = selectedBooks.length;

  cartCount.textContent =
    `${total} ${total === 1 ? "book" : "books"} selected`;

  if (cartClear) {
    cartClear.disabled = total === 0;
    cartClear.style.opacity = total === 0 ? "0.55" : "1";
    cartClear.style.cursor = total === 0 ? "not-allowed" : "pointer";
  }

  if (total === 0) {
    const emptyMessage = document.createElement("li");
    emptyMessage.className = "cart-item-meta";
    emptyMessage.style.padding = "18px 0";
    emptyMessage.textContent =
      "Your reading list is empty. Explore the shelves to find a book.";

    cartItems.append(emptyMessage);
  }
}


// Attach a click handler to every book-selection button.

selectAll("[data-add-to-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    const bookId = button.dataset.addToCart;
    addBook(bookId);
  });
});

if (cartClose) {
  cartClose.addEventListener("click", closeCart);
}

if (cartOverlay) {
  // Clicking the backdrop closes the drawer.
  cartOverlay.addEventListener("click", (event) => {
    if (event.target === cartOverlay) {
      closeCart();
    }
  });
}

if (cartClear) {
  cartClear.addEventListener("click", () => {
    selectedBooks = [];
    renderCart();
    announce("Your reading list has been cleared.");
  });
}

// Escape closes the drawer.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
  }
});

// Keep keyboard focus inside the open modal.
if (cartPanel) {
  cartPanel.addEventListener("keydown", (event) => {
    if (event.key !== "Tab" || !cartOverlay || cartOverlay.hidden) {
      return;
    }

    const focusableElements = selectAll(
      'button:not(:disabled), a[href], input:not(:disabled), [tabindex]:not([tabindex="-1"])',
      cartPanel
    ).filter((element) => element.getClientRects().length > 0);

    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {
      event.preventDefault();
      first.focus();
    }
  });
}


/* ---------- 7. ACCESSIBLE ANNOUNCEMENTS ---------- */

let announcementTimer;

function announce(message) {
  let liveRegion = select("#site-announcement");

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = "site-announcement";
    liveRegion.setAttribute("role", "status");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");

    Object.assign(liveRegion.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0, 0, 0, 0)",
      whiteSpace: "nowrap",
      border: "0"
    });

    document.body.append(liveRegion);
  }

  liveRegion.textContent = "";

  window.clearTimeout(announcementTimer);

  announcementTimer = window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 40);
}


/* ---------- 8. NEWSLETTER DEMO ---------- */

const newsletterForm = select("#newsletter-form");
const newsletterEmail = select("#newsletter-email");
const newsletterMessage = select("#newsletter-message");

if (newsletterForm && newsletterEmail && newsletterMessage) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = newsletterEmail.value.trim();

    if (!email || !newsletterEmail.checkValidity()) {
      newsletterEmail.reportValidity();
      return;
    }

    // This is a frontend demonstration only.
    // No email is sent or stored.

    newsletterMessage.textContent =
      "Thanks for your interest! This concept form is a demo and isn't connected to an email service.";

    newsletterMessage.setAttribute("role", "status");
    newsletterMessage.setAttribute("aria-live", "polite");

    newsletterForm.reset();
  });
}


/* ---------- 9. NAVIGATION ACTIVE STATE ---------- */

// Highlight the relevant navigation link when possible.

const sectionLinks = selectAll(
  '.navigation-menu a[href^="#"]'
);

const trackedSections = sectionLinks
  .map((link) => {
    const targetId = link.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);

    return target ? { link, target } : null;
  })
  .filter(Boolean);

if (
  trackedSections.length > 0 &&
  "IntersectionObserver" in window
) {
  const activeSectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        trackedSections.forEach(({ link, target }) => {
          if (target === entry.target) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    {
      rootMargin: "-25% 0px -60% 0px",
      threshold: 0
    }
  );

  trackedSections.forEach(({ target }) => {
    activeSectionObserver.observe(target);
  });
}


/* ---------- 10. INITIAL STATE ---------- */

renderCart();

console.info(
  "Dawn Treader Books concept loaded successfully."
);