<script setup lang="ts">
const head = useLocaleHead({ seo: true })
const { locale } = useI18n()
const site = useSiteUrl()
const settings = await useSettings()

useHead({
  htmlAttrs: { lang: () => head.value.htmlAttrs?.lang },
  link: () => [
    ...(head.value.link || []),
    { rel: 'manifest', href: '/manifest.webmanifest' },
  ],
  meta: () => head.value.meta || [],
  script: [
    { innerHTML: 'document.documentElement.classList.add("js")', tagPosition: 'head' },
    {
      // Données structurées globales : entreprise locale + site web (SEO & moteurs IA)
      key: 'ld-org',
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': ['Organization', 'LocalBusiness'],
            '@id': `${site}/#organization`,
            'name': 'Les Mielleries',
            'legalName': settings.value.companyName,
            'alternateName': ['Les Mielleries Sarl', 'Antamiel'],
            'url': site,
            'logo': { '@type': 'ImageObject', 'url': `${site}/brand/icon-512.png`, 'width': 512, 'height': 512 },
            'image': `${site}/og/fr/home.jpg`,
            'description': locale.value === 'en'
              ? 'Cameroon\'s leading honey packer and exporter since 2000: savannah honey, mountain and forest honey, PGI Oku white honey, beeswax and propolis.'
              : 'Premier conditionneur et exportateur de miel du Cameroun depuis 2000 : miel de savane, miel de montagnes et forêts, miel blanc d\'Oku IGP, cire d\'abeille et propolis.',
            'slogan': 'La nature à votre table',
            'foundingDate': '2000',
            'founder': { '@type': 'Person', 'name': 'Jacques Georges Badjang' },
            'telephone': settings.value.phone,
            'email': settings.value.email,
            'address': { '@type': 'PostalAddress', 'postOfficeBoxNumber': 'B.P. 15516', 'addressLocality': 'Douala', 'addressRegion': 'Littoral', 'addressCountry': 'CM' },
            'geo': { '@type': 'GeoCoordinates', 'latitude': 4.0511, 'longitude': 9.7679 },
            'areaServed': [{ '@type': 'Country', 'name': 'Cameroon' }, { '@type': 'Place', 'name': 'Africa' }, { '@type': 'Place', 'name': 'Europe' }],
            'knowsAbout': ['Miel', 'Honey', 'Apiculture', 'Beekeeping', 'Cire d\'abeille', 'Beeswax', 'Propolis', 'Miel blanc d\'Oku', 'Export de miel'],
            'contactPoint': [{ '@type': 'ContactPoint', 'telephone': settings.value.phone, 'contactType': 'sales', 'availableLanguage': ['French', 'English'], 'areaServed': 'CM' }],
            'sameAs': settings.value.socials.map(s => s.url),
          },
          {
            '@type': 'WebSite',
            '@id': `${site}/#website`,
            'url': site,
            'name': 'Les Mielleries',
            'inLanguage': ['fr-FR', 'en-US'],
            'publisher': { '@id': `${site}/#organization` },
          },
        ],
      }),
    },
  ],
})

// Référencement local (GEO) : Douala, région du Littoral, Cameroun
useSeoMeta({
  ogSiteName: 'Les Mielleries',
  twitterCard: 'summary_large_image',
})
useHead({
  meta: [
    { name: 'geo.region', content: 'CM-LT' },
    { name: 'geo.placename', content: 'Douala' },
    { name: 'geo.position', content: '4.0511;9.7679' },
    { name: 'ICBM', content: '4.0511, 9.7679' },
    { name: 'author', content: 'Les Mielleries Sarl' },
    { name: 'application-name', content: 'Les Mielleries' },
    { name: 'apple-mobile-web-app-title', content: 'Les Mielleries' },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
