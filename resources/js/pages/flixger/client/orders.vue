<script setup>
definePage({
  meta: {
    action: 'read',
    subject: 'Client',
  },
})

const router = useRouter()
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

const statusColor = (status) => {
  return { pending: 'warning', approved: 'success', rejected: 'error' }[status] || 'default'
}

const statusLabel = (status) => {
  return { pending: 'En attente de validation', approved: 'Validée', rejected: 'Rejetée' }[status] || status
}

const headers = [
  { title: 'Plateforme', key: 'platform' },
  { title: 'Durée', key: 'duration_months' },
  { title: 'Montant', key: 'total_amount' },
  { title: 'Référence', key: 'transaction_reference' },
  { title: 'Statut', key: 'status' },
  { title: 'Date fin', key: 'end_date' },
  { title: '', key: 'actions', sortable: false },
]
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Mes abonnements</h2>
        <p class="text-body-2 text-medium-emphasis">Historique de vos commandes</p>
      </div>
      <RouterLink to="/flixger/catalog">
        <VBtn color="primary">
          <VIcon start icon="tabler-plus" />
          Nouvel abonnement
        </VBtn>
      </RouterLink>
    </div>

    <VCard>
      <VDataTable
        :headers="headers"
        :items="orders"
        :loading="loading"
        loading-text="Chargement..."
        no-data-text="Aucune commande"
        item-value="id"
      >
        <template #item.platform="{ item }">
          <span class="font-weight-medium">{{ item.platform?.name }}</span>
        </template>

        <template #item.duration_months="{ item }">
          {{ item.duration_months }} mois
        </template>

        <template #item.total_amount="{ item }">
          <strong>{{ item.total_amount?.toLocaleString() }} XOF</strong>
        </template>

        <template #item.status="{ item }">
          <VChip :color="statusColor(item.status)" size="small" label>
            {{ statusLabel(item.status) }}
          </VChip>
        </template>

        <template #item.end_date="{ item }">
          <span v-if="item.end_date">{{ item.end_date }}</span>
          <span v-else class="text-medium-emphasis">–</span>
        </template>

        <template #item.actions="{ item }">
          <RouterLink :to="{ name: 'flixger-client-orders-id', params: { id: item.id } }">
            <VBtn icon size="small" variant="text">
              <VIcon icon="tabler-eye" />
            </VBtn>
          </RouterLink>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>
