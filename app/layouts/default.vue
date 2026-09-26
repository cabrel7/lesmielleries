<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="site">
    <a href="#main" class="skip-link">{{ t('common.skip') }}</a>
    <SiteHeader />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
    <WhatsAppFab />
  </div>
</template>
