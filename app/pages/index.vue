<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const settings = await useSettings()
const cols = useCollections()

const { data: featured } = await useAsyncData(
  () => `home-featured-${cols.value.products}`,
  () => queryCollection(cols.value.products).where('featured', '=', true).order('order', 'ASC').limit(4).all(),
  { watch: [cols] },
)
const { data: posts } = await useAsyncData(
  () => `home-posts-${cols.value.blog}`,
  () => queryCollection(cols.value.blog).order('date', 'DESC').limit(8).all(),
  { watch: [cols] },
)

const { locale } = useI18n()
usePageSeo({
  title: () => t('home.seoTitle'),
  description: () => t('home.seoDesc'),
  image: () => `/og/${locale.value}/home.jpg`,
})
const faq = computed(() => (tm('home.faq') as Record<string, unknown>[]).map(x => ({ q: rt(x.q as never), a: rt(x.a as never) })))
const openFaq = ref<number | null>(0)
useHead({
  script: [{
    key: 'ld-faq',
    type: 'application/ld+json',
    innerHTML: () => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': faq.value.map(f => ({ '@type': 'Question', 'name': f.q, 'acceptedAnswer': { '@type': 'Answer', 'text': f.a } })),
    }),
  }],
})
useHead({
  titleTemplate: '%s',
  link: [{ rel: 'preload', as: 'image', href: '/images/ambiance/hero-poster.webp', fetchpriority: 'high' }],
})

const wa = computed(() => waLink(settings.value.whatsapp, t('wa.generic')))
const marquee = computed(() => (tm('home.marquee') as unknown[]).map(m => rt(m as never)))
const regions = computed(() => (tm('home.regions') as Record<string, unknown>[]).map(r => ({ key: rt(r.key as never), name: rt(r.name as never), area: rt(r.area as never), text: rt(r.text as never) })))
const proTags = computed(() => (tm('home.proTags') as unknown[]).map(m => rt(m as never)))
const manifestoWords = computed(() => t('home.manifesto').split(' '))
const activeRegion = ref<string | null>(null)

const hero = ref<HTMLElement | null>(null)
const manifesto = ref<HTMLElement | null>(null)
let ctx: { revert: () => void } | null = null

onMounted(() => {
  const { $gsap, $reducedMotion } = useNuxtApp()
  const gsap = $gsap as typeof import('gsap').gsap
  if ($reducedMotion) return
  ctx = gsap.context(() => {
    // Entrée du hero
    gsap.from('.hero__line > span', { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.05 })
    gsap.from('.hero__fade', { y: 20, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.35 })
    // Parallaxe au défilement
    gsap.to('.hero__content', { yPercent: -18, opacity: 0, ease: 'none', scrollTrigger: { trigger: hero.value, start: 'top top', end: 'bottom top', scrub: true } })
    gsap.to('.hero__media', { scale: 1.12, ease: 'none', scrollTrigger: { trigger: hero.value, start: 'top top', end: 'bottom top', scrub: true } })
    // Manifeste : les mots s'allument au défilement
    gsap.fromTo('.mf__w', { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: manifesto.value, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } })
    // Alvéoles qui se remplissent
    gsap.fromTo('.hc__cell', { fillOpacity: 0 }, { fillOpacity: 1, ease: 'none', stagger: { each: 0.04, from: 'random' }, scrollTrigger: { trigger: '.stats', start: 'top 85%', end: 'bottom 40%', scrub: 0.8 } })
    // Zigzag gamme : images en parallaxe
    gsap.utils.toArray<HTMLElement>('.zz__img').forEach((el) => {
      gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
    })
  })
})
onBeforeUnmount(() => ctx?.revert())

// Motif d'alvéoles (décor section chiffres)
const cells = computed(() => {
  const out: { x: number, y: number }[] = []
  for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) out.push({ x: c * 30 + (r % 2 ? 15 : 0), y: r * 26 })
  return out
})
</script>

