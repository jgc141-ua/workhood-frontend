<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import AppModal from '@/components/AppModal.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'
import FormActions from '@/components/forms/FormActions.vue'
import { useMembershipTypeStore } from '@/stores/membershipTypeStore'
import { useMembershipStore } from '@/stores/membershipStore'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  memberEmail: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'subscribed'])

const membershipTypeStore = useMembershipTypeStore()
const membershipStore = useMembershipStore()
const authStore = useAuthStore()

const isOperatorMode = computed(() => !!props.memberEmail)

const selectedMembershipTypeId = ref('')
const selectedResourceId = ref('')
const autoRenew = ref(true)

const activeMembershipTypes = computed(() =>
  membershipTypeStore.allMembershipTypes.filter((m) => m.is_active),
)

const membershipTypeOptions = computed(() =>
  activeMembershipTypes.value.map((m) => ({ value: m.id, label: `${m.name} — ${m.monthly_price} €/mes` })),
)

const selectedMembershipType = computed(() =>
  activeMembershipTypes.value.find((m) => m.id === Number(selectedMembershipTypeId.value))
)

const isFixed = computed(() => !!selectedMembershipType.value?.is_fixed)

const resourceOptions = computed(() =>
  membershipStore.availableResources.map((r) => ({ value: r.id, label: r.name }))
)

const canSubmit = computed(() => {
  if (!selectedMembershipTypeId.value) return false
  if (isFixed.value && !selectedResourceId.value) return false
  return true
})

// Restablece los campos del formulario
function reset() {
  selectedMembershipTypeId.value = ''
  selectedResourceId.value = ''
  autoRenew.value = true
  membershipStore.availableResources = []
}

// Cierra el modal y limpia el formulario
function close() {
  reset()
  emit('close')
}

// Carga los recursos disponibles cuando se elige una membresía fija
watch(selectedMembershipTypeId, async (id) => {
  selectedResourceId.value = ''
  membershipStore.availableResources = []
  if (!id) return

  const membershipType = selectedMembershipType.value
  if (membershipType?.is_fixed) {
    await membershipStore.fetchAvailableResources(id).catch(() => { })
  }
})

onMounted(() => {
  if (!authStore.isAuthenticated) return
  if (!membershipTypeStore.allMembershipTypes.length) {
    membershipTypeStore.fetchMembershipTypes().catch(() => { })
  }
})

// Gestiona el envío del formulario de suscripción
async function handleSubmit() {
  if (!canSubmit.value) return

  const payload = {
    membership_type: Number(selectedMembershipTypeId.value),
    auto_renew: autoRenew.value,
  }
  if (isFixed.value) {
    payload.resource = Number(selectedResourceId.value)
  }

  try {
    if (isOperatorMode.value) {
      await membershipStore.subscribeMember(props.memberEmail, payload)
    } else {
      await membershipStore.subscribe(payload)
    }
    emit('subscribed')
    close()
  } catch {
    // El error ya está en membershipStore.error
  }
}
</script>

<template>
  <AppModal :show="show" :title="isOperatorMode ? `Suscribir a ${memberEmail}` : 'Suscribirse a una membresía'"
    @close="close">
    <form class="subscribe-form" @submit.prevent="handleSubmit">
      <PrettyInputSelector v-model="selectedMembershipTypeId" label="Tipo de membresía" :options="membershipTypeOptions"
        placeholder="Selecciona una membresía" search-placeholder="Buscar membresía..." required />

      <div v-if="selectedMembershipType" class="membership-summary">
        <p>{{ selectedMembershipType.description || 'Sin descripción' }}</p>

        <span class="pill-button" :class="selectedMembershipType.is_fixed ? 'pill-button-success' : 'pill-button-warn'">
          {{ selectedMembershipType.is_fixed ? 'Recurso fijo' : 'Recurso flexible' }}
        </span>
      </div>

      <PrettyInputSelector v-if="isFixed" v-model="selectedResourceId" label="Recurso asignado"
        :options="resourceOptions" placeholder="Selecciona un recurso disponible" search-placeholder="Buscar recurso..."
        required />

      <PrettyCheckbox v-model="autoRenew" text="Renovación automática" />

      <p v-if="membershipStore.error" class="error-message">{{ membershipStore.error }}</p>

      <FormActions :submit-label="isOperatorMode ? 'Suscribir miembro' : 'Suscribirme'"
        :disabled="!canSubmit || membershipStore.loading" @cancel="close" />
    </form>
  </AppModal>
</template>

<style scoped>
.subscribe-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.membership-summary {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
}

.membership-summary p {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  text-align: left;
}

.membership-summary span {
  color: white;
  max-width: max-content;
}

.error-message {
  color: var(--error);
  font-size: 0.9rem;
  margin: 0;
}
</style>
