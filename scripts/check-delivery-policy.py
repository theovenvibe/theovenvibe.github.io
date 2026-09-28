"""Audit built customer pages; optionally verify routes on a local preview."""
import argparse
import html
import json
import pathlib
import re
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--url', help='Local preview origin, e.g. http://127.0.0.1:4321')
args = parser.parse_args()
config = json.loads(pathlib.Path('site.config.json').read_text(encoding='utf-8'))
files = list(pathlib.Path('dist').rglob('*.html'))
assert files, 'Run npm run build first'
blocks = 0
exempt = []

def check_rating(value):
    if isinstance(value, dict):
        if 'ratingValue' in value:
            assert float(value['ratingValue']) == config['rating']['value']
        if 'reviewCount' in value:
            assert int(value['reviewCount']) == config['rating']['count']
        for child in value.values():
            check_rating(child)
    elif isinstance(value, list):
        for child in value:
            check_rating(child)

stale = re.compile(
    r'delivery starts at just ₹29|₹29 for 0[–-]2 km|₹69 for 2[–-]4 km|'
    r'beyond 4 km|minimum order ₹(?:199|249|399)|'
    r'afternoons 12[–-]4|late-night delivery[^₹]{0,40}₹(?:59|99)|'
    r'₹49 kitchen reopen', re.I)
for file in files:
    content = file.read_text(encoding='utf-8')
    assert not re.search(r'[\U0001F300-\U0001FAFF\u2600-\u27BF\U0001F1E6-\U0001F1FF]', content), f'{file}: emoji'
    assert not re.search(r'chicken|mutton|prawn|keema', content, re.I), f'{file}: non-veg copy'
    assert not re.search(r'<img(?![^>]*\balt=)[^>]*>', content), f'{file}: missing alt'
    assert '<title>' in content, f'{file}: missing title'
    if 'http-equiv="refresh"' in content or file == pathlib.Path('dist/r/index.html'):
        exempt.append(str(file))  # Redirects intentionally have no SEO description.
    else:
        assert '<meta name="description"' in content, f'{file}: missing description'
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', content, re.S):
        check_rating(json.loads(block))
        blocks += 1
    visible = re.sub(r'<(?:script|style)\b[^>]*>.*?</(?:script|style)>', '', content, flags=re.S)
    visible = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', visible)))
    assert not stale.search(visible), f'{file}: stale delivery policy'
print(f'PASS: {len(files)} HTML files, {blocks} JSON-LD blocks, zero stale delivery claims/emoji/alt/rating failures')
print(f'Description exemptions: {len(exempt)} intentional redirects')

if args.url:
    routes = ['/', '/menu/', '/checkout/', '/price-calculator/', '/contact/', '/faq/', '/blog/',
              '/blog/cloud-kitchen-future/', '/blog/veg-vs-non-veg/', '/blog/pizza-under-300/',
              '/blog/affordable-pizza/', '/blog/late-night-food/', '/sundargarh/', '/404.html',
              '/site.config.json', '/menu.json', '/robots.txt', '/sitemap-index.xml',
              '/blog-cloud-kitchen-future.html', '/blog-veg-vs-non-veg.html', '/blog-pizza-under-300.html',
              '/blog-affordable-pizza.html', '/blog-late-night-food.html', '/contact.html', '/faq.html',
              '/blog.html', '/sundargarh-770001.html']
    for route in routes:
        with urllib.request.urlopen(args.url.rstrip('/') + route) as response:
            assert response.status == 200, route
    print(f'PASS: {len(routes)} local routes')