<template>
  <div>
    <!-- ============ HERO ============ -->
    <section ref="hero" class="hero">
      <div class="hero__media">
        <BgVideo eager :rate="0.9" poster="/images/ambiance/hero-poster.webp" webm="/videos/hero-1280.webm" mp4="/videos/hero-1280.mp4" mp4-mobile="/videos/hero-720.mp4" />
      </div>
      <div class="hero__shade" />
      <div class="hero__content container">
        <p class="eyebrow hero__fade">{{ t('home.eyebrow') }}</p>
        <h1 class="hero__title">
          <span class="hero__line"><span>{{ t('home.title1') }}</span></span>
          <span class="hero__line"><span class="accent">{{ t('home.title2') }}</span></span>
        </h1>
        <p class="hero__lead">{{ t('home.lead') }}</p>
        <div class="hero__ctas hero__fade">
          <NuxtLink :to="localePath('/produits')" class="btn btn-primary">{{ t('home.cta1') }} <AppIcon name="arrow-right" /></NuxtLink>
          <a :href="wa" target="_blank" rel="noopener" class="btn btn-ghost"><AppIcon name="whatsapp" />{{ t('common.whatsapp') }}</a>
        </div>
      </div>
      <div class="hero__scroll hero__fade" aria-hidden="true">
        <span>{{ t('common.scroll') }}</span><i />
      </div>
    </section>

    <!-- ============ BANDEAU DÉFILANT ============ -->
    <div class="mq" aria-hidden="true">
      <div class="mq__track">
        <template v-for="n in 2" :key="n">
          <span v-for="m in marquee" :key="`${n}-${m}`" class="mq__item">{{ m }}<AppIcon name="hexagon" /></span>
        </template>
      </div>
    </div>

    <!-- ============ MANIFESTE ============ -->
    <section ref="manifesto" class="mf section section-dark">
      <div class="mf__video">
        <BgVideo desktop-only poster="/images/ambiance/dipper-poster.webp" webm="/videos/dipper-1280.webm" mp4="/videos/dipper-1280.mp4" />
      </div>
      <div class="container-narrow mf__inner">
        <p class="eyebrow">{{ t('home.manifestoLabel') }}</p>
        <p class="mf__text">
          <span v-for="(w, i) in manifestoWords" :key="i" class="mf__w">{{ w + ' ' }}</span>
        </p>
        <div class="mf__foot">
          <p class="mf__sign">— {{ t('home.manifestoSign') }}</p>
          <NuxtLink :to="localePath('/notre-histoire')" class="link-arrow">{{ t('home.manifestoCta') }} <AppIcon name="arrow-right" /></NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============ CHIFFRES ============ -->
    <section class="stats section-cream">
      <svg class="hc" viewBox="0 0 270 130" aria-hidden="true">
        <path v-for="(c, i) in cells" :key="i" class="hc__cell" :transform="`translate(${c.x} ${c.y})`" d="M15 0l13 7.5v15L15 30 2 22.5v-15z" />
      </svg>
      <div class="container stats__grid">
        <div class="stat reveal" v-reveal style="--d: 0s"><strong><CountUp :to="300" /></strong><span>{{ t('home.stats.honey') }}</span></div>
        <div class="stat reveal" v-reveal style="--d: .08s"><strong><CountUp :to="200" /></strong><span>{{ t('home.stats.wax') }}</span></div>
        <div class="stat reveal" v-reveal style="--d: .16s"><strong><CountUp :to="5" suffix="+" /></strong><span>{{ t('home.stats.countries') }}</span></div>
        <div class="stat reveal" v-reveal style="--d: .24s"><strong><CountUp :to="3" /></strong><span>{{ t('home.stats.regions') }}</span></div>
        <div class="stat reveal" v-reveal style="--d: .32s"><strong><CountUp :to="2000" plain /></strong><span>{{ t('home.stats.since') }}</span></div>
      </div>
    </section>

    <!-- ============ TERROIRS ============ -->
    <section class="terroir section section-dark">
      <div class="container terroir__grid">
        <div class="terroir__text">
          <div class="section-head">
            <p class="eyebrow reveal" v-reveal>{{ t('home.terroirLabel') }}</p>
            <h2 class="h2 reveal" v-reveal>{{ t('home.terroirTitle') }}</h2>
            <p class="lead reveal" v-reveal>{{ t('home.terroirLead') }}</p>
          </div>
          <ul class="regions">
            <li
              v-for="(r, i) in regions" :key="r.key" class="region reveal" v-reveal :style="{ '--d': `${i * 0.1}s` }"
              :class="{ on: activeRegion === r.key }" tabindex="0"
              @mouseenter="activeRegion = r.key" @mouseleave="activeRegion = null" @focus="activeRegion = r.key" @blur="activeRegion = null"
            >
              <span class="region__n">0{{ i + 1 }}</span>
              <div>
                <p class="region__area">{{ r.area }}</p>
                <h3 class="region__name">{{ r.name }}</h3>
                <p class="region__text">{{ r.text }}</p>
              </div>
            </li>
          </ul>
          <p class="terroir__hq"><AppIcon name="hexagon" /> {{ t('home.hq') }}</p>
        </div>
        <div class="terroir__map reveal" v-reveal>
          <CameroonMap :active="activeRegion" @hover="activeRegion = $event" />
        </div>
      </div>
    </section>

    <!-- ============ GAMME (zigzag) ============ -->
    <section class="range section">
      <div class="container">
        <div class="section-head center">
          <p class="eyebrow reveal" v-reveal>{{ t('home.rangeLabel') }}</p>
          <h2 class="h2 reveal" v-reveal>{{ t('home.rangeTitle') }}</h2>
        </div>
        <article v-for="(p, i) in featured" :key="p.path" class="zz" :class="{ rev: i % 2 }" :style="{ '--accent': p.accent }">
          <NuxtLink :to="localePath({ name: 'produits-slug', params: { slug: slugOf(p.path) } })" class="zz__media reveal-img" v-reveal>
            <NuxtImg :src="p.images?.[1]?.src || p.cover" :alt="p.title" width="900" height="900" sizes="xs:92vw md:46vw" loading="lazy" class="zz__img" />
            <span v-if="p.badge" class="badge-igp zz__badge">{{ p.badge }}</span>
          </NuxtLink>
          <div class="zz__body">
            <p class="zz__meta reveal" v-reveal>{{ p.kind }} · {{ p.region }}</p>
            <h3 class="zz__title reveal" v-reveal>{{ p.title }}</h3>
            <p class="zz__sub reveal" v-reveal>{{ p.subtitle }}</p>
            <p class="zz__excerpt reveal" v-reveal>{{ p.summary }}</p>
            <ul class="zz__list reveal" v-reveal>
              <li v-if="p.color"><span>{{ t('product.color') }}</span>{{ p.color }}</li>
              <li v-if="p.taste"><span>{{ t('product.taste') }}</span>{{ p.taste }}</li>
              <li v-if="p.texture"><span>{{ t('product.texture') }}</span>{{ p.texture }}</li>
            </ul>
            <div class="zz__ctas reveal" v-reveal>
              <NuxtLink :to="localePath({ name: 'produits-slug', params: { slug: slugOf(p.path) } })" class="btn btn-primary">{{ t('common.seeProduct') }}</NuxtLink>
              <a :href="waLink(settings.whatsapp, `${t('wa.hello')}\n${t('wa.product', { product: p.title })}`)" target="_blank" rel="noopener" class="btn btn-ghost"><AppIcon name="whatsapp" />{{ t('nav.order') }}</a>
            </div>
          </div>
        </article>
        <div class="range__all reveal" v-reveal>
          <NuxtLink :to="localePath('/produits')" class="link-arrow">{{ t('common.allProducts') }} <AppIcon name="arrow-right" /></NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============ BIENFAITS ============ -->
    <section class="benefits section section-cream honeycomb-bg">
      <div class="container benefits__grid">
        <div class="benefits__media reveal-img" v-reveal>
          <NuxtImg src="/images/ambiance/cuillere-miel.webp" alt="" width="900" height="1100" sizes="xs:92vw md:45vw" loading="lazy" />
        </div>
        <div>
          <div class="section-head">
            <p class="eyebrow reveal" v-reveal>{{ t('home.benefitsLabel') }}</p>
            <h2 class="h2 reveal" v-reveal>{{ t('home.benefitsTitle') }}</h2>
          </div>
          <div class="benefit reveal" v-reveal>
            <span class="benefit__ic"><AppIcon name="spoon" /></span>
            <div><h3>{{ t('home.food') }}</h3><p>{{ t('home.foodText') }}</p></div>
          </div>
          <div class="benefit reveal" v-reveal>
            <span class="benefit__ic"><AppIcon name="leaf" /></span>
            <div><h3>{{ t('home.tradition') }}</h3><p>{{ t('home.traditionText') }}</p></div>
          </div>
          <p class="benefits__note reveal" v-reveal>{{ t('home.benefitsNote') }}</p>
        </div>
      </div>
    </section>

    <!-- ============ PROFESSIONNELS ============ -->
    <section class="pro section section-dark">
      <div class="pro__bg">
        <NuxtImg src="/images/products/fut-2.webp" alt="" width="1400" height="1400" sizes="100vw" loading="lazy" />
      </div>
      <div class="container pro__inner">
        <p class="eyebrow reveal" v-reveal>{{ t('home.proLabel') }}</p>
        <h2 class="h2 reveal" v-reveal>{{ t('home.proTitle') }}</h2>
        <p class="lead reveal" v-reveal>{{ t('home.proText') }}</p>
        <div class="pro__icons reveal" v-reveal>
          <span v-for="(tag, i) in proTags" :key="i"><AppIcon :name="['factory', 'globe', 'truck', 'box'][i] || 'hexagon'" />{{ tag }}</span>
        </div>
        <div class="reveal" v-reveal>
          <NuxtLink :to="localePath('/professionnels')" class="btn btn-yellow">{{ t('home.proCta') }} <AppIcon name="arrow-right" /></NuxtLink>
        </div>
      </div>
    </section>

    <!-- ============ BLOG ============ -->
    <section v-if="posts?.length" class="section">
      <div class="container">
        <div class="blog-head">
          <div class="section-head">
            <p class="eyebrow reveal" v-reveal>{{ t('home.blogLabel') }}</p>
            <h2 class="h2 reveal" v-reveal>{{ t('home.blogTitle') }}</h2>
          </div>
          <NuxtLink :to="localePath('/blog')" class="link-arrow reveal" v-reveal>{{ t('home.blogCta') }} <AppIcon name="arrow-right" /></NuxtLink>
        </div>
        <AppCarousel :items="posts" :item-key="(p) => p.path" :autoplay="5500" :label="t('home.blogTitle')">
          <template #default="{ item, index }">
            <BlogCard :post="item" :index="index % 3" />
          </template>
        </AppCarousel>
      </div>
    </section>

    <!-- ============ FAQ (SEO + GEO) ============ -->
    <section class="faq section section-cream">
      <div class="container faq__grid">
        <div class="section-head">
          <p class="eyebrow reveal" v-reveal>{{ t('home.faqLabel') }}</p>
          <h2 class="h2 reveal" v-reveal>{{ t('home.faqTitle') }}</h2>
        </div>
        <div class="faq__list">
          <div v-for="(f, i) in faq" :key="i" class="faq__item" :class="{ open: openFaq === i }">
            <h3>
              <button type="button" class="faq__q" :aria-expanded="openFaq === i" :aria-controls="`faq-${i}`" @click="openFaq = openFaq === i ? null : i">
                {{ f.q }}<span class="faq__plus" aria-hidden="true" />
              </button>
            </h3>
            <div :id="`faq-${i}`" class="faq__a"><div><p>{{ f.a }}</p></div></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ CTA FINAL ============ -->
    <section class="final">
      <div class="container final__inner reveal" v-reveal>
        <h2 class="h2">{{ t('home.finalTitle') }}</h2>
        <p>{{ t('home.finalText') }}</p>
        <a :href="wa" target="_blank" rel="noopener" class="btn btn-wa"><AppIcon name="whatsapp" />{{ t('common.whatsapp') }}</a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ---------- Hero ---------- */
