<script setup lang="ts">
definePageMeta({ headerLight: true })

const { t, tm, rt, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const cols = useCollections()
const settings = await useSettings()
const slug = computed(() => String(route.params.slug))

const { data: product } = await useAsyncData(
  () => `product-${cols.value.products}-${slug.value}`,
  () => queryCollection(cols.value.products).path(`${locale.value === 'en' ? '/products' : '/produits'}/${slug.value}`).first(),
  { watch: [cols, slug] },
)
if (!product.value) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable', fatal: true })

const { data: related } = await useAsyncData(
  () => `related-${cols.value.products}-${slug.value}`,
  async () => {
    const all = await queryCollection(cols.value.products).order('order', 'ASC').all()
    const others = all.filter(p => slugOf(p.path) !== slug.value)
    const same = others.filter(p => p.category === product.value?.category)
    return [...same, ...others.filter(p => !same.includes(p))].slice(0, 3)
  },
  { watch: [cols, slug] },
)

const p = computed(() => product.value!)
const images = computed(() => (p.value.images?.length ? p.value.images : [{ src: p.value.cover, alt: p.value.title }]))
const format = ref<string>(p.value.formats?.[0] || '')
watch(p, v => (format.value = v.formats?.[0] || ''))

const waHref = computed(() => {
  const lines = [t('wa.hello'), t('wa.product', { product: p.value.title })]
  if (format.value) lines.push(t('wa.format', { format: format.value }))
  return waLink(settings.value.whatsapp, lines.join('\n'))
})
const quoteTo = computed(() => ({ path: localePath('/professionnels'), query: { produit: p.value.title } }))
const specs = computed(() => [
  { k: t('product.origin'), v: p.value.region, icon: 'pin' },
  { k: t('product.type'), v: p.value.kind, icon: 'hexagon' },
  { k: t('product.color'), v: p.value.color, icon: 'drop' },
  { k: t('product.taste'), v: p.value.taste, icon: 'sparkle' },
  { k: t('product.texture'), v: p.value.texture, icon: 'spoon' },
].filter(s => s.v))
const openPanel = ref<string | null>('usages')
const promise = computed(() => (tm('product.promise') as unknown[]).map(x => rt(x as never)))

useSeoMeta({
  title: () => `${p.value.title} — Les Mielleries`,
  description: () => p.value.summary,
  ogTitle: () => `${p.value.title} — Les Mielleries`,
  ogDescription: () => p.value.summary,
  ogImage: () => p.value.cover,
  ogType: 'product' as never,
})
useHead({
  script: [{
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': p.value.title,
      'description': p.value.summary,
      'image': images.value.map(i => `https://lesmielleries.com${i.src}`),
      'brand': { '@type': 'Brand', 'name': 'Antamiel — Les Mielleries' },
      'countryOfOrigin': 'CM',
    }),
  }],
})

