<script setup>
definePage({
  meta: {
    action: 'manage',
    subject: 'all',
  },
})

const profiles = ref([])
const platforms = ref([])
const loading = ref(true)
const dialog = ref(false)
const saving = ref(false)
const selectedProfile = ref(null)
const formErrors = ref({})
const filterStatus = ref(null)
const filterPlatform = ref(null)

const form = ref({
  profile_name: '',
  pin_code: '',
  status: 'available',
})

const headers = [
  { title: 'Profil', key: 'profile_name' },
  { title: 'Plateforme', key: 'platform' },
  { title: 'Compte', key: 'account' },
  { title: 'PIN', key: 'pin_code' },
  { title: 'Statut', key: 'status' },
  { title: 'Assigné à', key: 'client' },
  { title: 'Expire', key: 'end_date' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchData = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filterStatus.value) params.append('status', filterStatus.value)
  if (filterPlatform.value) params.append('platform_id', filterPlatform.value)

  const [profRes, platRes] = await Promise.all([
    useApi(`/admin/profiles?${params}`),
    useApi('/admin/platforms'),
  ])
  profiles.value = profRes.data.value || []
  platforms.value = platRes.data.value || []
  loading.value = false
}

onMounted(fetchData)
watch([filterStatus, filterPlatform], fetchData)

const openEdit = (p) => {
  selectedProfile.value = p
  formErrors.value = {}
  form.value = { profile_name: p.profile_name, pin_code: p.pin_code || '', status: p.status }
  dialog.value = true
}

