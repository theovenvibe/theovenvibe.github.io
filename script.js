// Global variables to track pending accordion opens
let pendingAccordionOpens = {
  combos: false,
  addons: false
};

// ===============================
// Navigation interactions (minimal, runs on DOMContentLoaded)
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  // ===============================
  // Scroll Animations (IntersectionObserver)
  // ===============================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Run once
      }
    });
  }, observerOptions);

  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });

  // ===============================
  // Mobile Menu Logic (Overlay)
  // ===============================
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  function openMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeMenu() {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", openMenu);
  }

  if (closeMenuBtn) {
    closeMenuBtn.addEventListener("click", closeMenu);
  }

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Fallback/Legacy support (optional, can be removed if all pages updated)
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    // ... legacy logic ...
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", function (e) {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        let target = document.querySelector(href);

        // Special handling: scroll to WhatsApp banner instead of #menu
        if (href === "#menu") {
          const waBanner = document.querySelector(".hero-cta");
          if (waBanner) target = waBanner;
        }

        // Special handling: open Combos section when clicked
        if (href === "#sec-combos") {
          const comboSection = document.querySelector("#sec-combos");
          if (comboSection) {
            target = comboSection;
            // Mark for opening after menu loads
            pendingAccordionOpens.combos = true;
            // Try to open immediately if already loaded
            const header = comboSection.querySelector(".accordion-header");
            if (header && !comboSection.classList.contains("active")) {
              header.click();
            }
          } else {
            // Accordion not loaded yet, mark for later
            pendingAccordionOpens.combos = true;
          }
        }

        // Special handling: open Add-ons section when clicked
        if (href === "#addonsSection") {
          const addonsSection = document.querySelector("#addonsSection");
          if (addonsSection) {
            target = addonsSection;
            // Mark for opening after menu loads
            pendingAccordionOpens.addons = true;
            // Try to open immediately if already loaded
            const accordion = addonsSection.querySelector(".accordion-item");
            if (accordion) {
              const header = accordion.querySelector(".accordion-header");
              if (header && !accordion.classList.contains("active")) {
                header.click();
              }
            }
          } else {
            // Accordion not loaded yet, mark for later
            pendingAccordionOpens.addons = true;
          }
        }

        // Scroll into view
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // ===============================
  // Dynamic Footer Injection
  // ===============================
  const footerPlaceholder = document.getElementById(
    "global-footer-placeholder"
  );
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = `
    <footer class="footer animate-on-scroll" id="footer">
      <div class="footer-container">
        <!-- Primary Content -->
        <div class="footer-content">
          <p class="footer-brand-name">The Oven Vibe</p>
          <nav class="footer-nav">
            <a href="index.html#menu">Menu</a>
            <a href="contact.html">Contact</a>
            <a href="faq.html">FAQ</a>
            <a href="blog.html">Blog</a>
          </nav>
        </div>

        <!-- Secondary/Right Content -->
        <div class="footer-right">
          <div class="footer-order-links">
            <a href="https://link.zomato.com/xqzv/rshare?id=11990877930563aa9&utm_source=site&utm_medium=footer&utm_campaign=delivery" target="_blank" rel="noopener noreferrer" aria-label="Order on Zomato">Zomato</a>
            <span style="opacity: 0.3">|</span>
            <a href="https://www.swiggy.com/direct/brand/710285?source=swiggy-direct&subSource=generic&utm_source=site&utm_medium=footer&utm_campaign=delivery" target="_blank" rel="noopener noreferrer" aria-label="Order on Swiggy">Swiggy</a>
          </div>

          <div class="footer-social-links">
            <a href="https://instagram.com/theovenvibe" target="_blank" rel="noopener noreferrer" aria-label="Follow on Instagram">Instagram</a>
            <span style="opacity: 0.3">|</span>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Follow on Facebook">Facebook</a>
            <span style="opacity: 0.3">|</span>
            <a href="https://maps.app.goo.gl/t8u7p3cfaYEkj5JP8" target="_blank" rel="noopener noreferrer" aria-label="Find us on Maps">Maps</a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-meta">
          <p>20 min takeaway · 30-45 min delivery</p>
          © 2025 The Oven Vibe · All rights reserved
        </div>
      </div>
    </footer>
    `;

    // Observe the new footer for animation
    const footer = footerPlaceholder.querySelector(".footer");
    if (footer) {
      observer.observe(footer);
    }
  }
});

