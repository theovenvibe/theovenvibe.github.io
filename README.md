# 🍕 The Oven Vibe — Sundargarh, Odisha

![The Oven Vibe Logo](https://theovenvibe.github.io/static/images/brand_images/The_Oven_Vibe_logo.webp)

Welcome to **The Oven Vibe** — your go-to **fresh, hot, oven-baked takeaway** cloud kitchen in Sundargarh, Odisha! We serve mouth-watering **pizzas, burgers, fries, snacks, and pasta**, all made to order and delivered fresh to you.

Check out our live website: [https://theovenvibe.github.io](https://theovenvibe.github.io)

---

## 🌟 About the Project

This is a **modern, responsive cloud kitchen website** built to showcase:

- Delicious menu items with combos & add-ons
- Easy ordering via **WhatsApp**
- Party & bulk order options
- SEO-friendly structured data
- Fast-loading modern images (AVIF, WebP, JXL)
- Hosted on **GitHub Pages**

---

## 📦 Features

| Feature              | Description                             |
| -------------------- | --------------------------------------- |
| ✅ Responsive Design | Works perfectly on mobile & desktop     |
| ✅ WhatsApp Orders   | Customers can order in one click        |
| ✅ Menu Management   | Update combos & add-ons via `menu.json` |
| ✅ SEO Optimized     | Schema.org, Open Graph & Twitter cards  |
| ✅ Modern Images     | AVIF, WebP & JXL formats                |
| ✅ Free Hosting      | GitHub Pages hosting, free forever      |

---

## 📂 Project Structure

```text
/
├── index.html            # Home page
├── menu.json             # Menu, combos & add-ons
├── blog.html             # Blog posts
├── faq.html              # Frequently Asked Questions
├── contact.html          # Contact page
├── robots.txt            # Search engine instructions
├── sitemap.xml           # Sitemap for SEO
├── style.css             # Main styles
├── script.js             # JavaScript functionality
├── static/
│   ├── images/           # Logos, hero, add-ons, blog images
│   └── svg/              # Icons (WhatsApp, phone, email)
└── README.md             # Project documentation

```

---

## 🚀 Deployment

Hosted for free on **GitHub Pages**: [https://theovenvibe.github.io](https://theovenvibe.github.io)

**Continuous Deployment Setup:**

1. Push updates to `main` branch → GitHub Pages automatically deploys.
2. Site is always available at `https://theovenvibe.github.io`

---

## 💌 Contact & Orders

## 🖼️ Temporary Image Placeholder Process

To standardize UX when product images are missing, a temporary placeholder is used automatically:

- Placeholder asset: `static/images/product_images/placeholder.svg`
- Auto-fallback behavior: If an image fails to load or a product has no `product_code`, the UI shows the placeholder with a dashed border and a TEMP badge.
- Where implemented: Rendering logic in `script.js` uses `PLACEHOLDER` and applies classes `temp-img` and `temp-image`.

How to replace with real images later:

1. Prepare images for each product/add-on/combo using this naming:
   - Products: `static/images/product_images/<PRODUCT_CODE>.avif|webp|jxl`
   - Add-ons: `static/images/add_on_images/<ADDON_CODE>.avif|webp|jxl`
   - Combos: `static/images/combo_images/<COMBO_CODE>.avif|webp|jxl`
2. Keep aspect ratio square; recommended max 640×640, optimized AVIF/WebP/JXL.
3. After placing files, ensure the related codes exist in `menu.json` (e.g., `product_code`).
4. No code changes required; the site will pick up images automatically and the TEMP indicator will disappear.

Notes:

- Prices are displayed from `menu.json` and must not be changed by assets.
- For accessibility and SEO, `alt` text includes the product name; placeholders add “(temporary image)”.

- 📱 WhatsApp: [+91-9692261138](https://wa.me/9192261138)
- ✉️ Email: theovenvibe@gmail.com
- 📸 Instagram: [@theovenvibe](https://instagram.com/theovenvibe)

---

## 🏷️ Badges

![Website Status](https://img.shields.io/badge/Website-Live-brightgreen)
![Netlify Deploy](https://img.shields.io/badge/Netlify-Deployed-blue)
![GitHub Repo](https://img.shields.io/badge/GitHub-Private-orange)

---

## 🔒 Privacy & Source Code

- The GitHub repository is **private** — your customers only see the live site.
- Only the **Netlify deployed site** is public.

---

## 🎉 License

Open for **personal use**. Redistribution or commercial use requires permission from **The Oven Vibe**.

---

Made with ❤️ by **The Oven Vibe Team**
