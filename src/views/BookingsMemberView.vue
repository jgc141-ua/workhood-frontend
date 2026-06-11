<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import { IonContent, onIonViewWillEnter } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import AppModal from '@/components/AppModal.vue'
import ReservationForm from '@/components/ReservationForm.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import ReservationDateRange from '@/components/ReservationDateRange.vue'
import ReservationFilters from '@/components/ReservationFilters.vue'
import DataTablePagination from '@/components/DataTablePagination.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { useResourceStore } from '@/stores/resourceStore'
import { useReservationStore } from '@/stores/reservationStore'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'
import IconTrash from '@/assets/icons/IconTrash.vue'

const resourceStore = useResourceStore()
const reservationStore = useReservationStore()
const authStore = useAuthStore()

const isReservationModalOpen = ref(false)
const selectedResource = ref(null)
const selectedBlock = ref(null)
const expandedResources = ref(new Set())
const schedules = ref({})
const selectedDate = ref(new Date().toISOString().split('T')[0])
const activeTab = ref('new') // 'new' | 'my'
const selectedState = ref('all')
const selectedTime = ref('upcoming')

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

const reservationOptions = [
  { icon: IconTrash, label: 'Cancelar reserva', action: 'cancel', danger: true },
]

const activeResources = computed(() =>
  resourceStore.resources.filter((r) => r.is_active && r.availability),
)

function formatTimeForInput(date, time) {
  return `${date}T${time}`
}

function buildMyReservationsParams(page = null) {
  const params = {}

  if (page != null) params.page = page
  if (selectedState.value !== 'all') params.state = selectedState.value
  if (selectedTime.value !== 'all') {
    params.upcoming = selectedTime.value === 'upcoming' ? 'true' : 'false'
  }

  return params
}

function setTab(tab) {
  activeTab.value = tab
  if (tab === 'my') {
    loadMyReservations()
  }
}

function isReservationPast(reservation) {
  return new Date(reservation.start_time) < new Date()
}

function handleReservationAction(reservation, option) {
  if (option.action === 'cancel') {
    reservationStore.openCancelModal(reservation)
  }
}

async function handleConfirmCancel() {
  try {
    await reservationStore.confirmCancel(loadMyReservations)
    showToast('Reserva cancelada correctamente', 'success')
  } catch (err) {
    showToast(err.message || 'Error al cancelar la reserva')
  }
}

watch([selectedState, selectedTime], () => {
  loadMyReservations(1)
})

async function loadMyReservations(targetPage = null) {
  try {
    await reservationStore.fetchMyReservations(buildMyReservationsParams(targetPage))
  } catch (err) {
    showToast(err.message || 'Error al cargar tus reservas')
  }
}

function onPrevMyPage() {
  if (reservationStore.page > 1) {
    loadMyReservations(reservationStore.page - 1)
  }
}

function onNextMyPage() {
  if (reservationStore.hasNextPage) {
    loadMyReservations(reservationStore.page + 1)
  }
}

const myPagination = computed(() => ({
  page: reservationStore.page,
  pageSize: reservationStore.pageSize,
  total: reservationStore.count,
}))

function toggleResource(resourceId) {
  const next = new Set(expandedResources.value)
  if (next.has(resourceId)) {
    next.delete(resourceId)
  } else {
    next.add(resourceId)
  }
  expandedResources.value = next
}

function isExpanded(resourceId) {
  return expandedResources.value.has(resourceId)
}

// Helpers para mostrar los horarios en filas de 3 bloques
const ROW_SIZE = 3

function chunkBlocks(blocks, size = ROW_SIZE) {
  const chunks = []
  for (let i = 0; i < blocks.length; i += size) {
    chunks.push(blocks.slice(i, i + size))
  }
  return chunks
}

// Devuelve las filas visibles según si el recurso está expandido
function getVisibleRows(resourceId) {
  const blocks = schedules.value[resourceId]?.blocks || []
  const rows = chunkBlocks(blocks)
  return isExpanded(resourceId) ? rows : rows.slice(0, 1)
}

// Abre el modal solo si el bloque está disponible
function handleBlockClick(resource, block) {
  if (block.status === 'free') {
    openReservationModal(resource, block)
  }
}

function openReservationModal(resource, block = null) {
  selectedResource.value = resource
  selectedBlock.value = block
  isReservationModalOpen.value = true
}

function closeReservationModal() {
  isReservationModalOpen.value = false
  selectedResource.value = null
  selectedBlock.value = null
}

async function onReserved() {
  closeReservationModal()
  await Promise.all([
    loadSchedules(),
    loadMyReservations(),
  ])
}

