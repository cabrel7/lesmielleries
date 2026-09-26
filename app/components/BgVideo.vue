<script setup lang="ts">
/**
 * Vidéo de fond performante et sans « flash » :
 * - l'image `poster` est posée en fond du conteneur (= 1re image de la vidéo) ;
 * - la vidéo apparaît en fondu dès qu'elle joue réellement, puis reste affichée :
 *   l'image d'attente ne revient jamais, même à chaque boucle ;
 * - une seule source téléchargée (mobile / WebM / MP4) ;
 * - chargement différé hors écran (sauf `eager`) ;
 * - image fixe seule si « économie de données », 2G, animations réduites
 *   ou, avec `desktopOnly`, sur mobile.
 */
const props = withDefaults(defineProps<{
  poster: string
  webm?: string
  mp4: string
  mp4Mobile?: string
  eager?: boolean
  desktopOnly?: boolean
  rate?: number
}>(), { rate: 1 })

const el = ref<HTMLVideoElement | null>(null)
const playing = ref(false)

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

  // La vidéo n'est révélée qu'une fois la 1re image réellement affichée
  const reveal = () => { playing.value = true }
  v.addEventListener('playing', reveal, { once: true })

  const start = () => {
    v.src = pickSource(v)
    v.playbackRate = props.rate
    v.defaultPlaybackRate = props.rate
    v.play().catch(() => {})
  }
  if (props.eager) {
    // Laisse d'abord le navigateur afficher la page (LCP), puis lance la vidéo
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }
    if (w.requestIdleCallback) w.requestIdleCallback(start, { timeout: 1200 })
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
  <div class="bgv" :style="{ backgroundImage: `url(${poster})` }">
    <video
      ref="el"
      class="bgv__video"
      :class="{ 'is-playing': playing }"
      muted
      loop
      playsinline
      autoplay
      preload="none"
      aria-hidden="true"
      disablepictureinpicture
      disableremoteplayback
    />
  </div>
</template>

<style scoped>
.bgv { position: absolute; inset: 0; background-size: cover; background-position: center; }
.bgv__video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 1.4s cubic-bezier(0.22, 1, 0.36, 1); }
.bgv__video.is-playing { opacity: 1; }
</style>
