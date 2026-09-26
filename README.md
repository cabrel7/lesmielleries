# Les Mielleries — site web (refonte 2026)

Refonte de [lesmielleries.com](https://lesmielleries.com) : site vitrine premium, bilingue FR/EN, mobile-first, animé, avec catalogue produits, blog et édition du contenu par le client via **Nuxt Studio**.

## Stack

| Brique | Rôle |
|---|---|
| **Nuxt 4** | Framework (SSR + pages pré-rendues) |
| **@nuxt/content v3** | Produits, articles et réglages en Markdown/YAML (`content/`) |
| **nuxt-studio** | Interface d'édition du contenu pour le client (`/_studio`) |
| **@nuxtjs/i18n** | Français (par défaut) + anglais (`/en/...`) |
| **@nuxt/image** | Images redimensionnées automatiquement |
| **GSAP + ScrollTrigger + Lenis** | Animations au défilement, défilement fluide |
| Fontsource (Fraunces + Inter) | Polices auto-hébergées (aucun appel à Google Fonts) |

Aucune base de données, aucun backend : les formulaires envoient vers **WhatsApp** ou l'**e-mail**.

## Démarrer

```bash
npm install          # Node >= 22.5
npm run dev          # http://localhost:3000  (Nuxt Studio : bouton en bas à gauche)
npm run generate     # version 100 % statique dans .output/public
npm run build        # version SSR (nécessaire pour Nuxt Studio en production)
```

## Arborescence

```
app/
  pages/            index · notre-histoire · produits/ · produits/[slug] · professionnels · contact · blog/ · blog/[slug] · mentions-legales
  components/       SiteHeader, SiteFooter, ProductGallery, ProductCard, CameroonMap, ContactForm, BgVideo…
  assets/css/       main.css — design system (couleurs du logo, typo, boutons, animations)
  plugins/          motion.client.ts (Lenis + GSAP) · reveal.ts (apparitions au scroll)
content/
  fr/produits/*.md  en/produits/*.md    ← 9 fiches produit (mêmes slugs en FR et EN)
  fr/blog/*.md      en/blog/*.md        ← articles
  settings.yml                          ← téléphone, WhatsApp, e-mail, adresse, horaires
i18n/locales/       fr.json · en.json   ← textes de l'interface
public/
  videos/           hero (filet de miel) + dipper (cuillère) — MP4/WebM optimisés
  images/products/  4 vues par produit : studio · ambiance · détail · texture
```

## Modifier le contenu

- **Coordonnées / numéro WhatsApp** : `content/settings.yml`
- **Ajouter un produit** : copier un fichier de `content/fr/produits/` (et son équivalent `en/`), adapter le front-matter. `images` = liste des vues de la galerie.
- **Écrire un article** : ajouter un `.md` dans `content/fr/blog/` (et `content/en/blog/` pour la version anglaise, même nom de fichier).
- Tout cela est faisable **sans code** via Nuxt Studio.

## Déploiement recommandé : Vercel

1. [vercel.com](https://vercel.com) → *Add New Project* → importer `cabrel7/lesmielleries`. Framework détecté : Nuxt. Aucune configuration.
2. Chaque `git push` sur `main` redéploie le site (CI/CD intégré).
3. Pour Nuxt Studio en production : ajouter les variables de `.env.example` dans *Settings → Environment Variables*, puis ouvrir `https://<domaine>/_studio`.
4. Brancher le domaine `lesmielleries.com` dans *Settings → Domains*.

> Netlify fonctionne aussi (build : `npm run build`). Un hébergement **purement statique** (`npm run generate`) fonctionne pour le site, mais **pas** pour Nuxt Studio en production.

## Performances (Lighthouse mobile, 4G lente simulée, serveur local)

| Page | Perf. | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Accueil | 79 | 100 | 100 | 100 |
| Fiche produit | 82 | 100 | 100 | 100 |
| Article | 84 | 100 | 100 | 100 |

Vidéo hero : 7,5 Mo → 570 Ko (WebM) / 270 Ko (MP4 mobile). La vidéo n'est pas chargée en mode « économie de données », en 2G ou si l'utilisateur a désactivé les animations.

## Points à valider avec le client

Voir [`VALIDATION.md`](./VALIDATION.md).
