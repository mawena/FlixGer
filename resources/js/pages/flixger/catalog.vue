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

const fetchPlatforms = async () => {
  try {
    const { data } = await useApi('/platforms')
    platforms.value = data.value || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchPlatforms)

const selectPlatform = (platform) => {
  router.push({ name: 'flixger-order', query: { platform_id: platform.id } })
}

const logoFallback = (e) => {
  e.target.src = 'https://placehold.co/80x80?text=📺'
}
</script>

<template>
  <div class="catalog-wrapper">
    <!-- Header -->
    <div class="catalog-header pa-6 text-center">
      <div class="d-flex align-center justify-center gap-2 mb-2">
        <VIcon icon="tabler-device-tv" size="40" color="primary" />
        <h1 class="text-h4 font-weight-bold">FlixGer</h1>
      </div>
      <p class="text-body-1 text-medium-emphasis">Accédez à vos plateformes préférées au meilleur prix au Togo</p>
      <div class="mt-3">
        <RouterLink to="/login">
          <VBtn variant="tonal" size="small" class="me-2">Connexion</VBtn>
        </RouterLink>
        <RouterLink to="/register">
          <VBtn color="primary" size="small">Créer un compte</VBtn>
        </RouterLink>
      </div>
    </div>

    <!-- Platforms Grid -->
    <div class="platforms-section pa-4">
      <h2 class="text-h6 font-weight-bold mb-4 text-center">Nos plateformes disponibles</h2>

      <VProgressCircular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-8" />

      <VRow v-else justify="center">
        <VCol
          v-for="platform in platforms"
          :key="platform.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <VCard
            class="platform-card cursor-pointer"
            :ripple="true"
            hover
            @click="selectPlatform(platform)"
          >
            <VCardText class="text-center pa-6">
              <VAvatar size="80" rounded class="mb-4" color="surface-variant">
                <img
                  :src="platform.logo_url"
                  :alt="platform.name"
                  style="max-width: 60px; max-height: 60px; object-fit: contain;"
                  @error="logoFallback"
                >
              </VAvatar>

              <h3 class="text-h6 font-weight-bold mb-1">{{ platform.name }}</h3>

              <div class="price-badge mt-3">
                <VChip color="success" size="large" label>
                  <strong>{{ platform.price_per_month.toLocaleString() }} XOF</strong>
                  <span class="text-caption ms-1">/ mois</span>
                </VChip>
              </div>

              <div class="mt-3">
                <VChip
                  :color="platform.available_profiles > 0 ? 'info' : 'warning'"
                  size="small"
                  variant="tonal"
                >
                  <VIcon start icon="tabler-users" size="14" />
                  {{ platform.available_profiles > 0 ? `${platform.available_profiles} profil(s) dispo.` : 'Complet' }}
                </VChip>
              </div>

              <VBtn
                color="primary"
                block
                class="mt-4"
                :disabled="platform.available_profiles === 0"
              >
                <VIcon start icon="tabler-shopping-cart" />
                Commander
              </VBtn>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VAlert v-if="!loading && platforms.length === 0" type="info" class="mt-4">
        Aucune plateforme disponible pour le moment.
      </VAlert>
    </div>

    <!-- How it works -->
    <div class="how-it-works pa-6 mt-4">
      <h2 class="text-h6 font-weight-bold text-center mb-6">Comment ça marche ?</h2>
      <VRow justify="center">
        <VCol cols="12" sm="4" class="text-center">
          <VIcon icon="tabler-list-check" size="40" color="primary" class="mb-2" />
          <h4 class="font-weight-bold">1. Choisissez</h4>
          <p class="text-body-2 text-medium-emphasis">Sélectionnez la plateforme et la durée souhaitée</p>
        </VCol>
        <VCol cols="12" sm="4" class="text-center">
          <VIcon icon="tabler-transfer" size="40" color="success" class="mb-2" />
          <h4 class="font-weight-bold">2. Payez via T-Money</h4>
          <p class="text-body-2 text-medium-emphasis">Effectuez un transfert Mobile Money et soumettez le reçu</p>
        </VCol>
        <VCol cols="12" sm="4" class="text-center">
          <VIcon icon="tabler-circle-check" size="40" color="info" class="mb-2" />
          <h4 class="font-weight-bold">3. Accédez</h4>
          <p class="text-body-2 text-medium-emphasis">Recevez vos identifiants après validation (sous 24h)</p>
        </VCol>
      </VRow>
    </div>
  </div>
</template>

<style scoped>
.catalog-wrapper {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
}

.catalog-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
  color: white;
}

.catalog-header .text-medium-emphasis {
  color: rgba(255, 255, 255, 0.85) !important;
}

.platform-card {
  transition: transform 0.2s;
}

.platform-card:hover {
  transform: translateY(-4px);
}

.how-it-works {
  background: rgb(var(--v-theme-surface));
}
</style>
