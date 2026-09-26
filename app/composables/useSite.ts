const FALLBACK = {
  companyName: 'Les Mielleries Sarl',
  phone: '+237 640 65 77 49',
  whatsapp: '237640657749',
  email: 'contact@lesmielleries.com',
  address: 'B.P. 15516',
  city: 'Douala, Cameroun',
  hours: 'Lun – Ven · 8h – 17h',
  mapsUrl: 'https://maps.google.com/?q=Douala,Cameroun',
  socials: [] as { label: string, url: string }[],
}

/** Réglages du site (coordonnées, WhatsApp…) éditables dans Nuxt Studio : content/settings.yml */
export async function useSettings() {
  const { data } = await useAsyncData('settings', () => queryCollection('settings').first())
  return computed(() => ({ ...FALLBACK, ...(data.value || {}) }))
}

/** Construit un lien WhatsApp avec message pré-rempli. */
export function waLink(number: string, text: string) {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

/** Nom de collection selon la langue active. */
export function useCollections() {
  const { locale } = useI18n()
  return computed(() => ({
    products: (locale.value === 'en' ? 'products_en' : 'products_fr') as 'products_en' | 'products_fr',
    blog: (locale.value === 'en' ? 'blog_en' : 'blog_fr') as 'blog_en' | 'blog_fr',
  }))
}

export function formatDate(date: string, locale: string) {
  try {
    return new Date(date).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  catch {
    return date
  }
}

/** Slug d'un document de contenu à partir de son chemin (/produits/miel-de-savane → miel-de-savane). */
export function slugOf(path?: string) {
  return (path || '').split('/').filter(Boolean).pop() || ''
}
