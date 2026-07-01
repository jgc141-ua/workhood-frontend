<script setup>
import AppModal from '@/components/AppModal.vue'
import { useDateFormat } from '@/composables/useDateFormat'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  member: {
    type: Object,
    default: null,
  },
  membership: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

// Formatea una fecha para mostrarla en pantalla
const { formatDDMMYYYY } = useDateFormat()

// Formatea un precio con dos decimales
function formatPrice(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(2)} €`
}
</script>

<template>
  <AppModal :show="show"
    :title="member ? `Suscripción de ${member.first_name} ${member.last_name}` : 'Suscripción del miembro'"
    @close="emit('close')">
    <div v-if="loading" class="server-state">Cargando...</div>

    <div v-else-if="!membership || !membership.is_active" class="server-state">
      Este miembro no tiene una suscripción activa.
    </div>

    <div v-else class="membership-detail">
      <div class="detail-row">
        <span class="detail-label">Tipo de membresía</span>
        <span class="detail-value">{{ membership.membership_type_name }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Recurso asignado</span>
        <span class="detail-value">{{ membership.resource_name || 'Ninguno' }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Precio</span>
        <span class="detail-value">{{ formatPrice(membership.price) }}/mes</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Fecha de inicio</span>
        <span class="detail-value">{{ formatDDMMYYYY(membership.start_date) }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Fecha de fin</span>
        <span class="detail-value">{{ formatDDMMYYYY(membership.end_date) }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Fecha de contratación</span>
        <span class="detail-value">{{ formatDDMMYYYY(membership.signed_at) }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Renovación automática</span>
        <span class="detail-value">{{ membership.auto_renew ? 'Sí' : 'No' }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Estado</span>
        <span class="detail-value">
          <span class="pill-button" style="color: white;"
            :class="membership.is_active ? 'pill-button-success' : 'pill-button-error'">
            {{ membership.is_active ? 'Activa' : 'Inactiva' }}
          </span>
        </span>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.membership-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--outline-variant);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 600;
  text-align: right;
}
</style>
