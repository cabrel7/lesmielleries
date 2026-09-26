<script setup lang="ts">
const head = useLocaleHead({ seo: true })
useHead({
  htmlAttrs: { lang: () => head.value.htmlAttrs?.lang },
  link: () => head.value.link || [],
  meta: () => head.value.meta || [],
  script: [{ innerHTML: 'document.documentElement.classList.add("js")', tagPosition: 'head' }],
})
useSeoMeta({
  ogSiteName: 'Les Mielleries',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