// ===============================
// Global constants
// ===============================
const WA_LINK = "https://wa.me/919692261138"; // WhatsApp order link
const MENU_JSON = "menu.json"; // Menu data file
const PLACEHOLDER = "static/images/product_images/placeholder.webp"; // Default placeholder image

// ===============================
// Function to create picture element (AVIF -> JXL -> WebP)
// ===============================
function buildPicture(productCode, folder, altText, className) {
  const picture = document.createElement("picture");

  // Define sources (priority order: AVIF -> JXL -> WebP)
  // Assuming folder mapping:
  // - "combo" -> static/images/combo_images/
  // - "menu"  -> static/images/product_images/
  // - "addon" -> static/images/add_on_images/

  let basePath = "";
  if (folder === "combo") basePath = "static/images/combo_images/";
  else if (folder === "addon") basePath = "static/images/add_on_images/";
  else basePath = "static/images/product_images/";

  const formats = ["avif", "jxl", "webp"];

  formats.forEach((ext) => {
    const source = document.createElement("source");
    source.srcset = `${basePath}${productCode}.${ext}`;
    source.type = `image/${ext}`;
    picture.appendChild(source);
  });

  const img = document.createElement("img");
  img.src = `${basePath}${productCode}.webp`; // Fallback
  img.alt = altText;
  img.className = className;
  img.loading = "lazy";

  // Handle load error -> show placeholder
  img.onerror = function () {
    this.onerror = null;
    this.src = PLACEHOLDER;
    // Remove sources to prevent broken image icon if browser tries them
    while (picture.firstChild !== this) {
      picture.removeChild(picture.firstChild);
    }
  };

  picture.appendChild(img);
  return picture;
}

// ===============================
// 1. Fetch & Render Menu
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const menuContainer = document.getElementById("menu");
  if (!menuContainer) return; // Only run on pages with #menu

  fetch(MENU_JSON)
    .then((response) => response.json())
    .then((data) => {
      // 1. Combos Accordion (First)
      const combosAccordion = buildCombosAccordion(data);
      if (combosAccordion) menuContainer.appendChild(combosAccordion);

      // 2. Render Categories (Accordions)
      const categories = {};

      // Group items by Category -> Subcategory
      data.Menu_Items.forEach((item) => {
        if (!categories[item.category]) {
          categories[item.category] = {};
        }
        if (!categories[item.category][item.subcategory]) {
          categories[item.category][item.subcategory] = [];
        }
        categories[item.category][item.subcategory].push(item);
      });

      // Order of categories (optional, or just iterate keys)
      // If you want specific order, define an array here. Otherwise:
      Object.keys(categories).forEach((catName) => {
        const catContent = document.createElement("div");
        catContent.className = "category-group";

        // Create a single grid for all items in this category
        const grid = document.createElement("div");
        grid.className = "menu-items";

        // Add all items from all subcategories to the single grid
        Object.values(categories[catName]).forEach((subcategoryItems) => {
          subcategoryItems.forEach((item) => {
            const card = buildMenuCard(item);
            grid.appendChild(card);
          });
        });

        catContent.appendChild(grid);

        // Create Accordion for this Category
        // Calculate total items
        let count = 0;
        Object.values(categories[catName]).forEach(
          (arr) => (count += arr.length)
        );

        const accordion = createAccordionItem(
          catName,
          count + " items",
          catContent,
          false
        ); // false = closed by default
        menuContainer.appendChild(accordion);
      });

      // 3. Render Add-ons (Separate Section)
      renderAddons(data.Add_ons);

      // 4. Handle pending accordion opens
      setTimeout(() => {
        if (pendingAccordionOpens.combos) {
          const comboSection = document.querySelector("#sec-combos");
          if (comboSection) {
            const header = comboSection.querySelector(".accordion-header");
            if (header && !comboSection.classList.contains("active")) {
              header.click();
            }
          }
        }

        if (pendingAccordionOpens.addons) {
          const addonsSection = document.querySelector("#addonsSection");
          if (addonsSection) {
            const accordion = addonsSection.querySelector(".accordion-item");
            if (accordion) {
              const header = accordion.querySelector(".accordion-header");
              if (header && !accordion.classList.contains("active")) {
                header.click();
              }
            }
          }
        }

        // Reset pending flags
        pendingAccordionOpens.combos = false;
        pendingAccordionOpens.addons = false;
      }, 100);
    })
    .catch((err) => console.error("Error loading menu:", err));
});

