<script setup lang="ts">
const props = defineProps<{
  product: { path: string, title: string, subtitle?: string, summary: string, cover: string, kind?: string, region?: string, badge?: string, accent?: string }
  index?: number
}>()
const localePath = useLocalePath()
const { t } = useI18n()
const to = computed(() => localePath({ name: 'produits-slug', params: { slug: slugOf(props.product.path) } }))

// Légère inclinaison 3D au survol (desktop uniquement)
function onMove(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  if (e.pointerType !== 'mouse' || !el) return
  const r = el.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width - 0.5
  const y = (e.clientY - r.top) / r.height - 0.5
  el.style.setProperty('--rx', `${-y * 6}deg`)
  el.style.setProperty('--ry', `${x * 8}deg`)
}
function onLeave(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement
  el?.style.setProperty('--rx', '0deg')
  el?.style.setProperty('--ry', '0deg')
}
</script>

<template>
  <NuxtLink :to="to" class="pc reveal" v-reveal :style="{ '--accent': product.accent || '#f28a21', '--d': `${(index || 0) % 3 * 0.08}s` }" @pointermove="onMove" @pointerleave="onLeave">
    <div class="pc__media">
      <NuxtImg :src="product.cover" :alt="product.title" width="640" height="640" sizes="xs:90vw sm:45vw lg:30vw" loading="lazy" class="pc__img" />
      <span v-if="product.badge" class="badge-igp pc__badge">{{ product.badge }}</span>
    </div>
    <div class="pc__body">
      <p class="pc__meta">{{ product.kind }}<span v-if="product.region"> · {{ product.region }}</span></p>
      <h3 class="pc__title">{{ product.title }}</h3>
      <p class="pc__excerpt">{{ product.summary }}</p>
      <span class="pc__more">{{ t('common.seeProduct') }} <AppIcon name="arrow-right" /></span>
    </div>
  </NuxtLink>
</template>

<style scoped>
.pc {
  --rx: 0deg;
  --ry: 0deg;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: #fff;
  border: 1px solid var(--line);
  overflow: hidden;
  transition: transform 1s var(--ease), box-shadow 0.5s var(--ease), border-color 0.3s, opacity 1s var(--ease);
}
.pc:hover { box-shadow: var(--shadow-lg); border-color: color-mix(in srgb, var(--accent) 40%, transparent); }
.pc__media { position: relative; aspect-ratio: 1; overflow: hidden; background: var(--cream); }
.pc__img { transform: perspective(800px) rotateX(var(--rx)) rotateY(var(--ry)) scale(1.02); }
.pc__media::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 4px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.6s var(--ease);
}
.pc:hover .pc__media::after { transform: scaleX(1); }
.pc__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s var(--ease); }
.pc:hover .pc__img { transform: perspective(800px) rotateX(var(--rx)) rotateY(var(--ry)) scale(1.08); }
.pc__badge { position: absolute; top: 1rem; left: 1rem; }
.pc__body { display: grid; gap: 0.5rem; padding: 1.4rem 1.4rem 1.6rem; flex: 1; align-content: start; }
.pc__meta { font-size: 0.75rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.pc__title { font-size: var(--step-2); }
.pc__excerpt { font-size: 0.95rem; color: var(--ink-2); line-height: 1.55; }
.pc__more { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: 0.6rem; font-weight: 600; font-size: 0.9rem; color: var(--orange-700); }
.pc__more svg { width: 16px; height: 16px; transition: transform 0.3s var(--ease); }
.pc:hover .pc__more svg { transform: translateX(4px); }
</style>
