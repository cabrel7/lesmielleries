<script setup lang="ts">
import map from '~/assets/data/cameroon.json'

const props = defineProps<{ active?: string | null }>()
const emit = defineEmits<{ (e: 'hover', key: string | null): void }>()

type Pt = [number, number]
const P = map.pts as Record<string, Pt>
// Zones apicoles (positions projetées depuis les coordonnées réelles)
const zones = [
  { key: 'savane', label: 'Savane', pts: [P.garoua, P.ngaoundere], r: 58 },
  { key: 'montagnes', label: 'Montagnes & Forêts', pts: [P.bafoussam, P.bamenda], r: 40 },
  { key: 'oku', label: 'Oku', pts: [P.oku], r: 16 },
]
const cities = [
  { name: 'Garoua', p: P.garoua },
  { name: 'Ngaoundéré', p: P.ngaoundere },
  { name: 'Bamenda', p: P.bamenda },
  { name: 'Bafoussam', p: P.bafoussam },
]
const center = (pts: Pt[]) => [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length] as Pt
</script>

<template>
  <svg class="cm" :viewBox="`0 0 ${map.w} ${map.h}`" role="img" aria-label="Carte des régions apicoles du Cameroun">
    <defs>
      <radialGradient id="zoneGrad">
        <stop offset="0%" stop-color="#fdd800" stop-opacity="0.85" />
        <stop offset="60%" stop-color="#f28a21" stop-opacity="0.35" />
        <stop offset="100%" stop-color="#f28a21" stop-opacity="0" />
      </radialGradient>
      <pattern id="hex" width="14" height="24.25" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
        <path d="M7 16.2L0 12.1V4L7 0l7 4v8.1zM7 24.25V16.2" fill="none" stroke="#f28a21" stroke-opacity="0.22" stroke-width="0.8" />
      </pattern>
      <clipPath id="cmClip"><path :d="map.d" /></clipPath>
    </defs>

    <path :d="map.d" class="cm__land" />
    <rect :width="map.w" :height="map.h" fill="url(#hex)" clip-path="url(#cmClip)" />

    <g v-for="z in zones" :key="z.key" class="cm__zone" :class="{ on: props.active === z.key }" @mouseenter="emit('hover', z.key)" @mouseleave="emit('hover', null)">
      <circle v-for="(p, i) in z.pts" :key="i" :cx="p[0]" :cy="p[1]" :r="z.r" fill="url(#zoneGrad)" class="cm__glow" />
      <circle :cx="center(z.pts)[0]" :cy="center(z.pts)[1]" r="5" class="cm__dot" />
      <circle :cx="center(z.pts)[0]" :cy="center(z.pts)[1]" r="5" class="cm__ring" />
    </g>

    <g class="cm__cities">
      <g v-for="c in cities" :key="c.name">
        <circle :cx="c.p[0]" :cy="c.p[1]" r="1.8" />
        <text :x="c.p[0] + 7" :y="c.p[1] + 3">{{ c.name }}</text>
      </g>
    </g>

    <!-- Douala : siège -->
    <g class="cm__hq">
      <path :d="`M${P.douala[0]} ${P.douala[1] - 9}l7.8 4.5v9L${P.douala[0]} ${P.douala[1] + 9}l-7.8-4.5v-9z`" />
      <text :x="P.douala[0] + 13" :y="P.douala[1] + 4">Douala</text>
    </g>
  </svg>
</template>

<style scoped>
.cm { width: 100%; height: auto; overflow: visible; }
.cm__land { fill: rgba(251, 244, 230, 0.06); stroke: rgba(251, 244, 230, 0.45); stroke-width: 1.2; }
.cm__zone { cursor: pointer; }
.cm__glow { transform-box: fill-box; transform-origin: center; transition: transform 0.6s var(--ease), opacity 0.4s; opacity: 0.75; }
.cm__zone.on .cm__glow, .cm__zone:hover .cm__glow { transform: scale(1.18); opacity: 1; }
.cm__dot { fill: var(--yellow); }
.cm__ring { fill: none; stroke: var(--yellow); stroke-width: 1.5; transform-box: fill-box; transform-origin: center; animation: ring 2.6s var(--ease) infinite; }
@keyframes ring {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(4.5); opacity: 0; }
}
.cm__cities circle { fill: rgba(251, 244, 230, 0.7); }
.cm__cities text, .cm__hq text { fill: rgba(251, 244, 230, 0.7); font-family: var(--font-body); font-size: 11px; letter-spacing: 0.02em; }
.cm__hq path { fill: var(--orange); }
.cm__hq text { fill: var(--cream); font-weight: 600; font-size: 12px; }
</style>
