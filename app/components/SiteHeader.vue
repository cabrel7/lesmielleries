<script setup lang="ts">
const { t, locale, locales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()
const route = useRoute()
const settings = await useSettings()

const open = ref(false)
const scrolled = ref(false)
const hidden = ref(false)

// Transparent uniquement au-dessus d'un hero sombre
const overHero = computed(() => !scrolled.value && !route.meta.headerLight)

const links = computed(() => [
  { to: localePath('/'), label: t('nav.home') },
  { to: localePath('/notre-histoire'), label: t('nav.story') },
  { to: localePath('/produits'), label: t('nav.products') },
  { to: localePath('/professionnels'), label: t('nav.pro') },
  { to: localePath('/blog'), label: t('nav.blog') },
  { to: localePath('/contact'), label: t('nav.contact') },
])
const otherLocale = computed(() => (locales.value as { code: string }[]).find(l => l.code !== locale.value)!)
const wa = computed(() => waLink(settings.value.whatsapp, t('wa.generic')))

let lastY = 0
function onScroll() {
  const y = window.scrollY
  scrolled.value = y > 40
  hidden.value = y > 400 && y > lastY && !open.value
  lastY = y
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(() => route.fullPath, () => (open.value = false))
watch(open, (v) => {
  if (import.meta.client) {
    document.documentElement.style.overflow = v ? 'hidden' : ''
    const { $lenis } = useNuxtApp()
    const l = $lenis as { stop: () => void, start: () => void } | null
    if (v) l?.stop()
    else l?.start()
  }
})
function isActive(to: string) {
  const home = localePath('/')
  return to === home ? route.path === home : route.path.startsWith(to)
}
</script>

<template>
  <header class="hdr" :class="{ 'is-scrolled': scrolled, 'is-hidden': hidden, 'is-open': open, 'over-hero': overHero }">
    <div class="hdr__bar container">
      <NuxtLink :to="localePath('/')" class="hdr__logo" aria-label="Les Mielleries — accueil">
        <img src="/brand/logo.webp" alt="" width="44" height="52">
        <span class="hdr__word">Les <em>Mielleries</em></span>
      </NuxtLink>

      <nav class="hdr__nav" aria-label="Navigation principale">
        <NuxtLink v-for="l in links.slice(1)" :key="l.to" :to="l.to" class="hdr__link" :class="{ active: isActive(l.to) }">{{ l.label }}</NuxtLink>
      </nav>

      <div class="hdr__actions">
        <NuxtLink :to="switchLocalePath(otherLocale.code as 'fr' | 'en')" class="hdr__lang" :aria-label="otherLocale.code === 'en' ? 'English version' : 'Version française'">{{ otherLocale.code.toUpperCase() }}</NuxtLink>
        <a :href="wa" target="_blank" rel="noopener" class="btn btn-wa hdr__cta" :aria-label="t('common.whatsapp')">
          <AppIcon name="whatsapp" /><span>{{ t('nav.order') }}</span>
        </a>
        <button class="hdr__burger" :aria-expanded="open" aria-controls="mobile-menu" @click="open = !open">
          <span class="sr-only">{{ open ? t('nav.close') : t('nav.menu') }}</span>
          <i /><i />
        </button>
      </div>
    </div>

    <div id="mobile-menu" class="mm" :class="{ 'is-open': open }" :aria-hidden="!open">
      <div class="mm__inner container">
        <nav class="mm__nav">
          <NuxtLink v-for="(l, i) in links" :key="l.to" :to="l.to" class="mm__link" :style="{ '--i': i }" :tabindex="open ? 0 : -1">
            <span class="mm__num">0{{ i + 1 }}</span>{{ l.label }}
          </NuxtLink>
        </nav>
        <div class="mm__foot">
          <a :href="wa" target="_blank" rel="noopener" class="btn btn-wa btn-block" :tabindex="open ? 0 : -1"><AppIcon name="whatsapp" />{{ t('common.whatsapp') }}</a>
          <a :href="`tel:${settings.phone.replace(/\s/g, '')}`" class="mm__tel" :tabindex="open ? 0 : -1">{{ settings.phone }}</a>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.hdr {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  color: var(--ink);
  transition: transform 0.5s var(--ease), color 0.3s;
}
.hdr.is-hidden { transform: translateY(-110%); }
.hdr.over-hero { color: var(--cream); }
.hdr.is-open { color: var(--cream); }
.hdr__bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: var(--header-h);
  margin-top: 10px;
  padding-inline: 1rem 0.6rem;
  border-radius: 999px;
  border: 1px solid transparent;
  transition: background 0.4s, border-color 0.4s, box-shadow 0.4s, backdrop-filter 0.4s;
}
.is-scrolled:not(.is-open) .hdr__bar {
  background: rgba(255, 251, 243, 0.82);
  border-color: var(--line);
  box-shadow: 0 10px 30px -18px rgba(30, 16, 6, 0.4);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  backdrop-filter: blur(14px) saturate(160%);
}
.hdr__logo { display: flex; align-items: center; gap: 0.6rem; }
.hdr__logo img { width: 40px; height: auto; filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.18)); }
.hdr__word { font-family: var(--font-display); font-size: 1.12rem; letter-spacing: -0.01em; line-height: 1; white-space: nowrap; }
@media (min-width: 640px) { .hdr__word { font-size: 1.25rem; } }
.hdr__word em { color: var(--orange-700); }
.over-hero .hdr__word em, .is-open .hdr__word em { color: var(--yellow); }

