<script setup>
definePage({
  meta: {
    action: 'manage',
    subject: 'all',
  },
})

// ── State ─────────────────────────────────────────────
const users = ref([])
const stats = ref({ total: 0, admins: 0, clients: 0 })
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)

const dialog = ref(false)
const deleteDialog = ref(false)
const detailDialog = ref(false)
const phoneDialog = ref(false)
const credentialsDialog = ref(false)

const selectedUser = ref(null)
const filterRole = ref('')
const search = ref('')
const formErrors = ref({})
const phoneErrors = ref({})
const isPasswordVisible = ref(false)

const form = ref({
  name: '', email: '', phone: '', role: 'client', password: '',
})

const phoneForm = ref({ name: '', phone: '' })
const createdCredentials = ref(null)

// ── Abonnement facultatif lors de la création par téléphone ──
const withSubscription = ref(false)
const platforms = ref([])
const availableProfiles = ref([])
const loadingProfiles = ref(false)
const subForm = ref({
  platform_id: null,
  profile_id: null,
  profile_name: '',
  pin_code: '',
  start_date: '',
  end_date: '',
})

const snackbar = ref({ show: false, text: '', color: 'success' })

// ── Fetch ──────────────────────────────────────────────
const fetchUsers = async () => {
  loading.value = true
  const params = new URLSearchParams()
  if (filterRole.value) params.append('role', filterRole.value)
  if (search.value) params.append('search', search.value)

  const [usersRes, statsRes] = await Promise.all([
    useApi(`/admin/users?${params}`),
    useApi('/admin/users/stats'),
  ])
  users.value = usersRes.data.value || []
  stats.value = statsRes.data.value || { total: 0, admins: 0, clients: 0 }
  loading.value = false
}

onMounted(fetchUsers)

let searchTimer = null
watch(search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchUsers, 350)
})
watch(filterRole, fetchUsers)

// ── CRUD ──────────────────────────────────────────────
const openCreate = () => {
  selectedUser.value = null
  formErrors.value = {}
  form.value = { name: '', email: '', phone: '', role: 'client', password: '' }
  dialog.value = true
}

const openEdit = (user) => {
  selectedUser.value = user
  formErrors.value = {}
  form.value = { name: user.name, email: user.email, phone: user.phone, role: user.role, password: '' }
  dialog.value = true
}

const openDetail = async (user) => {
  const { data } = await useApi(`/admin/users/${user.id}`)
  selectedUser.value = data.value
  detailDialog.value = true
}

const save = async () => {
  saving.value = true
  formErrors.value = {}
  try {
    const url = selectedUser.value ? `/admin/users/${selectedUser.value.id}` : '/admin/users'
    const method = selectedUser.value ? 'PUT' : 'POST'

    const { error } = await useApi(url, {
      method,
      body: JSON.stringify(form.value),
    })

    if (error.value) {
      formErrors.value = error.value?.data?.errors || {}
      if (!Object.keys(formErrors.value).length)
        formErrors.value._general = error.value?.data?.message || 'Une erreur est survenue'
      return
    }

    dialog.value = false
    await fetchUsers()
  } finally {
    saving.value = false
  }
}

const openDelete = (user) => {
  selectedUser.value = user
  deleteDialog.value = true
}

const confirmDelete = async () => {
  deleting.value = true
  try {
    const res = await fetch(`/api/admin/users/${selectedUser.value.id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${useCookie('accessToken').value}`,
      },
    })

    if (!res.ok) {
      const err = await res.json()
      alert(err.message || 'Erreur lors de la suppression')
      return
    }

    deleteDialog.value = false
    detailDialog.value = false
    selectedUser.value = null
    await fetchUsers()
  } finally {
    deleting.value = false
  }
}

