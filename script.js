// ===============================
// Navigation interactions (minimal, runs on DOMContentLoaded)
// ===============================
document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  // Toggle navbar open/close on mobile
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
      const isOpen = navLinks.classList.contains("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
    // Close menu on any link click (mobile)
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
      });
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
            const comboList = comboSection.querySelector(".combo-list");
            if (comboList && comboList.classList.contains("hidden"))
              comboList.classList.remove("hidden");
          }
        }

        // Special handling: open Add-ons section when clicked
        if (href === "#addonsSection") {
          const addonsSection = document.querySelector("#addonsSection");
          if (addonsSection) {
            target = addonsSection;
            const addonsList = addonsSection.querySelector("#addonsList");
            if (addonsList && addonsList.classList.contains("hidden"))
              addonsList.classList.remove("hidden");
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
});

// ===============================
// Global constants
// ===============================
const WA_LINK = "https://wa.me/919692261138"; // WhatsApp order link
const MENU_JSON = "menu.json"; // Menu data file
const PLACEHOLDER = "static/images/product_images/placeholder.webp"; // Default placeholder image

// ===============================
// Fetch menu.json and initialize rendering
// ===============================
async function init() {
  try {
    const res = await fetch(MENU_JSON, { credentials: "omit" });
    const data = await res.json();
    window.menuData = data;
    validateMenuData(data);

    renderMenuSections(data); // Main menu categories
    renderCombos(data); // Combos section
    renderAddons(data); // Add-ons section
  } catch (err) {
    console.error("Failed to load menu.json", err);
    const mc = document.getElementById("mainContent");
    if (mc) mc.innerHTML = "<p style='padding:20px'>Menu unavailable</p>";
  }
}

// ===============================
// Helper functions
// ===============================
function unique(arr) {
  return [...new Set(arr)];
}
function safeText(s) {
  return String(s || "");
}

function validateMenuData(d) {
  if (
    !d ||
    !Array.isArray(d.Menu_Items) ||
    !Array.isArray(d.Add_ons) ||
    !Array.isArray(d.Combos)
  ) {
    throw new Error("Invalid menu.json structure");
  }
  const req = ["product_code", "category", "item_name", "price"];
  d.Menu_Items.forEach((it) => {
    req.forEach((k) => {
      if (!(k in it)) {
        throw new Error("Invalid item: " + (it.product_code || it.item_name));
      }
    });
  });
}

// Directory by asset type
function imageBaseDir(type) {
  if (type === "addon") return "static/images/add_on_images/";
  if (type === "combo") return "static/images/combo_images/";
  return "static/images/product_images/";
}

// Create <picture> with AVIF > WebP > JXL, fallback <img> uses WebP
function buildPicture(code, type, alt, className = "") {
  const pic = document.createElement("picture");
  
  // If no code provided, use placeholder directly
  if (!code) {
    const img = document.createElement("img");
    img.src = PLACEHOLDER;
    img.alt = safeText(alt) + " (photo unavailable)";
    img.loading = "lazy";
    if (className) img.className = className;
    pic.appendChild(img);
    return pic;
  }
  
  const dir = imageBaseDir(type);
  const avif = `${dir}${code}.avif`;
  const webp = `${dir}${code}.webp`;
  const jxl = `${dir}${code}.jxl`;

  const s1 = document.createElement("source");
  s1.type = "image/avif";
  s1.srcset = avif;
  const s2 = document.createElement("source");
  s2.type = "image/webp";
  s2.srcset = webp;
  const s3 = document.createElement("source");
  s3.type = "image/jxl";
  s3.srcset = jxl;

  const img = document.createElement("img");
  img.src = PLACEHOLDER; // Start with placeholder as fallback
  img.alt = safeText(alt);
  img.loading = "lazy";
  if (className) img.className = className;
  
  // Try to load the actual image
  const testImg = new Image();
  testImg.onload = () => {
    img.src = webp; // If test passes, use the real image
  };
  testImg.onerror = () => {
    img.src = PLACEHOLDER; // If test fails, keep placeholder
  };
  testImg.src = webp; // Test with webp

  pic.appendChild(s1);
  pic.appendChild(s2);
  pic.appendChild(s3);
  pic.appendChild(img);
  return pic;
}

