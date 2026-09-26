<script setup lang="ts">
/**
 * Vidéo de fond performante :
 * - une seule source téléchargée, choisie selon l'écran et le format supporté ;
 * - chargement différé tant qu'elle n'approche pas de l'écran (sauf `eager`) ;
 * - image `poster` seule si « économie de données », 2G, animations réduites
 *   ou, avec `desktopOnly`, sur mobile.
 */
const props = defineProps<{
  poster: string
  webm?: string
  mp4: string
  mp4Mobile?: string
  eager?: boolean
  desktopOnly?: boolean
}>()

const el = ref<HTMLVideoElement | null>(null)

function pickSource(v: HTMLVideoElement) {
  const mobile = window.matchMedia('(max-width: 767px)').matches
  if (mobile && props.mp4Mobile) return props.mp4Mobile
  if (props.webm && v.canPlayType('video/webm; codecs="vp9"')) return props.webm
  return props.mp4
}

onMounted(() => {
  const v = el.value
  if (!v) return
  const nav = navigator as Navigator & { connection?: { saveData?: boolean, effectiveType?: string } }
  const saveData = nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType || '')
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = window.matchMedia('(max-width: 767px)').matches
  if (saveData || reduced || (props.desktopOnly && mobile)) return

  const start = () => {
    v.src = pickSource(v)
    v.play().catch(() => {})
  }
  if (props.eager) {
    // Laisse d'abord le navigateur afficher la page (LCP), puis lance la vidéo
    if ('requestIdleCallback' in window) (window as Window & { requestIdleCallback: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback(start, { timeout: 1200 })
    else setTimeout(start, 400)
    return
  }
  const io = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      start()
      io.disconnect()
    }
  }, { rootMargin: '100px' })
  io.observe(v)
})
</script>

<template>
  <video
    ref="el"
    class="bgv"
    :poster="poster"
    muted
    loop
    playsinline
    autoplay
    preload="none"
    aria-hidden="true"
    disablepictureinpicture
  />
</template>

<style scoped>
.bgv { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
</style>
