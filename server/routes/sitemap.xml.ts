/**
 * /sitemap.xml — généré à partir du contenu (produits, articles) avec alternatives FR/EN (hreflang)
 * et images produits. Pré-rendu au build ; se met à jour à chaque déploiement.
 */
const STATIC_PAGES: { fr: string, en: string, priority: string, freq: string }[] = [
  { fr: '/', en: '/en', priority: '1.0', freq: 'weekly' },
  { fr: '/produits', en: '/en/products', priority: '0.9', freq: 'weekly' },
  { fr: '/notre-histoire', en: '/en/our-story', priority: '0.7', freq: 'monthly' },
  { fr: '/professionnels', en: '/en/professionals', priority: '0.8', freq: 'monthly' },
  { fr: '/blog', en: '/en/blog', priority: '0.8', freq: 'weekly' },
  { fr: '/contact', en: '/en/contact', priority: '0.6', freq: 'yearly' },
]

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export default defineEventHandler(async (event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl || 'https://lesmielleries.com').replace(/\/$/, '')
  const today = new Date().toISOString().slice(0, 10)

  const [pFr, pEn, bFr, bEn] = await Promise.all([
    queryCollection(event, 'products_fr').all(),
    queryCollection(event, 'products_en').all(),
    queryCollection(event, 'blog_fr').all(),
    queryCollection(event, 'blog_en').all(),
  ])
  const slug = (p: string) => p.split('/').filter(Boolean).pop()!

  type Entry = { fr: string, en?: string, priority: string, freq: string, lastmod: string, images?: { loc: string, title: string }[] }
  const entries: Entry[] = STATIC_PAGES.map(p => ({ ...p, lastmod: today }))

  for (const p of pFr) {
    const s = slug(p.path)
    const en = pEn.find(x => slug(x.path) === s)
    entries.push({
      fr: `/produits/${s}`,
      en: en ? `/en/products/${s}` : undefined,
      priority: '0.8',
      freq: 'monthly',
      lastmod: today,
      images: (p.images || []).map((i: { src: string, alt: string }) => ({ loc: `${site}${i.src}`, title: i.alt })),
    })
  }
  for (const b of bFr) {
    const s = slug(b.path)
    const en = bEn.find(x => slug(x.path) === s)
    entries.push({ fr: `/blog/${s}`, en: en ? `/en/blog/${s}` : undefined, priority: '0.7', freq: 'monthly', lastmod: String(b.date).slice(0, 10), images: [{ loc: `${site}${b.cover}`, title: b.title }] })
  }

  const u = (p: string) => (p === '/' ? site : `${site}${p}`)
  const urls: string[] = []
  for (const e of entries) {
    const variants = [e.fr, ...(e.en ? [e.en] : [])]
    for (const loc of variants) {
      const alts = [
        `<xhtml:link rel="alternate" hreflang="fr" href="${u(e.fr)}"/>`,
        ...(e.en ? [`<xhtml:link rel="alternate" hreflang="en" href="${site}${e.en}"/>`] : []),
        `<xhtml:link rel="alternate" hreflang="x-default" href="${u(e.fr)}"/>`,
      ].join('')
      const imgs = (e.images || []).map(i => `<image:image><image:loc>${esc(i.loc)}</image:loc><image:title>${esc(i.title)}</image:title></image:image>`).join('')
      urls.push(`<url><loc>${u(loc)}</loc><lastmod>${e.lastmod}</lastmod><changefreq>${e.freq}</changefreq><priority>${e.priority}</priority>${alts}${imgs}</url>`)
    }
  }

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`
})
