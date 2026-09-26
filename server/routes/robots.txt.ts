/** /robots.txt — autorise l'indexation (y compris les moteurs IA), bloque l'éditeur. */
export default defineEventHandler((event) => {
  const site = String(useRuntimeConfig(event).public.siteUrl || 'https://lesmielleries.com').replace(/\/$/, '')
  setHeader(event, 'content-type', 'text/plain; charset=utf-8')
  return `User-agent: *
Allow: /
Disallow: /_studio
Disallow: /__nuxt_studio/
Disallow: /api/

# Moteurs de réponse IA (GEO) : bienvenus
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${site}/sitemap.xml
`
})