// ===============================
// Render menu sections (Pizza, Burger, etc.)
// Each category collapsible with count badge
// ===============================
function renderMenuSections(data) {
  const menuRoot = document.getElementById("menu");
  if (!menuRoot) return;
  menuRoot.innerHTML = "";

  const categories = unique(data.Menu_Items.map((i) => i.category)).sort();
  categories.forEach((cat) => {
    const section = document.createElement("section");
    section.className = "menu-section";
    section.id = "sec-" + cat.replace(/\s+/g, "-");

    // Header with title + item count
    const header = document.createElement("header");
    const h3 = document.createElement("h3");
    h3.innerText = cat;
    const count = data.Menu_Items.filter((it) => it.category === cat).length;
    const badge = document.createElement("div");
    badge.innerText = count + " items";
    badge.style.fontWeight = "700";
    badge.style.color = "#444";
    header.appendChild(h3);
    header.appendChild(badge);

    // Toggle category on click
    const itemsEl = document.createElement("div");
    itemsEl.className = "menu-items hidden"; // collapsed by default
    header.addEventListener("click", () => {
      itemsEl.classList.toggle("hidden");
      if (!itemsEl.classList.contains("hidden")) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    // Group items by product_code to handle variants (Half/Full, Small/Large)
    const items = data.Menu_Items.filter((i) => i.category === cat);
    const groupedByCode = {};
    items.forEach((item) => {
      if (!groupedByCode[item.product_code]) {
        groupedByCode[item.product_code] = [];
      }
      groupedByCode[item.product_code].push(item);
    });

    // Update count badge to show unique products only
    const uniqueCount = Object.keys(groupedByCode).length;
    badge.innerText = uniqueCount + " items";

    // Render each unique product (with variants grouped together)
    // Sort by item_id to maintain menu order
    const sortedEntries = Object.entries(groupedByCode).sort((a, b) => {
      const idA = a[1][0].item_id || 0;
      const idB = b[1][0].item_id || 0;
      return idA - idB;
    });
    
    sortedEntries.forEach(([productCode, itemsWithCode]) => {
      const mainItem = itemsWithCode[0]; // Use first item for basic display info
      const itm = document.createElement("article");
      itm.className = "item";

      // Apply status classes if item is not available
      if (mainItem.status === "coming-soon") {
        itm.classList.add("coming-soon");
      } else if (mainItem.status === "out-of-stock") {
        itm.classList.add("out-of-stock");
      }

      const thumb = document.createElement("div");
      thumb.className = "thumb";
      const pic = buildPicture(
        mainItem.product_code,
        "product",
        mainItem.display_name || mainItem.item_name
      );
      thumb.appendChild(pic);
      const imgEl1 = pic.querySelector("img");

      const meta = document.createElement("div");
      meta.className = "meta";
      const title = document.createElement("h4");
      title.innerText = mainItem.display_name || mainItem.item_name;
      const desc = document.createElement("p");
      desc.innerText = mainItem.description || "";

      meta.appendChild(title);
      meta.appendChild(desc);

      // Add variant prices (if multiple variants exist)
      if (itemsWithCode.length > 1) {
        const priceContainer = document.createElement("div");
        priceContainer.className = "variant-prices";
        priceContainer.style.display = "flex";
        priceContainer.style.gap = "10px";
        priceContainer.style.marginTop = "8px";
        priceContainer.style.flexWrap = "wrap";

        itemsWithCode.forEach((variant) => {
          const priceBtn = document.createElement("button");
          priceBtn.className = "price-variant";
          priceBtn.style.padding = "6px 12px";
          priceBtn.style.borderRadius = "6px";
          priceBtn.style.border = "1px solid #ddd";
          priceBtn.style.background = "#f9f9f9";
          priceBtn.style.cursor = "pointer";
          priceBtn.style.fontSize = "0.9rem";
          priceBtn.style.fontWeight = "600";
          priceBtn.style.transition = "all 0.2s";
          
          // Determine variant label (Half/Full, Small/Large, etc)
          let variantLabel = "₹" + variant.price;
          if (variant.item_name.includes("Half")) variantLabel = "Half: ₹" + variant.price;
          else if (variant.item_name.includes("Full")) variantLabel = "Full: ₹" + variant.price;
          else if (variant.item_name.includes("Small")) variantLabel = "Small: ₹" + variant.price;
          else if (variant.item_name.includes("Large")) variantLabel = "Large: ₹" + variant.price;
          
          priceBtn.textContent = variantLabel;
          
          priceBtn.addEventListener("mouseover", () => {
            priceBtn.style.background = "#ad210a";
            priceBtn.style.color = "#fff";
            priceBtn.style.borderColor = "#ad210a";
          });
          priceBtn.addEventListener("mouseout", () => {
            priceBtn.style.background = "#f9f9f9";
            priceBtn.style.color = "#000";
            priceBtn.style.borderColor = "#ddd";
          });
          
          priceContainer.appendChild(priceBtn);
        });
        meta.appendChild(priceContainer);
      } else {
        // Single price for non-variant items
        const price = document.createElement("div");
        price.className = "price";
        price.innerText = "₹" + mainItem.price;
        meta.appendChild(price);
      }

      itm.appendChild(thumb);
      itm.appendChild(meta);
      itemsEl.appendChild(itm);
    });

    section.appendChild(header);
    section.appendChild(itemsEl);
    menuRoot.appendChild(section);
  });
}

// ===============================
// Render combos (special section at top)
// Collapsible, includes count badge
// ===============================
function renderCombos(data) {
  const menuRoot = document.getElementById("menu");
  if (!menuRoot) return;
  const combos = data.Combos || [];
  if (!combos.length) return;

  const comboSection = document.createElement("section");
  comboSection.className = "menu-section";
  comboSection.id = "sec-combos";

  // Header with title + count
  const header = document.createElement("header");
  const h3 = document.createElement("h3");
  h3.innerText = "Combos & Offers";
  const badge = document.createElement("div");
  badge.innerText = combos.length + " offers";
  badge.style.fontWeight = "700";
  badge.style.color = "#444";
  header.appendChild(h3);
  header.appendChild(badge);
  comboSection.appendChild(header);

  // Collapsible list of combos
  const list = document.createElement("div");
  list.className = "combo-list hidden"; // collapsed by default
  header.addEventListener("click", () => {
    list.classList.toggle("hidden");
    if (!list.classList.contains("hidden")) {
      comboSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // Build code → name lookup
  const codeToName = {};
  (data.Menu_Items || []).forEach((item) => {
    codeToName[item.product_code] = item.display_name || item.item_name;
  });

  // Render each combo
  combos.forEach((c) => {
    const box = document.createElement("div");
    box.className = "combo";

    // Apply status classes if combo is not available
    if (c.status === "coming-soon") {
      box.classList.add("coming-soon");
    } else if (c.status === "out-of-stock") {
      box.classList.add("out-of-stock");
    }

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    const pic = buildPicture(c.combo_code, "combo", c.combo_name);
    thumb.appendChild(pic);
    const imgEl2 = pic.querySelector("img");

    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("h4");
    title.innerText = c.combo_name;
    const descr = document.createElement("p");
    
    // Extract just the items part from description (everything after "] ")
    let itemsText = "Includes: ";
    if (c.description) {
      // Description format: "[Veg preparation] Item1+Item2+Coke..."
      // Extract everything after the first "] "
      const parts = c.description.split("] ");
      if (parts.length > 1) {
        itemsText = "Includes: " + parts[1];
      }
    } else {
      // Fallback to items_included if no description
      const readableItems = (c.items_included || [])
        .map((code) => codeToName[code] || code)
        .join(", ");
      itemsText = "Includes: " + readableItems;
    }
    descr.innerText = itemsText;
    const price = document.createElement("div");
    price.className = "price";
    price.innerText = "₹" + c.combo_price;

    meta.appendChild(title);
    meta.appendChild(descr);
    meta.appendChild(price);

    box.appendChild(thumb);
    box.appendChild(meta);
    list.appendChild(box);
  });

  comboSection.appendChild(list);
  menuRoot.insertBefore(comboSection, menuRoot.firstChild); // show at top
}

// ===============================
// Render add-ons (separate section)
// Collapsible, includes count badge
// ===============================
function renderAddons(data) {
  const target = document.getElementById("addonsList");
  if (!target) return;
  target.innerHTML = "";
  const addons = data.Add_ons || [];

  // Update header with count
  const header = document.getElementById("addonsHeader");
  if (header) {
    header.innerHTML = "";
    const h3 = document.createElement("h3");
    h3.innerText = "Add-ons & Suggested";
    const badge = document.createElement("div");
    badge.innerText = addons.length + " items";
    badge.style.fontWeight = "700";
    badge.style.color = "#444";
    header.appendChild(h3);
    header.appendChild(badge);

    // Toggle section
    header.addEventListener("click", () => {
      target.classList.toggle("hidden");
      if (!target.classList.contains("hidden")) {
        header.parentElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  }

  // Render each add-on
  addons.forEach((a) => {
    const itm = document.createElement("article");
    itm.className = "item";

    // Apply status classes if addon is not available
    if (a.status === "coming-soon") {
      itm.classList.add("coming-soon");
    } else if (a.status === "out-of-stock") {
      itm.classList.add("out-of-stock");
    }

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    // Use image_code if available, otherwise fallback to addon_code
    const imageCode = a.image_code || a.addon_code;
    const pic = buildPicture(imageCode, "addon", a.addon_name);
    thumb.appendChild(pic);
    const imgEl3 = pic.querySelector("img");

    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("h4");
    title.innerText = a.addon_name;
    const desc = document.createElement("p");
    desc.innerText = a.best_for ? `Best for: ${a.best_for}` : "";
    const price = document.createElement("div");
    price.className = "price";
    price.innerText = "₹" + a.addon_price;

    meta.appendChild(title);
    meta.appendChild(desc);
    meta.appendChild(price);

    itm.appendChild(thumb);
    itm.appendChild(meta);
    target.appendChild(itm);
  });
}

// ===============================
// Init call — defer non-critical rendering to idle time (INP-friendly)
// ===============================
if ("requestIdleCallback" in window) {
  requestIdleCallback(init);
} else {
  setTimeout(init, 0);
}