// Barre d'achat mobile : apparaît quand les boutons principaux sortent de l'écran
const ctaRef = ref<HTMLElement | null>(null)
const showBar = ref(false)
onMounted(() => {
  const io = new IntersectionObserver(([e]) => { showBar.value = !e!.isIntersecting && e!.boundingClientRect.top < 0 })
  if (ctaRef.value) io.observe(ctaRef.value)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <div v-if="product" class="pd" :style="{ '--accent': p.accent }">
    <div class="pd__glow" aria-hidden="true" />
    <div class="container">
      <nav class="crumbs" aria-label="Fil d'Ariane">
        <NuxtLink :to="localePath('/')">{{ t('nav.home') }}</NuxtLink>
        <span>/</span>
        <NuxtLink :to="localePath('/produits')">{{ t('nav.products') }}</NuxtLink>
        <span>/</span>
        <span aria-current="page">{{ p.title }}</span>
      </nav>

      <div class="pd__grid">
        <div class="pd__gallery">
          <ProductGallery :images="images" :title="p.title" :badge="p.badge" :pending="p.photoPending" />
        </div>

        <div class="pd__info">
          <p class="pd__meta">{{ p.kind }}<template v-if="p.region"> · {{ p.region }}</template></p>
          <h1 class="pd__title">{{ p.title }}</h1>
          <p v-if="p.subtitle" class="pd__sub">{{ p.subtitle }}</p>
          <p class="pd__excerpt">{{ p.summary }}</p>

          <dl class="specs">
            <div v-for="s in specs" :key="s.k" class="spec">
              <dt><AppIcon :name="s.icon" />{{ s.k }}</dt>
              <dd>{{ s.v }}</dd>
            </div>
          </dl>

          <fieldset v-if="p.formats?.length" class="formats">
            <legend>{{ t('product.chooseFormat') }}</legend>
            <label v-for="f in p.formats" :key="f" class="fmt" :class="{ on: format === f }">
              <input v-model="format" type="radio" name="format" :value="f">
              <span>{{ f }}</span>
            </label>
          </fieldset>

          <div ref="ctaRef" class="pd__ctas">
            <a :href="waHref" target="_blank" rel="noopener" class="btn btn-wa"><AppIcon name="whatsapp" />{{ t('product.orderWa') }}</a>
            <NuxtLink :to="quoteTo" class="btn btn-ghost">{{ t('product.orderPro') }}</NuxtLink>
          </div>

          <ul class="promise">
            <li v-for="x in promise" :key="x"><AppIcon name="check" />{{ x }}</li>
          </ul>

          <div class="acc">
            <div v-for="panel in [
              { id: 'usages', title: t('product.usages'), items: p.usages },
              { id: 'benefits', title: t('product.benefits'), items: p.benefits },
              { id: 'storage', title: t('product.storage'), text: p.storage },
            ].filter(x => (x.items && x.items.length) || x.text)" :key="panel.id" class="acc__item" :class="{ open: openPanel === panel.id }">
              <button type="button" class="acc__head" :aria-expanded="openPanel === panel.id" @click="openPanel = openPanel === panel.id ? null : panel.id">
                {{ panel.title }}<span class="acc__plus" />
              </button>
              <div class="acc__body">
                <div>
                  <ul v-if="panel.items">
                    <li v-for="it in panel.items" :key="it">{{ it }}</li>
                  </ul>
                  <p v-else>{{ panel.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Histoire du produit -->
    <section class="story section">
      <div class="container story__grid">
        <div class="story__media reveal-img" v-reveal>
          <NuxtImg :src="images[1]?.src || '/images/ambiance/cuillere-miel.webp'" :alt="images[1]?.alt || ''" width="800" height="800" sizes="xs:92vw md:40vw" loading="lazy" />
        </div>
        <div class="prose reveal" v-reveal>
          <ContentRenderer :value="p" />
        </div>
      </div>
    </section>

    <!-- Produits liés -->
    <section v-if="related?.length" class="section section-cream">
      <div class="container">
        <div class="section-head">
          <h2 class="h2 reveal" v-reveal>{{ t('product.related') }}</h2>
        </div>
        <div class="rel">
          <ProductCard v-for="(r, i) in related" :key="r.path" :product="r" :index="i" />
        </div>
      </div>
    </section>

    <!-- Barre d'achat mobile -->
    <Transition name="bar">
      <div v-if="showBar" class="buybar">
        <div class="buybar__txt">
          <strong>{{ p.title }}</strong>
          <span v-if="format">{{ format }}</span>
        </div>
        <a :href="waHref" target="_blank" rel="noopener" class="btn btn-wa"><AppIcon name="whatsapp" />{{ t('nav.order') }}</a>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.pd { position: relative; padding-top: calc(var(--header-h) + 2.5rem); overflow: clip; }
.pd__glow { position: absolute; top: -20%; left: -10%; width: 70%; height: 70vh; background: radial-gradient(closest-side, color-mix(in srgb, var(--accent) 22%, transparent), transparent); pointer-events: none; z-index: -1; }
.crumbs { display: flex; flex-wrap: wrap; gap: 0.5rem; font-size: 0.82rem; color: var(--muted); margin-bottom: 1.5rem; }
.crumbs a:hover { color: var(--orange-700); }
.crumbs [aria-current] { color: var(--ink); }
.pd__grid { display: grid; gap: 2.5rem; padding-bottom: var(--section); }
.pd__info { display: grid; gap: 1.25rem; align-content: start; }
.pd__meta { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.pd__title { font-size: var(--step-4); }
.pd__sub { font-family: var(--font-display); font-style: italic; font-size: var(--step-1); color: color-mix(in srgb, var(--accent) 62%, #000); }
.pd__excerpt { font-size: 1.08rem; color: var(--ink-2); }
.specs { margin: 0.5rem 0 0; display: grid; border-top: 1px solid var(--line); }
.spec { display: grid; grid-template-columns: 9rem 1fr; gap: 1rem; padding: 0.8rem 0; border-bottom: 1px solid var(--line); }
.spec dt { display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.spec dt svg { width: 16px; height: 16px; color: var(--orange); }
.spec dd { margin: 0; font-weight: 500; }
.formats { border: 0; padding: 0; margin: 0.5rem 0 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.formats legend { font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin-bottom: 0.7rem; padding: 0; }
.fmt { position: relative; cursor: pointer; }
.fmt input { position: absolute; opacity: 0; pointer-events: none; }
.fmt span { display: inline-flex; align-items: center; min-height: 44px; padding: 0.5rem 1.1rem; border-radius: 12px; border: 1px solid var(--line); background: #fff; font-size: 0.92rem; font-weight: 500; transition: all 0.25s var(--ease); }
.fmt:hover span { border-color: var(--orange); }
.fmt.on span { background: var(--honey-900); color: var(--cream); border-color: var(--honey-900); }
.fmt input:focus-visible + span { outline: 2px solid var(--orange); outline-offset: 2px; }
.pd__ctas { display: grid; gap: 0.75rem; margin-top: 0.5rem; }
.promise { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; font-size: 0.85rem; color: var(--ink-2); }
.promise li { display: inline-flex; align-items: center; gap: 0.35rem; }
.promise svg { width: 16px; height: 16px; color: var(--green); }
.acc { border-top: 1px solid var(--line); margin-top: 0.5rem; }
.acc__item { border-bottom: 1px solid var(--line); }
.acc__head { display: flex; width: 100%; justify-content: space-between; align-items: center; padding: 1.1rem 0; border: 0; background: none; font-family: var(--font-display); font-size: var(--step-1); text-align: left; }
.acc__plus { position: relative; width: 14px; height: 14px; flex: none; }
.acc__plus::before, .acc__plus::after { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1.5px; background: currentColor; transition: transform 0.4s var(--ease); }
.acc__plus::after { transform: rotate(90deg); }
.open .acc__plus::after { transform: rotate(0); }
.acc__body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.5s var(--ease); }
.acc__body > div { overflow: hidden; }
.open .acc__body { grid-template-rows: 1fr; }
.acc__body ul { margin: 0 0 1.2rem; padding-left: 1.2rem; color: var(--ink-2); display: grid; gap: 0.35rem; }
.acc__body li::marker { color: var(--orange); }
.acc__body p { color: var(--ink-2); padding-bottom: 1.2rem; }
@media (min-width: 560px) { .pd__ctas { grid-template-columns: 1fr 1fr; } }
@media (min-width: 960px) {
  .pd__grid { grid-template-columns: 1.05fr 0.95fr; gap: clamp(3rem, 2rem + 3vw, 5.5rem); }
  .pd__gallery { position: sticky; top: calc(var(--header-h) + 1.5rem); align-self: start; }
}

.story { background: var(--honey-900); color: var(--cream); }
.story__grid { display: grid; gap: 3rem; align-items: center; }
.story__media { aspect-ratio: 1; border-radius: var(--radius-lg); overflow: hidden; }
.story__media img { width: 100%; height: 100%; object-fit: cover; }
.story .prose { color: rgba(251, 244, 230, 0.8); }
.story .prose :deep(h2) { color: var(--cream); margin-top: 0; }
.story .prose :deep(h2 ~ h2) { margin-top: 1.6em; }
.story .prose :deep(strong) { color: var(--yellow); }
.story .prose :deep(a) { color: var(--yellow); }
@media (min-width: 900px) { .story__grid { grid-template-columns: 0.85fr 1.15fr; gap: 5rem; } }

.rel { display: grid; gap: 1.5rem; }
@media (min-width: 620px) { .rel { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .rel { grid-template-columns: repeat(3, 1fr); gap: 2rem; } }

.buybar { position: fixed; left: 0.75rem; right: 5.25rem; bottom: max(0.75rem, env(safe-area-inset-bottom)); z-index: 39; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.5rem 0.5rem 0.5rem 1rem; border-radius: 999px; background: rgba(255, 251, 243, 0.94); border: 1px solid var(--line); box-shadow: var(--shadow-lg); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); }
.buybar__txt { display: grid; line-height: 1.2; min-width: 0; }
.buybar__txt strong { font-family: var(--font-display); font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.buybar__txt span { font-size: 0.75rem; color: var(--muted); }
.buybar .btn { min-height: 44px; padding: 0.5rem 1rem; font-size: 0.85rem; }
@media (min-width: 960px) { .buybar { display: none; } }
.bar-enter-active, .bar-leave-active { transition: transform 0.45s var(--ease), opacity 0.3s; }
.bar-enter-from, .bar-leave-to { transform: translateY(120%); opacity: 0; }
</style>
