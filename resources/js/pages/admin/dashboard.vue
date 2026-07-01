<script setup>
definePage({
  meta: {
    action: 'manage',
    subject: 'all',
  },
})

const stats = ref(null)
const expiringSoon = ref([])
const recentlyExpired = ref([])
const recentOrders = ref([])
const loading = ref(true)

const fetchDashboard = async () => {
  try {
    const { data } = await useApi('/admin/dashboard')
    if (data.value) {
      stats.value = data.value.stats
      expiringSoon.value = data.value.expiringSoon
      recentlyExpired.value = data.value.recentlyExpired || []
      recentOrders.value = data.value.recentOrders
    }
  } finally {
    loading.value = false
  }
}

onMounted(fetchDashboard)

const statusColor = (status) => {
  return { pending: 'warning', approved: 'success', rejected: 'error' }[status] || 'default'
}
const statusLabel = (status) => {
  return { pending: 'En attente', approved: 'Validée', rejected: 'Rejetée' }[status] || status
}
</script>

<template>
  <div>
    <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Tableau de bord</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">Vue d'ensemble de votre activité FlixGer</p>
      </div>
      <VBtn variant="outlined" :loading="loading" @click="fetchDashboard">
        <VIcon start icon="tabler-refresh" />
        Recharger
      </VBtn>
    </div>

    <VProgressCircular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-8" />

    <div v-else>
      <!-- Stats cards -->
      <VRow class="mb-6">
        <VCol cols="6" sm="4" md="2">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="tabler-users" color="primary" size="32" class="mb-2" />
              <div class="text-h5 font-weight-bold">{{ stats?.total_clients }}</div>
              <div class="text-caption text-medium-emphasis">Clients</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="6" sm="4" md="2">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="tabler-clock" color="warning" size="32" class="mb-2" />
              <div class="text-h5 font-weight-bold text-warning">{{ stats?.pending_orders }}</div>
              <div class="text-caption text-medium-emphasis">En attente</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="6" sm="4" md="2">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="tabler-circle-check" color="success" size="32" class="mb-2" />
              <div class="text-h5 font-weight-bold text-success">{{ stats?.approved_orders }}</div>
              <div class="text-caption text-medium-emphasis">Actifs</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="6" sm="4" md="2">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="tabler-user-circle" color="info" size="32" class="mb-2" />
              <div class="text-h5 font-weight-bold text-info">{{ stats?.available_profiles }}</div>
              <div class="text-caption text-medium-emphasis">Profils dispo.</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="6" sm="4" md="2">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="tabler-user-check" color="secondary" size="32" class="mb-2" />
              <div class="text-h5 font-weight-bold">{{ stats?.occupied_profiles }}</div>
              <div class="text-caption text-medium-emphasis">Profils assignés</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol v-if="stats?.expired_orders > 0" cols="6" sm="4" md="2">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="tabler-clock-x" color="error" size="32" class="mb-2" />
              <div class="text-h5 font-weight-bold text-error">{{ stats?.expired_orders }}</div>
              <div class="text-caption text-medium-emphasis">Expirés</div>
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="6" sm="4" md="2">
          <VCard>
            <VCardText class="text-center">
              <VIcon icon="tabler-coins" color="success" size="32" class="mb-2" />
              <div class="text-h5 font-weight-bold text-success">{{ stats?.monthly_revenue?.toLocaleString() }}</div>
              <div class="text-caption text-medium-emphasis">XOF ce mois</div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <VRow>
        <!-- Expiring soon + recently expired -->
        <VCol cols="12" md="5">
          <VCard class="mb-3">
            <VCardTitle class="pa-4 pb-0">
              <VIcon icon="tabler-alert-triangle" color="warning" class="me-2" />
              Expiration dans 48h
              <VChip v-if="expiringSoon.length" color="warning" size="x-small" class="ms-2">{{ expiringSoon.length }}</VChip>
            </VCardTitle>
            <VCardText>
              <div v-if="expiringSoon.length === 0" class="text-center py-3">
                <VIcon icon="tabler-circle-check" color="success" size="32" class="mb-1" />
                <p class="text-body-2 text-medium-emphasis mb-0">Aucune expiration imminente</p>
              </div>
              <VList v-else density="compact">
                <VListItem v-for="item in expiringSoon" :key="item.id">
                  <template #prepend>
                    <VAvatar :color="item.hours_left <= 24 ? 'error' : 'warning'" size="34" variant="tonal">
                      <span style="font-size:0.65rem;font-weight:700">{{ item.hours_left }}h</span>
                    </VAvatar>
                  </template>
                  <VListItemTitle class="text-body-2">{{ item.client }} – {{ item.platform }}</VListItemTitle>
                  <VListItemSubtitle>Profil : {{ item.profile || '–' }} | {{ item.end_date }}</VListItemSubtitle>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>

          <VCard>
            <VCardTitle class="pa-4 pb-0">
              <VIcon icon="tabler-clock-x" color="error" class="me-2" />
              Expirés récemment
              <VChip v-if="recentlyExpired.length" color="error" size="x-small" class="ms-2">{{ recentlyExpired.length }}</VChip>
            </VCardTitle>
            <VCardText>
              <div v-if="recentlyExpired.length === 0" class="text-center py-3">
                <p class="text-body-2 text-medium-emphasis mb-0">Aucune expiration récente</p>
              </div>
              <VList v-else density="compact">
                <VListItem v-for="item in recentlyExpired" :key="item.id">
                  <template #prepend>
                    <VAvatar color="error" size="34" variant="tonal">
                      <VIcon icon="tabler-clock-x" size="16" />
                    </VAvatar>
                  </template>
                  <VListItemTitle class="text-body-2">{{ item.client }} – {{ item.platform }}</VListItemTitle>
                  <VListItemSubtitle>Expiré le {{ item.end_date }}</VListItemSubtitle>
                </VListItem>
              </VList>
            </VCardText>
          </VCard>
        </VCol>

        <!-- Recent orders -->
        <VCol cols="12" md="7">
          <VCard>
            <VCardTitle class="d-flex justify-space-between align-center pa-4 pb-0">
              <span>
                <VIcon icon="tabler-shopping-cart" class="me-2" />
                Commandes récentes
              </span>
              <RouterLink to="/admin/orders">
                <VBtn variant="text" size="small" color="primary">Voir tout</VBtn>
              </RouterLink>
            </VCardTitle>
            <VCardText>
              <VTable density="compact">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Plateforme</th>
                    <th>Montant</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="o in recentOrders" :key="o.id">
                    <td>{{ o.client }}</td>
                    <td>{{ o.platform }}</td>
                    <td>{{ o.amount?.toLocaleString() }} XOF</td>
                    <td>
                      <VChip :color="statusColor(o.status)" size="x-small" label>
                        {{ statusLabel(o.status) }}
                      </VChip>
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </div>
</template>