// ===============================
// Helper: Build Menu Card
// ===============================
function buildMenuCard(item) {
  const card = document.createElement("article");
  card.className = "menu-card";

  if (item.status === "coming-soon") card.classList.add("coming-soon");
  else if (item.status === "out-of-stock") card.classList.add("out-of-stock");

  // Card Inner Wrapper
  const cardInner = document.createElement("div");
  cardInner.className = "menu-card-inner";
  card.appendChild(cardInner);

  // Image
  // Use product_code for image
  const pic = buildPicture(
    item.product_code,
    "menu",
    item.display_name,
    "menu-card-img"
  );
  cardInner.appendChild(pic);

  // Body
  const body = document.createElement("div");
  body.className = "menu-card-body";
  cardInner.appendChild(body);

  const title = document.createElement("h4");
  title.className = "menu-card-title";
  title.innerText = item.display_name || item.item_name;
  body.appendChild(title);

  const desc = document.createElement("p");
  desc.style.fontSize = "0.9rem";
  desc.style.color = "var(--color-text-muted)";
  desc.style.marginBottom = "1rem";
  desc.innerText = item.description;
  body.appendChild(desc);

  const price = document.createElement("div");
  price.className = "menu-card-price";
  price.innerText = "₹" + item.price;
  body.appendChild(price);

  return card;
}

// ===============================
// Helper: Build Combos Accordion
// ===============================
function buildCombosAccordion(data) {
  const combos = data.Combos || [];
  if (!combos.length) return null;

  const list = document.createElement("div");
  list.className = "menu-items combo-list";

  const codeToName = {};
  (data.Menu_Items || []).forEach((item) => {
    codeToName[item.product_code] = item.display_name || item.item_name;
  });

  combos.forEach((c) => {
    const card = document.createElement("article");
    card.className = "menu-card";

    if (c.status === "coming-soon") card.classList.add("coming-soon");
    else if (c.status === "out-of-stock") card.classList.add("out-of-stock");

    // Card Inner Wrapper
    const cardInner = document.createElement("div");
    cardInner.className = "menu-card-inner";
    card.appendChild(cardInner);

    // Image
    const pic = buildPicture(
      c.combo_code,
      "combo",
      c.combo_name,
      "menu-card-img"
    );
    cardInner.appendChild(pic);

    // Body
    const body = document.createElement("div");
    body.className = "menu-card-body";
    cardInner.appendChild(body);

    const title = document.createElement("h4");
    title.className = "menu-card-title";
    title.innerText = c.combo_name;
    body.appendChild(title);

    const desc = document.createElement("p");
    desc.style.fontSize = "0.9rem";
    desc.style.color = "var(--color-text-muted)";
    desc.style.marginBottom = "1rem";

    // Simplified description logic: Use description if present, else construct from items
    let itemsText = "Includes: ";
    if (c.description) {
      // If description already has "Includes:", use it as is, otherwise prefix it
      if (c.description.toLowerCase().includes("includes")) {
        itemsText = c.description;
      } else {
        itemsText = "Includes: " + c.description;
      }
    } else {
      const readableItems = (c.items_included || [])
        .map((code) => codeToName[code] || code)
        .join(", ");
      itemsText = "Includes: " + readableItems;
    }
    desc.innerText = itemsText;
    body.appendChild(desc);

    const price = document.createElement("div");
    price.className = "menu-card-price";
    price.innerText = "₹" + c.combo_price;
    body.appendChild(price);

    card.appendChild(body);
    list.appendChild(card);
  });

  // Create Accordion for Combos
  // CLOSED by default
  const accordion = createAccordionItem(
    "Combos & Offers",
    combos.length + " offers",
    list,
    false
  );
  accordion.id = "sec-combos";
  return accordion;
}

