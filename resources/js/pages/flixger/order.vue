<script setup>
definePage({
  meta: {
    layout: 'blank',
    public: true,
  },
})

const route = useRoute()
const router = useRouter()

// Steps: 1=select, 2=payment, 3=confirmation
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

const selectedPlatform = computed(() =>
  platforms.value.find(p => p.id === form.value.platform_id),
)

const totalAmount = computed(() => {
  if (!selectedPlatform.value) return 0
  return selectedPlatform.value.price_per_month * form.value.duration_months
})

const durations = [
  { value: 1, label: '1 mois' },
  { value: 3, label: '3 mois (-10%)' },
  { value: 6, label: '6 mois (-15%)' },
]

const fetchPlatforms = async () => {
  try {
    const { data } = await useApi('/platforms')
    platforms.value = data.value || []
  } finally {
    loading.value = false
  }
}

onMounted(fetchPlatforms)

const handleFileChange = (file) => {
  form.value.payment_screenshot = file
}

const submitOrder = async () => {
  submitting.value = true
  errors.value = {}

  try {
    const fd = new FormData()
    fd.append('platform_id', form.value.platform_id)
    fd.append('duration_months', form.value.duration_months)
    fd.append('transaction_reference', form.value.transaction_reference)
    fd.append('payment_screenshot', form.value.payment_screenshot)

    const userData = useCookie('userData')
    const token = useCookie('accessToken')

    const res = await fetch('/api/client/orders', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
      },
      body: fd,
    })

    if (!res.ok) {
      const errData = await res.json()
      if (errData.errors) errors.value = errData.errors
      else errors.value = { general: errData.message || 'Une erreur est survenue' }
      return
    }

    createdOrder.value = await res.json()
    step.value = 3
  } finally {
    submitting.value = false
  }
}

const TMONEY_NUMBER = '9X XX XX XX'
const TMONEY_NAME = 'FlixGer Services'
</script>

