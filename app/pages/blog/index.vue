<script setup lang="ts">
const { t } = useI18n()
const cols = useCollections()
const { data: posts } = await useAsyncData(
  () => `blog-${cols.value.blog}`,
  () => queryCollection(cols.value.blog).order('date', 'DESC').all(),
  { watch: [cols] },
)
const cats = computed(() => ['*', ...new Set((posts.value || []).map(p => p.category))])
const active = ref('*')
const list = computed(() => (posts.value || []).filter(p => active.value === '*' || p.category === active.value))
const first = computed(() => list.value[0])
const rest = computed(() => list.value.slice(1))

const { locale } = useI18n()
usePageSeo({ title: () => t('blog.seoTitle'), description: () => t('blog.seoDesc'), image: () => `/og/${locale.value}/blog.jpg` })
useBreadcrumbLd(() => [{ name: t('nav.home'), path: locale.value === 'en' ? '/en' : '/' }, { name: t('nav.blog'), path: locale.value === 'en' ? '/en/blog' : '/blog' }])
</script>

<template>
  <div>
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow">{{ t('blog.eyebrow') }}</p>
        <h1>{{ t('blog.title') }}</h1>
        <p class="lead">{{ t('blog.lead') }}</p>
      </div>
    </section>

    <section class="section blog">
      <div class="container">
        <div class="cats" role="tablist">
          <button v-for="c in cats" :key="c" type="button" role="tab" class="cat" :class="{ on: active === c }" :aria-selected="active === c" @click="active = c">
            {{ c === '*' ? t('blog.all') : c }}
          </button>
        </div>
        <BlogCard v-if="first" :key="first.path" :post="first" large class="blog__first" />
        <div class="blog__grid">
          <BlogCard v-for="(p, i) in rest" :key="p.path" :post="p" :index="i" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.blog { padding-top: clamp(2.5rem, 2rem + 2vw, 4rem); }
.cats { display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: none; margin-bottom: 2.5rem; }
.cat { flex: none; min-height: 44px; padding: 0.5rem 1.1rem; border-radius: 999px; border: 1px solid var(--line); background: #fff; font-weight: 500; font-size: 0.92rem; transition: all 0.25s; }
.cat:hover { border-color: var(--orange); }
.cat.on { background: var(--honey-900); color: var(--cream); border-color: var(--honey-900); }
.blog__first { margin-bottom: 4rem; padding-bottom: 4rem; border-bottom: 1px solid var(--line); }
.blog__grid { display: grid; gap: 2.5rem; }
@media (min-width: 760px) { .blog__grid { grid-template-columns: repeat(3, 1fr); gap: 2rem; } }
</style>
