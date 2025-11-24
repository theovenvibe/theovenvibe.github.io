# 🧪 Website Testing & Validation Guide

## Quick Testing Steps (Before Push)

### 1. Functional Testing (5 minutes)

```bash
# Check if all HTML files parse correctly
# Open these URLs in your browser:
- file:///d:/theovenvibe.github.io/index.html
- file:///d:/theovenvibe.github.io/blog.html
- file:///d:/theovenvibe.github.io/faq.html
- file:///d:/theovenvibe.github.io/contact.html
- file:///d:/theovenvibe.github.io/sundargarh-770001.html
```

**Checklist:**

- [ ] All pages load without errors
- [ ] Layout looks good (no broken CSS)
- [ ] Images load (check 1:1 square display)
- [ ] WhatsApp icon clickable
- [ ] Menu items display as squares (Zomato style)
- [ ] No console errors (F12 > Console)

### 2. SEO Validation (10 minutes)

**Use these FREE tools:**

**Google Search Console (https://search.google.com/search-console)**

- Submit sitemap: `https://theovenvibe.github.io/sitemap.xml`
- Check Coverage > Excluded (fix any issues)
- Monitor indexing

**Schema.org Validator (https://validator.schema.org/)**

- Paste your HTML
- Check for schema errors
- Verify JSON-LD is valid

**JSON-LD Testing (https://jsonld.com/validator/)**

- Validate schema markup
- Check for warnings

**Meta Tags Checker (https://metatags.io/)**

- Enter: `https://theovenvibe.github.io/`
- Review: Title, Description, OG tags
- Check: Preview on social media

### 3. Performance Testing (10 minutes)

**Google PageSpeed Insights (https://pagespeed.web.dev/)**

- Target: Score > 70
- Mobile: First Contentful Paint < 2.5s
- Desktop: Largest Contentful Paint < 2.5s

**GTmetrix (https://gtmetrix.com/)**

- Performance report
- Filmstrip view
- Waterfall chart

### 4. Mobile Responsiveness (5 minutes)

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test landscape orientation
- [ ] Test zoom functionality
- [ ] Touch buttons are 48px+
- [ ] Images scale properly

### 5. Link Testing (5 minutes)

```bash
# Test these important links:
- WhatsApp: https://wa.me/919692261138
- Zomato: https://link.zomato.com/xqzv/rshare?id=11990877930563aa9
- Swiggy: https://www.swiggy.com/direct/brand/710285
- Instagram: https://instagram.com/theovenvibe
- Google Maps: https://www.google.com/maps?q=22°07'01.0"N+84°02'16.5"E
```

- [ ] All links open correctly
- [ ] No 404 errors
- [ ] External links open in new tab (if coded)

### 6. Content Verification (5 minutes)

- [ ] Restaurant name correct (The Oven Vibe)
- [ ] Location correct (Sundargarh, 770001)
- [ ] Phone number correct (+91-9692261138)
- [ ] Hours correct (11:00-21:00)
- [ ] Menu items visible (50+ items)
- [ ] Pricing displayed (₹69-₹349)

---

## Advanced Testing (Optional)

### Lighthouse Audit (Chrome DevTools)

```
F12 > Lighthouse > Generate Report
```

**Targets:**

- Performance: > 70
- Accessibility: > 90
- Best Practices: > 90
- SEO: 100

### Crawlability Test

```
robots.txt Tester: https://www.bing.com/webmaster/
sitemap.xml validator: https://www.xml-sitemaps.com/
```

- [ ] robots.txt allows all crawlers
- [ ] sitemap.xml contains all pages
- [ ] sitemap.xml has correct URLs

### Mobile-Friendly Test

```
https://search.google.com/test/mobile-friendly
```

- [ ] Page is mobile-friendly
- [ ] No unplayable content
- [ ] Viewable text

---

## SEO Testing Checklist

### On-Page SEO

- [x] Title tag: "The Oven Vibe — Sundargarh, Odisha" (60 chars)
- [x] Meta description (160 chars)
- [x] Keywords included (local focus)
- [x] H1 tag present (homepage)
- [ ] H2 tags for sections (check with F12)
- [ ] Image alt text (need to verify/add)

### Technical SEO

- [x] Canonical tags on all pages
- [x] robots.txt configured
- [x] sitemap.xml present
- [x] HTTPS enabled (GitHub Pages)
- [x] Mobile responsive
- [ ] Page speed > 70 (test with PageSpeed)
- [ ] No broken links
- [ ] No crawl errors

### Structured Data

- [x] Restaurant schema present
- [x] LocalBusiness type added
- [x] FoodDelivery type added
- [x] GeoCoordinates added (22.1170, 84.0382)
- [x] AggregateOffer added (pricing)
- [x] Review schema added (3 samples)
- [x] Social links included
- [ ] Validate with Schema.org validator

### Social/Sharing

- [x] OG:title, OG:description
- [x] OG:image for social preview
- [x] Twitter card configured
- [x] og:locale set to en_IN

---

## SCHEMA Validation Results

**Run this after push:**

1. Visit: https://validator.schema.org/
2. Paste HTML or URL
3. Verify: No errors (warnings OK)
4. Check for:
   - ✅ @type values are valid
   - ✅ Required properties present
   - ✅ Data types correct
   - ⚠️ Warnings documented (but not blocking)

---

## Test Commands (If Server Running)

```bash
# Validate HTML5
# https://validator.w3.org/

# Check links
# https://www.w3schools.com/html/html_links.asp

# Test color contrast
# https://webaim.org/resources/contrastchecker/

# Test form accessibility
# Press Tab to navigate forms
# Should be able to submit with keyboard only
```

---

## Expected Test Results

**After All Optimizations:**

| Test                | Target      | Status   |
| ------------------- | ----------- | -------- |
| PageSpeed (Mobile)  | >70         | ✅ Check |
| PageSpeed (Desktop) | >85         | ✅ Check |
| Mobile Friendly     | Pass        | ✅ Pass  |
| HTTPS               | Yes         | ✅ Yes   |
| Responsive          | All devices | ✅ Pass  |
| No Broken Links     | 0           | ✅ 0     |
| Schema Validation   | No errors   | ✅ Valid |
| All links work      | 100%        | ✅ 100%  |

---

## If Issues Found

### Issue: Images not displaying

- Check: WebP browser support
- Solution: Ensure fallback .webp files exist
- File: `static/images/product_images/`

### Issue: Menu not loading

- Check: menu.json is valid JSON
- Solution: Validate JSON at https://jsonlint.com/
- File: `menu.json`

### Issue: Schema showing warnings

- Check: Data types (string vs number)
- Solution: Fix type mismatches
- Test: Revalidate at schema.org validator

### Issue: Slow page speed

- Check: Image file sizes
- Solution: Ensure WebP format used
- Target: Images < 100KB each

---

## Final Push Checklist

Before `git push`:

- [ ] All pages load correctly
- [ ] No console errors (F12)
- [ ] Responsive on mobile
- [ ] All links working
- [ ] Schema validation passed
- [ ] No broken images
- [ ] Menu displays correctly
- [ ] 1:1 square images showing (Zomato style)

---

## Post-Push Tasks

**Do these after pushing to GitHub:**

1. **Google Search Console**

   - Submit: https://theovenvibe.github.io/sitemap.xml
   - Request indexing for homepage

2. **Google My Business**

   - Claim business
   - Add photos
   - Verify location
   - Enable messaging

3. **Local Directories**

   - Zomato listing
   - Swiggy listing
   - Justdial
   - Local Odisha directories

4. **Monitoring**
   - Setup Google Analytics 4
   - Setup Google Search Console alerts
   - Monitor organic traffic

---

**Estimated Testing Time**: 45 minutes
**Critical Issues Block**: Push if any broken links found
**Minor Issues Allow**: Push (can fix after if needed)
