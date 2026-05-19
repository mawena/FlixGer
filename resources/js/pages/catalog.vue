<script setup>
definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const router = useRouter()
const platforms = ref([])
const loading = ref(true)
const userData = useCookie('userData')

const fetchPlatforms = async () => {
  try {
    const { data } = await useApi('/platforms')
    platforms.value = data.value || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchPlatforms)

const order = (platform) => {
  router.push({ name: 'order', query: { platform_id: platform.id } })
}

const logoFallback = e => { e.target.style.display = 'none' }

const platformColors = {
  Netflix: '#E50914',
  Spotify: '#1DB954',
  'Disney+': '#113CCF',
  'Prime Video': '#00A8E1',
}

const getColor = name => platformColors[name] || '#7367F0'

const discountBadge = (months) => {
  if (months === 3) return '-10%'
  if (months >= 6) return '-15%'
  return null
}
</script>

<template>
  <div class="catalog-root">

    <!-- ── Navbar ── -->
    <nav class="cat-nav px-4 px-sm-6">
      <div class="d-flex align-center gap-2">
        <VIcon icon="tabler-device-tv" color="primary" size="26" />
        <span class="text-h6 font-weight-black">Flix<span class="text-primary">Ger</span></span>
      </div>
      <div class="d-flex align-center gap-2">
        <template v-if="userData">
          <RouterLink :to="userData.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'">
            <VBtn color="primary" size="small" variant="tonal">
              <VIcon start icon="tabler-layout-dashboard" size="16" />
              Mon espace
            </VBtn>
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/login">
            <VBtn size="small" variant="text">Connexion</VBtn>
          </RouterLink>
          <RouterLink to="/register">
            <VBtn color="primary" size="small">S'inscrire</VBtn>
          </RouterLink>
        </template>
      </div>
    </nav>

    <!-- ── Hero ── -->
    <section class="cat-hero">
      <div class="hero-content text-center pa-6 pa-sm-10">
        <VChip color="success" size="small" class="mb-4" label>
          <VIcon start icon="tabler-sparkles" size="14" />
          Abonnements partagés • Prix réduits
        </VChip>
        <h1 class="hero-title mb-3">
          Streaming premium<br>
          <span class="text-primary">au prix Togo</span>
        </h1>
        <p class="hero-subtitle mb-6">
          Accédez à Netflix, Spotify, Disney+ et plus encore.<br>
          Paiement simple via <strong>T-Money</strong> ou <strong>Flooz</strong>.
        </p>
        <div class="d-flex justify-center gap-3 flex-wrap">
          <a href="#platforms">
            <VBtn color="primary" size="large">
              <VIcon start icon="tabler-arrow-down" />
              Voir les offres
            </VBtn>
          </a>
          <RouterLink to="/register">
            <VBtn variant="outlined" size="large">Créer un compte</VBtn>
          </RouterLink>
        </div>

        <!-- Trust badges -->
        <div class="trust-row mt-8 d-flex justify-center flex-wrap gap-4">
          <div class="trust-item">
            <VIcon icon="tabler-shield-check" color="success" size="18" />
            <span>Paiement sécurisé</span>
          </div>
          <div class="trust-item">
            <VIcon icon="tabler-clock" color="info" size="18" />
            <span>Accès sous 24h</span>
          </div>
          <div class="trust-item">
            <VIcon icon="tabler-headset" color="warning" size="18" />
            <span>Support WhatsApp</span>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Platforms ── -->
    <section id="platforms" class="cat-section pa-4 pa-sm-8">
      <div class="section-header text-center mb-8">
        <h2 class="text-h5 font-weight-bold mb-1">Nos offres du moment</h2>
        <p class="text-body-2 text-medium-emphasis">Choisissez votre plateforme préférée</p>
      </div>

      <VProgressCircular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-10" size="48" />

      <VRow v-else justify="center" class="platform-grid">
        <VCol
          v-for="p in platforms"
          :key="p.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <VCard
            class="platform-card"
            :class="{ 'platform-card--full': p.available_profiles === 0 }"
            elevation="2"
            @click="p.available_profiles > 0 && order(p)"
          >
            <!-- Color stripe -->
            <div class="platform-stripe" :style="{ background: getColor(p.name) }" />

            <VCardText class="pa-5">
              <!-- Logo + name -->
              <div class="d-flex align-center gap-3 mb-4">
                <div class="platform-logo-wrap" :style="{ background: getColor(p.name) + '18' }">
                  <img
                    :src="p.logo_url"
                    :alt="p.name"
                    class="platform-logo"
                    @error="logoFallback"
                  >
                </div>
                <div>
                  <div class="text-h6 font-weight-bold">{{ p.name }}</div>
                  <VChip
                    :color="p.available_profiles > 0 ? 'success' : 'error'"
                    size="x-small"
                    variant="tonal"
                    label
                  >
                    {{ p.available_profiles > 0 ? `${p.available_profiles} place(s) dispo.` : 'Complet' }}
                  </VChip>
                </div>
              </div>

              <!-- Pricing -->
              <div class="pricing-row mb-4">
                <div class="main-price">
                  <span class="price-amount">{{ p.price_per_month.toLocaleString() }}</span>
                  <span class="price-currency"> XOF</span>
                  <span class="price-period">/mois</span>
                </div>
                <div class="alt-prices text-caption text-medium-emphasis mt-1">
                  <span>3 mois : {{ (p.price_per_month * 3 * 0.9).toLocaleString() }} XOF</span>
                  <span class="mx-1">·</span>
                  <span>6 mois : {{ (p.price_per_month * 6 * 0.85).toLocaleString() }} XOF</span>
                </div>
              </div>

              <VBtn
                :color="p.available_profiles > 0 ? 'primary' : 'default'"
                :disabled="p.available_profiles === 0"
                block
                :variant="p.available_profiles > 0 ? 'elevated' : 'outlined'"
              >
                <VIcon start :icon="p.available_profiles > 0 ? 'tabler-shopping-cart' : 'tabler-x'" size="16" />
                {{ p.available_profiles > 0 ? 'Commander' : 'Indisponible' }}
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VAlert v-if="!loading && platforms.length === 0" type="info" variant="tonal" class="mt-4">
        Aucune plateforme disponible pour le moment. Revenez bientôt.
      </VAlert>
    </section>

    <!-- ── How it works ── -->
    <section class="cat-section cat-section--alt pa-6 pa-sm-10">
      <div class="section-header text-center mb-8">
        <h2 class="text-h5 font-weight-bold mb-1">Comment ça marche ?</h2>
        <p class="text-body-2 text-medium-emphasis">Simple, rapide, sans abonnement bancaire</p>
      </div>

      <VRow justify="center" class="steps-row">
        <VCol cols="12" sm="4" class="text-center step-col">
          <div class="step-number">1</div>
          <div class="step-icon-wrap mb-3">
            <VIcon icon="tabler-list-check" size="32" color="primary" />
          </div>
          <h4 class="font-weight-bold mb-1">Choisissez votre offre</h4>
          <p class="text-body-2 text-medium-emphasis">Sélectionnez la plateforme et la durée (1, 3 ou 6 mois)</p>
        </VCol>

        <VCol cols="12" sm="4" class="text-center step-col">
          <div class="step-number">2</div>
          <div class="step-icon-wrap mb-3">
            <VIcon icon="tabler-device-mobile" size="32" color="success" />
          </div>
          <h4 class="font-weight-bold mb-1">Payez via T-Money</h4>
          <p class="text-body-2 text-medium-emphasis">Transférez le montant et soumettez votre reçu en photo</p>
        </VCol>

        <VCol cols="12" sm="4" class="text-center step-col">
          <div class="step-number">3</div>
          <div class="step-icon-wrap mb-3">
            <VIcon icon="tabler-key" size="32" color="info" />
          </div>
          <h4 class="font-weight-bold mb-1">Recevez vos accès</h4>
          <p class="text-body-2 text-medium-emphasis">Vos identifiants sont disponibles dans votre espace sous 24h</p>
        </VCol>
      </VRow>
    </section>

    <!-- ── FAQ ── -->
    <section class="cat-section pa-6 pa-sm-10">
      <div class="section-header text-center mb-6">
        <h2 class="text-h5 font-weight-bold">Questions fréquentes</h2>
      </div>
      <div class="faq-list mx-auto" style="max-width: 640px;">
        <VExpansionPanels variant="accordion">
          <VExpansionPanel title="C'est quoi un compte partagé ?">
            <VExpansionPanelText>
              Nous achetons des comptes Premium ou Famille et revendons les profils individuels à un prix très réduit. Chaque client a son propre profil et ses propres paramètres.
            </VExpansionPanelText>
          </VExpansionPanel>
          <VExpansionPanel title="Mon accès est-il garanti pendant toute la durée ?">
            <VExpansionPanelText>
              Oui. Si votre accès est interrompu avant la fin de votre abonnement, nous vous remplaçons immédiatement par un autre profil disponible.
            </VExpansionPanelText>
          </VExpansionPanel>
          <VExpansionPanel title="Comment payer si je n'ai pas T-Money ?">
            <VExpansionPanelText>
              Nous acceptons aussi Flooz (Moov). Contactez-nous sur WhatsApp pour le numéro de réception.
            </VExpansionPanelText>
          </VExpansionPanel>
          <VExpansionPanel title="Combien de temps pour recevoir mes identifiants ?">
            <VExpansionPanelText>
              Votre commande est vérifiée et validée dans les 24h ouvrées. En pratique, la majorité des commandes sont traitées en moins de 2h.
            </VExpansionPanelText>
          </VExpansionPanel>
        </VExpansionPanels>
      </div>
    </section>

    <!-- ── Footer ── -->
    <footer class="cat-footer pa-6 text-center">
      <div class="d-flex align-center justify-center gap-2 mb-2">
        <VIcon icon="tabler-device-tv" color="primary" size="20" />
        <span class="font-weight-bold">FlixGer</span>
      </div>
      <p class="text-caption text-medium-emphasis mb-0">
        © {{ new Date().getFullYear() }} FlixGer Togo · Tous droits réservés
      </p>
    </footer>

  </div>
</template>

<style scoped>
.catalog-root {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  font-family: inherit;
}

/* Navbar */
.cat-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  background: rgb(var(--v-theme-surface));
  border-block-end: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  backdrop-filter: blur(8px);
}

