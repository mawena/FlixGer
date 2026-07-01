<script setup>
definePage({
  meta: {
    action: 'manage',
    subject: 'all',
  },
})

const orders = ref([])
const loading = ref(true)
const filterStatus = ref('pending')
const detailDialog = ref(false)
const rejectDialog = ref(false)
const selectedOrder = ref(null)
const rejecting = ref(false)
const approving = ref(false)
const rejectReason = ref('')

const headers = [
  { title: '#', key: 'id', width: '60px' },
  { title: 'Client', key: 'client' },
  { title: 'Plateforme', key: 'platform' },
  { title: 'Durée', key: 'duration' },
  { title: 'Montant', key: 'amount' },
  { title: 'Référence', key: 'reference' },
  { title: 'Statut', key: 'status' },
  { title: 'Date', key: 'date' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchOrders = async () => {
  loading.value = true
  const params = filterStatus.value ? `?status=${filterStatus.value}` : ''
  const { data } = await useApi(`/admin/orders${params}`)
  orders.value = data.value?.data || data.value || []
  loading.value = false
}

onMounted(fetchOrders)
watch(filterStatus, fetchOrders)

const openDetail = async (order) => {
  const { data } = await useApi(`/admin/orders/${order.id}`)
  selectedOrder.value = data.value
  detailDialog.value = true
}

const approveOrder = async (order) => {
  approving.value = true
  try {
    const { data, error } = await useApi(`/admin/orders/${order.id}/approve`, { method: 'POST' })
    if (error.value) {
      alert(error.value?.data?.message || 'Aucun profil disponible')
      return
    }
    detailDialog.value = false
    await fetchOrders()
  } finally {
    approving.value = false
  }
}

const openReject = (order) => {
  selectedOrder.value = order
  rejectReason.value = ''
  rejectDialog.value = true
}

const confirmReject = async () => {
  rejecting.value = true
  try {
    await useApi(`/admin/orders/${selectedOrder.value.id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reject_reason: rejectReason.value }),
    })
    rejectDialog.value = false
    detailDialog.value = false
    await fetchOrders()
  } finally {
    rejecting.value = false
  }
}

const markVerified = async (order) => {
  await useApi(`/admin/orders/${order.id}/verify`, { method: 'POST' })
  if (selectedOrder.value?.id === order.id) {
    selectedOrder.value.payment_verified = true
  }
  await fetchOrders()
}

const screenshotUrl = (order) => {
  return order?.payment_screenshot
    ? `/storage/${order.payment_screenshot}`
    : null
}

const statusColor = s => ({ pending: 'warning', approved: 'success', rejected: 'error' }[s] || 'default')
const statusLabel = s => ({ pending: 'En attente', approved: 'Validée', rejected: 'Rejetée' }[s] || s)
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold">Gestion des Commandes</h2>
        <p class="text-body-2 text-medium-emphasis">Validez les paiements et assignez les accès</p>
      </div>
      <VBtn variant="outlined" :loading="loading" @click="fetchOrders">
        <VIcon start icon="tabler-refresh" />
        Recharger
      </VBtn>
    </div>

    <!-- Status filter tabs -->
    <VTabs v-model="filterStatus" class="mb-4">
      <VTab value="pending">
        <VIcon start icon="tabler-clock" />
        En attente
      </VTab>
      <VTab value="approved">
        <VIcon start icon="tabler-circle-check" />
        Validées
      </VTab>
      <VTab value="rejected">
        <VIcon start icon="tabler-circle-x" />
        Rejetées
      </VTab>
      <VTab value="">
        <VIcon start icon="tabler-list" />
        Toutes
      </VTab>
    </VTabs>

    <VCard>
      <VDataTable
        :headers="headers"
        :items="orders"
        :loading="loading"
        loading-text="Chargement..."
        no-data-text="Aucune commande"
      >
        <template #item.client="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.user?.name }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.user?.phone }}</div>
          </div>
        </template>

        <template #item.platform="{ item }">
          {{ item.platform?.name }}
        </template>

        <template #item.duration="{ item }">
          {{ item.duration_months }} mois
        </template>

        <template #item.amount="{ item }">
          <strong>{{ item.total_amount?.toLocaleString() }} XOF</strong>
        </template>

        <template #item.reference="{ item }">
          <div class="d-flex align-center gap-1">
            <span class="text-body-2">{{ item.transaction_reference }}</span>
            <VChip
              v-if="item.payment_verified"
              color="success"
              size="x-small"
              variant="tonal"
            >
              <VIcon size="10" icon="tabler-shield-check" />
              Vérifié
            </VChip>
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip :color="statusColor(item.status)" size="small" label>
            {{ statusLabel(item.status) }}
          </VChip>
        </template>

        <template #item.date="{ item }">
          <span class="text-caption">{{ item.created_at?.split('T')[0] }}</span>
        </template>

        <template #item.actions="{ item }">
          <VBtn icon size="small" variant="text" @click="openDetail(item)">
            <VIcon icon="tabler-eye" />
          </VBtn>
          <template v-if="item.status === 'pending'">
            <VBtn icon size="small" variant="text" color="success" :loading="approving" @click="approveOrder(item)">
              <VIcon icon="tabler-circle-check" />
            </VBtn>
            <VBtn icon size="small" variant="text" color="error" @click="openReject(item)">
              <VIcon icon="tabler-circle-x" />
            </VBtn>
          </template>
        </template>
      </VDataTable>
    </VCard>

    <!-- Order Detail Dialog -->
    <VDialog v-model="detailDialog" max-width="700" scrollable>
      <VCard v-if="selectedOrder">
        <VCardTitle class="pa-4 d-flex justify-space-between">
          <span>Commande #{{ selectedOrder.id }}</span>
          <VChip :color="statusColor(selectedOrder.status)" label>{{ statusLabel(selectedOrder.status) }}</VChip>
        </VCardTitle>

        <VDivider />

        <VCardText>
          <VRow>
            <VCol cols="12" sm="6">
              <p class="text-caption font-weight-bold text-medium-emphasis mb-1">CLIENT</p>
              <p class="mb-0 font-weight-medium">{{ selectedOrder.user?.name }}</p>
              <p class="text-body-2 text-medium-emphasis">{{ selectedOrder.user?.email }}</p>
              <p class="text-body-2 text-medium-emphasis">{{ selectedOrder.user?.phone }}</p>
            </VCol>
            <VCol cols="12" sm="6">
              <p class="text-caption font-weight-bold text-medium-emphasis mb-1">COMMANDE</p>
              <p class="mb-1"><strong>{{ selectedOrder.platform?.name }}</strong> – {{ selectedOrder.duration_months }} mois</p>
              <p class="mb-1 text-success font-weight-bold">{{ selectedOrder.total_amount?.toLocaleString() }} XOF</p>
              <p class="text-caption mb-0">Réf: {{ selectedOrder.transaction_reference }}</p>
            </VCol>
          </VRow>

          <VDivider class="my-4" />

          <!-- Screenshot -->
          <p class="text-caption font-weight-bold text-medium-emphasis mb-2">REÇU T-MONEY</p>
          <div class="screenshot-container mb-4">
            <template v-if="screenshotUrl(selectedOrder)">
              <a :href="screenshotUrl(selectedOrder)" target="_blank" rel="noopener">
                <img
                  :src="screenshotUrl(selectedOrder)"
                  alt="Reçu T-Money"
                  class="screenshot-img"
                  @error="e => e.target.closest('a').innerHTML = '<span class=\'text-caption text-medium-emphasis\'>Impossible de charger l\'image</span>'"
                >
              </a>
              <p class="text-caption text-medium-emphasis mt-1">
                <VIcon icon="tabler-external-link" size="12" class="me-1" />
                Cliquez sur l'image pour l'agrandir
              </p>
            </template>
            <VAlert v-else type="warning" variant="tonal" density="compact">
              Aucune capture d'écran disponible
            </VAlert>
            <div class="d-flex gap-2 mt-2">
              <VBtn
                v-if="!selectedOrder.payment_verified"
                color="success"
                size="small"
                variant="tonal"
                @click="markVerified(selectedOrder)"
              >
                <VIcon start icon="tabler-shield-check" />
                Marquer comme vérifié
              </VBtn>
              <VChip v-else color="success" size="small">
                <VIcon start icon="tabler-shield-check" />
                Paiement vérifié
              </VChip>
            </div>
          </div>

          <!-- Profile info if approved -->
          <div v-if="selectedOrder.status === 'approved' && selectedOrder.profile">
            <VDivider class="mb-4" />
            <p class="text-caption font-weight-bold text-medium-emphasis mb-2">ACCÈS ASSIGNÉ</p>
            <VCard variant="tonal" color="success" class="pa-3">
              <p class="mb-1"><strong>Email:</strong> {{ selectedOrder.profile?.master_account?.email }}</p>
              <p class="mb-1"><strong>Profil:</strong> {{ selectedOrder.profile?.profile_name }}</p>
              <p v-if="selectedOrder.profile?.pin_code" class="mb-0"><strong>PIN:</strong> {{ selectedOrder.profile?.pin_code }}</p>
            </VCard>
          </div>
        </VCardText>

        <VDivider />

        <VCardActions class="pa-4">
          <VBtn variant="outlined" @click="detailDialog = false">Fermer</VBtn>
          <VSpacer />
          <template v-if="selectedOrder.status === 'pending'">
            <VBtn color="error" variant="outlined" @click="openReject(selectedOrder)">
              <VIcon start icon="tabler-circle-x" />
              Rejeter
            </VBtn>
            <VBtn color="success" :loading="approving" @click="approveOrder(selectedOrder)">
              <VIcon start icon="tabler-circle-check" />
              Valider & Assigner
            </VBtn>
          </template>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Reject Dialog -->
    <VDialog v-model="rejectDialog" max-width="420">
      <VCard>
        <VCardTitle class="pa-4">Rejeter la commande</VCardTitle>
        <VCardText>
          <VTextarea
            v-model="rejectReason"
            label="Raison du rejet (optionnel)"
            rows="3"
            placeholder="Ex: Reçu illisible, montant incorrect..."
          />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="outlined" @click="rejectDialog = false">Annuler</VBtn>
          <VBtn color="error" :loading="rejecting" @click="confirmReject">Confirmer le rejet</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.screenshot-img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}
</style>