<template>
  <div class="order-wrapper">
    <!-- Header -->
    <div class="order-header pa-4 d-flex align-center gap-3">
      <RouterLink to="/flixger/catalog">
        <VBtn icon variant="text" color="white">
          <VIcon icon="tabler-arrow-left" />
        </VBtn>
      </RouterLink>
      <div>
        <h1 class="text-h6 font-weight-bold text-white">Commander un abonnement</h1>
        <p class="text-caption text-white opacity-75 mb-0">FlixGer – Togo</p>
      </div>
    </div>

    <div class="pa-4">
      <!-- Step 1: Select platform & duration -->
      <VCard v-if="step === 1" class="mb-4">
        <VCardText>
          <h3 class="text-subtitle-1 font-weight-bold mb-4">
            <VIcon icon="tabler-list-check" class="me-2" />
            Étape 1 : Votre sélection
          </h3>

          <VProgressCircular v-if="loading" indeterminate color="primary" class="d-block mx-auto my-4" />

          <div v-else>
            <label class="text-body-2 font-weight-medium mb-2 d-block">Plateforme</label>
            <VRow class="mb-4">
              <VCol
                v-for="p in platforms"
                :key="p.id"
                cols="6"
                sm="3"
              >
                <VCard
                  :color="form.platform_id === p.id ? 'primary' : undefined"
                  :variant="form.platform_id === p.id ? 'elevated' : 'outlined'"
                  class="cursor-pointer text-center pa-2"
                  :disabled="p.available_profiles === 0"
                  @click="form.platform_id = p.id"
                >
                  <div class="text-caption font-weight-bold">{{ p.name }}</div>
                  <div class="text-caption">{{ p.price_per_month.toLocaleString() }} XOF/mois</div>
                </VCard>
              </VCol>
            </VRow>

            <label class="text-body-2 font-weight-medium mb-2 d-block">Durée</label>
            <VBtnToggle
              v-model="form.duration_months"
              mandatory
              color="primary"
              class="mb-4"
            >
              <VBtn
                v-for="d in durations"
                :key="d.value"
                :value="d.value"
                size="small"
              >
                {{ d.label }}
              </VBtn>
            </VBtnToggle>

            <!-- Summary -->
            <VDivider class="mb-4" />
            <div v-if="selectedPlatform" class="d-flex justify-space-between align-center mb-4">
              <span class="text-body-2">Total à payer :</span>
              <VChip color="success" label size="large">
                <strong>{{ totalAmount.toLocaleString() }} XOF</strong>
              </VChip>
            </div>

            <VBtn
              color="primary"
              block
              :disabled="!form.platform_id"
              @click="step = 2"
            >
              Continuer vers le paiement
              <VIcon end icon="tabler-arrow-right" />
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <!-- Step 2: Payment -->
      <VCard v-else-if="step === 2" class="mb-4">
        <VCardText>
          <h3 class="text-subtitle-1 font-weight-bold mb-4">
            <VIcon icon="tabler-transfer" class="me-2" />
            Étape 2 : Paiement T-Money
          </h3>

          <!-- Payment instructions -->
          <VAlert type="info" variant="tonal" class="mb-4">
            <div class="text-body-2">
              <strong>Instructions de paiement :</strong>
              <ol class="mt-2 ps-4">
                <li>Ouvrez votre application T-Money</li>
                <li>
                  Effectuez un transfert de
                  <strong class="text-primary">{{ totalAmount.toLocaleString() }} XOF</strong>
                </li>
                <li>
                  Vers le numéro : <strong>{{ TMONEY_NUMBER }}</strong> ({{ TMONEY_NAME }})
                </li>
                <li>Notez la référence de transaction</li>
                <li>Prenez une capture d'écran du reçu</li>
              </ol>
            </div>
          </VAlert>

          <!-- Summary recap -->
          <VCard variant="tonal" color="surface-variant" class="mb-4 pa-3">
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Plateforme :</span>
              <strong>{{ selectedPlatform?.name }}</strong>
            </div>
            <div class="d-flex justify-space-between text-body-2 mb-1">
              <span>Durée :</span>
              <strong>{{ form.duration_months }} mois</strong>
            </div>
            <div class="d-flex justify-space-between text-body-2">
              <span>Montant :</span>
              <strong class="text-success">{{ totalAmount.toLocaleString() }} XOF</strong>
            </div>
          </VCard>

          <!-- Form -->
          <VAlert v-if="errors.general" type="error" class="mb-3">
            {{ errors.general }}
          </VAlert>

          <VTextField
            v-model="form.transaction_reference"
            label="Référence de transaction T-Money"
            placeholder="Ex: TXN2024XXXXXX"
            :error-messages="errors.transaction_reference"
            class="mb-3"
          />

          <VFileInput
            label="Capture d'écran du reçu T-Money"
            accept="image/*"
            :error-messages="errors.payment_screenshot"
            prepend-icon=""
            prepend-inner-icon="tabler-photo"
            class="mb-4"
            @change="e => handleFileChange(e.target.files[0])"
          />

          <div class="d-flex gap-3">
            <VBtn
              variant="outlined"
              @click="step = 1"
            >
              <VIcon start icon="tabler-arrow-left" />
              Retour
            </VBtn>
            <VBtn
              color="primary"
              flex="1"
              :loading="submitting"
              :disabled="!form.transaction_reference || !form.payment_screenshot"
              @click="submitOrder"
            >
              <VIcon start icon="tabler-send" />
              Soumettre ma commande
            </VBtn>
          </div>
        </VCardText>
      </VCard>

      <!-- Step 3: Confirmation -->
      <VCard v-else-if="step === 3" class="mb-4">
        <VCardText class="text-center py-8">
          <VIcon icon="tabler-circle-check" color="success" size="64" class="mb-4" />
          <h3 class="text-h6 font-weight-bold mb-2">Commande soumise avec succès !</h3>
          <p class="text-body-2 text-medium-emphasis mb-6">
            Votre commande #{{ createdOrder?.id }} est en attente de validation.<br>
            Vous recevrez vos identifiants sous 24h après vérification de votre paiement.
          </p>

          <VAlert type="warning" variant="tonal" class="text-left mb-6">
            <strong>Important :</strong> Conservez la référence <strong>{{ createdOrder?.transaction_reference }}</strong>.
            Ne tentez pas d'annuler votre transfert T-Money.
          </VAlert>

          <div class="d-flex gap-3 justify-center flex-wrap">
            <RouterLink to="/login">
              <VBtn color="primary">
                <VIcon start icon="tabler-login" />
                Suivre ma commande
              </VBtn>
            </RouterLink>
            <RouterLink to="/flixger/catalog">
              <VBtn variant="outlined">
                Retour au catalogue
              </VBtn>
            </RouterLink>
          </div>
        </VCardText>
      </VCard>
    </div>
  </div>
</template>

<style scoped>
.order-wrapper {
  min-height: 100vh;
  max-width: 600px;
  margin: 0 auto;
  background: rgb(var(--v-theme-background));
}

.order-header {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
}
</style>
