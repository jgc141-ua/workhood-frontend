<script setup>
import { onMounted, ref, computed } from 'vue'
import { IonContent, onIonViewWillEnter } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import AppModal from '@/components/AppModal.vue'
import ReservationForm from '@/components/ReservationForm.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import { useResourceStore } from '@/stores/resourceStore'
import { useReservationStore } from '@/stores/reservationStore'
import { showToast } from '@/composables/toast'
import IconEdit from '@/assets/icons/IconEdit.vue'
import IconTrash from '@/assets/icons/IconTrash.vue'

const resourceStore = useResourceStore()
const reservationStore = useReservationStore()

const isReservationModalOpen = ref(false)
const selectedResource = ref(null)
const selectedBlock = ref(null)
const expandedResources = ref(new Set())
const schedules = ref({})
const selectedDate = ref(new Date().toISOString().split('T')[0])
const activeTab = ref('new') // 'new' | 'my'

const reservationOptions = [
  { icon: IconEdit, label: 'Modificar reserva', danger: false },
  { icon: IconTrash, label: 'Cancelar reserva', danger: true },
]

const activeResources = computed(() =>
  resourceStore.resources.filter((r) => r.is_active && r.availability),
)

function formatTimeForInput(date, time) {
  return `${date}T${time}`
}

function setTab(tab) {
  activeTab.value = tab
  if (tab === 'my') {
    reservationStore.fetchMyReservations().catch((err) => {
      showToast(err.message || 'Error al cargar tus reservas')
    })
  }
}

function parseDatetime(value) {
  if (!value) return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) return null
  const [, year, month, day, hour, minute] = match
  return { year, month, day, hour, minute }
}

function formatDateOnly(value) {
  const parsed = parseDatetime(value)
  if (!parsed) return '-'
  return `${parsed.day}/${parsed.month}/${parsed.year}`
}

function formatTimeOnly(value) {
  const parsed = parseDatetime(value)
  if (!parsed) return '-'
  return `${parsed.hour}:${parsed.minute}`
}

function formatType(value) {
  const types = {
    HOURLY: 'Por horas',
    DAILY: 'Día completo',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
  }
  return types[value] || value
}

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
  await loadSchedules()
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
  if (!resourceStore.resources.length) {
    await resourceStore.fetchResources({ page_size: 100 })
  }
  await Promise.all([
    loadSchedules(),
    reservationStore.fetchMyReservations().catch(() => { }),
  ])
}

onMounted(loadInitialData)
onIonViewWillEnter(loadInitialData)
</script>

<template>
  <MobileHeader title="Bookings" />
  <ion-content :fullscreen="true" class="ion-padding">
      <div class="row-between">
        <header class="page-header">
          <div>
            <p class="eyebrow">GESTIÓN DE RESERVAS</p>
            <h1 class="title">Bookings</h1>
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
        <div v-if="reservationStore.loading" class="server-state">Cargando reservas...</div>
        <div v-else-if="!reservationStore.reservations.length" class="server-state">
          No tienes reservas todavía.
        </div>

        <div v-else class="reservation-cards">
          <article v-for="reservation in reservationStore.reservations" :key="reservation.id"
            class="card reservation-card">
            <div class="reservation-card-info">
              <div class="reservation-title-actions">
                <h3 class="reservation-card-title">{{ reservation.resource_name }}</h3>
                <MoreActionsButton :options="reservationOptions" />
              </div>
              <div class="reservation-card-meta">
                <span class="reservation-state-badge"
                  :class="reservation.state === 'Confirmed' ? 'badge-confirmed' : 'badge-pending'">
                  {{ reservation.state === 'Confirmed' ? 'Confirmada' : reservation.state }}
                </span>
                <span class="reservation-type-pill">{{ formatType(reservation.reservation_type) }}</span>
              </div>
            </div>

            <div class="reservation-datetimes">
              <div class="reservation-datetime">
                <span class="reservation-datetime-label">Inicio</span>
                <span class="reservation-datetime-time">{{ formatTimeOnly(reservation.start_time) }}</span>
                <span class="reservation-datetime-date">{{ formatDateOnly(reservation.start_time) }}</span>
              </div>
              <div class="reservation-datetime-separator">→</div>
              <div class="reservation-datetime">
                <span class="reservation-datetime-label">Fin</span>
                <span class="reservation-datetime-time">{{ formatTimeOnly(reservation.end_time) }}</span>
                <span class="reservation-datetime-date">{{ formatDateOnly(reservation.end_time) }}</span>
              </div>
            </div>

            <span class="reservation-price">{{ reservation.total_price }} €</span>
          </article>
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

.btn-text {
  display: flex;
  justify-content: center;
  background: transparent;
  color: var(--primary);
  font-weight: 600;
  padding: var(--space-2) 0;
  text-align: left;
  opacity: 0.75;
  border-radius: 10px;
  background-color: var(--outline-variant);
  transition: ease 0.2s;
}

.btn-text:hover {
  opacity: 1;
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

.reservation-state-badge {
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

.badge-confirmed {
  background: #0f6a52;
}

.badge-pending {
  background: #f59e0b;
}

.reservation-datetimes {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  background: var(--surface-container-low);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}

.reservation-datetime {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  min-width: 70px;
  text-align: center;
}

.reservation-datetime-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.reservation-datetime-time {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--on-surface);
  line-height: 1.2;
}

.reservation-datetime-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.reservation-datetime-separator {
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
}

.reservation-type-pill {
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  background: rgba(0, 108, 79, 0.08);
}

.reservation-price {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary);
}

@media (max-width: 767.98px) {
  .reservation-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .reservation-datetimes {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
