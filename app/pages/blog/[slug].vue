<script setup lang="ts">
definePageMeta({ headerLight: true })
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const cols = useCollections()
const settings = await useSettings()
const slug = computed(() => String(route.params.slug))

const { data: post } = await useAsyncData(
  () => `post-${cols.value.blog}-${slug.value}`,
  () => queryCollection(cols.value.blog).path(`/blog/${slug.value}`).first(),
  { watch: [cols, slug] },
)
if (!post.value) throw createError({ statusCode: 404, statusMessage: 'Article introuvable', fatal: true })

const { data: others } = await useAsyncData(
  () => `post-others-${cols.value.blog}-${slug.value}`,
  async () => (await queryCollection(cols.value.blog).order('date', 'DESC').all()).filter(p => slugOf(p.path) !== slug.value),
  { watch: [cols, slug] },
)

const p = computed(() => post.value!)
const toc = computed(() => (p.value.body as unknown as { toc?: { links?: { id: string, text: string }[] } })?.toc?.links || [])
const shareUrl = computed(() => `${useSiteUrl()}${route.path}`)
const shareWa = computed(() => `https://wa.me/?text=${encodeURIComponent(`${p.value.title} — ${shareUrl.value}`)}`)

// Barre de progression de lecture
const progress = ref(0)
function onScroll() {
  const el = document.querySelector('.art__body') as HTMLElement | null
  if (!el) return
  const r = el.getBoundingClientRect()
  progress.value = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight * 0.6)))
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

usePageSeo({
  title: () => `${p.value.title} — Les Mielleries`,
  description: () => p.value.description,
  image: () => `/og/${locale.value}/blog-${slug.value}.jpg`,
  imageAlt: () => p.value.title,
  type: 'article',
  publishedTime: () => p.value.date,
})
useBreadcrumbLd(() => [
  { name: t('nav.home'), path: locale.value === 'en' ? '/en' : '/' },
  { name: t('nav.blog'), path: locale.value === 'en' ? '/en/blog' : '/blog' },
  { name: p.value.title, path: route.path },
])
const siteUrl = useSiteUrl()
useHead({
  script: [{
    key: 'ld-article',
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': p.value.title,
      'description': p.value.description,
      'image': `${siteUrl}/og/${locale.value}/blog-${slug.value}.jpg`,
      'url': `${siteUrl}${route.path}`,
      'mainEntityOfPage': `${siteUrl}${route.path}`,
      'datePublished': p.value.date,
      'dateModified': p.value.date,
      'author': { '@type': 'Organization', 'name': p.value.author },
      'publisher': { '@id': `${siteUrl}/#organization` },
      'inLanguage': locale.value,
    }),
  }],
})
</script>

<template>
  <article v-if="post" class="art">
    <div class="art__progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true" />
    <header class="art__head container-narrow">
      <NuxtLink :to="localePath('/blog')" class="art__back"><AppIcon name="arrow-left" />{{ t('nav.blog') }}</NuxtLink>
      <p class="art__meta"><span class="chip">{{ p.category }}</span>{{ formatDate(p.date, locale) }} · {{ t('common.minRead', { n: p.readingTime }) }}</p>
      <h1 class="art__title">{{ p.title }}</h1>
      <p class="lead">{{ p.description }}</p>
    </header>
    <div class="art__cover container reveal-img" v-reveal>
      <NuxtImg :src="p.cover" :alt="p.title" width="1400" height="780" sizes="xs:100vw lg:1240px" fetchpriority="high" />
    </div>
    <div class="art__layout container">
      <aside v-if="toc.length" class="art__toc">
        <p>{{ t('blog.toc') }}</p>
        <ul>
          <li v-for="l in toc" :key="l.id"><a :href="`#${l.id}`">{{ l.text }}</a></li>
        </ul>
      </aside>
      <div class="art__body prose">
        <ContentRenderer :value="p" />
        <div class="art__share">
          <span>{{ t('blog.share') }}</span>
          <a :href="shareWa" target="_blank" rel="noopener" class="btn btn-wa"><AppIcon name="whatsapp" />WhatsApp</a>
        </div>
      </div>
    </div>

    <section v-if="others?.length" class="section section-cream">
      <div class="container">
        <div class="section-head">
          <h2 class="h2">{{ t('blog.related') }}</h2>
        </div>
        <AppCarousel :items="others" :item-key="(o) => o.path" :autoplay="6000" :label="t('blog.related')">
          <template #default="{ item, index }">
            <BlogCard :post="item" :index="index % 3" />
          </template>
        </AppCarousel>
      </div>
    </section>
  </article>
</template>

<style scoped>
.art { padding-top: calc(var(--header-h) + 3rem); }
.art__progress { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 60; background: linear-gradient(90deg, var(--yellow), var(--orange)); transform-origin: left; }
.art__head { display: grid; gap: 1.25rem; margin-bottom: 2.5rem; }
.art__back { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; color: var(--muted); width: fit-content; }
.art__back svg { width: 16px; height: 16px; transition: transform 0.3s var(--ease); }
.art__back:hover { color: var(--orange-700); }
.art__back:hover svg { transform: translateX(-3px); }
.art__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; font-size: 0.85rem; color: var(--muted); }
.art__title { font-size: var(--step-4); }
.art__cover { aspect-ratio: 16 / 9; border-radius: var(--radius-lg); overflow: hidden; }
.art__cover img { width: 100%; height: 100%; object-fit: cover; }
.art__layout { display: grid; gap: 2rem; padding-block: clamp(3rem, 2rem + 3vw, 5rem) var(--section); }
.art__body { max-width: 720px; width: 100%; margin-inline: auto; }
.art__toc { display: none; }
.art__share { display: flex; align-items: center; gap: 1rem; margin-top: 3rem !important; padding-top: 2rem; border-top: 1px solid var(--line); font-weight: 600; color: var(--ink); }
.art__others { display: grid; gap: 2.5rem; }
@media (min-width: 760px) { .art__others { grid-template-columns: repeat(3, 1fr); gap: 2rem; } }
@media (min-width: 1100px) {
  .art__layout { grid-template-columns: 220px 1fr; gap: 4rem; }
  .art__body { margin: 0; }
  .art__toc { display: block; position: sticky; top: calc(var(--header-h) + 2rem); align-self: start; font-size: 0.88rem; }
  .art__toc p { font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-bottom: 1rem; font-weight: 600; }
  .art__toc ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.6rem; border-left: 1px solid var(--line); }
  .art__toc a { display: block; padding-left: 1rem; color: var(--ink-2); transition: color 0.2s; }
  .art__toc a:hover { color: var(--orange-700); }
}
</style>
