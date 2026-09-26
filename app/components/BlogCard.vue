<script setup lang="ts">
const props = defineProps<{ post: { path: string, title: string, description: string, cover: string, date: string, category: string, readingTime?: number }, index?: number, large?: boolean }>()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const to = computed(() => localePath({ name: 'blog-slug', params: { slug: slugOf(props.post.path) } }))
</script>

<template>
  <NuxtLink :to="to" class="bc reveal" v-reveal :class="{ large }" :style="{ '--d': `${(index || 0) * 0.08}s` }">
    <div class="bc__media">
      <NuxtImg :src="post.cover" :alt="post.title" width="800" height="533" sizes="xs:90vw md:45vw lg:33vw" loading="lazy" />
      <span class="bc__cat">{{ post.category }}</span>
    </div>
    <div class="bc__body">
      <p class="bc__meta">{{ formatDate(post.date, locale) }} · {{ t('common.minRead', { n: post.readingTime || 4 }) }}</p>
      <h3 class="bc__title">{{ post.title }}</h3>
      <p class="bc__desc">{{ post.description }}</p>
    </div>
  </NuxtLink>
</template>

<style scoped>
.bc { display: grid; gap: 1.2rem; align-content: start; }
.bc__media { position: relative; aspect-ratio: 3 / 2; border-radius: var(--radius-lg); overflow: hidden; background: var(--cream-2); }
.bc__media img { width: 100%; height: 100%; object-fit: cover; transition: transform 1.2s var(--ease); }
.bc:hover .bc__media img { transform: scale(1.06); }
.bc__cat { position: absolute; top: 1rem; left: 1rem; padding: 0.3rem 0.75rem; border-radius: 999px; background: rgba(255, 251, 243, 0.92); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; }
.bc__body { display: grid; gap: 0.5rem; }
.bc__meta { font-size: 0.8rem; color: var(--muted); }
.bc__title { font-size: var(--step-1); transition: color 0.2s; }
.bc:hover .bc__title { color: var(--orange-700); }
.bc__desc { color: var(--ink-2); font-size: 0.95rem; display: -webkit-box; -webkit-line-clamp: 3; line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.large .bc__title { font-size: var(--step-2); }
@media (min-width: 900px) {
  .large { grid-template-columns: 1.2fr 1fr; align-items: center; gap: 2.5rem; }
}
</style>
