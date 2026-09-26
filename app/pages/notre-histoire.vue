<script setup lang="ts">
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

const timeline = computed(() => (tm('story.timeline') as Record<string, unknown>[]).map(x => ({ year: rt(x.year as never), title: rt(x.title as never), text: rt(x.text as never) })))
const values = computed(() => (tm('story.values') as Record<string, unknown>[]).map(x => ({ title: rt(x.title as never), text: rt(x.text as never) })))
const regions = computed(() => (tm('home.regions') as Record<string, unknown>[]).map(x => ({ name: rt(x.name as never), area: rt(x.area as never) })))
const valueIcons = ['spoon', 'handshake', 'shield', 'leaf']

useSeoMeta({
  title: () => t('story.seoTitle'),
  description: () => t('story.seoDesc'),
  ogTitle: () => t('story.seoTitle'),
  ogDescription: () => t('story.seoDesc'),
  ogImage: '/images/ambiance/cuillere-miel.webp',
})

const line = ref<HTMLElement | null>(null)
let ctx: { revert: () => void } | null = null
onMounted(() => {
  const { $gsap, $reducedMotion } = useNuxtApp()
  if ($reducedMotion) return
  const gsap = $gsap as typeof import('gsap').gsap
  ctx = gsap.context(() => {
    gsap.fromTo('.tl__progress', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: line.value, start: 'top 70%', end: 'bottom 60%', scrub: true } })
    gsap.to('.sh__media img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.sh', start: 'top top', end: 'bottom top', scrub: true } })
  })
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div>
    <section class="page-hero sh">
      <div class="sh__media" aria-hidden="true">
        <NuxtImg src="/images/ambiance/cuillere-miel.webp" alt="" width="1600" height="1000" sizes="100vw" fetchpriority="high" />
      </div>
      <div class="container">
        <p class="eyebrow">{{ t('story.eyebrow') }}</p>
        <h1>{{ t('story.title') }}</h1>
        <p class="lead">{{ t('story.lead') }}</p>
      </div>
    </section>

    <!-- Frise -->
    <section class="section">
      <div class="container">
        <div class="section-head">
          <h2 class="h2 reveal" v-reveal>{{ t('story.timelineTitle') }}</h2>
        </div>
        <ol ref="line" class="tl">
          <span class="tl__track" aria-hidden="true"><span class="tl__progress" /></span>
          <li v-for="(s, i) in timeline" :key="s.year" class="tl__item reveal" v-reveal :style="{ '--d': `${i * 0.1}s` }">
            <span class="tl__dot" aria-hidden="true" />
            <p class="tl__year">{{ s.year }}</p>
            <div>
              <h3>{{ s.title }}</h3>
              <p>{{ s.text }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- Fournisseurs / mission -->
    <section class="section section-dark">
      <div class="container duo">
        <div class="duo__block reveal" v-reveal>
          <AppIcon name="bee" />
          <h2 class="h3">{{ t('story.suppliersTitle') }}</h2>
          <p>{{ t('story.suppliersText') }}</p>
        </div>
        <div class="duo__block reveal" v-reveal style="--d: .1s">
          <AppIcon name="factory" />
          <h2 class="h3">{{ t('story.missionTitle') }}</h2>
          <p>{{ t('story.missionText') }}</p>
        </div>
      </div>
      <div class="container map-wrap reveal" v-reveal>
        <div class="map-wrap__map"><CameroonMap /></div>
        <ul class="map-wrap__legend">
          <li v-for="r in regions" :key="r.name"><i class="sw" />{{ r.name }} · {{ r.area }}</li>
          <li><i class="sw hq" />{{ t('home.hq') }}</li>
        </ul>
      </div>
    </section>

    <!-- Valeurs -->
    <section class="section section-cream honeycomb-bg">
      <div class="container">
        <div class="section-head center">
          <p class="eyebrow reveal" v-reveal>Les Mielleries Sarl</p>
          <h2 class="h2 reveal" v-reveal>{{ t('story.valuesTitle') }}</h2>
        </div>
        <div class="values">
          <article v-for="(v, i) in values" :key="v.title" class="value reveal" v-reveal :style="{ '--d': `${i * 0.08}s` }">
            <span class="value__ic"><AppIcon :name="valueIcons[i] || 'hexagon'" /></span>
            <h3>{{ v.title }}</h3>
            <p>{{ v.text }}</p>
          </article>
        </div>
        <blockquote class="quote reveal" v-reveal>
          <p>« {{ t('story.quote') }} »</p>
        </blockquote>
        <div class="center-cta reveal" v-reveal>
          <NuxtLink :to="localePath('/produits')" class="btn btn-primary">{{ t('home.cta1') }} <AppIcon name="arrow-right" /></NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.sh__media { position: absolute; inset: 0; opacity: 0.35; }
.sh__media img { width: 100%; height: 120%; object-fit: cover; }
.sh__media::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, var(--honey-900) 25%, rgba(30, 16, 6, 0.4)); }
.sh { min-height: 70svh; display: grid; align-items: end; }