// ── Création par téléphone (clients directs) ──────────
const todayISO = () => new Date().toISOString().slice(0, 10)
const addMonthsISO = (iso, months) => {
  const d = new Date(iso)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

const openPhoneCreate = async () => {
  phoneErrors.value = {}
  phoneForm.value = { name: '', phone: '' }
  withSubscription.value = false
  availableProfiles.value = []
  subForm.value = {
    platform_id: null,
    profile_id: null,
    profile_name: '',
    pin_code: '',
    start_date: todayISO(),
    end_date: addMonthsISO(todayISO(), 1),
  }
  phoneDialog.value = true

  if (!platforms.value.length) {
    const { data } = await useApi('/platforms')
    platforms.value = data.value || []
  }
}

// Charger les profils disponibles quand la plateforme change
const onPlatformChange = async () => {
  subForm.value.profile_id = null
  subForm.value.profile_name = ''
  subForm.value.pin_code = ''
  availableProfiles.value = []
  if (!subForm.value.platform_id) return

  loadingProfiles.value = true
  try {
    const { data } = await useApi(`/admin/profiles?status=available&platform_id=${subForm.value.platform_id}`)
    availableProfiles.value = data.value || []
  } finally {
    loadingProfiles.value = false
  }
}

// Pré-remplir nom + code éditables : le profil prend le nom du client par défaut
const onProfileChange = () => {
  const p = availableProfiles.value.find(x => x.id === subForm.value.profile_id)
  subForm.value.profile_name = phoneForm.value.name || p?.profile_name || ''
  subForm.value.pin_code = p?.pin_code || ''
}

const profileLabel = (p) => {
  const acc = p.master_account?.email || '—'
  return `${p.profile_name} · ${acc}`
}

const createByPhone = async () => {
  saving.value = true
  phoneErrors.value = {}
  try {
    const payload = { ...phoneForm.value }
    if (withSubscription.value) {
      payload.subscription = {
        platform_id:  subForm.value.platform_id,
        profile_id:   subForm.value.profile_id,
        profile_name: subForm.value.profile_name,
        pin_code:     subForm.value.pin_code,
        start_date:   subForm.value.start_date,
        end_date:     subForm.value.end_date,
      }
    }

    const { data, error } = await useApi('/admin/users/by-phone', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (error.value) {
      const errs = error.value?.data?.errors || {}
      phoneErrors.value = errs
      // Remonter les erreurs d'abonnement (clés « subscription.* ») dans le message général
      const subMsgs = Object.entries(errs)
        .filter(([k]) => k.startsWith('subscription.'))
        .flatMap(([, v]) => v)
      if (subMsgs.length)
        phoneErrors.value._general = subMsgs.join(' ')
      else if (!Object.keys(errs).length)
        phoneErrors.value._general = error.value?.data?.message || 'Une erreur est survenue'
      return
    }

    phoneDialog.value = false
    createdCredentials.value = {
      name: data.value?.user?.name,
      phone: data.value?.user?.phone,
      password: data.value?.plain_password,
      subscription: data.value?.subscription || null,
    }
    credentialsDialog.value = true
    await fetchUsers()
  } finally {
    saving.value = false
  }
}

// ── WhatsApp / presse-papiers ─────────────────────────
const siteUrl = window.location.origin

const normalizePhone = (phone) => {
  let p = String(phone || '').replace(/\D/g, '')
  if (p.length === 8) p = `228${p}` // Indicatif Togo par défaut
  return p
}

const showSnack = (text, color = 'success') => {
  snackbar.value = { show: true, text, color }
}

const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    showSnack('Message copié ✔')
  } catch {
    // Fallback pour les navigateurs sans API clipboard (ex. http)
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    showSnack('Message copié ✔')
  }
}

const openWhatsapp = (phone, text) => {
  window.open(`https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(text)}`, '_blank')
}

