<script setup lang="ts">
const props = defineProps<{ name: string }>()

const paths: Record<string, string> = {
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  'arrow-down': '<path d="M12 5v14M6 13l6 6 6-6"/>',
  'menu': '<path d="M4 7h16M4 12h16M4 17h10"/>',
  'close': '<path d="M6 6l12 12M18 6L6 18"/>',
  'phone': '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  'mail': '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  'pin': '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  'clock': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  'leaf': '<path d="M5 19c0-8 5-13 15-14-1 10-6 15-14 15"/><path d="M5 19l8-8"/>',
  'drop': '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  'hexagon': '<path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z"/>',
  'check': '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  'zoom': '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5M11 8v6M8 11h6"/>',
  'globe': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  'truck': '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
  'factory': '<path d="M3 20V10l6 3V10l6 3V6h6v14z"/><path d="M7 16h2M12 16h2M17 16h2"/>',
  'shield': '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-4.5"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  'mountain': '<path d="M2 20l7-12 4 6 3-4 6 10z"/>',
  'handshake': '<path d="M3 11l4-4 4 2 3-2 4 1 3 3"/><path d="M3 11l6 6c1 1 2 1 3 0l1-1M21 11l-6 6M9 13l2 2M11 11l3 3"/>',
  'spoon': '<path d="M14.5 3.5a4 4 0 0 1 0 6 4 4 0 0 1-5.2.6L4 15.4a1.4 1.4 0 0 0 2 2l5.3-5.3a4 4 0 0 1 .6-5.2 4 4 0 0 1 2.6-3.4z"/>',
  'bee': '<ellipse cx="12" cy="14" rx="4.5" ry="6"/><path d="M7.8 12h8.4M7.6 15.5h8.8M9 7.5C6 3 3 5 5 8s4 2 4 2M15 7.5c3-4.5 6-2.5 4 .5s-4 2-4 2"/>',
  'sparkle': '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  'box': '<path d="M3 7.5L12 3l9 4.5v9L12 21l-9-4.5z"/><path d="M3 7.5l9 4.5 9-4.5M12 12v9"/>',
  'whatsapp': '',
}
const d = computed(() => paths[props.name] ?? '')
</script>

<template>
  <svg v-if="name === 'whatsapp'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm0-21.6A11.8 11.8 0 0 0 1.8 17.9L.1 24l6.3-1.7A11.8 11.8 0 1 0 12 .2z" />
  </svg>
  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="d" />
</template>
