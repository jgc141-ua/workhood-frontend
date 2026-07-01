<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { IonContent } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import DataTableColumns from '@/components/DataTableColumns.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import ReservationForm from '@/components/ReservationForm.vue'
import ReservationFilters from '@/components/ReservationFilters.vue'
import ReservationDateRange from '@/components/ReservationDateRange.vue'
import IconTrash from '@/assets/icons/IconTrash.vue'
import { useReservationStore } from '@/stores/reservationStore'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'

const reservationStore = useReservationStore()
const authStore = useAuthStore()

const selectedState = ref('all')
const selectedTime = ref('upcoming')
const isNewReservationModalOpen = ref(false)

const stateLabels = {
  Pending: 'Pendiente',
  Confirmed: 'Confirmada',
  Cancelled: 'Cancelada',
}

const typeLabels = {
  HOURLY: 'Por horas',
  DAILY: 'Día completo',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
}

const activeFilters = computed(() => ({
  state: selectedState.value !== 'all' ? selectedState.value : null,
  upcoming: selectedTime.value !== 'all' ? selectedTime.value : null,
}))

const reservationColumns = [
  { key: 'resource', label: 'RECURSO', width: '1.5fr' },
  { key: 'user', label: 'USUARIO', width: '1.5fr' },
  { key: 'dates', label: 'FECHAS', width: '1.5fr' },
  { key: 'type', label: 'TIPO', width: '0.75fr' },
  { key: 'state', label: 'ESTADO', width: '0.75fr' },
  { key: 'price', label: 'PRECIO', width: '0.5fr' },
  { key: 'actions', label: '', width: '0.25fr' },
]

function buildParams(page = reservationStore.allPage) {
  const params = { page, pageSize: reservationStore.allPageSize }
  const filters = activeFilters.value

  if (filters.state) params.state = filters.state
  if (filters.upcoming) {
    params.upcoming = filters.upcoming === 'upcoming' ? 'true' : 'false'
  }

  return params
}

async function loadReservations(page = reservationStore.allPage) {
  await reservationStore.fetchAllReservations(buildParams(page))
}

function prevPage() {
  loadReservations(reservationStore.allPage - 1)
}

function nextPage() {
  loadReservations(reservationStore.allPage + 1)
}

function isReservationPast(reservation) {
  return new Date(reservation.start_time) < new Date()
}

function reservationActionOptions(reservation) {
  const options = []
  if (reservation.state !== 'Cancelled' && !isReservationPast(reservation)) {
    options.push({ icon: IconTrash, label: 'Cancelar reserva', action: 'cancel', danger: true })
  }
  return options
}

function handleReservationAction(reservation, option) {
  if (option.action === 'cancel') {
    reservationStore.openCancelModal(reservation)
  }
}

async function handleConfirmCancel() {
  try {
    await reservationStore.confirmCancel(loadReservations)
    showToast('Reserva cancelada correctamente', 'success')
  } catch (err) {
    showToast(err.message || 'Error al cancelar la reserva')
  }
}

watch([selectedState, selectedTime], () => {
  loadReservations(1)
})

// Abre el modal de "Nueva reserva" cuando se solicita desde el sidebar (admin)
function openNewReservation() {
  isNewReservationModalOpen.value = true
  reservationStore.closeNewReservationModal()
  loadReservations()
}

// Si el admin pulsa el botón estando ya en /bookings
watch(() => reservationStore.isNewReservationModalOpen, (isOpen) => {
  if (isOpen) openNewReservation()
})

function closeNewReservationModal() {
  isNewReservationModalOpen.value = false
}

async function onNewReserved() {
  closeNewReservationModal()
  await loadReservations()
}

onMounted(() => {
  if (!authStore.isAuthenticated) return
  // Si la vista se monta con la petición ya pendiente (admin venía de otra ruta)
  if (reservationStore.isNewReservationModalOpen) {
    openNewReservation()
  } else {
    loadReservations()
  }
})
</script>

<template>
  <MobileHeader title="Bookings" />
  <ion-content :fullscreen="true" class="ion-padding">
    <section class="bookings-admin">
      <header class="row-between">
        <div class="page-header">
          <p class="eyebrow">GESTIÓN DE RESERVAS</p>
          <h1 class="title">Reservas de recursos</h1>
        </div>
      </header>

      <ConfirmModal :show="reservationStore.isCancelModalOpen" title="Cancelar reserva"
        message="¿Estás seguro de que deseas cancelar la reserva de"
        :item-name="reservationStore.reservationToCancel?.resource_name" confirm-label="Cancelar reserva" confirm-danger
        @confirm="handleConfirmCancel" @close="reservationStore.closeCancelModal"
        @after-close="reservationStore.resetCancelModal" />

      <AppModal :show="isNewReservationModalOpen" title="Nueva reserva" @close="closeNewReservationModal">
        <ReservationForm :key="`new-reservation-${isNewReservationModalOpen}`" is-admin @reserved="onNewReserved"
          @cancel="closeNewReservationModal" />
      </AppModal>

      <ReservationFilters v-model:state="selectedState" v-model:time="selectedTime" />

      <DataTableColumns :columns="reservationColumns" :items="reservationStore.allReservations" key-field="id"
        :loading="reservationStore.loading" :error="reservationStore.error"
        :pagination="{ page: reservationStore.allPage, pageSize: reservationStore.allPageSize, total: reservationStore.allCount }"
        @prev-page="prevPage" @next-page="nextPage">

        <template #cell-resource="{ item }">
          <div class="data-table-text data-table-text--primary">{{ item.resource_name || '-' }}</div>
        </template>

        <template #cell-user="{ item }">
          <div class="data-table-text">{{ item.user_email || '-' }}</div>
        </template>

        <template #cell-dates="{ item }">
          <ReservationDateRange :start-time="item.start_time" :end-time="item.end_time" />
        </template>

        <template #cell-type="{ item }">
          <span class="reservation-pill">{{ typeLabels[item.reservation_type] || item.reservation_type }}</span>
        </template>

        <template #cell-state="{ item }">
          <span class="reservation-badge" :class="`reservation-badge--${item.state.toLowerCase()}`">
            {{ stateLabels[item.state] || item.state }}
          </span>
        </template>

        <template #cell-price="{ item }">
          <div class="data-table-text data-table-text--primary">{{ item.total_price }} €</div>
        </template>

        <template #cell-actions="{ item }">
          <MoreActionsButton v-if="reservationActionOptions(item).length" :options="reservationActionOptions(item)"
            @select="(opt) => handleReservationAction(item, opt)" />
        </template>
      </DataTableColumns>
    </section>
  </ion-content>
</template>

<style scoped>
.bookings-admin {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

@media (max-width: 1024px) {

  .row-between {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 600px) {
  .bookings-admin {
    gap: var(--space-4);
  }
}

.reservation-badge {
  flex-shrink: 0;
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #fff;
  background: #9ca3af;
}

.reservation-badge--confirmed {
  background: #0f6a52;
}

.reservation-badge--pending {
  background: #f59e0b;
}

.reservation-badge--cancelled {
  background: #dc2626;
}

.reservation-pill {
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  background: rgba(0, 108, 79, 0.08);
}
</style>
