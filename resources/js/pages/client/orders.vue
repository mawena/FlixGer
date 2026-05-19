<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Client',
  },
})

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

const statusConfig = {
  pending:  { color: 'warning', label: 'En attente', icon: 'tabler-clock' },
  approved: { color: 'success', label: 'Validée',    icon: 'tabler-circle-check' },
  rejected: { color: 'error',   label: 'Rejetée',    icon: 'tabler-circle-x' },
}

const platformColors = {
  Netflix: '#E50914', Spotify: '#1DB954',
  'Disney+': '#113CCF', 'Prime Video': '#00A8E1',
}
const getColor = n => platformColors[n] || '#7367F0'

const daysLeft = (endDate) => {
  if (!endDate) return null
  return Math.max(0, Math.ceil((new Date(endDate) - new Date()) / 86400000))
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center flex-wrap gap-3 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Mes abonnements</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">Historique de toutes vos commandes</p>
      </div>
      <RouterLink to="/catalog">
        <VBtn color="primary">
          <VIcon start icon="tabler-plus" />
          Nouvelle commande
        </VBtn>
      </RouterLink>
    </div>

    <VProgressCircular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-8" />

    <!-- Empty state -->
    <VCard v-else-if="orders.length === 0" class="text-center pa-10">
      <VIcon icon="tabler-shopping-cart-off" size="56" color="secondary" class="mb-3" />
      <p class="text-body-1 font-weight-medium mb-1">Aucune commande</p>
      <p class="text-body-2 text-medium-emphasis mb-4">Vous n'avez pas encore commandé d'abonnement</p>
      <RouterLink to="/catalog">
        <VBtn color="primary">
          <VIcon start icon="tabler-apps" />
          Voir le catalogue
        </VBtn>
      </RouterLink>
    </VCard>

    <!-- Orders list -->
    <div v-else>
      <VCard
        v-for="order in orders"
        :key="order.id"
        class="order-card mb-3"
      >
        <div class="order-stripe" :style="{ background: getColor(order.platform?.name) }" />

        <VCardText class="pa-4">
          <div class="d-flex justify-space-between align-start gap-3">

            <!-- Left: platform + info -->
            <div class="d-flex align-center gap-3 flex-1 min-w-0">
              <div class="order-icon" :style="{ background: getColor(order.platform?.name) + '18' }">
                <VIcon icon="tabler-device-tv" :color="getColor(order.platform?.name)" size="22" />
              </div>
              <div class="min-w-0">
                <div class="font-weight-bold">{{ order.platform?.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ order.duration_months }} mois · {{ order.total_amount?.toLocaleString() }} XOF
                </div>
                <div v-if="order.end_date" class="text-caption text-medium-emphasis">
                  Expire : {{ order.end_date }}
                  <VChip
                    v-if="order.status === 'approved' && daysLeft(order.end_date) !== null && daysLeft(order.end_date) <= 10"
                    :color="daysLeft(order.end_date) <= 3 ? 'error' : 'warning'"
                    size="x-small"
                    class="ms-1"
                    label
                  >{{ daysLeft(order.end_date) }}j</VChip>
                </div>
              </div>
            </div>

            <!-- Right: status + link -->
            <div class="d-flex flex-column align-end gap-2">
              <VChip
                :color="statusConfig[order.status]?.color"
                size="small"
                label
              >
                <VIcon start :icon="statusConfig[order.status]?.icon" size="12" />
                {{ statusConfig[order.status]?.label }}
              </VChip>

              <RouterLink :to="{ name: 'client-orders-id', params: { id: order.id } }">
                <VBtn size="x-small" variant="text" color="primary">
                  Voir détails
                  <VIcon end icon="tabler-chevron-right" size="12" />
                </VBtn>
              </RouterLink>
            </div>
          </div>

          <!-- Credentials preview for approved orders -->
          <template v-if="order.status === 'approved' && order.access">
            <VDivider class="mt-3 mb-2" />
            <div class="d-flex align-center gap-1 text-caption text-success">
              <VIcon icon="tabler-lock-open" size="13" />
              <span class="font-weight-bold">Accès disponible</span>
              <span class="text-medium-emphasis ms-1">— Profil : {{ order.access.profile_name }}</span>
            </div>
          </template>

          <!-- Ref for pending -->
          <div v-if="order.status === 'pending'" class="mt-2">
            <div class="text-caption text-medium-emphasis">
              <VIcon icon="tabler-hash" size="13" class="me-1" />
              Réf: {{ order.transaction_reference }}
            </div>
          </div>

          <!-- Reject reason -->
          <VAlert
            v-if="order.status === 'rejected' && order.reject_reason"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            {{ order.reject_reason }}
          </VAlert>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.order-card { border-radius: 12px !important; overflow: hidden; }
.order-stripe { height: 3px; }
.order-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.min-w-0 { min-width: 0; }
</style>