.tl { position: relative; list-style: none; margin: 0; padding: 0 0 0 2.5rem; display: grid; gap: 3rem; }
.tl__track { position: absolute; left: 7px; top: 8px; bottom: 8px; width: 2px; background: var(--line); }
.tl__progress { position: absolute; inset: 0; background: linear-gradient(var(--yellow), var(--orange)); transform-origin: top; }
.tl__item { position: relative; display: grid; gap: 0.5rem; }
.tl__dot { position: absolute; left: calc(-2.5rem + 1px); top: 0.55rem; width: 14px; height: 14px; border-radius: 50%; background: var(--ivory); border: 3px solid var(--orange); }
.tl__year { font-family: var(--font-display); font-size: var(--step-3); line-height: 1; color: var(--orange); font-style: italic; }
.tl__item h3 { font-size: var(--step-1); margin-bottom: 0.4rem; }
.tl__item p { color: var(--ink-2); max-width: 52ch; }
@media (min-width: 900px) {
  .tl__item { grid-template-columns: 19rem 1fr; gap: 2rem; align-items: baseline; }
}

.duo { display: grid; gap: 3rem; }
.duo__block { display: grid; gap: 1rem; align-content: start; }
.duo__block svg { width: 40px; height: 40px; color: var(--yellow); }
.duo__block p { color: rgba(251, 244, 230, 0.78); font-size: 1.05rem; }
@media (min-width: 900px) { .duo { grid-template-columns: 1fr 1fr; gap: 5rem; } }
.map-wrap { display: grid; gap: 2rem; align-items: center; margin-top: 4rem; padding-top: 4rem; border-top: 1px solid var(--line-light); }
.map-wrap__map { max-width: 360px; width: 100%; justify-self: center; }
.map-wrap__legend { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.9rem; }
.map-wrap__legend li { display: flex; align-items: center; gap: 0.75rem; }
.sw { width: 14px; height: 14px; border-radius: 50%; background: radial-gradient(var(--yellow), var(--orange)); flex: none; }
.sw.hq { border-radius: 3px; background: var(--orange); transform: rotate(45deg) scale(0.85); }
@media (min-width: 900px) { .map-wrap { grid-template-columns: 1fr 1fr; } }

.values { display: grid; gap: 1.25rem; }
.value { display: grid; gap: 0.75rem; align-content: start; padding: 2rem; border-radius: var(--radius-lg); background: rgba(255, 255, 255, 0.75); border: 1px solid var(--line); }
.value__ic { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: var(--yellow); }
.value__ic svg { width: 24px; height: 24px; }
.value h3 { font-size: var(--step-1); }
.value p { color: var(--ink-2); font-size: 0.95rem; }
@media (min-width: 640px) { .values { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .values { grid-template-columns: repeat(4, 1fr); } }
.quote { margin: clamp(3rem, 2rem + 4vw, 6rem) auto 0; max-width: 900px; text-align: center; }
.quote p { font-family: var(--font-display); font-style: italic; font-size: var(--step-2); line-height: 1.3; }
.center-cta { display: flex; justify-content: center; margin-top: 2.5rem; }
</style>
