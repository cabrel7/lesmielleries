"""Génère les images de partage Open Graph (1200x630) pour chaque page, produit et article, en FR et EN."""
import os, re, yaml
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps

import pathlib
ROOT = str(pathlib.Path(__file__).resolve().parents[1])
PUB = f'{ROOT}/public'
FONTS = f'{ROOT}/scripts/fonts'  # TTF statiques (Fraunces, Inter)
W, H = 1200, 630
HONEY = (30, 16, 6)
CREAM = (251, 244, 230)
YELLOW = (253, 216, 0)
ORANGE = (242, 138, 33)

fr_title = ImageFont.truetype(f'{FONTS}/Fraunces-Regular.ttf', 62)
fr_title_s = ImageFont.truetype(f'{FONTS}/Fraunces-Regular.ttf', 52)
fr_ital = ImageFont.truetype(f'{FONTS}/Fraunces-Italic.ttf', 30)
inter = ImageFont.truetype(f'{FONTS}/Inter-SemiBold.ttf', 17)
inter_m = ImageFont.truetype(f'{FONTS}/Inter-Medium.ttf', 20)
logo = Image.open(f'{PUB}/brand/logo.png').convert('RGBA')


def wrap(draw, text, font, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def base():
    im = Image.new('RGB', (W, H), HONEY)
    glow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(glow).ellipse((700, -260, 1500, 420), fill=120)
    glow = glow.filter(ImageFilter.GaussianBlur(140))
    im.paste(Image.new('RGB', (W, H), ORANGE), (0, 0), glow)
    return im


def make(out, img_path, eyebrow, title, subtitle, mode='cover'):
    en = '/og/en/' in out
    im = base()
    # Visuel à gauche (carte arrondie)
    src = Image.open(f'{PUB}{img_path}').convert('RGB')
    card = ImageOps.fit(src, (500, 550), Image.LANCZOS, centering=(0.5, 0.45))
    mask = Image.new('L', card.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, *card.size), 28, fill=255)
    shadow = Image.new('L', (W, H), 0)
    ImageDraw.Draw(shadow).rounded_rectangle((52, 58, 552, 608), 28, fill=160)
    shadow = shadow.filter(ImageFilter.GaussianBlur(24))
    im.paste(Image.new('RGB', (W, H), (0, 0, 0)), (0, 0), shadow)
    im.paste(card, (40, 40), mask)

    d = ImageDraw.Draw(im)
    x, maxw = 600, 540
    lg = logo.copy()
    lg.thumbnail((58, 68))
    im.paste(lg, (x, 52), lg)
    d.text((x + 72, 70), 'LES MIELLERIES', font=inter, fill=YELLOW, spacing=4)
    d.text((x + 72, 94), 'Nature on your table' if en else 'La nature à votre table', font=ImageFont.truetype(f'{FONTS}/Fraunces-Italic.ttf', 18), fill=(251, 244, 230, 200))

    y = 190
    if eyebrow:
        d.text((x, y), eyebrow.upper(), font=inter, fill=(242, 170, 90))
        y += 40
    font = fr_title if len(title) < 34 else fr_title_s
    for line in wrap(d, title, font, maxw)[:3]:
        d.text((x, y), line, font=font, fill=CREAM)
        y += font.size + 8
    if subtitle:
        y += 10
        for line in wrap(d, subtitle, fr_ital, maxw)[:2]:
            d.text((x, y), line, font=fr_ital, fill=YELLOW)
            y += 40
    d.line((x, 548, x + 60, 548), fill=ORANGE, width=3)
    d.text((x, 566), 'lesmielleries.com  ·  Douala, ' + ('Cameroon' if en else 'Cameroun'), font=inter_m, fill=(251, 244, 230))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, 'JPEG', quality=84, optimize=True, progressive=True)


def fm(path):
    txt = open(path, encoding='utf-8').read()
    return yaml.safe_load(txt.split('---')[1])


count = 0
for lang in ('fr', 'en'):
    # Produits
    for f in sorted(os.listdir(f'{ROOT}/content/{lang}/produits')):
        d = fm(f'{ROOT}/content/{lang}/produits/{f}')
        slug = f[:-3]
        img = d['images'][0]['src'] if d.get('images') else d['cover']
        make(f'{PUB}/og/{lang}/produit-{slug}.jpg', img, f"{d.get('kind', '')} · {d.get('region', '')}", d['title'], d.get('subtitle', ''))
        count += 1
    # Articles
    for f in sorted(os.listdir(f'{ROOT}/content/{lang}/blog')):
        d = fm(f'{ROOT}/content/{lang}/blog/{f}')
        make(f'{PUB}/og/{lang}/blog-{f[:-3]}.jpg', d['cover'], d.get('category', ''), d['title'], '')
        count += 1

pages = {
    'fr': {
        'home': ('/images/ambiance/hero-poster.webp', 'Depuis 2000 · Douala', 'Miel pur et naturel du Cameroun', 'Filtré, jamais préparé'),
        'story': ('/images/ambiance/cuillere-miel.webp', 'Notre histoire', 'Vingt-cinq ans au service du miel camerounais', ''),
        'products': ('/images/products/gamme-bouteilles.webp', 'Nos produits', 'Toute la richesse de la ruche', 'Miels, cire, propolis'),
        'pro': ('/images/products/fut-2.webp', 'Professionnels & export', 'Votre partenaire miel, du fût au conteneur', '300 t de miel · 200 t de cire / an'),
        'contact': ('/images/ambiance/filet-miel.webp', 'Contact', 'Parlons miel', 'WhatsApp · +237 640 65 77 49'),
        'blog': ('/images/ambiance/blog-oku.webp', 'Le journal', 'Conseils, terroirs & recettes', ''),
    },
    'en': {
        'home': ('/images/ambiance/hero-poster.webp', 'Since 2000 · Douala', 'Pure, natural honey from Cameroon', 'Filtered, never processed'),
        'story': ('/images/ambiance/cuillere-miel.webp', 'Our story', 'Twenty-five years serving Cameroonian honey', ''),
        'products': ('/images/products/gamme-bouteilles.webp', 'Our products', 'All the richness of the hive', 'Honey, beeswax, propolis'),
        'pro': ('/images/products/fut-2.webp', 'Professionals & export', 'Your honey partner, from drum to container', '300 t of honey · 200 t of wax / year'),
        'contact': ('/images/ambiance/filet-miel.webp', 'Contact', "Let's talk honey", 'WhatsApp · +237 640 65 77 49'),
        'blog': ('/images/ambiance/blog-oku.webp', 'The journal', 'Tips, terroirs & recipes', ''),
    },
}
for lang, P in pages.items():
    for k, (img, eb, t, st) in P.items():
        make(f'{PUB}/og/{lang}/{k}.jpg', img, eb, t, st)
        count += 1
print('OG images:', count)
