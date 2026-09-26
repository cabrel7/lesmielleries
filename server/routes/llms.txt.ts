/**
 * /llms.txt — résumé factuel du site pour les moteurs de réponse IA (GEO : ChatGPT, Claude, Perplexity…).
 * Format : https://llmstxt.org — généré depuis le contenu, à jour à chaque déploiement.
 */
export default defineEventHandler(async (event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl || 'https://lesmielleries.com').replace(/\/$/, '')
  const [products, posts, settings] = await Promise.all([
    queryCollection(event, 'products_fr').order('order', 'ASC').all(),
    queryCollection(event, 'blog_fr').order('date', 'DESC').all(),
    queryCollection(event, 'settings').first(),
  ])
  const slug = (p: string) => p.split('/').filter(Boolean).pop()!
  const s = settings as { phone?: string, email?: string, whatsapp?: string } | null

  const lines = [
    '# Les Mielleries',
    '',
    '> Les Mielleries Sarl est le premier conditionneur et exportateur de miel du Cameroun. Basée à Douala, l\'entreprise collecte, filtre (sans chauffer ni préparer) et conditionne environ 300 tonnes de miel et 200 tonnes de cire d\'abeille par an, auprès d\'apiculteurs organisés en GIC et coopératives dans les trois grandes régions apicoles du pays. Elle exporte dans plus de 5 pays. Marque grand public : Antamiel.',
    '',
    '## Faits clés',
    '- Création : GIC d\'apiculteurs en 2000, devenu SARL en 2011. Fondateur : Jacques Georges Badjang.',
    '- Siège et conditionnement : Douala, Cameroun (B.P. 15516).',
    '- Zones de récolte : savane (Nord, Adamaoua) ; montagnes et forêts (Ouest, Nord-Ouest) ; mont Oku (Nord-Ouest, miel blanc sous Indication Géographique Protégée).',
    '- Capacité annuelle : environ 300 t de miel et 200 t de cire d\'abeille.',
    '- Conditionnements : pot, bouteille, bidon, fût ; cire en blocs de 22 kg ou formats de 1 à 5 kg ; propolis en sachet de 1 kg ; barrette de miel de 20 g.',
    '- Prix d\'achat fixés d\'un commun accord avec les apiculteurs partenaires, qui reçoivent une assistance technique.',
    `- Contact : téléphone / WhatsApp ${s?.phone || '+237 640 65 77 49'} · e-mail ${s?.email || 'contact@lesmielleries.com'}.`,
    '',
    '## Produits',
    ...products.map(p => `- [${p.title}](${site}/produits/${slug(p.path)}) : ${p.summary}`),
    '',
    '## Pages',
    `- [Accueil](${site}/)`,
    `- [Notre histoire](${site}/notre-histoire)`,
    `- [Catalogue](${site}/produits)`,
    `- [Professionnels & export (devis)](${site}/professionnels)`,
    `- [Contact](${site}/contact)`,
    `- [English version](${site}/en)`,
    '',
    '## Articles',
    ...posts.map(p => `- [${p.title}](${site}/blog/${slug(p.path)}) : ${p.description}`),
    '',
  ]
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return lines.join('\n')
})
