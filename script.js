// Sticky navbar hamburger toggle and smooth scroll
document.addEventListener('DOMContentLoaded', function() {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if(navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });
    // Close menu on link click (mobile)
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }
  // Smooth scroll for nav links
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = link.getAttribute('href');
      if(href && href.startsWith('#')) {
        let target = document.querySelector(href);
        // For menu link, scroll to WhatsApp banner above menu
        if(href === '#menu') {
          const waBanner = document.querySelector('.hero-cta');
          if(waBanner) target = waBanner;
        }
        // For combos, scroll and unfold
        if(href === '#sec-combos') {
          const comboSection = document.querySelector('#sec-combos');
          if(comboSection) {
            target = comboSection;
            // Unfold combo list
            const comboList = comboSection.querySelector('.combo-list');
            if(comboList && comboList.classList.contains('hidden')) comboList.classList.remove('hidden');
          }
        }
        // For add-ons, scroll and unfold
        if(href === '#addonsSection') {
          const addonsSection = document.querySelector('#addonsSection');
          if(addonsSection) {
            target = addonsSection;
            // Unfold add-ons list
            const addonsList = addonsSection.querySelector('#addonsList');
            if(addonsList && addonsList.classList.contains('hidden')) addonsList.classList.remove('hidden');
          }
        }
        if(target) {
          e.preventDefault();
          target.scrollIntoView({behavior: 'smooth', block: 'start'});
        }
      }
    });
  });
});
/* script.js
   Mobile-first behavior:
   - Load menu.json
   - Build category filter pills
   - Render categories as sections (collapsible)
   - Desktop: grid layout; Mobile: list layout (handled by CSS)
   - Combos listed as a separate section
   - Add-ons shown below menu
*/

const WA_LINK = "https://wa.me/919692261138";
const MENU_JSON = "menu.json";
const PLACEHOLDER = "static/images/product_images/placeholder.webp";

/* fetch and initialize */
async function init(){
  try{
    const res = await fetch(MENU_JSON);
    const data = await res.json();
    window.menuData = data;
  // buildFilters(data); // removed
  renderMenuSections(data);
  renderCombos(data);
  renderAddons(data);
  // attachFilterBehavior(); // removed
  }catch(err){
    console.error("Failed to load menu.json", err);
    document.getElementById("mainContent").innerHTML = "<p style='padding:20px'>Menu unavailable</p>";
  }
}

/* helpers */
function unique(arr){ return [...new Set(arr)]; }
function safeText(s){ return String(s||''); }
function imagePath(code, type){
  if(!code) return PLACEHOLDER;
  if(type === 'addon') return `static/images/add_on_images/${code}.webp`;
  if(type === 'combo') return `static/images/combo_images/${code}.webp`;
  return `static/images/product_images/${code}.webp`;
}

// buildFilters removed

/* Render menu sections (category accordion) */
function renderMenuSections(data){
  const menuRoot = document.getElementById("menu");
  menuRoot.innerHTML = "";

  const categories = unique(data.Menu_Items.map(i=>i.category)).sort();
  categories.forEach(cat=>{
    const section = document.createElement("section");
    section.className = "menu-section";
    section.id = "sec-" + cat.replace(/\s+/g,'-');

    // header
    const header = document.createElement("header");
    const h3 = document.createElement("h3");
    h3.innerText = cat;
    const count = data.Menu_Items.filter(it=>it.category===cat).length;
    const badge = document.createElement("div");
    badge.innerText = count + " items";
    badge.style.fontWeight = "700";
    badge.style.color = "#444";
    header.appendChild(h3);
    header.appendChild(badge);
    header.addEventListener("click", ()=> {
      // toggle items visibility
      itemsEl.classList.toggle("hidden");
      // smooth scroll into view on open (mobile)
      if(!itemsEl.classList.contains("hidden")){
        section.scrollIntoView({behavior:"smooth", block:"start"});
      }
    });

    // items container
    const itemsEl = document.createElement("div");
    itemsEl.className = "menu-items hidden"; // collapsed by default

    // populate items
    const items = data.Menu_Items.filter(i=>i.category===cat);
    items.forEach(item=>{
      const itm = document.createElement("article");
      itm.className = "item";

      const thumb = document.createElement("div");
      thumb.className = "thumb";
      const img = document.createElement("img");
      img.src = imagePath(item.product_code);
      img.alt = item.display_name || item.item_name;
      img.onerror = () => { img.src = PLACEHOLDER; img.style.opacity = 0.9; };
      thumb.appendChild(img);

      const meta = document.createElement("div");
      meta.className = "meta";
      const title = document.createElement("h4");
      title.innerText = item.display_name || item.item_name;
      const desc = document.createElement("p");
      desc.innerText = item.description || "";
      const price = document.createElement("div");
      price.className = "price";
      price.innerText = "₹" + item.price;

      meta.appendChild(title);
      meta.appendChild(desc);
      meta.appendChild(price);

      itm.appendChild(thumb);
      itm.appendChild(meta);
      itemsEl.appendChild(itm);
    });

    section.appendChild(header);
    section.appendChild(itemsEl);
    menuRoot.appendChild(section);
  });
}

