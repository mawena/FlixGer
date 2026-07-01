<script setup>
definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()
const router = useRouter()
const ability = useAbility()

const userData = useCookie('userData')
const accessToken = useCookie('accessToken')
const isLoggedIn = computed(() => !!accessToken.value)

// Steps: 1=select  2=account  3=payment  4=confirmation
const step = ref(1)
const platforms = ref([])
const loading = ref(true)
const submitting = ref(false)
const createdOrder = ref(null)
const errors = ref({})

const form = ref({
  platform_id: route.query.platform_id ? Number(route.query.platform_id) : null,
  duration_months: 1,
  transaction_reference: '',
  payment_screenshot: null,
})

// Account form (step 2 — only if not logged in)
const authMode = ref('register') // 'register' | 'login'
const accountForm = ref({ name: '', email: '', phone: '', password: '', password_confirmation: '' })

const selectedPlatform = computed(() => platforms.value.find(p => p.id === form.value.platform_id))

const durations = [
  { months: 1, label: '1 mois', discount: 0 },
  { months: 3, label: '3 mois', discount: 10 },
  { months: 6, label: '6 mois', discount: 15 },
]

const totalAmount = computed(() => {
  if (!selectedPlatform.value) return 0
  const d = durations.find(d => d.months === form.value.duration_months)
  const base = selectedPlatform.value.price_per_month * form.value.duration_months
  return Math.round(base * (1 - (d?.discount || 0) / 100))
})

const savingsAmount = computed(() => {
  if (!selectedPlatform.value) return 0
  const base = selectedPlatform.value.price_per_month * form.value.duration_months
  return base - totalAmount.value
})

const TMONEY_NUMBER = '9X XX XX XX'
const TMONEY_NAME = 'FlixGer Services'

const fetchPlatforms = async () => {
  try {
    const { data } = await useApi('/platforms')
    platforms.value = data.value || []
  } finally {
    loading.value = false
  }
}
onMounted(fetchPlatforms)

// ── Step 1 → 2 or 3 ──────────────────────────────────
const goToStep2 = () => {
  if (!form.value.platform_id) return
  step.value = isLoggedIn.value ? 3 : 2
}

// ── Step 2: Auth ──────────────────────────────────────
const authErrors = ref({})
const authLoading = ref(false)

const doAuth = async () => {
  authErrors.value = {}
  authLoading.value = true
  try {
    const endpoint = authMode.value === 'register' ? '/auth/register' : '/auth/login'
    const body = authMode.value === 'register'
      ? accountForm.value
      : { email: accountForm.value.email, password: accountForm.value.password }

    const res = await $api(endpoint, {
      method: 'POST',
      body,
      onResponseError({ response }) {
        authErrors.value = response._data.errors || { general: response._data.message }
      },
    })
    if (!res) return

    useCookie('userAbilityRules').value = res.userAbilityRules
    ability.update(res.userAbilityRules)
    useCookie('userData').value = res.userData
    accessToken.value = res.accessToken

    step.value = 3
  } finally {
    authLoading.value = false
  }
}

// ── Step 3: Submit order ──────────────────────────────
const handleFileChange = e => { form.value.payment_screenshot = e.target.files[0] }

