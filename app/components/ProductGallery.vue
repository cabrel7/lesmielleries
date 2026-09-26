<script setup lang="ts">
/**
 * Galerie produit multi-angles
 * - glisser (mobile) grâce au scroll-snap natif
 * - vignettes + flèches + clavier
 * - plein écran avec zoom (clic/tap = zoom ×2.2, le déplacement suit le doigt/la souris)
 */
const props = defineProps<{ images: { src: string, alt: string }[], title: string, badge?: string, pending?: boolean }>()
const { t } = useI18n()

const track = ref<HTMLElement | null>(null)
const current = ref(0)
const lightbox = ref(false)
const zoomed = ref(false)
const origin = ref('50% 50%')

function go(i: number) {
  const n = props.images.length
  current.value = (i + n) % n
  const el = track.value
  if (el) el.scrollTo({ left: el.clientWidth * current.value, behavior: 'smooth' })
}
let raf = 0
function onScroll() {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const el = track.value
    if (!el) return
    current.value = Math.round(el.scrollLeft / el.clientWidth)
  })
}
function open(i: number) {
  current.value = i
  lightbox.value = true
  zoomed.value = false
}
function close() {
  lightbox.value = false
  zoomed.value = false
  nextTick(() => go(current.value))
}
function toggleZoom(e: MouseEvent) {
  zoomed.value = !zoomed.value
  pan(e)
}
function pan(e: MouseEvent | PointerEvent) {
  if (!zoomed.value) return
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
  origin.value = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
}
function onKey(e: KeyboardEvent) {
  if (!lightbox.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') { current.value = (current.value + 1) % props.images.length; zoomed.value = false }
  if (e.key === 'ArrowLeft') { current.value = (current.value - 1 + props.images.length) % props.images.length; zoomed.value = false }
}
watch(lightbox, (v) => {
  if (!import.meta.client) return
  document.documentElement.style.overflow = v ? 'hidden' : ''
  const l = useNuxtApp().$lenis as { stop: () => void, start: () => void } | null
  if (v) l?.stop()
  else l?.start()
})
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="gal">
    <div class="gal__main">
      <div ref="track" class="gal__track" @scroll.passive="onScroll">
        <button v-for="(img, i) in images" :key="img.src" class="gal__slide" type="button" :aria-label="`${t('product.zoom')} ${i + 1}/${images.length}`" @click="open(i)">
          <NuxtImg :src="img.src" :alt="img.alt" width="1000" height="1000" sizes="xs:100vw md:55vw lg:600px" :loading="i === 0 ? 'eager' : 'lazy'" :fetchpriority="i === 0 ? 'high' : 'auto'" />
        </button>
      </div>
      <span v-if="badge" class="badge-igp gal__badge">{{ badge }}</span>
      <span class="gal__count">{{ current + 1 }} / {{ images.length }}</span>
      <span class="gal__zoom" aria-hidden="true"><AppIcon name="zoom" /></span>
      <template v-if="images.length > 1">
        <button class="gal__arrow prev" type="button" :aria-label="t('product.prev')" @click="go(current - 1)"><AppIcon name="arrow-left" /></button>
        <button class="gal__arrow next" type="button" :aria-label="t('product.next')" @click="go(current + 1)"><AppIcon name="arrow-right" /></button>
      </template>
      <p v-if="pending" class="gal__pending">{{ t('common.photoPending') }}</p>
    </div>

    <div v-if="images.length > 1" class="gal__thumbs" role="tablist">
      <button
        v-for="(img, i) in images" :key="img.src" type="button" role="tab" class="gal__thumb"
        :class="{ on: i === current }" :aria-selected="i === current" :aria-label="img.alt" @click="go(i)"
      >
        <NuxtImg :src="img.src" :alt="''" width="160" height="160" loading="lazy" />
      </button>
    </div>

    <Teleport to="body">
      <Transition name="lb">
        <div v-if="lightbox" class="lb" role="dialog" aria-modal="true" :aria-label="title" @click.self="close">
          <button class="lb__close" type="button" :aria-label="t('nav.close')" @click="close"><AppIcon name="close" /></button>
          <div class="lb__stage" :class="{ zoomed }" @click="toggleZoom" @pointermove="pan">
            <NuxtImg :key="images[current]!.src" :src="images[current]!.src" :alt="images[current]!.alt" width="1400" height="1400" sizes="100vw" :style="{ transformOrigin: origin }" />
          </div>
          <div class="lb__bar">
            <button type="button" :aria-label="t('product.prev')" @click="current = (current - 1 + images.length) % images.length; zoomed = false"><AppIcon name="arrow-left" /></button>
            <span>{{ current + 1 }} / {{ images.length }} · {{ images[current]!.alt }}</span>
            <button type="button" :aria-label="t('product.next')" @click="current = (current + 1) % images.length; zoomed = false"><AppIcon name="arrow-right" /></button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.gal { display: grid; gap: 0.9rem; }
.gal__main { position: relative; border-radius: var(--radius-lg); overflow: hidden; background: var(--cream); box-shadow: var(--shadow); }
.gal__track { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
.gal__track::-webkit-scrollbar { display: none; }
.gal__slide { flex: 0 0 100%; scroll-snap-align: center; aspect-ratio: 1; padding: 0; border: 0; background: none; cursor: zoom-in; }
.gal__slide img { width: 100%; height: 100%; object-fit: cover; }
.gal__badge { position: absolute; top: 1rem; left: 1rem; }
.gal__count { position: absolute; left: 1rem; bottom: 1rem; padding: 0.3rem 0.7rem; border-radius: 999px; background: rgba(30, 16, 6, 0.7); color: var(--cream); font-size: 0.78rem; font-variant-numeric: tabular-nums; }
.gal__zoom { position: absolute; right: 1rem; top: 1rem; display: grid; place-items: center; width: 40px; height: 40px; border-radius: 50%; background: rgba(255, 251, 243, 0.85); pointer-events: none; }
.gal__zoom svg { width: 20px; height: 20px; }
.gal__arrow { position: absolute; top: 50%; display: none; place-items: center; width: 48px; height: 48px; margin-top: -24px; border-radius: 50%; border: 0; background: rgba(255, 251, 243, 0.9); box-shadow: var(--shadow); transition: transform 0.3s var(--ease), background 0.3s; }
.gal__arrow:hover { transform: scale(1.08); background: #fff; }
.gal__arrow svg { width: 20px; height: 20px; }
.gal__arrow.prev { left: 1rem; }
.gal__arrow.next { right: 1rem; }
.gal__pending { position: absolute; left: 0; right: 0; bottom: 0; padding: 2.5rem 1rem 1rem; text-align: center; font-size: 0.8rem; color: var(--cream); background: linear-gradient(transparent, rgba(30, 16, 6, 0.75)); pointer-events: none; }
.gal__thumbs { display: flex; gap: 0.6rem; overflow-x: auto; scrollbar-width: none; padding: 2px; }
.gal__thumb { flex: 0 0 auto; width: 76px; height: 76px; padding: 0; border-radius: 14px; overflow: hidden; border: 2px solid transparent; background: var(--cream); opacity: 0.6; transition: opacity 0.3s, border-color 0.3s, transform 0.3s var(--ease); }
.gal__thumb img { width: 100%; height: 100%; object-fit: cover; }
.gal__thumb:hover { opacity: 1; }
.gal__thumb.on { opacity: 1; border-color: var(--orange); transform: translateY(-2px); }
@media (min-width: 900px) {
  .gal__arrow { display: grid; }
  .gal__thumb { width: 88px; height: 88px; }
}

/* Lightbox */
.lb { position: fixed; inset: 0; z-index: 100; display: grid; grid-template-rows: 1fr auto; background: rgba(20, 10, 3, 0.96); color: var(--cream); }
.lb__close { position: absolute; top: max(1rem, env(safe-area-inset-top)); right: 1rem; z-index: 2; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--line-light); background: rgba(255, 255, 255, 0.06); }
.lb__close svg { width: 22px; height: 22px; }
.lb__stage { display: grid; place-items: center; overflow: hidden; padding: 4rem 1rem 1rem; cursor: zoom-in; touch-action: pinch-zoom; }
.lb__stage img { max-width: min(92vw, 1100px); max-height: 78vh; width: auto; height: auto; object-fit: contain; border-radius: 12px; transition: transform 0.5s var(--ease); }
.lb__stage.zoomed { cursor: zoom-out; }
.lb__stage.zoomed img { transform: scale(2.2); }
.lb__bar { display: flex; align-items: center; justify-content: center; gap: 1.25rem; padding: 1rem 1rem calc(1rem + env(safe-area-inset-bottom)); font-size: 0.85rem; }
.lb__bar button { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--line-light); background: transparent; }
.lb__bar svg { width: 20px; height: 20px; }
.lb__bar span { max-width: 60vw; text-align: center; opacity: 0.8; }
.lb-enter-active, .lb-leave-active { transition: opacity 0.35s var(--ease); }
.lb-enter-from, .lb-leave-to { opacity: 0; }
</style>
