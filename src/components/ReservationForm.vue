<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import FormActions from '@/components/forms/FormActions.vue'
import { useResourceStore } from '@/stores/resourceStore'
import { useReservationStore } from '@/stores/reservationStore'
import { showToast } from '@/composables/toast'

const props = defineProps({
  initialResource: {
    type: [String, Number],
    default: '',
  },
  initialStartTime: {
    type: String,
    default: '',
  },
  initialEndTime: {
    type: String,
    default: '',
  },
  initialDate: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['reserved', 'cancel'])

const resourceStore = useResourceStore()
const reservationStore = useReservationStore()

const resourceId = ref(props.initialResource ? Number(props.initialResource) : '')
const reservationType = ref('HOURLY')
const startTime = ref('')
const endTime = ref('')
const dailyDate = ref('')
const recurrenceEndDate = ref('')
const availability = ref(null)
const checkingAvailability = ref(false)

function defaultDatetime(date, time) {
  return date ? `${date}T${time}` : ''
}

function nowRounded(stepMinutes = 30) {
  const now = new Date()
  const ms = stepMinutes * 60 * 1000
  const rounded = new Date(Math.ceil(now.getTime() / ms) * ms)
  return rounded.toISOString().slice(0, 16)
}

function addMinutes(datetime, minutes) {
  if (!datetime) return ''
  const date = new Date(datetime)
  date.setMinutes(date.getMinutes() + minutes)
  return date.toISOString().slice(0, 16)
}

function initializeForm() {
  const now = nowRounded()
  resourceId.value = props.initialResource ? Number(props.initialResource) : ''
  reservationType.value = 'HOURLY'
  startTime.value = props.initialStartTime || now
  endTime.value = props.initialEndTime || addMinutes(startTime.value, 60)
  dailyDate.value = props.initialDate || now.split('T')[0]
  recurrenceEndDate.value = props.initialDate ? defaultDatetime(props.initialDate, '10:00') : addMinutes(now, 60)
  availability.value = null
}

initializeForm()

const typeOptions = [
  { value: 'HOURLY', label: 'Por horas' },
  { value: 'DAILY', label: 'Día completo' },
  { value: 'WEEKLY', label: 'Semanal' },
  { value: 'MONTHLY', label: 'Mensual' },
]

const resourceOptions = computed(() =>
  resourceStore.resources.map((r) => ({ value: r.id, label: `${r.name} (${r.capacity} pers.)` })),
)

const nowIso = computed(() => new Date().toISOString().slice(0, 16))

const canSubmit = computed(() => {
  if (!resourceId.value) return false
  if (reservationType.value === 'DAILY') {
    if (!dailyDate.value) return false
    return `${dailyDate.value}T00:00` >= nowIso.value
  }
  if (!startTime.value || !endTime.value) return false
  if (startTime.value < nowIso.value) return false
  if (['WEEKLY', 'MONTHLY'].includes(reservationType.value) && !recurrenceEndDate.value) return false
  return true
})

onMounted(() => {
  if (!resourceStore.resources.length) {
    resourceStore.fetchResources().catch(() => { })
  }
})

function reset() {
  initializeForm()
}

function cancel() {
  reset()
  emit('cancel')
}

async function checkAvailability() {
  if (!resourceId.value || !startTime.value || !endTime.value) {
    availability.value = null
    return
  }

  checkingAvailability.value = true
  try {
    availability.value = await reservationStore.checkAvailability(
      resourceId.value,
      startTime.value,
      endTime.value,
    )
  } catch (err) {
    availability.value = { available: false, reason: 'Error al comprobar disponibilidad' }
    showToast(err.message || 'Error al comprobar disponibilidad')
  } finally {
    checkingAvailability.value = false
  }
}

watch([resourceId, startTime, endTime, reservationType, recurrenceEndDate], () => {
  availability.value = null
})

watch(reservationType, (newType) => {
  if (newType === 'DAILY' && !dailyDate.value && startTime.value) {
    dailyDate.value = startTime.value.split('T')[0]
  }
})

async function handleSubmit() {
  if (!canSubmit.value) {
    showToast('No se puede reservar en el pasado')
    return
  }

  let payloadStartTime = startTime.value
  let payloadEndTime = endTime.value

  if (reservationType.value === 'DAILY') {
    payloadStartTime = `${dailyDate.value}T00:00`
    payloadEndTime = `${dailyDate.value}T23:59`
  } else {
    await checkAvailability()
    if (!availability.value?.available) {
      showToast(availability.value?.reason || 'No disponible')
      return
    }
  }

  const payload = {
    resource: Number(resourceId.value),
    reservation_type: reservationType.value,
    start_time: payloadStartTime,
    end_time: payloadEndTime,
  }

  if (['WEEKLY', 'MONTHLY'].includes(reservationType.value)) {
    payload.recurrence_end_date = recurrenceEndDate.value
  }

  try {
    await reservationStore.createReservation(payload)
    showToast('Reserva creada correctamente', 'success')
    emit('reserved')
    reset()
  } catch (err) {
    showToast(err.message || 'Error al crear la reserva')
  }
}
</script>

<template>
  <form class="reservation-form" @submit.prevent="handleSubmit">
    <PrettyInputSelector v-model="resourceId" label="Recurso" :options="resourceOptions"
      placeholder="Selecciona un recurso" search-placeholder="Buscar recurso..." required />

    <PrettyInputSelector v-model="reservationType" label="Tipo de reserva" :options="typeOptions"
      placeholder="Selecciona un tipo" required />

    <p v-if="reservationType === 'DAILY'" class="hint">
      Se reservará desde la apertura hasta el cierre del espacio.
    </p>

    <FormInput v-if="reservationType !== 'DAILY'" v-model="startTime" label="Fecha y hora de inicio"
      type="datetime-local" required />

    <FormInput v-if="reservationType !== 'DAILY'" v-model="endTime" label="Fecha y hora de fin" type="datetime-local"
      required />

    <FormInput v-if="reservationType === 'DAILY'" v-model="dailyDate" label="Fecha de la reserva" type="date"
      required />

    <FormInput v-if="['WEEKLY', 'MONTHLY'].includes(reservationType)" v-model="recurrenceEndDate"
      label="Fin de la recurrencia" type="datetime-local" required />

    <div v-if="reservationType !== 'DAILY' && checkingAvailability" class="availability-status checking">
      Comprobando disponibilidad...
    </div>
    <div v-else-if="reservationStore.error" class="error-message">
      {{ reservationStore.error }}
    </div>

    <FormActions submit-label="Reservar" :disabled="!canSubmit || reservationStore.loading"
      :loading="reservationStore.loading" @cancel="cancel" />
  </form>
</template>

<style scoped>
.reservation-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.availability-status {
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.availability-status.checking {
  background: var(--surface-container-low);
  color: #6b7280;
}

.hint {
  margin-top: -25px;
  text-align: center;
}

.error-message {
  margin-top: calc(var(--space-2) * -1);
  color: var(--error);
  font-size: 0.9rem;
  text-align: center;
}
</style>
