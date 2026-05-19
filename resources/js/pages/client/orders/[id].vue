<script setup>
import { useExpiration } from '@/composables/useExpiration'

definePage({
  meta: { action: 'read', subject: 'Client' },
})

const { isExpired, expiryColor, expiryLabel } = useExpiration()

const route = useRoute()
const router = useRouter()
const order = ref(null)
const loading = ref(true)

const fetchOrder = async () => {
  try {
    const { data } = await useApi(`/client/orders/${route.params.id}`)
    order.value = data.value
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrder)

const orderExpired = computed(() =>
  order.value?.status === 'approved' && isExpired(order.value?.end_date),
)

const statusColor = (status) => {
  if (status === 'approved' && orderExpired.value) return 'error'
  return { pending: 'warning', approved: 'success', rejected: 'error' }[status] || 'default'
}

const statusLabel = (status) => {
  if (status === 'approved' && orderExpired.value) return 'Abonnement expiré'
  return { pending: 'En attente de validation', approved: 'Actif ✓', rejected: 'Rejetée ✗' }[status] || status
}
</script>

<template>
  <div>
    <div class="d-flex align-center gap-3 mb-6">
      <VBtn icon variant="text" @click="router.back()">
        <VIcon icon="tabler-arrow-left" />
      </VBtn>
      <div>
        <h2 class="text-h5 font-weight-bold">Détail commande #{{ route.params.id }}</h2>
      </div>
    </div>

    <VProgressCircular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-8" />

    <VRow v-else-if="order">
      <!-- Status card -->
      <VCol cols="12">
        <VCard :color="statusColor(order.status)" variant="tonal" class="mb-4">
          <VCardText class="d-flex align-center gap-3">
            <VIcon
              :icon="order.status === 'approved' ? 'tabler-circle-check' : order.status === 'rejected' ? 'tabler-circle-x' : 'tabler-clock'"
              size="36"
            />
            <div>
              <div class="text-h6 font-weight-bold">{{ statusLabel(order.status) }}</div>
              <div v-if="order.reject_reason" class="text-body-2">
                Raison : {{ order.reject_reason }}
              </div>
              <div v-if="order.status === 'pending'" class="text-body-2">
                Votre paiement est en cours de vérification. Délai : 24h.
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Order details -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle class="pa-4 pb-0">Détails de la commande</VCardTitle>
          <VCardText>
            <VList lines="two" density="compact">
              <VListItem>
                <template #prepend>
                  <VIcon icon="tabler-brand-netflix" />
                </template>
                <VListItemTitle>Plateforme</VListItemTitle>
                <VListItemSubtitle>{{ order.platform?.name }}</VListItemSubtitle>
              </VListItem>
              <VListItem>
                <template #prepend>
                  <VIcon icon="tabler-calendar" />
                </template>
                <VListItemTitle>Durée</VListItemTitle>
                <VListItemSubtitle>{{ order.duration_months }} mois</VListItemSubtitle>
              </VListItem>
              <VListItem>
                <template #prepend>
                  <VIcon icon="tabler-coins" />
                </template>
                <VListItemTitle>Montant</VListItemTitle>
                <VListItemSubtitle>{{ order.total_amount?.toLocaleString() }} XOF</VListItemSubtitle>
              </VListItem>
              <VListItem>
                <template #prepend>
                  <VIcon icon="tabler-transfer" />
                </template>
                <VListItemTitle>Référence T-Money</VListItemTitle>
                <VListItemSubtitle>{{ order.transaction_reference }}</VListItemSubtitle>
              </VListItem>
              <VListItem v-if="order.start_date">
                <template #prepend>
                  <VIcon icon="tabler-calendar-event" />
                </template>
                <VListItemTitle>Période</VListItemTitle>
                <VListItemSubtitle>{{ order.start_date }} → {{ order.end_date }}</VListItemSubtitle>
              </VListItem>
            </VList>

            <!-- Expiry alert -->
            <VAlert
              v-if="order.status === 'approved' && order.end_date"
              :type="orderExpired ? 'error' : expiryColor(order.end_date) === 'warning' || expiryColor(order.end_date) === 'error' ? expiryColor(order.end_date) : null"
              variant="tonal"
              class="mt-3"
            >
              <template v-if="orderExpired">
                Cet abonnement a <strong>expiré le {{ order.end_date }}</strong>.
                <RouterLink to="/catalog" class="ms-1 font-weight-bold">Renouveler →</RouterLink>
              </template>
              <template v-else-if="expiryColor(order.end_date) !== 'success'">
                <strong>{{ expiryLabel(order.end_date) }}</strong> pour cet abonnement.
                <RouterLink to="/catalog" class="ms-1">Renouveler maintenant</RouterLink>
              </template>
            </VAlert>
          </VCardText>
        </VCard>
      </VCol>

      <!-- Access credentials (only if approved) -->
      <VCol cols="12" md="6">
        <VCard>
          <VCardTitle class="pa-4 pb-0">
            <VIcon icon="tabler-lock" class="me-2" />
            Identifiants d'accès
          </VCardTitle>
          <VCardText>
            <div v-if="order.status === 'approved' && order.access">
              <VAlert type="success" variant="tonal" class="mb-3" density="compact">
                Votre accès est actif. Gardez ces informations confidentielles.
              </VAlert>

              <VCard variant="outlined" class="pa-3">
                <div class="mb-3">
                  <p class="text-caption text-medium-emphasis mb-0">Email du compte</p>
                  <p class="text-body-1 font-weight-bold">{{ order.access.email }}</p>
                </div>
                <div class="mb-3">
                  <p class="text-caption text-medium-emphasis mb-0">Mot de passe</p>
                  <p class="text-body-1 font-weight-bold">{{ order.access.password }}</p>
                </div>
                <div class="mb-3">
                  <p class="text-caption text-medium-emphasis mb-0">Nom du profil</p>
                  <p class="text-body-1 font-weight-bold">{{ order.access.profile_name }}</p>
                </div>
                <div v-if="order.access.pin_code">
                  <p class="text-caption text-medium-emphasis mb-0">Code PIN</p>
                  <p class="text-body-1 font-weight-bold">{{ order.access.pin_code }}</p>
                </div>
              </VCard>
            </div>

            <div v-else class="text-center py-6">
              <VIcon
                :icon="order.status === 'rejected' ? 'tabler-lock-x' : 'tabler-lock'"
                size="48"
                :color="order.status === 'rejected' ? 'error' : 'warning'"
                class="mb-3"
              />
              <p class="text-body-2 text-medium-emphasis">
                {{ order.status === 'rejected'
                  ? 'Commande rejetée. Les identifiants ne sont pas disponibles.'
                  : 'Les identifiants seront disponibles après validation de votre paiement.' }}
              </p>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
