import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Défilement fluide (Lenis) + GSAP ScrollTrigger synchronisés.
 * Désactivé si l'utilisateur préfère réduire les animations.
 */
export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let lenis: Lenis | null = null
  if (!reduced) {
    lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), touchMultiplier: 1.4 })
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis!.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  const router = useRouter()
  router.afterEach((to, from) => {
    if (to.path !== from.path && !to.hash) lenis?.scrollTo(0, { immediate: true })
  })
  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })

  return { provide: { lenis, gsap, ScrollTrigger, reducedMotion: reduced } }
})
