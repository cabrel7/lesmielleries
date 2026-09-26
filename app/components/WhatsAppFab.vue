<script setup lang="ts">
const { t } = useI18n()
const settings = await useSettings()
const show = ref(false)
const href = computed(() => waLink(settings.value.whatsapp, t('wa.generic')))
function onScroll() { show.value = window.scrollY > 500 }
onMounted(() => { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }) })
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <a :href="href" target="_blank" rel="noopener" class="fab" :class="{ show }" :aria-label="t('common.whatsapp')">
    <AppIcon name="whatsapp" />
    <span class="fab__pulse" />
  </a>
</template>

<style scoped>
.fab {
  position: fixed;
  right: max(1rem, env(safe-area-inset-right));
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 40;
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: #1faa55;
  color: #fff;
  box-shadow: 0 12px 30px -8px rgba(31, 170, 85, 0.6);
  transform: scale(0) rotate(-30deg);
  transition: transform 0.5s var(--ease);
}
.fab.show { transform: none; }
.fab svg { width: 28px; height: 28px; position: relative; z-index: 1; }
.fab__pulse { position: absolute; inset: 0; border-radius: 50%; background: #1faa55; animation: pulse 2.4s infinite; }
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.6; }
  80%, 100% { transform: scale(1.7); opacity: 0; }
}
</style>