// ===============================
// Helper: Render Add-ons
// ===============================
function renderAddons(addons) {
  const addonsSection = document.getElementById("addonsSection");
  const container = document.getElementById("addonsList");
  if (!addonsSection || !container || !addons || !addons.length) return;

  // Create accordion wrapper
  const accordion = document.createElement("div");
  accordion.className = "accordion-item";

  // Create header
  const header = document.createElement("div");
  header.className = "accordion-header";
  header.innerHTML = `
    <div class="accordion-title">
      <h3>Add-ons & Suggested</h3>
      <span class="accordion-subtitle">${addons.length} items</span>
    </div>
    <svg class="accordion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  // Create grid wrapper (like other menu sections)
  const grid = document.createElement("div");
  grid.className = "menu-items";

  // Build addon cards in grid
  addons.forEach((addon) => {
    const card = document.createElement("article");
    card.className = "menu-card addon-card";

    if (addon.status === "coming-soon") card.classList.add("coming-soon");
    else if (addon.status === "out-of-stock") card.classList.add("out-of-stock");

    const cardInner = document.createElement("div");
    cardInner.className = "menu-card-inner";
    card.appendChild(cardInner);

    // Image
    const pic = buildPicture(
      addon.image_code,
      "addon",
      addon.addon_name,
      "menu-card-img"
    );
    cardInner.appendChild(pic);

    const body = document.createElement("div");
    body.className = "menu-card-body";
    cardInner.appendChild(body);

    const title = document.createElement("h4");
    title.className = "menu-card-title";
    title.innerText = addon.addon_name;
    body.appendChild(title);

    // Add description placeholder to match regular menu cards
    const desc = document.createElement("p");
    desc.style.fontSize = "0.9rem";
    desc.style.color = "var(--color-text-muted)";
    desc.style.marginBottom = "1rem";
    desc.innerText = "Perfect complement to your meal";
    body.appendChild(desc);

    const price = document.createElement("div");
    price.className = "menu-card-price";
    price.innerText = "₹" + addon.addon_price;
    body.appendChild(price);

    grid.appendChild(card);
  });

  // Create accordion content wrapper
  const contentWrapper = document.createElement("div");
  contentWrapper.className = "accordion-content";
  contentWrapper.appendChild(grid);

  accordion.appendChild(header);
  accordion.appendChild(contentWrapper);

  // Replace the addonsList with accordion
  const addonsList = document.getElementById("addonsList");
  if (addonsList) {
    addonsSection.replaceChild(accordion, addonsList);
  } else {
    addonsSection.appendChild(accordion);
  }

  // Add toggle logic
  header.addEventListener("click", () => {
    const isActive = accordion.classList.contains("active");

    if (!isActive) {
      accordion.classList.add("active");
      contentWrapper.style.maxHeight = contentWrapper.scrollHeight + "px";
    } else {
      accordion.classList.remove("active");
      contentWrapper.style.maxHeight = null;
    }
  });
}


// ===============================
// Helper: Create Accordion Item
// ===============================
function createAccordionItem(titleText, subtitleText, contentNode, isOpen) {
  const item = document.createElement("div");
  item.className = "accordion-item";
  if (isOpen) item.classList.add("active");

  const header = document.createElement("div");
  header.className = "accordion-header";
  header.innerHTML = `
    <div class="accordion-title">
      <h3>${titleText}</h3>
      <span class="accordion-subtitle">${subtitleText}</span>
    </div>
    <svg class="accordion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  `;

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "accordion-content";
  contentWrapper.appendChild(contentNode);

  item.appendChild(header);
  item.appendChild(contentWrapper);

  // Toggle Logic
  header.addEventListener("click", () => {
    const isActive = item.classList.contains("active");

    // Close others? (Optional - keeping separate)
    // document.querySelectorAll(".accordion-item").forEach(i => {
    //   i.classList.remove("active");
    //   i.querySelector(".accordion-content").style.maxHeight = null;
    // });

    if (!isActive) {
      item.classList.add("active");
      contentWrapper.style.maxHeight = contentWrapper.scrollHeight + "px";
    } else {
      item.classList.remove("active");
      contentWrapper.style.maxHeight = null;
    }
  });

  return item;
}