// Message d'accès à une plateforme (abonnement validé)
const accessMessage = (user, order) => {
  const acc = order.profile?.master_account || {}
  return `Bonjour ${user.name} 👋\n\n`
    + `Voici vos accès pour votre abonnement *${order.platform?.name}* sur FlixGer :\n\n`
    + `📧 Email : ${acc.email || '—'}\n`
    + `🔒 Mot de passe : ${acc.password || '—'}\n`
    + `👤 Profil : ${order.profile?.profile_name || '—'}\n`
    + `🔑 Code PIN : ${order.profile?.pin_code || '—'}\n\n`
    + `📅 Valable jusqu'au : ${order.end_date || '—'}\n\n`
    + `Bon visionnage ! 🎬`
}

// Message complet : abonnement (compte maître + profil) + PS identifiants du site
const fullMessage = (c) => {
  const s = c.subscription
  let msg = `Bonjour ${c.name || ''} 👋\n\n`

  if (s) {
    msg += `Voici votre abonnement *${s.platform_name}* sur FlixGer :\n\n`
      + `📧 Email : ${s.account_email}\n`
      + `🔒 Mot de passe : ${s.account_password}\n`
      + `👤 Profil : ${s.profile_name}\n`
      + `🔑 Code PIN : ${s.pin_code || '—'}\n\n`
      + `📅 Du ${s.start_date} au ${s.end_date}\n\n`
      + `Bon visionnage ! 🎬\n\n`
      + `――――――――――\n`
      + `PS : un compte a aussi été créé pour vous sur FlixGer (${siteUrl}).\n`
      + `👤 Identifiant : ${c.phone}\n`
      + `🔒 Mot de passe : ${c.password}\n\n`
      + `Connectez-vous pour souscrire à de nouveaux abonnements et suivre tous vos abonnements en cours. 😊`
  } else {
    msg += `Votre compte FlixGer a bien été créé.\n\n`
      + `🔗 Site : ${siteUrl}\n`
      + `👤 Identifiant : ${c.phone}\n`
      + `🔒 Mot de passe : ${c.password}\n\n`
      + `Connectez-vous puis pensez à changer votre mot de passe. À bientôt sur FlixGer ! 🎬`
  }

  return msg
}

const orderHasAccess = order => order.status === 'approved' && order.profile?.master_account

// ── Helpers ───────────────────────────────────────────
const roleColor = r => r === 'admin' ? 'error' : 'primary'
const roleIcon  = r => r === 'admin' ? 'tabler-shield-filled' : 'tabler-user'
const roleLabel = r => r === 'admin' ? 'Admin' : 'Client'

const avatarText = name => name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'
const avatarColor = (id) => {
  const colors = ['primary', 'success', 'info', 'warning', 'error', 'secondary']
  return colors[id % colors.length]
}