const save = async () => {
  saving.value = true
  formErrors.value = {}
  try {
    const { error } = await useApi(`/admin/profiles/${selectedProfile.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(form.value),
    })
    if (error.value) {
      formErrors.value = error.value?.data?.errors || {}
      return
    }
    dialog.value = false
    await fetchData()
  } finally {
    saving.value = false
  }
}

const deleteProfile = async (p) => {
  if (confirm(`Supprimer le profil "${p.profile_name}" ?`)) {
    await useApi(`/admin/profiles/${p.id}`, { method: 'DELETE' })
    await fetchData()
  }
}

const statusColor = s => s === 'available' ? 'success' : 'warning'
const statusLabel = s => s === 'available' ? 'Disponible' : 'Assigné'

// ── WhatsApp : envoi des accès au client relié au profil ──
const siteUrl = window.location.origin

const normalizePhone = (phone) => {
  let p = String(phone || '').replace(/\D/g, '')
  if (p.length === 8) p = `228${p}` // Indicatif Togo par défaut
  return p
}

// Un bouton WhatsApp n'a de sens que si le profil est relié à un client ayant un numéro
const hasWhatsapp = p => !!p.current_order?.user?.phone

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

const whatsappMessage = (p) => {
  const order = p.current_order || {}
  const user = order.user || {}
  return `Bonjour ${user.name || ''} 👋\n\n`
    + `Voici vos accès pour votre abonnement *${p.master_account?.platform?.name || ''}* sur FlixGer :\n\n`
    + `📧 Email : ${p.master_account?.email || '—'}\n`
    + `🔒 Mot de passe : ${p.master_account?.password || '—'}\n`
    + `👤 Profil : ${p.profile_name || '—'}\n`
    + `🔑 Code PIN : ${p.pin_code || '—'}\n\n`
    + `📅 Valable jusqu'au : ${fmtDate(order.end_date)}\n\n`
    + `Retrouvez et gérez vos abonnements sur ${siteUrl} 🎬`
}

const sendWhatsapp = (p) => {
  const phone = normalizePhone(p.current_order?.user?.phone)
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage(p))}`, '_blank')
}

const pinVisible = reactive({})
const togglePin = (id) => { pinVisible[id] = !pinVisible[id] }
const generatePin = () => { form.value.pin_code = String(Math.floor(1000 + Math.random() * 9000)) }
</script>

<template>
  <div>
    <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-3 mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold">Profils / Écrans</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">Gérez les écrans de chaque compte</p>
      </div>
      <VBtn variant="outlined" :loading="loading" @click="fetchData">
        <VIcon start icon="tabler-refresh" />
        Recharger
      </VBtn>
    </div>

    <!-- Filters -->
    <VRow class="mb-4">
      <VCol cols="12" sm="4">
        <VSelect
          v-model="filterStatus"
          :items="[{ title: 'Tous les statuts', value: null }, { title: 'Disponible', value: 'available' }, { title: 'Assigné', value: 'occupied' }]"
          label="Filtrer par statut"
          clearable
          density="compact"
        />
      </VCol>
      <VCol cols="12" sm="4">
        <VSelect
          v-model="filterPlatform"
          :items="[{ title: 'Toutes les plateformes', value: null }, ...platforms.map(p => ({ title: p.name, value: p.id }))]"
          label="Filtrer par plateforme"
          clearable
          density="compact"
        />
      </VCol>
    </VRow>

    <VCard>
      <VDataTable
        :headers="headers"
        :items="profiles"
        :loading="loading"
        loading-text="Chargement..."
        no-data-text="Aucun profil"
      >
        <template #item.platform="{ item }">
          {{ item.master_account?.platform?.name }}
        </template>

        <template #item.account="{ item }">
          <span class="text-body-2">{{ item.master_account?.email }}</span>
        </template>

        <template #item.pin_code="{ item }">
          <div class="d-flex align-center gap-1">
            <span class="font-mono text-body-2">
              {{ pinVisible[item.id] ? (item.pin_code || '–') : (item.pin_code ? '••••' : '–') }}
            </span>
            <VBtn
              v-if="item.pin_code"
              icon
              size="x-small"
              variant="text"
              @click="togglePin(item.id)"
            >
              <VIcon :icon="pinVisible[item.id] ? 'tabler-eye-off' : 'tabler-eye'" size="14" />
            </VBtn>
          </div>
        </template>

        <template #item.status="{ item }">
          <VChip :color="statusColor(item.status)" size="small" label>
            {{ statusLabel(item.status) }}
          </VChip>
        </template>

        <template #item.client="{ item }">
          <span v-if="item.current_order">{{ item.current_order?.user?.name }}</span>
          <span v-else class="text-medium-emphasis">–</span>
        </template>

        <template #item.end_date="{ item }">
          <span v-if="item.current_order?.end_date">
            <VChip
              :color="new Date(item.current_order.end_date) < new Date()
                ? 'error'
                : new Date(item.current_order.end_date) < new Date(Date.now() + 48 * 3600000)
                  ? 'warning'
                  : 'success'"
              size="x-small"
              variant="tonal"
            >
              {{ new Date(item.current_order.end_date) < new Date() ? 'Expiré · ' : '' }}{{ item.current_order.end_date }}
            </VChip>
          </span>
          <span v-else class="text-medium-emphasis">–</span>
        </template>

        <template #item.actions="{ item }">
          <VBtn
            v-if="hasWhatsapp(item)"
            icon
            size="small"
            variant="text"
            color="success"
            @click="sendWhatsapp(item)"
          >
            <VIcon icon="tabler-brand-whatsapp" />
            <VTooltip activator="parent" location="top">Envoyer les accès sur WhatsApp</VTooltip>
          </VBtn>
          <VBtn icon size="small" variant="text" @click="openEdit(item)">
            <VIcon icon="tabler-edit" />
          </VBtn>
          <VBtn icon size="small" variant="text" color="error" @click="deleteProfile(item)">
            <VIcon icon="tabler-trash" />
          </VBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Edit Dialog -->
    <VDialog v-model="dialog" max-width="400">
      <VCard>
        <VCardTitle class="pa-4">Modifier le profil</VCardTitle>
        <VCardText>
          <VTextField v-model="form.profile_name" label="Nom du profil" :error-messages="formErrors.profile_name" class="mb-3" />
          <div class="d-flex gap-2 align-start mb-3">
            <VTextField
              v-model="form.pin_code"
              label="Code PIN (optionnel)"
              :error-messages="formErrors.pin_code"
              class="flex-grow-1"
            />
            <VBtn
              variant="tonal"
              color="secondary"
              class="mt-1"
              @click="generatePin"
            >
              <VIcon start icon="tabler-refresh" size="16" />
              Générer
            </VBtn>
          </div>
          <VSelect
            v-model="form.status"
            :items="[{ title: 'Disponible', value: 'available' }, { title: 'Assigné', value: 'occupied' }]"
            label="Statut"
            :error-messages="formErrors.status"
          />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="outlined" @click="dialog = false">Annuler</VBtn>
          <VBtn color="primary" :loading="saving" @click="save">Modifier</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
