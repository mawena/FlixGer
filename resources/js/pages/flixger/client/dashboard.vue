<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Client',
  },
})

const userData = useCookie('userData')
const orders = ref([])
const loading = ref(true)

const fetchOrders = async () => {
  try {
    const { data } = await useApi('/client/orders')
    orders.value = data.value || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)

const activeOrders = computed(() => orders.value.filter(o => o.status === 'approved'))
const pendingOrders = computed(() => orders.value.filter(o => o.status === 'pending'))

const statusColor = (status) => {
  return { pending: 'warning', approved: 'success', rejected: 'error' }[status] || 'default'
}

const statusLabel = (status) => {
  return { pending: 'En attente', approved: 'Validée', rejected: 'Rejetée' }[status] || status
}

const daysLeft = (endDate) => {
  if (!endDate) return null
  const diff = Math.ceil((new Date(endDate) - new Date()) / 86400000)
  return diff > 0 ? diff : 0
}
</script>

<template>
  <div>
    <VRow class="mb-4">
      <VCol cols="12">
        <h2 class="text-h5 font-weight-bold">
          Bienvenue, {{ userData?.name }} 👋
        </h2>
        <p class="text-body-2 text-medium-emphasis">Gérez vos abonnements streaming</p>
      </VCol>
    </VRow>

    <!-- Stats cards -->
    <VRow class="mb-6">
      <VCol cols="6" sm="3">
        <VCard>
          <VCardText class="text-center">
            <VIcon icon="tabler-circle-check" color="success" size="36" class="mb-2" />
            <div class="text-h5 font-weight-bold">{{ activeOrders.length }}</div>
            <div class="text-caption text-medium-emphasis">Actifs</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="3">
        <VCard>
          <VCardText class="text-center">
            <VIcon icon="tabler-clock" color="warning" size="36" class="mb-2" />
            <div class="text-h5 font-weight-bold">{{ pendingOrders.length }}</div>
            <div class="text-caption text-medium-emphasis">En attente</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Active subscriptions with credentials -->
    <VCard class="mb-4">
      <VCardTitle class="pa-4 pb-0">
        <VIcon icon="tabler-device-tv" class="me-2" />
        Mes abonnements actifs
      </VCardTitle>
      <VCardText>
        <VProgressCircular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-4" />

        <div v-else-if="activeOrders.length === 0" class="text-center py-4">
          <VIcon icon="tabler-device-tv-off" size="48" color="secondary" class="mb-2" />
          <p class="text-body-2 text-medium-emphasis">Aucun abonnement actif</p>
          <RouterLink to="/flixger/catalog">
            <VBtn color="primary" size="small" class="mt-2">
              <VIcon start icon="tabler-plus" />
              Commander maintenant
            </VBtn>
          </RouterLink>
        </div>

        <div v-else>
          <VCard
            v-for="order in activeOrders"
            :key="order.id"
            variant="outlined"
            class="mb-3"
          >
            <VCardText>
              <div class="d-flex justify-space-between align-start flex-wrap gap-2">
                <div>
                  <div class="d-flex align-center gap-2 mb-2">
                    <VChip color="success" size="small" label>Actif</VChip>
                    <strong>{{ order.platform?.name }}</strong>
                  </div>
                  <p class="text-caption text-medium-emphasis mb-0">
                    Expire le {{ order.end_date }}
                    <VChip
                      v-if="daysLeft(order.end_date) !== null && daysLeft(order.end_date) <= 5"
                      color="warning"
                      size="x-small"
                      class="ms-1"
                    >
                      {{ daysLeft(order.end_date) }}j restants
                    </VChip>
                  </p>
                </div>
              </div>

              <!-- Credentials section -->
              <VDivider class="my-3" />
              <div v-if="order.access" class="credentials-box pa-3 rounded">
                <p class="text-caption font-weight-bold text-success mb-2">
                  <VIcon icon="tabler-lock-open" size="14" class="me-1" />
                  Identifiants d'accès
                </p>
                <VRow dense>
                  <VCol cols="12" sm="6">
                    <p class="text-caption text-medium-emphasis mb-0">Email du compte</p>
                    <p class="text-body-2 font-weight-medium">{{ order.access.email }}</p>
                  </VCol>
                  <VCol cols="12" sm="6">
                    <p class="text-caption text-medium-emphasis mb-0">Mot de passe</p>
                    <p class="text-body-2 font-weight-medium">{{ order.access.password }}</p>
                  </VCol>
                  <VCol cols="12" sm="6">
                    <p class="text-caption text-medium-emphasis mb-0">Profil</p>
                    <p class="text-body-2 font-weight-medium">{{ order.access.profile_name }}</p>
                  </VCol>
                  <VCol v-if="order.access.pin_code" cols="12" sm="6">
                    <p class="text-caption text-medium-emphasis mb-0">Code PIN</p>
                    <p class="text-body-2 font-weight-medium">{{ order.access.pin_code }}</p>
                  </VCol>
                </VRow>
              </div>
            </VCardText>
          </VCard>
        </div>
      </VCardText>
    </VCard>

    <!-- Pending orders -->
    <VCard v-if="pendingOrders.length > 0">
      <VCardTitle class="pa-4 pb-0">
        <VIcon icon="tabler-clock" color="warning" class="me-2" />
        Commandes en attente
      </VCardTitle>
      <VCardText>
        <VCard
          v-for="order in pendingOrders"
          :key="order.id"
          variant="tonal"
          color="warning"
          class="mb-3"
        >
          <VCardText>
            <div class="d-flex justify-space-between align-center">
              <div>
                <strong>{{ order.platform?.name }}</strong>
                <p class="text-caption mb-0">{{ order.duration_months }} mois – {{ order.total_amount?.toLocaleString() }} XOF</p>
                <p class="text-caption mb-0">Réf: {{ order.transaction_reference }}</p>
              </div>
              <VChip color="warning" size="small" label>En attente</VChip>
            </div>
          </VCardText>
        </VCard>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.credentials-box {
  background: rgba(var(--v-theme-success), 0.08);
  border: 1px solid rgba(var(--v-theme-success), 0.2);
}
</style>
