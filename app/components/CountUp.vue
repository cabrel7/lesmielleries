<script setup lang="ts">
const props = withDefaults(defineProps<{ to: number, prefix?: string, suffix?: string, duration?: number, plain?: boolean }>(), { prefix: '', suffix: '', duration: 1.8, plain: false })
const el = ref<HTMLElement | null>(null)
const val = ref(props.plain ? props.to : 0)
const fmt = (n: number) => (props.plain ? String(Math.round(n)) : Math.round(n).toLocaleString('fr-FR'))

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { val.value = props.to; return }
  val.value = props.plain ? Math.max(0, props.to - 26) : 0
  const from = val.value
  const io = new IntersectionObserver((e) => {
    if (!e[0]?.isIntersecting) return
    io.disconnect()
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / (props.duration * 1000))
      val.value = from + (props.to - from) * (1 - Math.pow(1 - p, 4))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, { threshold: 0.4 })
  if (el.value) io.observe(el.value)
})
</script>

<template>
  <span ref="el">{{ prefix }}{{ fmt(val) }}{{ suffix }}</span>
</template>
