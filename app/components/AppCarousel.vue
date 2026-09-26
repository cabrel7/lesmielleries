<script setup lang="ts" generic="T">
/**
 * Carrousel léger (sans dépendance) :
 * - défilement natif avec scroll-snap (glisser au doigt sur mobile) ;
 * - glisser à la souris sur desktop ;
 * - flèches, barre de progression, clavier ;
 * - défilement automatique lent (option `autoplay`, en ms), en pause au survol / toucher / focus,
 *   désactivé si l'utilisateur préfère réduire les animations.
 */
const props = withDefaults(defineProps<{
  items: T[]
  itemKey?: (item: T, i: number) => string | number
  autoplay?: number
  label?: string
}>(), { autoplay: 0, label: 'Carrousel' })

const { t } = useI18n()
const track = ref<HTMLElement | null>(null)
const progress = ref(0)
const atStart = ref(true)
const atEnd = ref(false)
const scrollable = ref(false)

function measure() {
  const el = track.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  scrollable.value = max > 4
  progress.value = max > 0 ? el.scrollLeft / max : 1
  atStart.value = el.scrollLeft <= 4
  atEnd.value = el.scrollLeft >= max - 4
}

function step() {
  const el = track.value
  const first = el?.firstElementChild as HTMLElement | null
  if (!el || !first) return 300
  const gap = Number.parseFloat(getComputedStyle(el).columnGap || '0') || 0
  return first.offsetWidth + gap
}
function go(dir: 1 | -1) {
  const el = track.value
  if (!el) return
  if (dir === 1 && atEnd.value) return el.scrollTo({ left: 0, behavior: 'smooth' })
  if (dir === -1 && atStart.value) return el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
  el.scrollBy({ left: dir * step(), behavior: 'smooth' })
}

// ---- Glisser à la souris ----
let dragging = false
let moved = false
let startX = 0
let startLeft = 0
function onDown(e: PointerEvent) {
  if (e.pointerType !== 'mouse' || !track.value) return
  dragging = true
  moved = false
  startX = e.clientX
  startLeft = track.value.scrollLeft
  track.value.classList.add('is-drag')
}
function onMove(e: PointerEvent) {
  if (!dragging || !track.value) return
  const dx = e.clientX - startX
  if (Math.abs(dx) > 5) moved = true
  track.value.scrollLeft = startLeft - dx
}
function onUp() {
  if (!dragging || !track.value) return
  dragging = false
  track.value.classList.remove('is-drag')
}
function onClickCapture(e: MouseEvent) {
  // Empêche d'ouvrir un lien à la fin d'un glissement
  if (moved) {
    e.preventDefault()
    e.stopPropagation()
    moved = false
  }
}

// ---- Défilement automatique ----
let timer: ReturnType<typeof setInterval> | null = null
const paused = ref(false)
function startAuto() {
  if (!props.autoplay || timer) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  timer = setInterval(() => {
    if (!paused.value && scrollable.value && document.visibilityState === 'visible') go(1)
  }, props.autoplay)
}

let ro: ResizeObserver | null = null
onMounted(() => {
  measure()
  ro = new ResizeObserver(measure)
  if (track.value) ro.observe(track.value)
  startAuto()
})
onBeforeUnmount(() => {
  ro?.disconnect()
  if (timer) clearInterval(timer)
})
watch(() => props.items.length, () => nextTick(measure))
</script>

<template>
  <div
    class="car" role="region" :aria-roledescription="'carousel'" :aria-label="label"
    @mouseenter="paused = true" @mouseleave="paused = false" @focusin="paused = true" @focusout="paused = false" @touchstart.passive="paused = true"
  >
    <div
      ref="track" class="car__track" tabindex="0"
      @scroll.passive="measure" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointerleave="onUp" @click.capture="onClickCapture"
      @keydown.right.prevent="go(1)" @keydown.left.prevent="go(-1)"
    >
      <div v-for="(item, i) in items" :key="itemKey ? itemKey(item, i) : i" class="car__slide" role="group" :aria-label="`${i + 1} / ${items.length}`">
        <slot :item="item" :index="i" />
      </div>
    </div>
    <div v-if="scrollable" class="car__ctrl">
      <div class="car__bar" aria-hidden="true"><span :style="{ transform: `scaleX(${Math.max(0.08, progress)})` }" /></div>
      <div class="car__btns">
        <button type="button" class="car__btn" :aria-label="t('product.prev')" @click="go(-1)"><AppIcon name="arrow-left" /></button>
        <button type="button" class="car__btn" :aria-label="t('product.next')" @click="go(1)"><AppIcon name="arrow-right" /></button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.car { --per: 1.15; --gap: 1rem; position: relative; }
.car__track {
  display: flex;
  gap: var(--gap);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 0;
  scrollbar-width: none;
  overscroll-behavior-x: contain;
  padding: 4px 2px 1.5rem;
  margin: -4px -2px 0;
  outline: none;
  cursor: grab;
}
.car__track::-webkit-scrollbar { display: none; }
.car__track.is-drag { cursor: grabbing; scroll-snap-type: none; scroll-behavior: auto; user-select: none; }
.car__track.is-drag :deep(a), .car__track.is-drag :deep(img) { pointer-events: none; }
.car__track:focus-visible { outline: 2px solid var(--orange); outline-offset: 4px; border-radius: var(--radius); }
.car__slide { flex: 0 0 calc((100% - (var(--per) - 1) * var(--gap)) / var(--per)); scroll-snap-align: start; display: flex; }
.car__slide > :deep(*) { flex: 1; }
.car__ctrl { display: flex; align-items: center; gap: 1.5rem; margin-top: 0.5rem; }
.car__bar { position: relative; flex: 1; height: 2px; background: var(--line); border-radius: 2px; overflow: hidden; }
.car__bar span { position: absolute; inset: 0; background: linear-gradient(90deg, var(--yellow), var(--orange)); transform-origin: left; transition: transform 0.4s var(--ease); }
.car__btns { display: flex; gap: 0.5rem; }
.car__btn { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; border: 1px solid var(--line); background: #fff; transition: background 0.3s, color 0.3s, border-color 0.3s, transform 0.3s var(--ease); }
.car__btn:hover { background: var(--honey-900); color: var(--cream); border-color: var(--honey-900); transform: scale(1.05); }
.car__btn svg { width: 20px; height: 20px; }
@media (min-width: 640px) { .car { --per: 2.15; --gap: 1.5rem; } }
@media (min-width: 1024px) { .car { --per: 3; --gap: 2rem; } }
</style>
