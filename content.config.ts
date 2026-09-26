import { defineCollection, defineContentConfig, z } from '@nuxt/content'

/**
 * Schéma d'un produit — éditable dans Nuxt Studio via un formulaire auto-généré.
 * Les champs `images` alimentent la galerie multi-angles de la fiche produit.
 */
const productSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  category: z.enum(['miel', 'ruche', 'pro']),
  kind: z.string().optional(), // ex. « Multifloral », « Unifloral »
  region: z.string().optional(),
  badge: z.string().optional(), // ex. « IGP »
  summary: z.string(),
  cover: z.string(),
  images: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
  color: z.string().optional(),
  taste: z.string().optional(),
  texture: z.string().optional(),
  formats: z.array(z.string()).default([]),
  usages: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  storage: z.string().optional(),
  accent: z.string().default('#F28A21'), // couleur d'accent de la fiche
  order: z.number().default(99),
  featured: z.boolean().default(false),
  photoPending: z.boolean().default(false), // true = visuels provisoires en attendant la séance photo
})

const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  cover: z.string(),
  date: z.string(),
  category: z.string(),
  readingTime: z.number().default(4),
  author: z.string().default('Les Mielleries'),
})

export default defineContentConfig({
  collections: {
    products_fr: defineCollection({ type: 'page', source: { include: 'fr/produits/*.md', prefix: '/produits' }, schema: productSchema }),
    products_en: defineCollection({ type: 'page', source: { include: 'en/produits/*.md', prefix: '/products' }, schema: productSchema }),
    blog_fr: defineCollection({ type: 'page', source: { include: 'fr/blog/*.md', prefix: '/blog' }, schema: postSchema }),
    blog_en: defineCollection({ type: 'page', source: { include: 'en/blog/*.md', prefix: '/blog' }, schema: postSchema }),
    settings: defineCollection({
      type: 'data',
      source: 'settings.yml',
      schema: z.object({
        companyName: z.string(),
        phone: z.string(),
        whatsapp: z.string(), // format international sans + ni espaces : 237640657749
        email: z.string(),
        address: z.string(),
        city: z.string(),
        hours: z.string().optional(),
        mapsUrl: z.string().optional(),
        socials: z.array(z.object({ label: z.string(), url: z.string() })).default([]),
      }),
    }),
  },
})