/* Hero */
.cat-hero {
  background: linear-gradient(160deg,
    rgb(var(--v-theme-primary), 0.08) 0%,
    rgb(var(--v-theme-background)) 60%
  );
  border-block-end: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.hero-title {
  font-size: clamp(1.8rem, 5vw, 2.8rem);
  font-weight: 800;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1rem;
  color: rgba(var(--v-theme-on-background), 0.7);
  max-width: 480px;
  margin-inline: auto;
}

.trust-row .trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-background), 0.65);
}

/* Sections */
.cat-section { background: rgb(var(--v-theme-background)); }
.cat-section--alt { background: rgb(var(--v-theme-surface)); }

/* Platform cards */
.platform-card {
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  border-radius: 12px !important;
  overflow: hidden;
  position: relative;
}
.platform-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important; }
.platform-card--full { opacity: 0.55; cursor: default; }
.platform-card--full:hover { transform: none; }

.platform-stripe {
  height: 4px;
  width: 100%;
}

.platform-logo-wrap {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.platform-logo {
  max-width: 36px;
  max-height: 36px;
  object-fit: contain;
}

.pricing-row .main-price { line-height: 1; }
.price-amount { font-size: 1.6rem; font-weight: 800; }
.price-currency { font-size: 0.9rem; font-weight: 600; }
.price-period { font-size: 0.8rem; color: rgba(var(--v-theme-on-surface), 0.55); }

/* Steps */
.step-col { position: relative; }
.step-number {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgb(var(--v-theme-primary));
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step-icon-wrap {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

/* Footer */
.cat-footer {
  background: rgb(var(--v-theme-surface));
  border-block-start: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