async function loadSchedules() {
  for (const resource of activeResources.value) {
    try {
      const data = await reservationStore.fetchResourceSchedule(resource.id, selectedDate.value)
      schedules.value[resource.id] = data
    } catch {
      schedules.value[resource.id] = { is_open: false, blocks: [] }
    }
  }
}

async function loadInitialData() {
  if (!authStore.isAuthenticated) return
  if (!resourceStore.resources.length) {
    await resourceStore.fetchResources({ page_size: 100 })
  }
  await Promise.all([
    loadSchedules(),
    loadMyReservations().catch(() => { }),
  ])
}

onMounted(loadInitialData)
onIonViewWillEnter(loadInitialData)
</script>

<template>
  <MobileHeader title="Reservas" />
  <ion-content :fullscreen="true" class="ion-padding">
    <div class="row-between">
      <header class="page-header">
        <div>
          <p class="eyebrow">GESTIÓN DE RESERVAS</p>
          <h1 class="title">Reservas</h1>
        </div>
      </header>
      <div class="booking-tabs" role="tablist" aria-label="Pestañas de reservas">
        <button type="button" class="booking-tab" :class="{ 'booking-tab-active': activeTab === 'new' }"
          @click="setTab('new')">
          Nueva reserva
        </button>
        <button type="button" class="booking-tab" :class="{ 'booking-tab-active': activeTab === 'my' }"
          @click="setTab('my')">
          Mis reservas
        </button>
      </div>
    </div>

    <AppModal :show="isReservationModalOpen" title="Nueva reserva" @close="closeReservationModal">
      <ReservationForm v-if="selectedResource"
        :key="`${selectedResource.id}-${selectedDate}-${selectedBlock?.start_time || ''}-${selectedBlock?.end_time || ''}`"
        :initial-resource="selectedResource.id" :initial-date="selectedDate"
        :initial-start-time="selectedBlock ? formatTimeForInput(selectedDate, selectedBlock.start_time) : ''"
        :initial-end-time="selectedBlock ? formatTimeForInput(selectedDate, selectedBlock.end_time) : ''"
        @reserved="onReserved" @cancel="closeReservationModal" />
    </AppModal>

    <ConfirmModal :show="reservationStore.isCancelModalOpen" title="Cancelar reserva"
      message="¿Estás seguro de que deseas cancelar la reserva de"
      :item-name="reservationStore.reservationToCancel?.resource_name" confirm-label="Cancelar reserva" confirm-danger
      @confirm="handleConfirmCancel" @close="reservationStore.closeCancelModal"
      @after-close="reservationStore.resetCancelModal" />

    <!-- Nueva reserva -->
    <section v-if="activeTab === 'new'" class="resources-section">
      <div class="date-selector-bar">
        <label for="booking-date" class="date-selector-label">Reservar para:</label>
        <input id="booking-date" v-model="selectedDate" type="date" class="date-selector-input"
          @change="loadSchedules" />
      </div>

      <div v-if="resourceStore.loading" class="server-state">Cargando recursos...</div>
      <div v-else-if="!activeResources.length" class="server-state">
        No hay recursos disponibles.
      </div>

      <div v-else class="resource-cards">
        <article v-for="resource in activeResources" :key="resource.id" class="card resource-card">
          <div class="resource-header">
            <h3 class="resource-name">{{ resource.name }}</h3>
            <div class="resource-meta-price">
              <p class="resource-meta">
                <b>Tipo:</b> {{ resource.resource_type_name }}
                <br />
                <b>Capacidad:</b> {{ resource.capacity }} personas
                <br />
              </p>
              <b class="pill-button resource-price" style="margin: 0;">{{ resource.price }} €/hora</b>
            </div>
          </div>

          <!-- Horarios disponibles del recurso -->
          <div v-if="schedules[resource.id]?.is_open" class="resource-schedule">
            <div v-for="(row, rowIndex) in getVisibleRows(resource.id)" :key="rowIndex" class="schedule-row">
              <div v-for="(block, blockIndex) in row" :key="blockIndex" class="time-block" :class="block.status"
                @click="handleBlockClick(resource, block)">
                <span class="time-range">{{ block.start_time }} - {{ block.end_time }}</span>
              </div>
            </div>
          </div>

          <button v-if="schedules[resource.id]?.blocks.length > 3" type="button" class="btn btn-text"
            @click="toggleResource(resource.id)">
            {{ isExpanded(resource.id) ? 'Ver menos' : 'Ver más' }}
          </button>

          <div v-if="schedules[resource.id]?.blocks.length == 0" class="resource-closed">
            <span class="pill-button pill-button-warn" style="color: white;">Cerrado</span>
          </div>
        </article>
      </div>
    </section>

    <!-- Mis reservas -->
    <section v-if="activeTab === 'my'" class="my-reservations-section">
      <ReservationFilters v-model:state="selectedState" v-model:time="selectedTime" />

      <div v-if="reservationStore.loading" class="server-state">Cargando reservas...</div>
      <div v-else-if="!reservationStore.reservations.length" class="server-state">
        No hay reservas
      </div>

      <div v-else class="reservation-cards">
        <article v-for="reservation in reservationStore.reservations" :key="reservation.id"
          class="card reservation-card">
          <div class="reservation-card-info">
            <div class="reservation-title-actions">
              <h3 class="reservation-card-title">{{ reservation.resource_name }}</h3>
              <MoreActionsButton v-if="reservation.state !== 'Cancelled' && !isReservationPast(reservation)"
                :options="reservationOptions" @select="(opt) => handleReservationAction(reservation, opt)" />
            </div>
            <div class="reservation-card-meta">
              <span class="reservation-badge" :class="`reservation-badge--${reservation.state.toLowerCase()}`">
                {{ stateLabels[reservation.state] || reservation.state }}
              </span>
              <span class="reservation-pill">{{ typeLabels[reservation.reservation_type] || reservation.reservation_type
              }}</span>
            </div>
          </div>

          <ReservationDateRange class="reservation-date-range" :start-time="reservation.start_time"
            :end-time="reservation.end_time" size="md" />

          <span class="reservation-price">{{ reservation.total_price }} €</span>
        </article>
      </div>

      <div v-if="reservationStore.count > reservationStore.pageSize" class="card pagination-card">
        <DataTablePagination :pagination="myPagination" :loading="reservationStore.loading"
          :items-length="reservationStore.reservations.length" @prev-page="onPrevMyPage"
          @next-page="onNextMyPage" />
      </div>
    </section>
  </ion-content>
