<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <NuxtLayout>
    <section class="err honeycomb-bg">
      <div class="container">
        <p class="err__code">{{ error.statusCode }}</p>
        <h1 class="h2">{{ t('error.title') }}</h1>
        <p class="lead">{{ t('error.text') }}</p>
        <button class="btn btn-primary" @click="clearError({ redirect: localePath('/') })">{{ t('error.home') }}</button>
      </div>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.err { min-height: 90vh; display: grid; place-items: center; text-align: center; background-color: var(--honey-900); color: var(--cream); padding: 8rem 0 4rem; }
.err .container { display: grid; gap: 1.25rem; justify-items: center; }
.err .lead { color: rgba(251, 244, 230, 0.75); }
.err__code { font-family: var(--font-display); font-size: clamp(6rem, 20vw, 12rem); line-height: 1; color: var(--orange); font-style: italic; }
</style>
