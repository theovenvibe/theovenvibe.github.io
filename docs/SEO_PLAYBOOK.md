# Search playbook — current operating guide

Updated 17 October 2026. Read AI_SEARCH.md for this release and AI_SEARCH_HANDOFF.md for verification/release status. The previous July playbook is preserved in archive/SEO_PLAYBOOK_2026-07-30.md as historical context. Its old domain, hours, radius, menu counts, review counts, ranking timelines and traffic diagnoses are not current operating instructions.

## Source of truth

- Canonical host: SITE_URL in astro.config.mjs (currently https://theovenvibe.com).
- Menu, website prices, serving details and availability: menu.json through src/lib/data.ts. This is the direct website catalogue; do not import Zomato pricing decisions automatically.
- Contact, hours and delivery terms: site.config.json plus docs/DELIVERY_PRICING.md. Do not repeat numerical examples from older docs.
- Photography: owner confirmed on 17 October that all Oven Vibe images are photographs taken by their team, not AI-generated. Keep originals unchanged and do not copy Bhuk Lagla's different image policy.
- Ratings are not newly verified by this search task. site.config.json retains its existing dated figures; refresh only against actual Google evidence. Never invent reviews or customer cases.

## Search maintenance

Whenever the menu changes, rebuild and run npm run test:search. Review affected answers/comparisons and public descriptions. Do not advance editorial dates merely because a build ran. Keep promotional and customer-specific pages out of the sitemap, with noindex where already used; robots.txt is not an access-control mechanism.

Monthly: review the Search health workflow, Search Console performance/indexing/sitemaps/security/manual-action reports, and Bing sitemap/AI Performance where available. Keep separate baselines for web clicks, actual enquiries/orders and observed AI citations. A click does not prove an order. No Umami changes are part of this task.

After an approved deployment: run node scripts/audit-live-search.mjs. Notify genuinely changed public URLs with the explicit IndexNow helper once; do not resubmit unchanged content daily. Check Google/Bing sitemap processing in the correct business account. No crawler receipt proves indexing or recommendation.

Quarterly: check live menu facts, links, mobile guide usability and real questions received. Add useful evidence to existing pages instead of publishing repeated local keyword pages. Before festivals, verify availability windows and dietary descriptions. Yearly, review official crawler/search guidance and dependencies.

GitHub may disable scheduled workflows in public repositories after 60 days without activity. Check the schedule rather than assuming permanent unattended monitoring. Search quality and business accuracy require periodic review; rankings and AI citations are not guaranteed.

## Off-site work requires actual verification

Check the existing Google Business Profile name, address, hours, website/menu URL and genuine photos in the correct account before making changes. Do not create duplicate profiles, imply verification, post reviews on behalf of customers or manufacture keywords/quotes. Any customer testimonial or event story needs evidence and publication permission.

No numerical share of search traffic, future ranking position or specific improvement timeline is assumed. Search Console and actual order data should determine which customer questions deserve the next improvement.
