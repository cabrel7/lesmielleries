/**
 * v-reveal : ajoute la classe `is-in` quand l'élément entre dans l'écran.
 * Usage : <div class="reveal" v-reveal> … </div>   (délai : style="--d: .2s")
 * Sans JavaScript, le contenu reste visible (les styles ne s'appliquent qu'avec html.js).
 */
export default defineNuxtPlugin((nuxtApp) => {
  let io: IntersectionObserver | null = null

  const getIO = () => {
    if (io || typeof window === 'undefined') return io
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io!.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    return io
  }

  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement) {
      getIO()?.observe(el)
    },
    unmounted(el: HTMLElement) {
      io?.unobserve(el)
    },
    getSSRProps() {
      return {}
    },
  })
})
