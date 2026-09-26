<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const cols = useCollections()
const route = useRoute()

const { data: products } = await useAsyncData(
  () => `products-${cols.value.products}`,
  () => queryCollection(cols.value.products).order('order', 'ASC').all(),
  { watch: [cols] },
)

type Cat = 'all' | 'miel' | 'ruche' | 'pro'
const filters: Cat[] = ['all', 'miel', 'ruche', 'pro']
const active = ref<Cat>((filters.includes(route.query.cat as Cat) ? route.query.cat : 'all') as Cat)
const list = computed(() => (products.value || []).filter(p => active.value === 'all' || p.category === active.value))
const countFor = (c: Cat) => (products.value || []).filter(p => c === 'all' || p.category === c).length

watch(active, (v) => {
  navigateTo({ query: v === 'all' ? {} : { cat: v } }, { replace: true })
})

useSeoMeta({
  title: () => t('products.seoTitle'),
  description: () => t('products.seoDesc'),
  ogTitle: () => t('products.seoTitle'),
  ogDescription: () => t('products.seoDesc'),
  ogImage: '/images/products/gamme-bouteilles.webp',
})
</script>

<template>
  <div>
    <section class="page-hero prod-hero">
      <div class="prod-hero__img">
        <NuxtImg src="/images/products/gamme-bouteilles.webp" alt="" width="900" height="900" sizes="xs:80vw md:45vw" fetchpriority="high" />
      </div>
      <div class="container">
        <p class="eyebrow">{{ t('products.eyebrow') }}</p>
        <h1>{{ t('products.title') }}</h1>
        <p class="lead">{{ t('products.lead') }}</p>
      </div>
    </section>

    <section class="section catalog">
      <div class="container">
        <div class="filters" role="tablist" :aria-label="t('products.eyebrow')">
          <button
            v-for="f in filters" :key="f" type="button" role="tab" class="filter" :class="{ on: active === f }"
            :aria-selected="active === f" @click="active = f"
          >
            {{ t(`products.filters.${f}`) }} <span>{{ countFor(f) }}</span>
          </button>
        </div>

        <TransitionGroup name="grid" tag="div" class="grid">
          <ProductCard v-for="(p, i) in list" :key="p.path" :product="p" :index="i" />
        </TransitionGroup>

        <p class="catalog__note"><AppIcon name="box" /> {{ t('products.packaging') }}</p>
      </div>
    </section>

    <section class="section-cream cta-pro">
      <div class="container cta-pro__inner">
        <div>
          <p class="eyebrow">{{ t('home.proLabel') }}</p>
          <h2 class="h3">{{ t('home.proTitle') }}</h2>
        </div>
        <NuxtLink :to="localePath('/professionnels')" class="btn btn-primary">{{ t('common.quote') }} <AppIcon name="arrow-right" /></NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.prod-hero { padding-bottom: clamp(4rem, 3rem + 5vw, 8rem); }
.prod-hero__img { position: absolute; right: -6%; bottom: -18%; width: min(620px, 70vw); opacity: 0.22; pointer-events: none; -webkit-mask-image: radial-gradient(closest-side, #000 60%, transparent); mask-image: radial-gradient(closest-side, #000 60%, transparent); }
@media (min-width: 900px) { .prod-hero__img { opacity: 0.55; right: 2%; bottom: -30%; } }
.catalog { padding-top: clamp(2.5rem, 2rem + 2vw, 4rem); }
.filters { display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: none; margin-bottom: 2.5rem; padding-bottom: 4px; }
.filter { flex: none; display: inline-flex; align-items: center; gap: 0.5rem; min-height: 44px; padding: 0.5rem 1.1rem; border-radius: 999px; border: 1px solid var(--line); background: #fff; font-weight: 500; font-size: 0.92rem; transition: background 0.3s, color 0.3s, border-color 0.3s; }
.filter span { display: grid; place-items: center; min-width: 22px; height: 22px; padding: 0 6px; border-radius: 999px; background: var(--cream-2); font-size: 0.72rem; font-weight: 700; }
.filter:hover { border-color: var(--orange); }
.filter.on { background: var(--honey-900); color: var(--cream); border-color: var(--honey-900); }
.filter.on span { background: var(--orange); color: #fff; }
.grid { display: grid; gap: 1.5rem; grid-template-columns: 1fr; }
@media (min-width: 620px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); gap: 2rem; } }
.grid-move, .grid-enter-active, .grid-leave-active { transition: all 0.5s var(--ease); }
.grid-enter-from, .grid-leave-to { opacity: 0; transform: scale(0.96); }
.grid-leave-active { position: absolute; visibility: hidden; }
.catalog__note { display: flex; align-items: center; justify-content: center; gap: 0.6rem; margin-top: 3rem; color: var(--muted); font-size: 0.92rem; text-align: center; }
.catalog__note svg { width: 20px; height: 20px; color: var(--orange); flex: none; }
.cta-pro { padding-block: clamp(3rem, 2rem + 3vw, 5rem); }
.cta-pro__inner { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.5rem; }
.cta-pro h2 { margin-top: 0.5rem; max-width: 22ch; }
</style>