const submitOrder = async () => {
  submitting.value = true
  errors.value = {}
  try {
    const fd = new FormData()
    fd.append('platform_id', form.value.platform_id)
    fd.append('duration_months', form.value.duration_months)
    fd.append('transaction_reference', form.value.transaction_reference)
    fd.append('payment_screenshot', form.value.payment_screenshot)

    const res = await fetch('/api/client/orders', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken.value}`,
      },
      body: fd,
    })

    if (!res.ok) {
      const err = await res.json()
      errors.value = err.errors || { general: err.message || 'Une erreur est survenue' }
      return
    }
    createdOrder.value = await res.json()
    step.value = 4
  } finally {
    submitting.value = false
  }
}

// ── Helpers ───────────────────────────────────────────
const stepLabel = s => ['', 'Offre', 'Compte', 'Paiement', '✓'][s]
const platformColors = { Netflix: '#E50914', Spotify: '#1DB954', 'Disney+': '#113CCF', 'Prime Video': '#00A8E1' }
const getColor = n => platformColors[n] || '#7367F0'
const logoFallback = e => { e.target.style.display = 'none' }

const isPasswordVisible = ref(false)
</script>

<template>
  <div class="order-root">

    <!-- ── Top bar ── -->
    <div class="order-topbar px-4">
      <RouterLink to="/catalog">
        <VBtn icon variant="text" size="small">
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
      </RouterLink>
      <div class="flex-1 text-center">
        <span class="text-body-2 font-weight-bold">Commander un abonnement</span>
      </div>
      <div style="width:36px" />
    </div>

    <!-- ── Step indicator ── -->
    <div class="step-bar px-4 pb-3" v-if="step < 4">
      <div class="step-track">
        <div
          v-for="s in (isLoggedIn ? [1, 3] : [1, 2, 3])"
          :key="s"
          class="step-dot"
          :class="{
            'step-dot--active': step === s,
            'step-dot--done': step > s
          }"
        >
          <VIcon v-if="step > s" icon="tabler-check" size="12" />
          <span v-else>{{ isLoggedIn ? [1,2][([1,3].indexOf(s))] : s }}</span>
        </div>
        <div class="step-line" />
      </div>
      <div class="step-labels text-caption text-medium-emphasis mt-1">
        <span>Offre</span>
        <span v-if="!isLoggedIn">Compte</span>
        <span>Paiement</span>
      </div>
    </div>

    <div class="order-body pa-4">

      <!-- ══════════════════════════════════════════════
           STEP 1 — Sélection offre
      ══════════════════════════════════════════════ -->
      <div v-if="step === 1">

        <VProgressCircular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-8" size="48" />

        <div v-else>
          <!-- Platform picker -->
          <p class="field-label mb-2">Choisissez votre plateforme</p>
          <VRow dense class="mb-4">
            <VCol
              v-for="p in platforms"
              :key="p.id"
              cols="6"
            >
              <div
                class="plat-pick"
                :class="{
                  'plat-pick--selected': form.platform_id === p.id,
                  'plat-pick--disabled': p.available_profiles === 0
                }"
                @click="p.available_profiles > 0 && (form.platform_id = p.id)"
              >
                <div class="plat-pick-stripe" :style="{ background: getColor(p.name) }" />
                <div class="pa-2 text-center">
                  <div class="plat-pick-logo mb-1">
                    <img :src="p.logo_url" :alt="p.name" @error="logoFallback">
                  </div>
                  <div class="text-caption font-weight-bold">{{ p.name }}</div>
                  <div class="text-caption" style="font-size:0.7rem">
                    {{ p.price_per_month.toLocaleString() }} XOF/mois
                  </div>
                  <VChip
                    v-if="p.available_profiles === 0"
                    color="error"
                    size="x-small"
                    class="mt-1"
                    label
                  >Complet</VChip>
                </div>
              </div>
            </VCol>
          </VRow>

          <!-- Duration picker -->
          <p class="field-label mb-2">Choisissez la durée</p>
          <VRow dense class="mb-5">
            <VCol v-for="d in durations" :key="d.months" cols="4">
              <div
                class="dur-pick"
                :class="{ 'dur-pick--selected': form.duration_months === d.months }"
                @click="form.duration_months = d.months"
              >
                <div class="dur-pick-months">{{ d.months }}</div>
                <div class="dur-pick-label">mois</div>
                <VChip
                  v-if="d.discount"
                  color="success"
                  size="x-small"
                  class="mt-1"
                  label
                >-{{ d.discount }}%</VChip>
              </div>
            </VCol>
          </VRow>

          <!-- Summary box -->
          <Transition name="fade">
            <div v-if="selectedPlatform" class="summary-box mb-5">
              <div class="d-flex justify-space-between align-center mb-1">
                <span class="text-body-2">{{ selectedPlatform.name }} × {{ form.duration_months }} mois</span>
                <span class="text-body-2">{{ (selectedPlatform.price_per_month * form.duration_months).toLocaleString() }} XOF</span>
              </div>
              <div v-if="savingsAmount > 0" class="d-flex justify-space-between align-center mb-1">
                <span class="text-caption text-success">Réduction appliquée</span>
                <span class="text-caption text-success">- {{ savingsAmount.toLocaleString() }} XOF</span>
              </div>
              <VDivider class="my-2" />
              <div class="d-flex justify-space-between align-center">
                <span class="font-weight-bold">Total à payer</span>
                <span class="text-h6 font-weight-bold text-primary">{{ totalAmount.toLocaleString() }} XOF</span>
              </div>
            </div>
          </Transition>

          <VBtn
            color="primary"
            block
            size="large"
            :disabled="!form.platform_id"
            @click="goToStep2"
          >
            Continuer
            <VIcon end icon="tabler-arrow-right" />
          </VBtn>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════
           STEP 2 — Compte (uniquement si non connecté)
      ══════════════════════════════════════════════ -->
      <div v-else-if="step === 2">

        <!-- Mode toggle -->
        <div class="auth-toggle mb-5">
          <button
            class="auth-toggle-btn"
            :class="{ active: authMode === 'register' }"
            @click="authMode = 'register'"
          >
            Nouveau compte
          </button>
          <button
            class="auth-toggle-btn"
            :class="{ active: authMode === 'login' }"
            @click="authMode = 'login'"
          >
            J'ai déjà un compte
          </button>
        </div>

        <VAlert v-if="authErrors.general" type="error" variant="tonal" class="mb-4" density="compact">
          {{ authErrors.general }}
        </VAlert>

        <template v-if="authMode === 'register'">
          <VTextField
            v-model="accountForm.name"
            label="Nom complet"
            placeholder="Kofi Amega"
            :error-messages="authErrors.name"
            class="mb-3"
            hide-details="auto"
          />
          <VTextField
            v-model="accountForm.email"
            label="Email"
            type="email"
            placeholder="kofi@example.com"
            :error-messages="authErrors.email"
            class="mb-3"
            hide-details="auto"
          />
          <VTextField
            v-model="accountForm.phone"
            label="Numéro T-Money / Flooz"
            placeholder="9X XX XX XX"
            :error-messages="authErrors.phone"
            class="mb-3"
            hide-details="auto"
          />
          <VTextField
            v-model="accountForm.password"
            label="Mot de passe"
            :type="isPasswordVisible ? 'text' : 'password'"
            :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
            :error-messages="authErrors.password"
            class="mb-3"
            hide-details="auto"
            @click:append-inner="isPasswordVisible = !isPasswordVisible"
          />
          <VTextField
            v-model="accountForm.password_confirmation"
            label="Confirmer le mot de passe"
            type="password"
            class="mb-5"
            hide-details="auto"
          />
        </template>

        <template v-else>
          <VTextField
            v-model="accountForm.email"
            label="Email"
            type="email"
            placeholder="kofi@example.com"
            :error-messages="authErrors.email"
            class="mb-3"
            hide-details="auto"
          />
          <VTextField
            v-model="accountForm.password"
            label="Mot de passe"
            :type="isPasswordVisible ? 'text' : 'password'"
            :append-inner-icon="isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'"
            :error-messages="authErrors.password"
            class="mb-5"
            hide-details="auto"
            @click:append-inner="isPasswordVisible = !isPasswordVisible"
          />
        </template>

        <div class="d-flex gap-3">
          <VBtn variant="outlined" @click="step = 1">
            <VIcon start icon="tabler-arrow-left" />
            Retour
          </VBtn>
          <VBtn
            color="primary"
            flex="1"
            :loading="authLoading"
            @click="doAuth"
          >
            {{ authMode === 'register' ? 'Créer mon compte' : 'Se connecter' }}
            <VIcon end icon="tabler-arrow-right" />
          </VBtn>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════
           STEP 3 — Paiement T-Money
      ══════════════════════════════════════════════ -->
      <div v-else-if="step === 3">

        <!-- Recap -->
        <div class="recap-chip-row mb-4 d-flex align-center gap-2 flex-wrap">
          <VChip label size="small" color="primary" variant="tonal">
            <VIcon start icon="tabler-device-tv" size="14" />
            {{ selectedPlatform?.name }}
          </VChip>
          <VChip label size="small" color="default" variant="tonal">
            {{ form.duration_months }} mois
          </VChip>
          <VChip label size="small" color="success">
            {{ totalAmount.toLocaleString() }} XOF
          </VChip>
        </div>

        <!-- Instructions card -->
        <VCard variant="tonal" color="info" class="mb-4">
          <VCardText class="pa-4">
            <div class="d-flex align-center gap-2 mb-3">
              <VIcon icon="tabler-device-mobile" color="info" />
              <span class="font-weight-bold">Instruction de paiement T-Money</span>
            </div>
            <ol class="instruction-list">
              <li>Ouvrez <strong>T-Money</strong> ou <strong>Flooz</strong></li>
              <li>
                Envoyez exactement
                <strong class="text-success" style="font-size:1.05rem">
                  {{ totalAmount.toLocaleString() }} XOF
                </strong>
              </li>
              <li>
                Au numéro : <strong>{{ TMONEY_NUMBER }}</strong>
                <VChip size="x-small" class="ms-1" label>{{ TMONEY_NAME }}</VChip>
              </li>
              <li>Notez la <strong>référence</strong> affichée sur le reçu</li>
              <li>Prenez une <strong>capture d'écran</strong> du reçu</li>
            </ol>
          </VCardText>
        </VCard>

        <!-- Form -->
        <VAlert v-if="errors.general" type="error" variant="tonal" density="compact" class="mb-3">
          {{ errors.general }}
        </VAlert>

        <VTextField
          v-model="form.transaction_reference"
          label="Référence de la transaction"
          placeholder="Ex : TXN2026XXXXXX"
          :error-messages="errors.transaction_reference"
          prepend-inner-icon="tabler-hash"
          class="mb-3"
          hide-details="auto"
        />

        <div class="file-drop-zone mb-5" :class="{ 'has-file': form.payment_screenshot }">
          <label class="file-drop-label">
            <input
              type="file"
              accept="image/*"
              class="file-input"
              @change="handleFileChange"
            >
            <div v-if="!form.payment_screenshot" class="text-center py-6">
              <VIcon icon="tabler-photo-up" size="36" color="primary" class="mb-2" />
              <div class="text-body-2 font-weight-medium">Déposez votre reçu ici</div>
              <div class="text-caption text-medium-emphasis">ou cliquez pour choisir une photo</div>
            </div>
            <div v-else class="d-flex align-center gap-3 pa-3">
              <VIcon icon="tabler-photo-check" color="success" size="28" />
              <div>
                <div class="text-body-2 font-weight-medium text-success">Photo ajoutée</div>
                <div class="text-caption text-medium-emphasis">{{ form.payment_screenshot?.name }}</div>
              </div>
              <VBtn
                icon
                size="x-small"
                variant="text"
                class="ms-auto"
                @click.prevent="form.payment_screenshot = null"
              >
                <VIcon icon="tabler-x" size="14" />
              </VBtn>
            </div>
          </label>
          <div v-if="errors.payment_screenshot" class="text-error text-caption mt-1 px-3">
            {{ errors.payment_screenshot[0] }}
          </div>
        </div>

        <div class="d-flex gap-3">
          <VBtn variant="outlined" @click="step = isLoggedIn ? 1 : 2">
            <VIcon start icon="tabler-arrow-left" />
            Retour
          </VBtn>
          <VBtn
            color="success"
            flex="1"
            size="large"
            :loading="submitting"
            :disabled="!form.transaction_reference || !form.payment_screenshot"
            @click="submitOrder"
          >
            <VIcon start icon="tabler-send" />
            Envoyer ma commande
          </VBtn>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════
           STEP 4 — Confirmation
      ══════════════════════════════════════════════ -->
      <div v-else-if="step === 4" class="text-center py-6">
        <div class="success-anim mb-5">
          <VIcon icon="tabler-circle-check-filled" color="success" size="80" />
        </div>
        <h2 class="text-h6 font-weight-bold mb-2">Commande envoyée !</h2>
        <p class="text-body-2 text-medium-emphasis mb-1">
          Commande <strong>#{{ createdOrder?.id }}</strong> en attente de validation.
        </p>
        <p class="text-body-2 text-medium-emphasis mb-6">
          Vous recevrez vos identifiants dans votre espace sous 24h.
        </p>

        <VAlert type="warning" variant="tonal" class="text-left mb-6" density="compact">
          Conservez la référence <strong>{{ createdOrder?.transaction_reference }}</strong>.
          Ne tentez pas d'annuler le transfert T-Money.
        </VAlert>

        <div class="d-flex flex-column gap-3">
          <RouterLink to="/client/dashboard">
            <VBtn color="primary" block size="large">
              <VIcon start icon="tabler-layout-dashboard" />
              Aller dans mon espace
            </VBtn>
          </RouterLink>
          <RouterLink to="/catalog">
            <VBtn variant="outlined" block>
              Retour au catalogue
            </VBtn>
          </RouterLink>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.order-root {
  min-height: 100vh;
  max-width: 560px;
  margin: 0 auto;
  background: rgb(var(--v-theme-background));
}

/* Topbar */
.order-topbar {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-block-end: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
  position: sticky;
  top: 0;
  z-index: 10;
}

/* Step bar */
.step-bar { padding-top: 16px; }
.step-track {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.step-line {
  position: absolute;
  top: 50%;
  left: 16%;
  right: 16%;
  height: 2px;
  background: rgba(var(--v-theme-on-surface), 0.12);
  z-index: 0;
}
.step-dot {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.2);
  background: rgb(var(--v-theme-surface));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 1;
  color: rgba(var(--v-theme-on-surface), 0.4);
  transition: all 0.2s;
}
.step-dot--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgb(var(--v-theme-primary));
  color: white;
}
.step-dot--done {
  border-color: rgb(var(--v-theme-success));
  background: rgb(var(--v-theme-success));
  color: white;
}
.step-labels {
  display: flex;
  justify-content: space-around;
}

/* Field label */
.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.75);
}

/* Platform picker */
.plat-pick {
  border: 2px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s;
}
.plat-pick:hover { border-color: rgb(var(--v-theme-primary)); }
.plat-pick--selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}
.plat-pick--disabled { opacity: 0.45; cursor: default; pointer-events: none; }
.plat-pick-stripe { height: 3px; }
.plat-pick-logo { height: 28px; display: flex; align-items: center; justify-content: center; }
.plat-pick-logo img { max-width: 42px; max-height: 22px; object-fit: contain; }

/* Duration picker */
.dur-pick {
  border: 2px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px;
  padding: 10px 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
}
.dur-pick:hover { border-color: rgb(var(--v-theme-primary)); }
.dur-pick--selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.06);
}
.dur-pick-months { font-size: 1.4rem; font-weight: 800; line-height: 1; }
.dur-pick-label { font-size: 0.7rem; color: rgba(var(--v-theme-on-surface), 0.55); }

/* Summary box */
.summary-box {
  background: rgba(var(--v-theme-primary), 0.05);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 10px;
  padding: 14px 16px;
}

/* Auth toggle */
.auth-toggle {
  display: flex;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 10px;
  overflow: hidden;
}
.auth-toggle-btn {
  flex: 1;
  padding: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(var(--v-theme-on-surface), 0.55);
  transition: all 0.15s;
}
.auth-toggle-btn.active {
  background: rgb(var(--v-theme-primary));
  color: white;
}

/* Instructions */
.instruction-list {
  padding-left: 20px;
  margin: 0;
}
.instruction-list li {
  margin-bottom: 6px;
  font-size: 0.9rem;
}

/* File drop zone */
.file-drop-zone {
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.15s;
}
.file-drop-zone:hover, .file-drop-zone.has-file {
  border-color: rgb(var(--v-theme-primary));
}
.file-drop-label {
  display: block;
  cursor: pointer;
  width: 100%;
}
.file-input {
  display: none;
}

/* Fade transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Success anim */
.success-anim {
  animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