.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  align-items: end;
  overflow: hidden;
  background: var(--honey-900) url('/images/ambiance/hero-poster.webp') center / cover no-repeat;
  color: var(--cream);
  isolation: isolate;
}
.hero__media { position: absolute; inset: 0; z-index: -2; will-change: transform; }
.hero__shade {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, rgba(20, 10, 3, 0.55) 0%, rgba(20, 10, 3, 0.05) 35%, rgba(20, 10, 3, 0.35) 60%, rgba(20, 10, 3, 0.92) 100%),
    radial-gradient(80% 60% at 20% 90%, rgba(20, 10, 3, 0.6), transparent 70%);
}
.hero__content { text-shadow: 0 2px 30px rgba(20, 10, 3, 0.45); display: grid; gap: 1.5rem; padding-bottom: clamp(5rem, 4rem + 6vh, 9rem); padding-top: 8rem; }
.hero__title { font-size: var(--step-5); line-height: 0.98; letter-spacing: -0.03em; }
.hero__line { display: block; overflow: hidden; padding-bottom: 0.08em; }
.hero__line > span { display: inline-block; }
.hero .accent { color: var(--yellow); }
.hero .eyebrow { color: var(--cream); }
.hero__lead { max-width: 46ch; font-size: var(--step-1); line-height: 1.5; color: rgba(251, 244, 230, 0.86); }
.hero__ctas { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.hero__scroll {
  position: absolute;
  right: var(--gutter);
  bottom: 2rem;
  display: none;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  writing-mode: vertical-rl;
  opacity: 0.75;
}
.hero__scroll i { width: 1px; height: 60px; background: linear-gradient(var(--cream), transparent); animation: drip 2.2s var(--ease) infinite; transform-origin: top; }
@keyframes drip {
  0% { transform: scaleY(0); }
  50% { transform: scaleY(1); }
  100% { transform: scaleY(1); opacity: 0; }
}
@media (min-width: 768px) { .hero__scroll { display: flex; } }
@media (max-width: 767px) { .hero__shade { background: linear-gradient(180deg, rgba(20, 10, 3, 0.55) 0%, rgba(20, 10, 3, 0.25) 30%, rgba(20, 10, 3, 0.7) 55%, rgba(20, 10, 3, 0.95) 100%); } }

/* ---------- Marquee ---------- */
.mq { background: var(--orange); color: var(--honey-900); overflow: hidden; padding: 1rem 0; border-block: 1px solid rgba(0, 0, 0, 0.08); }
.mq__track { display: flex; width: max-content; animation: mq 40s linear infinite; }
.mq__item { display: inline-flex; align-items: center; gap: 2rem; padding-right: 2rem; font-family: var(--font-display); font-size: clamp(1.25rem, 1rem + 1vw, 1.9rem); font-style: italic; white-space: nowrap; }
.mq__item svg { width: 16px; height: 16px; fill: var(--yellow); stroke: var(--honey-900); }
@keyframes mq { to { transform: translateX(-50%); } }

/* ---------- Manifeste ---------- */
.mf { overflow: hidden; }
.mf__video { position: absolute; inset: 0; opacity: 0.18; filter: saturate(1.3); }
.mf__video::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, var(--honey-900), transparent 30%, transparent 70%, var(--honey-900)); }
.mf__inner { position: relative; display: grid; gap: 2rem; text-align: center; justify-items: center; }
.mf__text { width: 100%; font-family: var(--font-display); font-size: clamp(1.6rem, 1.1rem + 2.4vw, 3.1rem); line-height: 1.28; letter-spacing: -0.01em; }
.mf__foot { display: grid; gap: 1.25rem; justify-items: center; }
.mf__sign { font-style: italic; color: var(--yellow); }