.hdr__nav { display: none; gap: 0.25rem; }
.hdr__link {
  position: relative;
  padding: 0.5rem 0.85rem;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 999px;
  opacity: 0.85;
  transition: opacity 0.2s, background 0.2s;
}
.hdr__link:hover { opacity: 1; background: rgba(242, 138, 33, 0.12); }
.hdr__link.active { opacity: 1; }
.hdr__link.active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 2px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--orange);
  transform: translateX(-50%);
}
.hdr__actions { display: flex; align-items: center; gap: 0.5rem; }
.hdr__lang {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid currentColor;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  opacity: 0.8;
}
.hdr__lang:hover { opacity: 1; }
.hdr__cta { min-height: 44px; padding: 0.6rem 1.1rem; font-size: 0.88rem; }
.hdr__cta span { display: none; }
.hdr__burger {
  position: relative;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 0;
  background: var(--orange);
}
.hdr__burger i {
  position: absolute;
  left: 14px;
  right: 14px;
  height: 2px;
  background: #fff;
  border-radius: 2px;
  transition: transform 0.4s var(--ease), top 0.4s var(--ease);
}
.hdr__burger i:first-of-type { top: 19px; }
.hdr__burger i:last-of-type { top: 26px; right: 18px; }
.is-open .hdr__burger i:first-of-type { top: 22px; transform: rotate(45deg); }
.is-open .hdr__burger i:last-of-type { top: 22px; right: 14px; transform: rotate(-45deg); }

/* Menu mobile plein écran */
.mm {
  position: fixed;
  inset: 0;
  z-index: 1;
  background: var(--honey-900);
  color: var(--cream);
  clip-path: circle(0 at calc(100% - 44px) 46px);
  transition: clip-path 0.8s var(--ease);
  overflow-y: auto;
}
.mm.is-open { clip-path: circle(150% at calc(100% - 44px) 46px); }
.mm__inner { min-height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding-top: calc(var(--header-h) + 3rem); padding-bottom: 2rem; gap: 2rem; }
.mm__nav { display: grid; }
.mm__link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--line-light);
  font-family: var(--font-display);
  font-size: clamp(2rem, 8vw, 3rem);
  line-height: 1.1;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s var(--ease), transform 0.6s var(--ease), color 0.2s;
}
.mm.is-open .mm__link { opacity: 1; transform: none; transition-delay: calc(0.15s + var(--i) * 0.05s); }
.mm__link:hover, .mm__link.router-link-active { color: var(--yellow); }
.mm__num { font-family: var(--font-body); font-size: 0.75rem; letter-spacing: 0.1em; opacity: 0.5; }
.mm__foot { display: grid; gap: 1rem; justify-items: center; }
.mm__tel { font-size: 1.1rem; opacity: 0.8; }

@media (min-width: 640px) {
  .hdr__cta span { display: inline; }
}
@media (min-width: 1100px) {
  .hdr__nav { display: flex; }
  .hdr__burger, .mm { display: none; }
}
</style>
