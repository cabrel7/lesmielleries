<script setup lang="ts">
const { t } = useI18n()
const settings = await useSettings()
const wa = computed(() => waLink(settings.value.whatsapp, t('wa.generic')))

const { locale } = useI18n()
usePageSeo({ title: () => t('contact.seoTitle'), description: () => t('contact.seoDesc'), image: () => `/og/${locale.value}/contact.jpg` })
useBreadcrumbLd(() => [{ name: t('nav.home'), path: locale.value === 'en' ? '/en' : '/' }, { name: t('nav.contact'), path: locale.value === 'en' ? '/en/contact' : '/contact' }])
</script>

<template>
  <div>
    <section class="page-hero">
      <div class="container">
        <p class="eyebrow">{{ t('contact.eyebrow') }}</p>
        <h1>{{ t('contact.title') }}</h1>
        <p class="lead">{{ t('contact.lead') }}</p>
      </div>
    </section>

    <section class="section">
      <div class="container ct">
        <aside class="ct__cards">
          <a :href="wa" target="_blank" rel="noopener" class="card card--wa reveal" v-reveal>
            <span class="card__ic"><AppIcon name="whatsapp" /></span>
            <span class="card__k">{{ t('contact.whatsapp') }}</span>
            <strong>{{ settings.phone }}</strong>
            <span class="card__go"><AppIcon name="arrow-right" /></span>
          </a>
          <a :href="`tel:${settings.phone.replace(/\s/g, '')}`" class="card reveal" v-reveal style="--d: .05s">
            <span class="card__ic"><AppIcon name="phone" /></span>
            <span class="card__k">{{ t('contact.phone') }}</span>
            <strong>{{ settings.phone }}</strong>
          </a>
          <a :href="`mailto:${settings.email}`" class="card reveal" v-reveal style="--d: .1s">
            <span class="card__ic"><AppIcon name="mail" /></span>
            <span class="card__k">{{ t('contact.email') }}</span>
            <strong>{{ settings.email }}</strong>
          </a>
          <div class="card reveal" v-reveal style="--d: .15s">
            <span class="card__ic"><AppIcon name="pin" /></span>
            <span class="card__k">{{ t('contact.address') }}</span>
            <strong>{{ settings.address }}, {{ settings.city }}</strong>
          </div>
          <div v-if="settings.hours" class="card reveal" v-reveal style="--d: .2s">
            <span class="card__ic"><AppIcon name="clock" /></span>
            <span class="card__k">{{ t('contact.hours') }}</span>
            <strong>{{ settings.hours }}</strong>
          </div>
        </aside>
        <div class="ct__form reveal" v-reveal>
          <h2 class="h3">{{ t('contact.formTitle') }}</h2>
          <ContactForm mode="contact" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.ct { display: grid; gap: 3rem; }
.ct__cards { display: grid; gap: 0.9rem; align-content: start; }
.card { position: relative; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 1rem; align-items: center; padding: 1.1rem 1.25rem; border-radius: var(--radius); background: #fff; border: 1px solid var(--line); transition: border-color 0.3s, transform 0.4s var(--ease), box-shadow 0.4s var(--ease); }
a.card:hover { border-color: var(--orange); transform: translateY(-2px); box-shadow: var(--shadow); }
.card__ic { grid-row: 1 / 3; display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: var(--cream-2); color: var(--orange-700); }
.card__ic svg { width: 22px; height: 22px; }
.card__k { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.card strong { font-weight: 600; overflow-wrap: anywhere; }
.card--wa { background: #1faa55; color: #fff; border-color: #1faa55; }
.card--wa .card__ic { background: rgba(255, 255, 255, 0.18); color: #fff; }
.card--wa .card__k { color: rgba(255, 255, 255, 0.8); }
.card__go { position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%); }
.card__go svg { width: 20px; height: 20px; }
.ct__form { display: grid; gap: 1.5rem; padding: clamp(1.25rem, 1rem + 2vw, 2.5rem); border-radius: var(--radius-lg); background: var(--cream); border: 1px solid var(--line); }
@media (min-width: 1000px) { .ct { grid-template-columns: 0.8fr 1.2fr; gap: 4rem; } }
</style>
