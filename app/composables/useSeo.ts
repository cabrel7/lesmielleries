/**
 * SEO d'une page : titre, description, Open Graph, Twitter, URL absolues.
 * Canonical + hreflang sont gérés par @nuxtjs/i18n (useLocaleHead dans app.vue).
 *
 * `image` : chemin d'une image 1200×630 (dossier public/og/{fr|en}/…) — sinon image par défaut de la langue.
 */
export function usePageSeo(opts: {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string | undefined>
  imageAlt?: MaybeRefOrGetter<string | undefined>
  type?: 'website' | 'article' | 'product'
  noindex?: boolean
  publishedTime?: MaybeRefOrGetter<string | undefined>
}) {
  const { public: pub } = useRuntimeConfig()
  const { locale } = useI18n()
  const site = String(pub.siteUrl || 'https://lesmielleries.com').replace(/\/$/, '')
  const abs = (p?: string) => (!p ? undefined : p.startsWith('http') ? p : `${site}${p}`)
  const img = computed(() => abs(toValue(opts.image) || `/og/${locale.value}/home.jpg`))
  const isJpg = computed(() => /\.jpe?g$/i.test(img.value || ''))

  useSeoMeta({
    title: () => toValue(opts.title),
    description: () => toValue(opts.description),
    ogTitle: () => toValue(opts.title),
    ogDescription: () => toValue(opts.description),
    ogType: (opts.type === 'product' ? 'website' : opts.type || 'website') as 'website',
    ogImage: () => img.value,
    ogImageSecureUrl: () => img.value,
    ogImageWidth: () => (isJpg.value ? 1200 : undefined),
    ogImageHeight: () => (isJpg.value ? 630 : undefined),
    ogImageType: () => (isJpg.value ? 'image/jpeg' : undefined),
    ogImageAlt: () => toValue(opts.imageAlt) || toValue(opts.title),
    twitterCard: 'summary_large_image',
    twitterTitle: () => toValue(opts.title),
    twitterDescription: () => toValue(opts.description),
    twitterImage: () => img.value,
    twitterImageAlt: () => toValue(opts.imageAlt) || toValue(opts.title),
    articlePublishedTime: () => (opts.type === 'article' ? toValue(opts.publishedTime) : undefined),
    robots: opts.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1',
  })
}

/** Fil d'Ariane (JSON-LD BreadcrumbList). */
export function useBreadcrumbLd(items: MaybeRefOrGetter<{ name: string, path: string }[]>) {
  const { public: pub } = useRuntimeConfig()
  const site = String(pub.siteUrl || 'https://lesmielleries.com').replace(/\/$/, '')
  useHead({
    script: [{
      key: 'ld-breadcrumb',
      type: 'application/ld+json',
      innerHTML: () => JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': toValue(items).map((it, i) => ({ '@type': 'ListItem', 'position': i + 1, 'name': it.name, 'item': `${site}${it.path}` })),
      }),
    }],
  })
}

export function useSiteUrl() {
  const { public: pub } = useRuntimeConfig()
  return String(pub.siteUrl || 'https://lesmielleries.com').replace(/\/$/, '')
}
