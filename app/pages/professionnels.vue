<script setup lang="ts">
const { t, tm, rt } = useI18n()
const route = useRoute()
const offers = computed(() => (tm('pro.offers') as Record<string, unknown>[]).map(x => ({ title: rt(x.title as never), text: rt(x.text as never) })))
const sectors = computed(() => (tm('pro.sectors') as unknown[]).map(x => rt(x as never)))
const offerImgs = ['/images/products/fut-1.webp', '/images/products/cire-1.webp', '/images/products/propolis-1.webp', '/images/products/barrette-1.webp']
const preset = computed(() => (typeof route.query.produit === 'string' ? route.query.produit : ''))

const { locale } = useI18n()
usePageSeo({ title: () => t('pro.seoTitle'), description: () => t('pro.seoDesc'), image: () => `/og/${locale.value}/pro.jpg` })
useBreadcrumbLd(() => [{ name: t('nav.home'), path: locale.value === 'en' ? '/en' : '/' }, { name: t('nav.pro'), path: locale.value === 'en' ? '/en/professionals' : '/professionnels' }])
</script>

<template>
  <div>
    <section class="page-hero ph">
      <div class="ph__img" aria-hidden="true">
        <NuxtImg src="/images/products/fut-2.webp" alt="" width="1000" height="1000" sizes="xs:80vw md:50vw" fetchpriority="high" />
      </div>
      <div class="container">
        <p class="eyebrow">{{ t('pro.eyebrow') }}</p>
        <h1>{{ t('pro.title') }}</h1>
        <p class="lead">{{ t('pro.lead') }}</p>
        <div class="ph__kpis">
          <div><strong><CountUp :to="300" /> t</strong><span>{{ t('home.stats.honey') }}</span></div>
          <div><strong><CountUp :to="200" /> t</strong><span>{{ t('home.stats.wax') }}</span></div>
          <div><strong><CountUp :to="5" suffix="+" /></strong><span>{{ t('home.stats.countries') }}</span></div>
        </div>
        <div>
          <a href="#devis" class="btn btn-yellow">{{ t('common.quote') }} <AppIcon name="arrow-down" /></a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 class="h2 reveal" v-reveal>{{ t('pro.offersTitle') }}</h2>
        </div>
        <div class="offers">
          <article v-for="(o, i) in offers" :key="o.title" class="offer reveal" v-reveal :style="{ '--d': `${i * 0.08}s` }">
            <div class="offer__img"><NuxtImg :src="offerImgs[i]" :alt="o.title" width="600" height="600" sizes="xs:90vw sm:45vw lg:23vw" loading="lazy" /></div>
            <h3>{{ o.title }}</h3>
            <p>{{ o.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section-cream sectors">
      <div class="container">
        <h2 class="h3 reveal" v-reveal>{{ t('pro.sectorsTitle') }}</h2>
        <ul class="sectors__list">
          <li v-for="(s, i) in sectors" :key="s" class="reveal" v-reveal :style="{ '--d': `${i * 0.05}s` }"><AppIcon name="hexagon" />{{ s }}</li>
        </ul>
      </div>
    </section>

    <section id="devis" class="section quote">
      <div class="container quote__grid">
        <div class="quote__intro">
          <p class="eyebrow">{{ t('pro.eyebrow') }}</p>
          <h2 class="h2">{{ t('pro.formTitle') }}</h2>
          <p class="lead">{{ t('pro.formLead') }}</p>
          <ul class="quote__points">
            <li><AppIcon name="check" />{{ t('product.promise.1') }}</li>
            <li><AppIcon name="check" />{{ t('home.stats.countries') }} : 5+</li>
            <li><AppIcon name="check" />{{ t('products.packaging') }}</li>
          </ul>
        </div>
        <div class="quote__card">
          <ContactForm mode="pro" :preset-product="preset" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ph { min-height: 80svh; display: grid; align-items: end; }
.ph__img { position: absolute; right: -10%; top: 10%; width: min(700px, 80vw); opacity: 0.25; -webkit-mask-image: radial-gradient(closest-side, #000 55%, transparent); mask-image: radial-gradient(closest-side, #000 55%, transparent); }
@media (min-width: 900px) { .ph__img { opacity: 0.6; right: 0; } }
.ph__kpis { display: flex; flex-wrap: wrap; gap: 1.5rem 3rem; margin: 1rem 0; }
.ph__kpis div { display: grid; }
.ph__kpis strong { font-family: var(--font-display); font-weight: 400; font-size: var(--step-3); color: var(--yellow); line-height: 1.1; }
.ph__kpis div > span { font-size: 0.85rem; opacity: 0.75; }

.offers { display: grid; gap: 1.5rem; }
.offer { display: grid; gap: 0.75rem; align-content: start; }
.offer__img { aspect-ratio: 1; border-radius: var(--radius-lg); overflow: hidden; background: var(--cream); margin-bottom: 0.5rem; }
.offer__img img { width: 100%; height: 100%; object-fit: cover; transition: transform 1s var(--ease); }
.offer:hover .offer__img img { transform: scale(1.05); }
.offer h3 { font-size: var(--step-1); }
.offer p { color: var(--ink-2); font-size: 0.95rem; }
@media (min-width: 620px) { .offers { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .offers { grid-template-columns: repeat(4, 1fr); } }

.sectors { padding-block: clamp(3rem, 2rem + 3vw, 5rem); }
.sectors__list { list-style: none; margin: 1.5rem 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.75rem; }
.sectors__list li { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.7rem 1.2rem; border-radius: 999px; background: #fff; border: 1px solid var(--line); font-weight: 500; }
.sectors__list svg { width: 16px; height: 16px; fill: var(--yellow); stroke: var(--orange); }

.quote__grid { display: grid; gap: 3rem; }
.quote__intro { display: grid; gap: 1rem; align-content: start; }
.quote__points { list-style: none; padding: 0; margin: 1rem 0 0; display: grid; gap: 0.75rem; }
.quote__points li { display: flex; gap: 0.6rem; align-items: flex-start; color: var(--ink-2); }
.quote__points svg { width: 20px; height: 20px; color: var(--green); flex: none; margin-top: 2px; }
.quote__card { padding: clamp(1.25rem, 1rem + 2vw, 2.5rem); border-radius: var(--radius-lg); background: var(--cream); border: 1px solid var(--line); }
@media (min-width: 1000px) { .quote__grid { grid-template-columns: 0.8fr 1.2fr; gap: 5rem; } }
</style>
