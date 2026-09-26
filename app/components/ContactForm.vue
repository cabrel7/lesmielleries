<script setup lang="ts">
/**
 * Formulaire sans serveur : le message est composé puis envoyé
 * via WhatsApp (canal principal) ou via le client e-mail.
 * → Pour un envoi serveur (Resend, Brevo…), brancher /server/api/contact plus tard.
 */
const props = defineProps<{ mode: 'pro' | 'contact', presetProduct?: string }>()
const { t, tm, rt } = useI18n()
const settings = await useSettings()
const cols = useCollections()
const { data: products } = await useAsyncData(
  () => `form-products-${cols.value.products}`,
  () => queryCollection(cols.value.products).order('order', 'ASC').select('title').all(),
  { watch: [cols] },
)

const subjects = computed(() => (tm('form.subjects') as unknown[]).map(s => rt(s as never)))
const f = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  country: '',
  product: props.presetProduct || '',
  volume: '',
  subject: '',
  message: '',
})
watch(() => props.presetProduct, v => v && (f.product = v))
const formEl = ref<HTMLFormElement | null>(null)

function compose() {
  const L: string[] = [props.mode === 'pro' ? `[${t('pro.formTitle')}]` : `[${f.subject || t('contact.formTitle')}]`]
  L.push(`${t('form.name')} : ${f.name}`)
  if (f.company) L.push(`${t('form.company')} : ${f.company}`)
  if (f.email) L.push(`${t('form.email')} : ${f.email}`)
  if (f.phone) L.push(`${t('form.phone')} : ${f.phone}`)
  if (f.country) L.push(`${t('form.country')} : ${f.country}`)
  if (f.product) L.push(`${t('form.product')} : ${f.product}`)
  if (f.volume) L.push(`${t('form.volume')} : ${f.volume}`)
  if (f.message) L.push('', f.message)
  return L.join('\n')
}
function valid() {
  if (!formEl.value) return false
  if (!formEl.value.checkValidity()) {
    formEl.value.reportValidity()
    return false
  }
  return true
}
function sendWa() {
  if (!valid()) return
  window.open(waLink(settings.value.whatsapp, compose()), '_blank', 'noopener')
}
function sendMail() {
  if (!valid()) return
  const subject = props.mode === 'pro' ? t('pro.formTitle') : (f.subject || t('contact.formTitle'))
  window.location.href = `mailto:${settings.value.email}?subject=${encodeURIComponent(`${subject} — ${f.name}`)}&body=${encodeURIComponent(compose())}`
}
</script>

<template>
  <form ref="formEl" class="cf" novalidate @submit.prevent="sendWa">
    <div class="cf__grid">
      <label class="fld">
        <span>{{ t('form.name') }} *</span>
        <input v-model="f.name" type="text" name="name" autocomplete="name" required>
      </label>
      <label v-if="mode === 'pro'" class="fld">
        <span>{{ t('form.company') }} *</span>
        <input v-model="f.company" type="text" name="company" autocomplete="organization" required>
      </label>
      <label v-else class="fld">
        <span>{{ t('form.subject') }}</span>
        <select v-model="f.subject" name="subject">
          <option value="">{{ t('form.choose') }}</option>
          <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label class="fld">
        <span>{{ t('form.phone') }} *</span>
        <input v-model="f.phone" type="tel" name="phone" autocomplete="tel" inputmode="tel" required>
      </label>
      <label class="fld">
        <span>{{ t('form.email') }}</span>
        <input v-model="f.email" type="email" name="email" autocomplete="email">
      </label>
      <label v-if="mode === 'pro'" class="fld">
        <span>{{ t('form.country') }} *</span>
        <input v-model="f.country" type="text" name="country" autocomplete="country-name" required>
      </label>
      <label class="fld">
        <span>{{ t('form.product') }}</span>
        <select v-model="f.product" name="product">
          <option value="">{{ t('form.choose') }}</option>
          <option v-for="p in products" :key="p.title" :value="p.title">{{ p.title }}</option>
          <option :value="t('form.other')">{{ t('form.other') }}</option>
        </select>
      </label>
      <label v-if="mode === 'pro'" class="fld cf__full">
        <span>{{ t('form.volume') }}</span>
        <input v-model="f.volume" type="text" name="volume" :placeholder="t('form.volumePh')">
      </label>
      <label class="fld cf__full">
        <span>{{ t('form.message') }}{{ mode === 'contact' ? ' *' : '' }}</span>
        <textarea v-model="f.message" name="message" rows="5" :required="mode === 'contact'" />
      </label>
    </div>
    <div class="cf__actions">
      <button type="submit" class="btn btn-wa"><AppIcon name="whatsapp" />{{ t('form.sendWa') }}</button>
      <button type="button" class="btn btn-ghost" @click="sendMail"><AppIcon name="mail" />{{ t('form.sendMail') }}</button>
    </div>
    <p class="cf__note">* {{ t('form.required') }} · {{ t('form.privacy') }}</p>
  </form>
</template>

<style scoped>
.cf { display: grid; gap: 1.5rem; }
.cf__grid { display: grid; gap: 1rem; }
.fld { display: grid; gap: 0.4rem; }
.fld span { font-size: 0.8rem; font-weight: 600; letter-spacing: 0.02em; color: var(--ink-2); }
.fld input, .fld select, .fld textarea {
  width: 100%;
  min-height: 52px;
  padding: 0.8rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #fff;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  -webkit-appearance: none;
  appearance: none;
}
.fld select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%238a735d' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 18px; padding-right: 2.75rem; }
.fld textarea { resize: vertical; min-height: 130px; }
.fld input:focus, .fld select:focus, .fld textarea:focus { outline: none; border-color: var(--orange); box-shadow: 0 0 0 4px rgba(242, 138, 33, 0.15); }
.cf__actions { display: grid; gap: 0.75rem; }
.cf__note { font-size: 0.78rem; color: var(--muted); }
@media (min-width: 640px) {
  .cf__grid { grid-template-columns: 1fr 1fr; }
  .cf__full { grid-column: 1 / -1; }
  .cf__actions { grid-template-columns: auto auto; justify-content: start; }
}
</style>