/* Render combos as a prominent section near top of menu */
function renderCombos(data){
  const menuRoot = document.getElementById("menu");
  const combos = data.Combos || [];
  if(!combos.length) return;

  const comboSection = document.createElement("section");
  comboSection.className = "menu-section";
  comboSection.id = "sec-combos";
  const header = document.createElement("header");
  const h3 = document.createElement("h3");
  h3.innerText = "Combos & Offers";
  header.appendChild(h3);
  // Add item count badge for combos
  const badge = document.createElement("div");
  badge.innerText = combos.length + " offers";
  badge.style.fontWeight = "700";
  badge.style.color = "#444";
  header.appendChild(badge);
  comboSection.appendChild(header);

  const list = document.createElement("div");
  list.className = "combo-list hidden"; // collapsed by default

  // Toggle combo-list on header click
  header.addEventListener("click", ()=>{
    list.classList.toggle("hidden");
    if(!list.classList.contains("hidden")){
      comboSection.scrollIntoView({behavior:"smooth", block:"start"});
    }
  });

  // Build a lookup for product_code to display_name
  const codeToName = {};
  (data.Menu_Items || []).forEach(item => {
    codeToName[item.product_code] = item.display_name || item.item_name;
  });

  combos.forEach(c=>{
    const box = document.createElement("div");
    box.className = "combo";

    const thumb = document.createElement("div");
    thumb.className = "thumb";
    const img = document.createElement("img");
    // Use combo_code image if available
    img.src = c.combo_code ? imagePath(c.combo_code, 'combo') : PLACEHOLDER;
    img.onerror = () => img.src = PLACEHOLDER;
    thumb.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("h4");
    title.innerText = c.combo_name;
    const descr = document.createElement("p");
    // Map product codes to display names, show 'Drink' as-is
    const readableItems = (c.items_included || []).map(code => codeToName[code] || code).join(", ");
    descr.innerText = "Includes: " + readableItems;
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
  // put combos at top before categories
  menuRoot.insertBefore(comboSection, menuRoot.firstChild);
}

/* Add-ons */
function renderAddons(data){
  const target = document.getElementById("addonsList");
  target.innerHTML = "";
  const addons = data.Add_Ons || [];
    // Render add-ons as stacked items like menu
  addons.forEach(a=>{
    const itm = document.createElement("article");
    itm.className = "item";

    // Use add-on image from add_on_images folder
    const thumb = document.createElement("div");
    thumb.className = "thumb";
    const img = document.createElement("img");
    img.src = a.addon_code ? imagePath(a.addon_code, 'addon') : PLACEHOLDER;
    img.alt = a.addon_name;
    img.onerror = () => { img.src = PLACEHOLDER; img.style.opacity = 0.9; };
    thumb.appendChild(img);

    const meta = document.createElement("div");
    meta.className = "meta";
    const title = document.createElement("h4");
    title.innerText = a.addon_name;
    const desc = document.createElement("p");
    desc.innerText = a.best_for ? `Best for: ${a.best_for}` : "";
    const price = document.createElement("div");
    price.className = "price";
    price.innerText = "₹" + a.price;

    meta.appendChild(title);
    meta.appendChild(desc);
    meta.appendChild(price);

    itm.appendChild(thumb);
    itm.appendChild(meta);
    target.appendChild(itm);
  });

  // Add click-to-toggle for Add-ons header
  const header = document.getElementById("addonsHeader");
  if(header && target){
    header.addEventListener("click", ()=>{
      target.classList.toggle("hidden");
      if(!target.classList.contains("hidden")){
        header.parentElement.scrollIntoView({behavior:"smooth", block:"start"});
      }
    });
  }
}

// attachFilterBehavior removed

/* init */
init();