/* ---------- Chiffres ---------- */
.stats { position: relative; padding-block: clamp(3.5rem, 3rem + 3vw, 6rem); overflow: hidden; }
.hc { position: absolute; right: -40px; top: 50%; width: min(520px, 70vw); transform: translateY(-50%); opacity: 0.55; pointer-events: none; -webkit-mask-image: linear-gradient(to left, #000 20%, transparent 85%); mask-image: linear-gradient(to left, #000 20%, transparent 85%); }
.hc__cell { fill: var(--yellow); stroke: var(--orange); stroke-opacity: 0.35; stroke-width: 1; }
.stats__grid { position: relative; display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem 1.5rem; }
.stat { display: grid; gap: 0.25rem; padding-left: 1rem; border-left: 2px solid var(--orange); }
.stat strong { font-family: var(--font-display); font-weight: 400; font-size: var(--step-4); line-height: 1; color: var(--honey-900); }
.stat > span { font-size: 0.85rem; color: var(--ink-2); }
@media (min-width: 900px) { .stats__grid { grid-template-columns: repeat(5, 1fr); } }

/* ---------- Terroirs ---------- */
.terroir { overflow: hidden; }
.terroir__grid { display: grid; gap: 3rem; align-items: center; }
.regions { list-style: none; padding: 0; margin: 0; display: grid; }
.region { display: grid; grid-template-columns: auto 1fr; gap: 1.25rem; padding: 1.4rem 0; border-top: 1px solid var(--line-light); cursor: default; transition: padding 0.4s var(--ease); outline: none; }
.region:last-child { border-bottom: 1px solid var(--line-light); }
.region__n { font-size: 0.75rem; color: var(--yellow); letter-spacing: 0.1em; padding-top: 0.35rem; }
.region__area { font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; opacity: 0.6; }
.region__name { font-size: var(--step-2); margin: 0.2rem 0 0.4rem; transition: color 0.3s; }
.region__text { color: rgba(251, 244, 230, 0.7); max-width: 42ch; }
.region.on { padding-left: 0.75rem; }
.region.on .region__name { color: var(--yellow); }
.terroir__hq { display: inline-flex; align-items: center; gap: 0.5rem; margin-top: 1.5rem; font-size: 0.85rem; opacity: 0.75; }
.terroir__hq svg { width: 16px; height: 16px; fill: var(--orange); stroke: none; }
.terroir__map { max-width: 440px; justify-self: center; width: 100%; }
@media (min-width: 960px) { .terroir__grid { grid-template-columns: 1.1fr 0.9fr; gap: 5rem; } }

/* ---------- Zigzag ---------- */
.zz { display: grid; gap: 2rem; align-items: center; padding-block: clamp(2rem, 1rem + 4vw, 4.5rem); }
.zz + .zz { border-top: 1px solid var(--line); }
.zz__media { position: relative; display: block; aspect-ratio: 1; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-lg); }
.zz__img { width: 100%; height: 112%; object-fit: cover; margin-top: -6%; }
.zz__badge { position: absolute; top: 1.25rem; left: 1.25rem; }
.zz__body { display: grid; gap: 0.9rem; align-content: center; }
.zz__meta { font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.zz__title { font-size: var(--step-3); }
.zz__sub { font-family: var(--font-display); font-style: italic; font-size: var(--step-1); color: color-mix(in srgb, var(--accent, var(--orange)) 62%, #000); }
.zz__excerpt { color: var(--ink-2); max-width: 48ch; }
.zz__list { list-style: none; padding: 0; margin: 0.5rem 0; display: grid; }
.zz__list li { display: grid; grid-template-columns: 7.5rem 1fr; gap: 1rem; padding: 0.7rem 0; border-bottom: 1px solid var(--line); font-size: 0.95rem; }
.zz__list span { color: var(--muted); font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; padding-top: 2px; }
.zz__ctas { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem; color: var(--ink); }
.range__all { text-align: center; margin-top: 2rem; }
@media (min-width: 900px) {
  .zz { grid-template-columns: 1fr 1fr; gap: clamp(3rem, 2rem + 4vw, 6rem); }
  .zz.rev .zz__media { order: 2; }
  .zz__media { aspect-ratio: 4 / 5; }
}

/* ---------- Bienfaits ---------- */
.benefits__grid { display: grid; gap: 3rem; align-items: center; }
.benefits__media { border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 4 / 5; }
.benefits__media img { width: 100%; height: 100%; object-fit: cover; }
.benefit { display: grid; grid-template-columns: auto 1fr; gap: 1.25rem; padding: 1.5rem 0; border-top: 1px solid var(--line); }
.benefit h3 { font-size: var(--step-1); margin-bottom: 0.5rem; }
.benefit p { color: var(--ink-2); }
.benefit__ic { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--yellow); color: var(--honey-900); }
.benefit__ic svg { width: 24px; height: 24px; }
.benefits__note { margin-top: 1rem; font-size: 0.8rem; color: var(--muted); font-style: italic; }
@media (min-width: 900px) { .benefits__grid { grid-template-columns: 0.9fr 1.1fr; gap: 5rem; } }

/* ---------- Pro ---------- */
.pro { overflow: hidden; }
.pro__bg { position: absolute; inset: 0; opacity: 0.35; }
.pro__bg img { width: 100%; height: 100%; object-fit: cover; }
.pro__bg::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, var(--honey-900) 30%, rgba(30, 16, 6, 0.6)); }
.pro__inner { position: relative; display: grid; gap: 1.5rem; max-width: 760px; margin-left: max(var(--gutter), (100% - var(--maxw)) / 2); }
.pro__icons { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.pro__icons span { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; border: 1px solid var(--line-light); border-radius: 999px; font-size: 0.85rem; }
.pro__icons svg { width: 18px; height: 18px; color: var(--yellow); }

/* ---------- Blog ---------- */
.blog-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; }
.blog-head .section-head { margin-bottom: 1.5rem; }
.blog-grid { display: grid; gap: 2.5rem; }
@media (min-width: 760px) { .blog-grid { grid-template-columns: repeat(3, 1fr); gap: 2rem; } }

/* ---------- FAQ ---------- */
.faq__grid { display: grid; gap: 1rem; }
.faq__list { border-top: 1px solid var(--line); }
.faq__item { border-bottom: 1px solid var(--line); }
.faq__item h3 { font-size: inherit; }
.faq__q { display: flex; width: 100%; justify-content: space-between; align-items: center; gap: 1.5rem; padding: 1.35rem 0; border: 0; background: none; text-align: left; font-family: var(--font-display); font-size: var(--step-1); line-height: 1.3; }
.faq__plus { position: relative; flex: none; width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--line); transition: background 0.3s, border-color 0.3s; }
.faq__plus::before, .faq__plus::after { content: ''; position: absolute; left: 11px; right: 11px; top: 50%; height: 1.5px; margin-top: -0.75px; background: currentColor; transition: transform 0.4s var(--ease); }
.faq__plus::after { transform: rotate(90deg); }
.faq__item.open .faq__plus { background: var(--yellow); border-color: var(--yellow); }
.faq__item.open .faq__plus::after { transform: rotate(0); }
.faq__a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.5s var(--ease); }
.faq__a > div { overflow: hidden; }
.faq__item.open .faq__a { grid-template-rows: 1fr; }
.faq__a p { padding: 0 3.5rem 1.5rem 0; color: var(--ink-2); }
@media (min-width: 960px) { .faq__grid { grid-template-columns: 0.8fr 1.2fr; gap: 5rem; } }

/* ---------- CTA final ---------- */
.final { padding: var(--section) 0; }
.final__inner {
  display: grid;
  gap: 1rem;
  justify-items: center;
  text-align: center;
  padding: clamp(3rem, 2rem + 4vw, 5rem) var(--gutter);
  border-radius: var(--radius-lg);
  background: radial-gradient(80% 120% at 50% 0%, var(--yellow), var(--orange) 70%);
  color: var(--honey-900);
}
.final__inner p { max-width: 40ch; }
</style>