</template>

<style scoped>
.booking-tabs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.booking-tab {
  border: 0;
  background: transparent;
  color: #4b5563;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font: inherit;
  font-weight: 600;
  transition: var(--transition-fast);
}

.booking-tab:hover {
  background: var(--surface-container-high);
}

.booking-tab-active {
  background: var(--surface-container-lowest);
  color: var(--primary);
  box-shadow: var(--shadow-floating);
}

.resources-section {
  margin-top: var(--space-6);
}

.date-selector-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  padding: var(--space-3) var(--space-4);
  background: var(--surface-container-low);
  border-radius: var(--radius-md);
  width: fit-content;
}

.date-selector-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}

.date-selector-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
}

.date-selector-input:focus {
  outline: none;
  border-color: var(--secondary);
}

.my-reservations-section {
  margin-top: var(--space-6);
}

.my-reservations-section .reservation-filters {
  margin-bottom: var(--space-5);
}

.resource-cards {
  display: grid;
  align-items: center;
  justify-content: center;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: var(--space-5);
}

.resource-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.resource-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.resource-name {
  font-size: 1.1rem;
  color: var(--primary);
}

.resource-meta-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.resource-meta {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.resource-price {
  margin: var(--space-1) 0 0;
  font-size: 1.05rem;
  color: #6b7280;
}

.resource-schedule {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.schedule-row {
  display: flex;
  flex-direction: row;
  gap: var(--space-2);
}

.time-block {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.time-block.free {
  background: rgba(15, 106, 82, 0.1);
  color: var(--success-text);
}

.time-block.free:hover {
  opacity: 0.8;
}

.time-block.occupied {
  background: rgba(220, 38, 38, 0.08);
  color: var(--error);
  cursor: not-allowed;
}

.time-range {
  font-weight: 600;
  font-size: 0.9rem;
}

.resource-closed {
  display: flex;
  justify-content: flex-start;
}

.reservation-cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.reservation-card {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-4) var(--space-5);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.reservation-card:hover {
  box-shadow: var(--shadow-floating);
}

.reservation-card-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}

.reservation-title-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-4);
}

.reservation-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
  line-height: 1.3;
}

.reservation-card-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.reservation-price {
  font-size: 1.15rem;
  font-weight: 700;
  min-width: 150px;
  text-align: center;
  flex-shrink: 0;
  color: var(--primary);
}

@media (max-width: 767.98px) {
  .reservation-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .reservation-date-range {
    width: 100%;
    justify-content: space-between;
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

.pagination-card {
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-3);
}
</style>
