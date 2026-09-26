/**
 * v-reveal : ajoute la classe `is-in` quand l'élément entre dans l'écran.
 * Usage : <div class="reveal" v-reveal> … </div>   (délai : style="--d: .2s")
 * Sans JavaScript, le contenu reste visible (les styles ne s'appliquent qu'avec html.js).
 *
 * Important : quand Vue met à jour un `:class` dynamique (survol, focus…), il réécrit
 * l'attribut class et supprime `is-in`. Le hook `updated` le remet immédiatement,
 * avant l'affichage : l'élément ne disparaît plus.
 */
const SHOWN = 'revealed'

export default defineNuxtPlugin((nuxtApp) => {
  let io: IntersectionObserver | null = null

  const getIO = () => {
    if (io || typeof window === 'undefined') return io
    io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement
            el.dataset[SHOWN] = '1'
            el.classList.add('is-in')
            io!.unobserve(el)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    return io
  }

  const keep = (el: HTMLElement) => {
    if (el.dataset[SHOWN] && !el.classList.contains('is-in')) el.classList.add('is-in')
  }

  nuxtApp.vueApp.directive('reveal', {
    mounted(el: HTMLElement) {
      getIO()?.observe(el)
    },
    beforeUpdate: keep,
    updated: keep,
    unmounted(el: HTMLElement) {
      io?.unobserve(el)
    },
    getSSRProps() {
      return {}
    },
  })
})
