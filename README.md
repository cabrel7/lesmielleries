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

## Nuxt Studio : accès réservé au client (connexion Google)

Seules les adresses listées dans `STUDIO_GOOGLE_MODERATORS` peuvent entrer dans `/_studio`. Tout autre compte Google est refusé.

1. **Google Cloud** ([console.cloud.google.com](https://console.cloud.google.com)) → nouveau projet « Les Mielleries Studio »
   - *APIs & Services → OAuth consent screen* : type **External**, nom de l'app, e-mail de support → enregistrer, puis **Publish app** (les scopes email/profile ne demandent pas de vérification Google).
   - *Credentials → Create credentials → OAuth client ID* → **Web application**
     - Authorized redirect URIs : `https://lesmielleries.com/__nuxt_studio/auth/google` (+ `https://<projet>.vercel.app/__nuxt_studio/auth/google` pour tester)
   - Copier **Client ID** et **Client secret**.
2. **GitHub** (compte `cabrel7`, propriétaire du dépôt) → *Settings → Developer settings → Personal access tokens → Fine-grained tokens* → *Generate*
   - Repository access : **Only select repositories** → `lesmielleries`
   - Permissions : **Contents → Read and write**
   - Copier le token (`github_pat_…`).
3. **Vercel** → projet → *Settings → Environment Variables* (Production) :

   | Variable | Valeur |
   |---|---|
   | `STUDIO_GOOGLE_CLIENT_ID` | Client ID Google |
   | `STUDIO_GOOGLE_CLIENT_SECRET` | Client secret Google |
   | `STUDIO_GOOGLE_MODERATORS` | `client@gmail.com,dylanmenga05@gmail.com` — **sans espaces** |
   | `STUDIO_GITHUB_TOKEN` | le token GitHub |

4. **Redéployer** (*Deployments → … → Redeploy*) : les variables ne sont prises en compte qu'au déploiement suivant.
5. Le client ouvre `https://lesmielleries.com/_studio` → « Se connecter avec Google » → il édite → **Publier** : Studio fait un commit sur `main`, Vercel redéploie en ~1 min.

Retirer un accès = supprimer l'e-mail de `STUDIO_GOOGLE_MODERATORS` puis redéployer.

## SEO & GEO

| Élément | Où |
|---|---|
| Titre, description, Open Graph, Twitter (URL absolues) | `app/composables/useSeo.ts` → `usePageSeo()` sur chaque page |
| Images de partage 1200×630 (FR/EN, 38 images) | `public/og/` — régénérables avec le script de génération |
| Canonical + `hreflang` FR/EN/x-default | automatique (`@nuxtjs/i18n`) |
| `sitemap.xml` (pages, produits, articles, images, alternatives FR/EN) | `server/routes/sitemap.xml.ts` — suit le contenu automatiquement |
| `robots.txt` (Studio bloqué, robots IA autorisés) | `server/routes/robots.txt.ts` |
| `llms.txt` (fiche factuelle pour ChatGPT, Claude, Perplexity…) | `server/routes/llms.txt.ts` |
| JSON-LD : Organization/LocalBusiness (géolocalisée), WebSite, FAQPage, Product, BlogPosting, BreadcrumbList | `app/app.vue` + pages |
| Géolocalisation (`geo.region`, `geo.position`, `ICBM`) : Douala, Littoral | `app/app.vue` |
| Favicon, apple-touch-icon, icônes Android (maskable), `manifest.webmanifest` | `public/` |

Après la mise en ligne : déclarer `https://lesmielleries.com/sitemap.xml` dans **Google Search Console** et **Bing Webmaster Tools**, et créer la fiche **Google Business Profile** (Douala) — c'est le levier n°1 du référencement local.
Pour changer de domaine : variable `NUXT_PUBLIC_SITE_URL`.

## Performances (Lighthouse mobile, 4G lente simulée, serveur local)

| Page | Perf. | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Accueil | 79 | 100 | 100 | 100 |
| Fiche produit | 82 | 100 | 100 | 100 |
| Article | 84 | 100 | 100 | 100 |

Vidéo hero : 7,5 Mo → 570 Ko (WebM) / 270 Ko (MP4 mobile). La vidéo n'est pas chargée en mode « économie de données », en 2G ou si l'utilisateur a désactivé les animations.

## Points à valider avec le client

Voir [`VALIDATION.md`](./VALIDATION.md).
