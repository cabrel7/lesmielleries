<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const settings = await useSettings()
const cols = useCollections()
const { data: products } = await useAsyncData(
  () => `footer-products-${cols.value.products}`,
  () => queryCollection(cols.value.products).order('order', 'ASC').limit(6).all(),
  { watch: [cols] },
)
const year = new Date().getFullYear()
const wa = computed(() => waLink(settings.value.whatsapp, t('wa.generic')))
</script>

<template>
  <footer class="ftr">
    <div class="ftr__quote container">
      <p class="reveal" v-reveal>{{ t('footer.quote') }}</p>
    </div>
    <div class="ftr__grid container">
      <div class="ftr__brand">
        <NuxtLink :to="localePath('/')" class="ftr__logo">
          <img src="/brand/logo.webp" alt="Les Mielleries" width="56" height="66" loading="lazy">
        </NuxtLink>
        <p>{{ t('footer.about') }}</p>
        <a :href="wa" target="_blank" rel="noopener" class="btn btn-wa"><AppIcon name="whatsapp" />{{ t('common.whatsappShort') }}</a>
      </div>
      <div>
        <h3 class="ftr__h">{{ t('footer.explore') }}</h3>
        <ul>
          <li><NuxtLink :to="localePath('/notre-histoire')">{{ t('nav.story') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/produits')">{{ t('nav.products') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/professionnels')">{{ t('nav.pro') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/blog')">{{ t('nav.blog') }}</NuxtLink></li>
          <li><NuxtLink :to="localePath('/contact')">{{ t('nav.contact') }}</NuxtLink></li>
        </ul>
      </div>
      <div>
        <h3 class="ftr__h">{{ t('footer.products') }}</h3>
        <ul>
          <li v-for="p in products" :key="p.path">
            <NuxtLink :to="localePath({ name: 'produits-slug', params: { slug: slugOf(p.path) } })">{{ p.title }}</NuxtLink>
          </li>
        </ul>
      </div>
      <div>
        <h3 class="ftr__h">{{ t('footer.contact') }}</h3>
        <ul class="ftr__contact">
          <li><AppIcon name="phone" /><a :href="`tel:${settings.phone.replace(/\s/g, '')}`">{{ settings.phone }}</a></li>
          <li><AppIcon name="mail" /><a :href="`mailto:${settings.email}`">{{ settings.email }}</a></li>
          <li><AppIcon name="pin" /><span>{{ settings.address }}<br>{{ settings.city }}</span></li>
        </ul>
      </div>
    </div>
    <div class="ftr__bottom container">
      <span>© {{ year }} {{ settings.companyName }}. {{ t('footer.rights') }}</span>
      <NuxtLink :to="localePath('/mentions-legales')">{{ t('footer.legal') }}</NuxtLink>
      <span>{{ t('footer.made') }}</span>
    </div>
  </footer>
</template>

<style scoped>
.ftr {
  position: relative;
  background: var(--honey-950);
  color: rgba(251, 244, 230, 0.75);
  padding-top: clamp(4rem, 3rem + 5vw, 8rem);
  overflow: hidden;
}
.ftr::before {
  content: '';
  position: absolute;
  inset: auto -20% -40% -20%;
  height: 70%;
  background: radial-gradient(50% 50% at 50% 50%, rgba(242, 138, 33, 0.22), transparent 70%);
  pointer-events: none;
}
.ftr__quote p {
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--step-4);
  color: var(--cream);
  text-align: center;
  line-height: 1.1;
}
.ftr__grid {
  position: relative;
  display: grid;
  gap: 2.5rem;
  grid-template-columns: 1fr;
  margin-top: clamp(3rem, 2rem + 4vw, 6rem);
  padding-bottom: 3rem;
  border-bottom: 1px solid var(--line-light);
}
.ftr__brand { display: grid; gap: 1.25rem; justify-items: start; max-width: 34ch; }
.ftr__logo img { width: 56px; }
.ftr__h { font-family: var(--font-body); font-size: 0.75rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--yellow); margin-bottom: 1rem; font-weight: 600; }
ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.65rem; }
ul a { transition: color 0.2s; }
ul a:hover { color: var(--yellow); }
.ftr__contact li { display: flex; gap: 0.7rem; align-items: flex-start; }
.ftr__contact svg { width: 18px; height: 18px; flex: none; margin-top: 4px; color: var(--orange); }
.ftr__bottom {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  justify-content: space-between;
  padding-block: 1.75rem calc(1.75rem + env(safe-area-inset-bottom));
  font-size: 0.82rem;
  opacity: 0.7;
}
.ftr__bottom a:hover { color: var(--yellow); }
@media (min-width: 720px) {
  .ftr__grid { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 1024px) {
  .ftr__grid { grid-template-columns: 1.4fr 1fr 1fr 1.2fr; }
}
</style>
