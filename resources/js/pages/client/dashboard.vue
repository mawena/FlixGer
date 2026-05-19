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

const daysLeft = (endDate) => {
  if (!endDate) return null
  return Math.max(0, Math.ceil((new Date(endDate) - new Date()) / 86400000))
}

const daysLeftColor = (d) => {
  if (d === null) return 'default'
  if (d <= 3) return 'error'
  if (d <= 7) return 'warning'
  return 'success'
}

const platformColors = {
  Netflix: '#E50914', Spotify: '#1DB954',
  'Disney+': '#113CCF', 'Prime Video': '#00A8E1',
}
const getColor = n => platformColors[n] || '#7367F0'

const copied = ref(null)
const copyText = async (text, key) => {
  await navigator.clipboard.writeText(text)
  copied.value = key
  setTimeout(() => { copied.value = null }, 1500)
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-start flex-wrap gap-3 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">
          Bonjour, {{ userData?.name?.split(' ')[0] }} 👋
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Gérez vos abonnements streaming
        </p>
      </div>
      <RouterLink to="/catalog">
        <VBtn color="primary">
          <VIcon start icon="tabler-plus" />
          Nouvel abonnement
        </VBtn>
      </RouterLink>
    </div>

    <!-- Stats -->
    <VRow class="mb-6">
      <VCol cols="6" sm="3">
        <VCard>
          <VCardText class="text-center pa-4">
            <VIcon icon="tabler-circle-check" color="success" size="28" class="mb-1" />
            <div class="text-h5 font-weight-black">{{ activeOrders.length }}</div>
            <div class="text-caption text-medium-emphasis">Actifs</div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="3">
        <VCard>
          <VCardText class="text-center pa-4">
            <VIcon icon="tabler-clock" color="warning" size="28" class="mb-1" />
            <div class="text-h5 font-weight-black">{{ pendingOrders.length }}</div>
            <div class="text-caption text-medium-emphasis">En attente</div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VProgressCircular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-8" />

    <template v-else>

      <!-- ── Active subscriptions ── -->
      <template v-if="activeOrders.length > 0">
        <h3 class="text-subtitle-1 font-weight-bold mb-3">
          <VIcon icon="tabler-device-tv" class="me-1" size="18" />
          Abonnements actifs
        </h3>

        <VCard
          v-for="order in activeOrders"
          :key="order.id"
          class="sub-card mb-4"
        >
          <!-- Color top stripe -->
          <div class="sub-stripe" :style="{ background: getColor(order.platform?.name) }" />

          <VCardText class="pa-4">
            <!-- Title row -->
            <div class="d-flex justify-space-between align-start mb-3">
              <div class="d-flex align-center gap-2">
                <div
                  class="sub-icon"
                  :style="{ background: getColor(order.platform?.name) + '18' }"
                >
                  <VIcon icon="tabler-device-tv" :color="getColor(order.platform?.name)" size="20" />
                </div>
                <div>
                  <div class="font-weight-bold">{{ order.platform?.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ order.duration_months }} mois</div>
                </div>
              </div>
              <VChip
                v-if="daysLeft(order.end_date) !== null"
                :color="daysLeftColor(daysLeft(order.end_date))"
                size="small"
                label
              >
                {{ daysLeft(order.end_date) }}j restants
              </VChip>
            </div>

            <!-- Expiry progress bar -->
            <div v-if="order.start_date && order.end_date" class="mb-4">
              <div class="d-flex justify-space-between text-caption text-medium-emphasis mb-1">
                <span>{{ order.start_date }}</span>
                <span>Expire le {{ order.end_date }}</span>
              </div>
              <VProgressLinear
                :model-value="Math.min(100, Math.max(0, 100 - (daysLeft(order.end_date) / (order.duration_months * 30)) * 100))"
                :color="daysLeftColor(daysLeft(order.end_date))"
                rounded
                height="6"
                bg-color="surface-variant"
              />
            </div>

            <!-- Credentials -->
            <div v-if="order.access">
              <VDivider class="mb-3" />
              <div class="cred-header mb-3">
                <VIcon icon="tabler-lock-open" color="success" size="16" class="me-1" />
                <span class="text-caption font-weight-bold text-success">Vos identifiants d'accès</span>
              </div>

              <VRow dense>
                <VCol cols="12" sm="6">
                  <div class="cred-field" @click="copyText(order.access.email, `email-${order.id}`)">
                    <div class="cred-label">Email du compte</div>
                    <div class="cred-value-row">
                      <span class="cred-value">{{ order.access.email }}</span>
                      <VIcon
                        :icon="copied === `email-${order.id}` ? 'tabler-check' : 'tabler-copy'"
                        :color="copied === `email-${order.id}` ? 'success' : 'default'"
                        size="14"
                      />
                    </div>
                  </div>
                </VCol>
                <VCol cols="12" sm="6">
                  <div class="cred-field" @click="copyText(order.access.password, `pw-${order.id}`)">
                    <div class="cred-label">Mot de passe</div>
                    <div class="cred-value-row">
                      <span class="cred-value">{{ order.access.password }}</span>
                      <VIcon
                        :icon="copied === `pw-${order.id}` ? 'tabler-check' : 'tabler-copy'"
                        :color="copied === `pw-${order.id}` ? 'success' : 'default'"
                        size="14"
                      />
                    </div>
                  </div>
                </VCol>
                <VCol cols="12" sm="6">
                  <div class="cred-field" @click="copyText(order.access.profile_name, `prof-${order.id}`)">
                    <div class="cred-label">Profil à utiliser</div>
                    <div class="cred-value-row">
                      <span class="cred-value">{{ order.access.profile_name }}</span>
                      <VIcon
                        :icon="copied === `prof-${order.id}` ? 'tabler-check' : 'tabler-copy'"
                        :color="copied === `prof-${order.id}` ? 'success' : 'default'"
                        size="14"
                      />
                    </div>
                  </div>
                </VCol>
                <VCol v-if="order.access.pin_code" cols="12" sm="6">
                  <div class="cred-field" @click="copyText(order.access.pin_code, `pin-${order.id}`)">
                    <div class="cred-label">Code PIN</div>
                    <div class="cred-value-row">
                      <span class="cred-value">{{ order.access.pin_code }}</span>
                      <VIcon
                        :icon="copied === `pin-${order.id}` ? 'tabler-check' : 'tabler-copy'"
                        :color="copied === `pin-${order.id}` ? 'success' : 'default'"
                        size="14"
                      />
                    </div>
                  </div>
                </VCol>
              </VRow>

              <VAlert
                v-if="daysLeft(order.end_date) !== null && daysLeft(order.end_date) <= 7"
                :type="daysLeft(order.end_date) <= 3 ? 'error' : 'warning'"
                variant="tonal"
                density="compact"
                class="mt-3"
              >
                Votre abonnement expire dans <strong>{{ daysLeft(order.end_date) }} jour(s)</strong>.
                <RouterLink to="/catalog" class="ms-1 font-weight-bold">Renouveler →</RouterLink>
              </VAlert>
            </div>
          </VCardText>
        </VCard>
      </template>

      <!-- ── Empty state ── -->
      <VCard v-else class="text-center pa-8 mb-4">
        <VIcon icon="tabler-device-tv-off" size="56" color="secondary" class="mb-3" />
        <p class="text-body-1 font-weight-medium mb-1">Aucun abonnement actif</p>
        <p class="text-body-2 text-medium-emphasis mb-4">
          Choisissez une plateforme et passez votre première commande
        </p>
        <RouterLink to="/catalog">
          <VBtn color="primary">
            <VIcon start icon="tabler-apps" />
            Voir le catalogue
          </VBtn>
        </RouterLink>
      </VCard>

      <!-- ── Pending orders ── -->
      <template v-if="pendingOrders.length > 0">
        <h3 class="text-subtitle-1 font-weight-bold mb-3">
          <VIcon icon="tabler-clock" color="warning" class="me-1" size="18" />
          En attente de validation
        </h3>

        <VCard
          v-for="order in pendingOrders"
          :key="order.id"
          variant="tonal"
          color="warning"
          class="mb-3"
        >
          <VCardText class="pa-4">
            <div class="d-flex justify-space-between align-center flex-wrap gap-2">
              <div>
                <div class="font-weight-bold">{{ order.platform?.name }}</div>
                <div class="text-caption">
                  {{ order.duration_months }} mois · {{ order.total_amount?.toLocaleString() }} XOF
                </div>
                <div class="text-caption text-medium-emphasis">Réf: {{ order.transaction_reference }}</div>
              </div>
              <RouterLink :to="{ name: 'client-orders-id', params: { id: order.id } }">
                <VBtn size="small" variant="outlined" color="warning">Détails</VBtn>
              </RouterLink>
            </div>
          </VCardText>
        </VCard>
      </template>

    </template>
  </div>
</template>

<style scoped>
.sub-card { border-radius: 12px !important; overflow: hidden; }
.sub-stripe { height: 4px; }
.sub-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cred-header { display: flex; align-items: center; }

.cred-field {
  background: rgba(var(--v-theme-success), 0.06);
  border: 1px solid rgba(var(--v-theme-success), 0.15);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: background 0.15s;
}
.cred-field:hover { background: rgba(var(--v-theme-success), 0.1); }

.cred-label {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin-bottom: 2px;
}
.cred-value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.cred-value {
  font-weight: 600;
  font-size: 0.88rem;
  word-break: break-all;
}
</style>