const headers = [
  { title: 'Utilisateur', key: 'user' },
  { title: 'Email', key: 'email' },
  { title: 'Téléphone', key: 'phone' },
  { title: 'Rôle', key: 'role' },
  { title: 'Commandes', key: 'orders_count' },
  { title: 'Inscrit le', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

const statusConfig = {
  pending:  { color: 'warning', label: 'En attente' },
  approved: { color: 'success', label: 'Validée' },
  rejected: { color: 'error',   label: 'Rejetée' },
}
</script>

<template>
  <div>
    <!-- ── Header ── -->
    <div class="d-flex justify-space-between align-center flex-wrap gap-3 mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Gestion des Utilisateurs</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">Administrateurs et clients de la plateforme</p>
      </div>
      <div class="d-flex gap-2">
        <VBtn variant="outlined" :loading="loading" @click="fetchUsers">
          <VIcon start icon="tabler-refresh" />
          Recharger
        </VBtn>
        <VBtn color="success" variant="tonal" @click="openPhoneCreate">
          <VIcon start icon="tabler-brand-whatsapp" />
          Client direct (téléphone)
        </VBtn>
        <VBtn color="primary" @click="openCreate">
          <VIcon start icon="tabler-user-plus" />
          Ajouter un utilisateur
        </VBtn>
      </div>
    </div>

    <!-- ── Stats ── -->
    <VRow class="mb-5">
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3 pa-4">
            <VAvatar color="primary" variant="tonal" size="48" rounded>
              <VIcon icon="tabler-users" size="24" />
            </VAvatar>
            <div>
              <div class="text-h5 font-weight-black">{{ stats.total }}</div>
              <div class="text-caption text-medium-emphasis">Total utilisateurs</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3 pa-4">
            <VAvatar color="error" variant="tonal" size="48" rounded>
              <VIcon icon="tabler-shield-filled" size="24" />
            </VAvatar>
            <div>
              <div class="text-h5 font-weight-black">{{ stats.admins }}</div>
              <div class="text-caption text-medium-emphasis">Administrateurs</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="6" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3 pa-4">
            <VAvatar color="primary" variant="tonal" size="48" rounded>
              <VIcon icon="tabler-user" size="24" />
            </VAvatar>
            <div>
              <div class="text-h5 font-weight-black">{{ stats.clients }}</div>
              <div class="text-caption text-medium-emphasis">Clients</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- ── Filters ── -->
    <VCard class="mb-4">
      <VCardText class="pa-4">
        <VRow dense align="center">
          <VCol cols="12" sm="6" md="5">
            <VTextField
              v-model="search"
              placeholder="Rechercher par nom, email ou téléphone…"
              prepend-inner-icon="tabler-search"
              density="compact"
              hide-details
              clearable
            />
          </VCol>
          <VCol cols="12" sm="6" md="3">
            <VSelect
              v-model="filterRole"
              :items="[
                { title: 'Tous les rôles', value: '' },
                { title: 'Administrateurs', value: 'admin' },
                { title: 'Clients', value: 'client' },
              ]"
              density="compact"
              hide-details
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- ── Table ── -->
    <VCard>
      <VDataTable
        :headers="headers"
        :items="users"
        :loading="loading"
        loading-text="Chargement…"
        no-data-text="Aucun utilisateur trouvé"
        item-value="id"
      >
        <template #item.user="{ item }">
          <div class="d-flex align-center gap-3 py-1">
            <VAvatar :color="avatarColor(item.id)" size="36">
              <span class="text-caption font-weight-bold text-white">{{ avatarText(item.name) }}</span>
            </VAvatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
            </div>
          </div>
        </template>

        <template #item.role="{ item }">
          <VChip :color="roleColor(item.role)" size="small" label>
            <VIcon start :icon="roleIcon(item.role)" size="13" />
            {{ roleLabel(item.role) }}
          </VChip>
        </template>

        <template #item.orders_count="{ item }">
          <VChip
            :color="item.orders_count > 0 ? 'info' : 'default'"
            size="small"
            variant="tonal"
            label
          >
            {{ item.orders_count }} commande{{ item.orders_count !== 1 ? 's' : '' }}
          </VChip>
        </template>

        <template #item.created_at="{ item }">
          <span class="text-caption text-medium-emphasis">
            {{ item.created_at?.split('T')[0] }}
          </span>
        </template>

        <template #item.actions="{ item }">
          <VBtn icon size="small" variant="text" @click="openDetail(item)">
            <VIcon icon="tabler-eye" />
            <VTooltip activator="parent">Voir le profil</VTooltip>
          </VBtn>
          <VBtn icon size="small" variant="text" @click="openEdit(item)">
            <VIcon icon="tabler-edit" />
            <VTooltip activator="parent">Modifier</VTooltip>
          </VBtn>
          <VBtn icon size="small" variant="text" color="error" @click="openDelete(item)">
            <VIcon icon="tabler-trash" />
            <VTooltip activator="parent">Supprimer</VTooltip>
          </VBtn>
        </template>
      </VDataTable>
    </VCard>

    <!-- ══════════════════════════════════════════════
         Dialog Création / Modification
    ══════════════════════════════════════════════ -->
    <VDialog v-model="dialog" max-width="520">
      <VCard>
        <VCardTitle class="pa-5 d-flex align-center gap-2">
          <VIcon :icon="selectedUser ? 'tabler-user-edit' : 'tabler-user-plus'" color="primary" />
          {{ selectedUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5">
          <VAlert v-if="formErrors._general" type="error" variant="tonal" density="compact" class="mb-4">
            {{ formErrors._general }}
          </VAlert>

          <VRow dense>
            <VCol cols="12">
              <VTextField
                v-model="form.name"
                label="Nom complet"
                prepend-inner-icon="tabler-user"
                :error-messages="formErrors.name"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                label="Adresse email"
                type="email"
                prepend-inner-icon="tabler-mail"
                :error-messages="formErrors.email"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="form.phone"
                label="Numéro T-Money / Flooz"
                prepend-inner-icon="tabler-device-mobile"
                :error-messages="formErrors.phone"
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="form.role"
                label="Rôle"
                prepend-inner-icon="tabler-shield"
                :items="[
                  { title: 'Client', value: 'client' },
                  { title: 'Administrateur', value: 'admin' },
                ]"
                :error-messages="formErrors.role"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                label="Mot de passe"
                :placeholder="selectedUser ? 'Laisser vide pour ne pas modifier' : 'Minimum 6 caractères'"
                prepend-inner-icon="tabler-lock"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
                :error-messages="formErrors.password"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="outlined" @click="dialog = false">Annuler</VBtn>
          <VBtn color="primary" :loading="saving" @click="save">
            <VIcon start :icon="selectedUser ? 'tabler-device-floppy' : 'tabler-user-plus'" />
            {{ selectedUser ? 'Enregistrer' : 'Créer' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- ══════════════════════════════════════════════
         Dialog Détail utilisateur
    ══════════════════════════════════════════════ -->
    <VDialog v-model="detailDialog" max-width="640" scrollable>
      <VCard v-if="selectedUser">
        <VCardTitle class="pa-5 d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-3">
            <VAvatar :color="avatarColor(selectedUser.id)" size="44">
              <span class="font-weight-bold text-white">{{ avatarText(selectedUser.name) }}</span>
            </VAvatar>
            <div>
              <div class="font-weight-bold">{{ selectedUser.name }}</div>
              <VChip :color="roleColor(selectedUser.role)" size="x-small" label class="mt-1">
                <VIcon start :icon="roleIcon(selectedUser.role)" size="11" />
                {{ roleLabel(selectedUser.role) }}
              </VChip>
            </div>
          </div>
          <VBtn icon variant="text" size="small" @click="detailDialog = false">
            <VIcon icon="tabler-x" />
          </VBtn>
        </VCardTitle>
        <VDivider />

        <VCardText>
          <!-- Infos -->
          <p class="text-caption font-weight-bold text-medium-emphasis mb-2 mt-2">INFORMATIONS</p>
          <VList density="compact" lines="two">
            <VListItem prepend-icon="tabler-mail">
              <VListItemTitle>{{ selectedUser.email }}</VListItemTitle>
              <VListItemSubtitle>Email</VListItemSubtitle>
            </VListItem>
            <VListItem prepend-icon="tabler-device-mobile">
              <VListItemTitle>{{ selectedUser.phone || '–' }}</VListItemTitle>
              <VListItemSubtitle>Téléphone</VListItemSubtitle>
            </VListItem>
            <VListItem prepend-icon="tabler-calendar">
              <VListItemTitle>{{ selectedUser.created_at?.split('T')[0] }}</VListItemTitle>
              <VListItemSubtitle>Date d'inscription</VListItemSubtitle>
            </VListItem>
          </VList>

          <!-- Orders history -->
          <template v-if="selectedUser.orders?.length">
            <VDivider class="my-3" />
            <p class="text-caption font-weight-bold text-medium-emphasis mb-3">
              COMMANDES ({{ selectedUser.orders_count }})
            </p>
            <VCard
              v-for="order in selectedUser.orders"
              :key="order.id"
              variant="outlined"
              class="mb-2"
            >
              <VCardText class="pa-3">
                <div class="d-flex justify-space-between align-center flex-wrap gap-2">
                  <div>
                    <div class="font-weight-medium text-body-2">{{ order.platform?.name }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ order.duration_months }} mois · {{ order.total_amount?.toLocaleString() }} XOF
                    </div>
                    <div v-if="order.end_date" class="text-caption text-medium-emphasis">
                      Expire : {{ order.end_date }}
                    </div>
                  </div>
                  <VChip
                    :color="statusConfig[order.status]?.color"
                    size="small"
                    label
                  >
                    {{ statusConfig[order.status]?.label }}
                  </VChip>
                </div>

                <!-- Accès + message WhatsApp (abonnement validé) -->
                <template v-if="orderHasAccess(order)">
                  <VDivider class="my-3" />
                  <div class="d-flex flex-wrap gap-4 mb-3">
                    <div>
                      <div class="text-caption text-medium-emphasis">Email</div>
                      <div class="text-body-2 font-weight-medium">{{ order.profile?.master_account?.email }}</div>
                    </div>
                    <div>
                      <div class="text-caption text-medium-emphasis">Mot de passe</div>
                      <div class="text-body-2 font-weight-medium">{{ order.profile?.master_account?.password }}</div>
                    </div>
                    <div>
                      <div class="text-caption text-medium-emphasis">Profil</div>
                      <div class="text-body-2 font-weight-medium">{{ order.profile?.profile_name || '–' }}</div>
                    </div>
                    <div>
                      <div class="text-caption text-medium-emphasis">Code PIN</div>
                      <div class="text-body-2 font-weight-medium">{{ order.profile?.pin_code || '–' }}</div>
                    </div>
                  </div>
                  <div class="d-flex gap-2 flex-wrap">
                    <VBtn
                      size="small"
                      color="success"
                      variant="flat"
                      @click="openWhatsapp(selectedUser.phone, accessMessage(selectedUser, order))"
                    >
                      <VIcon start icon="tabler-brand-whatsapp" />
                      Envoyer sur WhatsApp
                    </VBtn>
                    <VBtn
                      size="small"
                      color="success"
                      variant="outlined"
                      @click="copyText(accessMessage(selectedUser, order))"
                    >
                      <VIcon start icon="tabler-copy" />
                      Copier le message
                    </VBtn>
                  </div>
                </template>
              </VCardText>
            </VCard>
          </template>

          <div v-else class="text-center py-4">
            <VIcon icon="tabler-shopping-cart-off" size="36" color="secondary" class="mb-2" />
            <p class="text-body-2 text-medium-emphasis mb-0">Aucune commande</p>
          </div>
        </VCardText>

        <VDivider />
        <VCardActions class="pa-4">
          <VBtn color="primary" variant="tonal" @click="() => { detailDialog = false; openEdit(selectedUser) }">
            <VIcon start icon="tabler-edit" />
            Modifier
          </VBtn>
          <VSpacer />
          <VBtn color="error" variant="outlined" @click="openDelete(selectedUser)">
            <VIcon start icon="tabler-trash" />
            Supprimer
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- ══════════════════════════════════════════════
         Dialog Suppression
    ══════════════════════════════════════════════ -->
    <VDialog v-model="deleteDialog" max-width="420">
      <VCard>
        <VCardTitle class="pa-5 d-flex align-center gap-2">
          <VIcon icon="tabler-alert-triangle" color="error" />
          Supprimer l'utilisateur
        </VCardTitle>
        <VCardText class="pa-5">
          <p class="mb-3">
            Voulez-vous supprimer <strong>{{ selectedUser?.name }}</strong>
            (<span class="text-medium-emphasis">{{ selectedUser?.email }}</span>) ?
          </p>
          <VAlert type="error" variant="tonal" density="compact">
            Toutes les commandes associées seront également supprimées. Cette action est irréversible.
          </VAlert>
        </VCardText>
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="outlined" @click="deleteDialog = false">Annuler</VBtn>
          <VBtn color="error" :loading="deleting" @click="confirmDelete">
            <VIcon start icon="tabler-trash" />
            Supprimer
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- ══════════════════════════════════════════════
         Dialog Création par téléphone (client direct)
    ══════════════════════════════════════════════ -->
    <VDialog v-model="phoneDialog" max-width="480">
      <VCard>
        <VCardTitle class="pa-5 d-flex align-center gap-2">
          <VIcon icon="tabler-brand-whatsapp" color="success" />
          Ajouter un client direct
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5">
          <VAlert type="info" variant="tonal" density="compact" class="mb-4">
            Pour un client qui vous a contacté directement (WhatsApp, etc.).
            Seul le numéro de téléphone est requis&nbsp;: un compte est créé et un mot de passe
            généré automatiquement pour lui envoyer ses identifiants.
          </VAlert>

          <VAlert v-if="phoneErrors._general" type="error" variant="tonal" density="compact" class="mb-4">
            {{ phoneErrors._general }}
          </VAlert>

          <VRow dense>
            <VCol cols="12">
              <VTextField
                v-model="phoneForm.phone"
                label="Numéro de téléphone"
                placeholder="Ex : 90 00 00 00"
                prepend-inner-icon="tabler-device-mobile"
                :error-messages="phoneErrors.phone"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="phoneForm.name"
                label="Nom (facultatif)"
                prepend-inner-icon="tabler-user"
                :error-messages="phoneErrors.name"
              />
            </VCol>
          </VRow>

          <VDivider class="my-4" />

          <VSwitch
            v-model="withSubscription"
            color="primary"
            label="Créer aussi un abonnement (facultatif)"
            density="compact"
          />

          <VExpandTransition>
            <div v-if="withSubscription" class="mt-2">
              <VRow dense>
                <VCol cols="12">
                  <VSelect
                    v-model="subForm.platform_id"
                    :items="platforms"
                    item-title="name"
                    item-value="id"
                    label="Plateforme"
                    prepend-inner-icon="tabler-device-tv"
                    @update:model-value="onPlatformChange"
                  />
                </VCol>
                <VCol cols="12">
                  <VSelect
                    v-model="subForm.profile_id"
                    :items="availableProfiles"
                    :item-title="profileLabel"
                    item-value="id"
                    label="Profil à attribuer"
                    :loading="loadingProfiles"
                    :disabled="!subForm.platform_id"
                    :no-data-text="subForm.platform_id ? 'Aucun profil disponible' : 'Choisissez une plateforme'"
                    prepend-inner-icon="tabler-user-circle"
                    @update:model-value="onProfileChange"
                  />
                </VCol>
                <VCol cols="12" sm="6">
                  <VTextField
                    v-model="subForm.profile_name"
                    label="Nom du profil"
                    :disabled="!subForm.profile_id"
                    prepend-inner-icon="tabler-tag"
                  />
                </VCol>
                <VCol cols="12" sm="6">
                  <VTextField
                    v-model="subForm.pin_code"
                    label="Code PIN"
                    :disabled="!subForm.profile_id"
                    prepend-inner-icon="tabler-key"
                  />
                </VCol>
                <VCol cols="12" sm="6">
                  <VTextField
                    v-model="subForm.start_date"
                    type="date"
                    label="Date de début"
                    prepend-inner-icon="tabler-calendar"
                  />
                </VCol>
                <VCol cols="12" sm="6">
                  <VTextField
                    v-model="subForm.end_date"
                    type="date"
                    label="Date de fin"
                    prepend-inner-icon="tabler-calendar-check"
                  />
                </VCol>
              </VRow>
            </div>
          </VExpandTransition>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4">
          <VSpacer />
          <VBtn variant="outlined" @click="phoneDialog = false">Annuler</VBtn>
          <VBtn color="success" :loading="saving" @click="createByPhone">
            <VIcon start icon="tabler-user-plus" />
            Créer le compte
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- ══════════════════════════════════════════════
         Dialog Identifiants générés
    ══════════════════════════════════════════════ -->
    <VDialog v-model="credentialsDialog" max-width="480" persistent>
      <VCard v-if="createdCredentials">
        <VCardTitle class="pa-5 d-flex align-center gap-2">
          <VIcon icon="tabler-circle-check" color="success" />
          Compte créé
        </VCardTitle>
        <VDivider />
        <VCardText class="pa-5">
          <VAlert type="warning" variant="tonal" density="compact" class="mb-4">
            Notez ou envoyez ces identifiants maintenant&nbsp;: le mot de passe
            ne sera plus affiché ensuite.
          </VAlert>

          <VList density="compact" class="mb-2">
            <VListItem prepend-icon="tabler-user">
              <VListItemTitle>{{ createdCredentials.name }}</VListItemTitle>
              <VListItemSubtitle>Nom</VListItemSubtitle>
            </VListItem>
            <VListItem prepend-icon="tabler-device-mobile">
              <VListItemTitle>{{ createdCredentials.phone }}</VListItemTitle>
              <VListItemSubtitle>Identifiant (téléphone)</VListItemSubtitle>
            </VListItem>
            <VListItem prepend-icon="tabler-lock">
              <VListItemTitle class="font-weight-bold">{{ createdCredentials.password }}</VListItemTitle>
              <VListItemSubtitle>Mot de passe</VListItemSubtitle>
            </VListItem>
          </VList>

          <template v-if="createdCredentials.subscription">
            <VDivider class="my-3" />
            <p class="text-caption text-medium-emphasis mb-2">Abonnement créé</p>
            <VList density="compact" class="mb-2">
              <VListItem prepend-icon="tabler-device-tv">
                <VListItemTitle>{{ createdCredentials.subscription.platform_name }}</VListItemTitle>
                <VListItemSubtitle>Plateforme</VListItemSubtitle>
              </VListItem>
              <VListItem prepend-icon="tabler-mail">
                <VListItemTitle>{{ createdCredentials.subscription.account_email }}</VListItemTitle>
                <VListItemSubtitle>Email du compte maître</VListItemSubtitle>
              </VListItem>
              <VListItem prepend-icon="tabler-lock">
                <VListItemTitle>{{ createdCredentials.subscription.account_password }}</VListItemTitle>
                <VListItemSubtitle>Mot de passe du compte maître</VListItemSubtitle>
              </VListItem>
              <VListItem prepend-icon="tabler-user-circle">
                <VListItemTitle>{{ createdCredentials.subscription.profile_name }} · PIN {{ createdCredentials.subscription.pin_code || '—' }}</VListItemTitle>
                <VListItemSubtitle>Profil attribué</VListItemSubtitle>
              </VListItem>
              <VListItem prepend-icon="tabler-calendar">
                <VListItemTitle>{{ createdCredentials.subscription.start_date }} → {{ createdCredentials.subscription.end_date }}</VListItemTitle>
                <VListItemSubtitle>Période</VListItemSubtitle>
              </VListItem>
            </VList>
          </template>
        </VCardText>
        <VDivider />
        <VCardActions class="pa-4 flex-wrap gap-2">
          <VBtn
            color="success"
            variant="flat"
            @click="openWhatsapp(createdCredentials.phone, fullMessage(createdCredentials))"
          >
            <VIcon start icon="tabler-brand-whatsapp" />
            Envoyer sur WhatsApp
          </VBtn>
          <VBtn
            color="success"
            variant="outlined"
            @click="copyText(fullMessage(createdCredentials))"
          >
            <VIcon start icon="tabler-copy" />
            Copier
          </VBtn>
          <VSpacer />
          <VBtn variant="tonal" @click="credentialsDialog = false">Fermer</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- ── Snackbar ── -->
    <VSnackbar v-model="snackbar.show" :color="snackbar.color" location="top end" timeout="2500">
      {{ snackbar.text }}
    </VSnackbar>
  </div>
</template>
