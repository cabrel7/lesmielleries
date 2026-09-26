<script setup lang="ts">
const { t, locale } = useI18n()
const settings = await useSettings()
usePageSeo({ title: () => t('legal.seoTitle'), description: () => t('legal.title'), noindex: true })
</script>

<template>
  <div>
    <section class="page-hero">
      <div class="container">
        <h1>{{ t('legal.title') }}</h1>
      </div>
    </section>
    <section class="section">
      <div class="container-narrow prose">
        <template v-if="locale === 'fr'">
          <h2>Éditeur du site</h2>
          <p><strong>{{ settings.companyName }}</strong><br>{{ settings.address }}, {{ settings.city }}<br>Téléphone : {{ settings.phone }}<br>E-mail : {{ settings.email }}</p>
          <p>Directeur de la publication : Jacques Georges Badjang.</p>
          <p><em>RCCM, NIU et capital social : à compléter par Les Mielleries Sarl.</em></p>
          <h2>Hébergement</h2>
          <p><em>À compléter selon l'hébergeur retenu (ex. Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis).</em></p>
          <h2>Propriété intellectuelle</h2>
          <p>L'ensemble des contenus de ce site (textes, photographies, logos, marques Les Mielleries et Antamiel) est la propriété exclusive de {{ settings.companyName }}, sauf mention contraire. Toute reproduction sans autorisation écrite préalable est interdite.</p>
          <h2>Données personnelles</h2>
          <p>Les informations saisies dans les formulaires sont transmises directement à nos équipes via WhatsApp ou e-mail, uniquement pour répondre à votre demande. Elles ne sont ni stockées sur ce site ni cédées à des tiers. Vous pouvez demander leur suppression à tout moment en écrivant à {{ settings.email }}.</p>
          <h2>Cookies</h2>
          <p>Ce site n'utilise pas de cookies publicitaires ni de traceurs tiers.</p>
        </template>
        <template v-else>
          <h2>Publisher</h2>
          <p><strong>{{ settings.companyName }}</strong><br>{{ settings.address }}, Douala, Cameroon<br>Phone: {{ settings.phone }}<br>Email: {{ settings.email }}</p>
          <p>Publication director: Jacques Georges Badjang.</p>
          <p><em>Company registration details: to be completed by Les Mielleries Sarl.</em></p>
          <h2>Hosting</h2>
          <p><em>To be completed with the chosen host.</em></p>
          <h2>Intellectual property</h2>
          <p>All content on this website (texts, photographs, logos, the Les Mielleries and Antamiel brands) is the exclusive property of {{ settings.companyName }} unless otherwise stated. Any reproduction without prior written consent is prohibited.</p>
          <h2>Personal data</h2>
          <p>Information entered in forms is sent directly to our team via WhatsApp or email, solely to answer your request. It is neither stored on this website nor shared with third parties. You may request its deletion at any time by writing to {{ settings.email }}.</p>
          <h2>Cookies</h2>
          <p>This website uses no advertising cookies or third-party trackers.</p>
        </template>
      </div>
    </section>
  </div>
</template>
