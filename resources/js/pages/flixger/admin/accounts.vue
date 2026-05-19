<script setup>
definePage({
  meta: {
    action: 'manage',
    subject: 'all',
  },
})

const accounts = ref([])
const platforms = ref([])
const loading = ref(true)
const dialog = ref(false)
const saving = ref(false)
const selectedAccount = ref(null)
const expandedAccounts = ref([])

const form = ref({
  platform_id: null,
  email: '',
  password: '',
  status: 'active',
  notes: '',
  nb_profiles: 4,
})

const headers = [
  { title: 'Plateforme', key: 'platform' },
  { title: 'Email', key: 'email' },
  { title: 'Statut', key: 'status' },
  { title: 'Profils', key: 'profiles_count' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const fetchData = async () => {
  loading.value = true
  const [accRes, platRes] = await Promise.all([
    useApi('/admin/accounts'),
    useApi('/admin/platforms'),
  ])
  accounts.value = accRes.data.value || []
  platforms.value = platRes.data.value || []
  loading.value = false
}

onMounted(fetchData)

const openCreate = () => {
  selectedAccount.value = null
  form.value = { platform_id: null, email: '', password: '', status: 'active', notes: '', nb_profiles: 4 }
  dialog.value = true
}

const openEdit = (acc) => {
  selectedAccount.value = acc
  form.value = {
    platform_id: acc.platform_id,
    email: acc.email,
    password: '',
    status: acc.status,
    notes: acc.notes || '',
    nb_profiles: 4,
  }
  dialog.value = true
}

const save = async () => {
  saving.value = true
  try {
    if (selectedAccount.value) {
      await useApi(`/admin/accounts/${selectedAccount.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(form.value),
      })
    } else {
      await useApi('/admin/accounts', {
        method: 'POST',
        body: JSON.stringify(form.value),
      })
    }
    dialog.value = false
    await fetchData()
  } finally {
    saving.value = false
  }
}

const deleteAccount = async (acc) => {
  if (confirm(`Supprimer le compte ${acc.email} ?`)) {
    await useApi(`/admin/accounts/${acc.id}`, { method: 'DELETE' })
    await fetchData()
  }
}

const statusColor = s => s === 'active' ? 'success' : 'error'
const profileStatusColor = s => s === 'available' ? 'success' : 'warning'
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Comptes Maîtres</h2>
        <p class="text-body-2 text-medium-emphasis">Gérez les comptes de streaming et leurs profils</p>
      </div>
      <VBtn color="primary" @click="openCreate">
        <VIcon start icon="tabler-plus" />
        Ajouter un compte
      </VBtn>
    </div>

    <VCard>
      <VDataTable
        :headers="headers"
        :items="accounts"
        :loading="loading"
        loading-text="Chargement..."
        no-data-text="Aucun compte"
        item-value="id"
        show-expand
      >
        <template #item.platform="{ item }">
          <span class="font-weight-medium">{{ item.platform?.name }}</span>
        </template>

        <template #item.status="{ item }">
          <VChip :color="statusColor(item.status)" size="small" label>
            {{ item.status === 'active' ? 'Actif' : 'Expiré' }}
          </VChip>
        </template>

        <template #item.profiles_count="{ item }">
          <VChip color="info" size="small" variant="tonal">
            {{ item.profiles?.length || 0 }} profils
          </VChip>
        </template>

        <template #item.actions="{ item }">
          <VBtn icon size="small" variant="text" @click="openEdit(item)">
            <VIcon icon="tabler-edit" />
          </VBtn>
          <VBtn icon size="small" variant="text" color="error" @click="deleteAccount(item)">
            <VIcon icon="tabler-trash" />
          </VBtn>
        </template>

        <!-- Expanded row: show profiles -->
        <template #expanded-row="{ item }">
          <tr>
            <td :colspan="headers.length + 1" class="pa-0">
              <div class="pa-4 bg-surface">
                <p class="text-caption font-weight-bold mb-2">Profils de {{ item.email }}</p>
                <div class="d-flex flex-wrap gap-2">
                  <VChip
                    v-for="profile in item.profiles"
                    :key="profile.id"
                    :color="profileStatusColor(profile.status)"
                    size="small"
                    variant="tonal"
                    label
                  >
                    {{ profile.profile_name }}
                    <span v-if="profile.pin_code" class="ms-1">(PIN: {{ profile.pin_code }})</span>
                  </VChip>
                  <span v-if="!item.profiles?.length" class="text-caption text-medium-emphasis">
                    Aucun profil
                  </span>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </VDataTable>
    </VCard>

    <!-- Dialog -->
    <VDialog v-model="dialog" max-width="520">
      <VCard>
        <VCardTitle class="pa-4">
          {{ selectedAccount ? 'Modifier le compte' : 'Ajouter un compte' }}
        </VCardTitle>
        <VCardText>
          <VSelect
            v-model="form.platform_id"
            :items="platforms"
            item-title="name"
            item-value="id"
            label="Plateforme"
            class="mb-3"
          />
          <VTextField v-model="form.email" label="Email du compte" type="email" class="mb-3" />
          <VTextField
            v-model="form.password"
            label="Mot de passe"
            :placeholder="selectedAccount ? 'Laisser vide pour ne pas modifier' : ''"
            class="mb-3"
          />
          <VSelect
            v-model="form.status"
            :items="[{ title: 'Actif', value: 'active' }, { title: 'Expiré', value: 'expired' }]"
            label="Statut"
            class="mb-3"
          />
          <VTextField
            v-if="!selectedAccount"
            v-model.number="form.nb_profiles"
            label="Nombre de profils à générer"
            type="number"
            min="1"
            max="10"
            class="mb-3"
          />
          <VTextarea v-model="form.notes" label="Notes (optionnel)" rows="2" />
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="outlined" @click="dialog = false">Annuler</VBtn>
          <VBtn color="primary" :loading="saving" @click="save">
            {{ selectedAccount ? 'Modifier' : 'Créer' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
