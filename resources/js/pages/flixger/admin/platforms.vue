<script setup>
definePage({
  meta: {
    action: 'manage',
    subject: 'all',
  },
})

const platforms = ref([])
const loading = ref(true)
const dialog = ref(false)
const deleteDialog = ref(false)
const saving = ref(false)
const selectedPlatform = ref(null)

const form = ref({
  name: '',
  logo_url: '',
  price_per_month: '',
  active: true,
})

const headers = [
  { title: 'Nom', key: 'name' },
  { title: 'Prix / mois', key: 'price_per_month' },
  { title: 'Comptes', key: 'master_accounts_count' },
  { title: 'Commandes', key: 'orders_count' },
  { title: 'Statut', key: 'active' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchPlatforms = async () => {
  loading.value = true
  const { data } = await useApi('/admin/platforms')
  platforms.value = data.value || []
  loading.value = false
}

onMounted(fetchPlatforms)

const openCreate = () => {
  selectedPlatform.value = null
  form.value = { name: '', logo_url: '', price_per_month: '', active: true }
  dialog.value = true
}

const openEdit = (p) => {
  selectedPlatform.value = p
  form.value = { name: p.name, logo_url: p.logo_url || '', price_per_month: p.price_per_month, active: p.active }
  dialog.value = true
}

const save = async () => {
  saving.value = true
  try {
    if (selectedPlatform.value) {
      await useApi(`/api/admin/platforms/${selectedPlatform.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(form.value),
      })
    } else {
      await useApi('/admin/platforms', {
        method: 'POST',
        body: JSON.stringify(form.value),
      })
    }
    dialog.value = false
    await fetchPlatforms()
  } finally {
    saving.value = false
  }
}

const confirmDelete = (p) => {
  selectedPlatform.value = p
  deleteDialog.value = true
}

const deletePlatform = async () => {
  await useApi(`/api/admin/platforms/${selectedPlatform.value.id}`, { method: 'DELETE' })
  deleteDialog.value = false
  await fetchPlatforms()
}
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Plateformes</h2>
        <p class="text-body-2 text-medium-emphasis">Gérez les plateformes de streaming</p>
      </div>
      <VBtn color="primary" @click="openCreate">
        <VIcon start icon="tabler-plus" />
        Nouvelle plateforme
      </VBtn>
    </div>

    <VCard>
      <VDataTable
        :headers="headers"
        :items="platforms"
        :loading="loading"
        loading-text="Chargement..."
        no-data-text="Aucune plateforme"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center gap-2">
            <VAvatar size="32" rounded color="surface-variant">
              <img v-if="item.logo_url" :src="item.logo_url" :alt="item.name" style="max-width:24px;max-height:24px;object-fit:contain">
              <VIcon v-else icon="tabler-device-tv" size="16" />
            </VAvatar>
            <span class="font-weight-medium">{{ item.name }}</span>
          </div>
        </template>

        <template #item.price_per_month="{ item }">
          <strong>{{ item.price_per_month?.toLocaleString() }} XOF</strong>
        </template>

        <template #item.active="{ item }">
          <VChip :color="item.active ? 'success' : 'error'" size="small" label>
            {{ item.active ? 'Actif' : 'Inactif' }}
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn icon size="small" variant="text" @click="openEdit(item)">
            <VIcon icon="tabler-edit" />
          </VBtn>
          <VBtn icon size="small" variant="text" color="error" @click="confirmDelete(item)">
            <VIcon icon="tabler-trash" />
          </VBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create/Edit Dialog -->
    <VDialog v-model="dialog" max-width="500">
      <VCard>
        <VCardTitle class="pa-4">
          {{ selectedPlatform ? 'Modifier la plateforme' : 'Nouvelle plateforme' }}
        </VCardTitle>
        <VCardText>
          <VTextField v-model="form.name" label="Nom de la plateforme" class="mb-3" />
          <VTextField v-model="form.logo_url" label="URL du logo" class="mb-3" />
          <VTextField
            v-model="form.price_per_month"
            label="Prix par mois (XOF)"
            type="number"
            min="0"
            class="mb-3"
          />
          <VSwitch v-model="form.active" label="Plateforme active" color="primary" />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="outlined" @click="dialog = false">Annuler</VBtn>
          <VBtn color="primary" :loading="saving" @click="save">
            {{ selectedPlatform ? 'Modifier' : 'Créer' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Confirm -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard>
        <VCardTitle class="pa-4">Supprimer la plateforme</VCardTitle>
        <VCardText>
          Voulez-vous supprimer <strong>{{ selectedPlatform?.name }}</strong> ?
          Cette action supprimera également tous les comptes et profils associés.
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="outlined" @click="deleteDialog = false">Annuler</VBtn>
          <VBtn color="error" @click="deletePlatform">Supprimer</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
