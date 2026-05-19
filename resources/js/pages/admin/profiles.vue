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
  form.value = { profile_name: p.profile_name, pin_code: p.pin_code || '', status: p.status }
  dialog.value = true
}

const save = async () => {
  saving.value = true
  try {
    await useApi(`/admin/profiles/${selectedProfile.value.id}`, {
      method: 'PUT',
      body: JSON.stringify(form.value),
    })
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
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <div>
        <h2 class="text-h5 font-weight-bold">Profils / Écrans</h2>
        <p class="text-body-2 text-medium-emphasis">Gérez les écrans de chaque compte</p>
      </div>
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
              :color="new Date(item.current_order.end_date) < new Date(Date.now() + 48 * 3600000) ? 'error' : 'default'"
              size="x-small"
              variant="tonal"
            >
              {{ item.current_order.end_date }}
            </VChip>
          </span>
          <span v-else class="text-medium-emphasis">–</span>
        </template>

        <template #item.actions="{ item }">
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
          <VTextField v-model="form.profile_name" label="Nom du profil" class="mb-3" />
          <VTextField v-model="form.pin_code" label="Code PIN (optionnel)" class="mb-3" />
          <VSelect
            v-model="form.status"
            :items="[{ title: 'Disponible', value: 'available' }, { title: 'Assigné', value: 'occupied' }]"
            label="Statut"
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
