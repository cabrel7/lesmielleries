// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/content', '@nuxtjs/i18n', '@nuxt/image', 'nuxt-studio'],

  css: [
    '@fontsource-variable/fraunces/index.css',
    '@fontsource-variable/fraunces/wght-italic.css',
    '@fontsource-variable/inter/index.css',
    '~/assets/css/main.css',
  ],

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#1E1006' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', type: 'image/png', href: '/brand/icon-192.png', sizes: '192x192' },
        { rel: 'apple-touch-icon', href: '/brand/icon-180.png' },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },


  // ---------- Contenu (produits, blog, réglages) ----------
  content: {
    experimental: { sqliteConnector: 'native' }, // Node >= 22.5, pas de dépendance native
    build: {
      markdown: {
        toc: { depth: 3 },
      },
    },
  },

  // ---------- Nuxt Studio (édition par le client) ----------
  // Local : `npm run dev` puis bouton flottant en bas à gauche.
  // Production : déployer en SSR (Vercel/Netlify) + variables STUDIO_GITHUB_CLIENT_ID / STUDIO_GITHUB_CLIENT_SECRET.
  studio: {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'cabrel7',
      repo: 'lesmielleries',
      branch: 'main',
    },
  },

  // ---------- Multilingue FR / EN ----------
  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    baseUrl: 'https://lesmielleries.com',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    customRoutes: 'config',
    pages: {
      'notre-histoire': { fr: '/notre-histoire', en: '/our-story' },
      'produits/index': { fr: '/produits', en: '/products' },
      'produits/[slug]': { fr: '/produits/[slug]', en: '/products/[slug]' },
      professionnels: { fr: '/professionnels', en: '/professionals' },
      'mentions-legales': { fr: '/mentions-legales', en: '/legal-notice' },
    },
    detectBrowserLanguage: false,
  },

  // ---------- Images ----------
  image: {
    quality: 80,
    format: ['avif', 'webp'],
    screens: { xs: 360, sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1600 },
  },

  // ---------- Rendu ----------
  routeRules: {
    '/**': { prerender: true },
    '/_studio/**': { prerender: false },
    '/__nuxt_studio/**': { prerender: false },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/', '/en'],
      failOnError: false,
      ignore: [/produit=/],
    },
    compressPublicAssets: true,
  },

  hooks: {
    // Ne pas précharger les imports dynamiques (dont l'éditeur Nuxt Studio, ~770 Ko) : économie de data mobile
    'build:manifest': (manifest) => {
      for (const key in manifest) manifest[key]!.dynamicImports = []
    },
  },

  vite: {
    optimizeDeps: { include: ['gsap', 'gsap/ScrollTrigger', 'lenis'] },
  },
})
