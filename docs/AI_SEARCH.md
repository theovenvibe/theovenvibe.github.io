# AI search and answer readiness

17 October 2026. Implementation is a review draft until the release evidence in AI_SEARCH_HANDOFF.md says deployed. Owner explicitly excluded Umami work and WhatsApp communication.

## What this implements

SEO: canonical business host, coherent public pages, menu/category/item entities with stable real HTML anchors, current menu descriptions, semantic HTML, connected internal links, ordinary image alt text and sitemap/indexability validation.

AEO: the existing /faq/ now has 26 anchored native-HTML answers, generated from the same answer data as its FAQPage graph. A FAQ is useful customer content; no Google FAQ rich-result eligibility is claimed.

GEO/LLMO/AI search: /choose/ compares every available dish/drink and combo from the published menu, including specific sauces, sizes and ingredients. Shared business/entity identifiers connect pages and articles. Search crawlers can read the initial HTML without executing the basket or order form. Explicit OAI-SearchBot, Claude-SearchBot and Claude-User groups allow public retrieval; the wildcard already allowed public Google/Bing access.

E-E-A-T/trust: business publisher attribution, genuine article publication/edit dates, source/correction policy, first-party photographs confirmed by the owner, disclosed AI editing assistance, and examples distinguished from actual customer cases. No invented chef credentials, testimonials, first-hand narrative, expert interviews, popularity statistics or competitor price research.

Freshness: builds no longer reset every sitemap lastmod to the build timestamp. The six existing article URLs and original dates remain; actual substantive edits are dated 17 October. The catalogue remains authoritative for prices and serving details. Seasonal availability continues to use the existing campaign window.

Maintenance: rendered build validation runs in deployment CI, plus a monthly/manual read-only public search-health workflow. Explicit IndexNow helper defaults to preview; --submit is used only after the approved content and its public ownership file are live.

## Search products and actual limits

ChatGPT search: OpenAI documents OAI-SearchBot separately from GPTBot. Search access is not equivalent to training access, and user-driven fetches differ again. No training-crawler policy change was required here.

Claude: Anthropic documents search and user retrieval crawlers separately from ClaudeBot. We allow the public search/retrieval agents and retain the previous wildcard policy. These directives do not demonstrate an actual crawl or citation.

Google Search AI and Gemini: public, useful, indexable content supports discovery. Google Search eligibility also depends on actual indexing/snippet eligibility and the property's current generative-AI inclusion control. Google-Extended controls other uses and is distinct from Googlebot. Existing public wildcard access was retained; no account setting was silently changed.

Crawler access is one prerequisite. It cannot force ChatGPT, Claude, Gemini, Google, Bing or another system to retrieve, rank, cite or recommend this business. Search results differ by query, place, time and product. No special llms.txt file, fabricated schema, hidden AI instructions or paid tool is used as a ranking claim.

## Reference sources reviewed on 17 October 2026

- Google AI search: https://developers.google.com/search/docs/fundamentals/ai-optimization-guide
- Google crawler controls: https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers
- OpenAI crawlers: https://developers.openai.com/api/docs/bots
- Anthropic crawler controls: https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- IndexNow: https://www.indexnow.org/documentation
- GitHub schedule limits: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/disable-and-enable-workflows

Review sources when these services change. The implementation does not create an account on the user's behalf or submit content into private assistant conversations.
