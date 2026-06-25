<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { IonPage, IonContent, IonButton, onIonViewWillEnter } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import DataTableList from '@/components/DataTableList.vue'
import SubscribeMembershipModal from '@/components/SubscribeMembershipModal.vue'
import ReservationDateRange from '@/components/ReservationDateRange.vue'
import { useMeStore } from '@/stores/meStore'
import { useMembershipStore } from '@/stores/membershipStore'
import { useAccessStore } from '@/stores/accessStore'
import { useReservationStore } from '@/stores/reservationStore'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'

const meStore = useMeStore()
const membershipStore = useMembershipStore()
const accessStore = useAccessStore()
const reservationStore = useReservationStore()
const authStore = useAuthStore()

const isSubscribeModalOpen = ref(false)
const accessMessage = ref('')
const page = ref(1)
const pageSize = ref(5)
const lastAccess = ref(null)

const canCheckOut = computed(() => {
  if (!lastAccess.value) return false
  return lastAccess.value.type === 'ENTRADA' && lastAccess.value.result === 'PERMITIDO'
})

async function loadInitialData() {
  if (!authStore.isAuthenticated) return
  membershipStore.fetchMyMembership().catch(() => { })
  loadMyAccesses()
  reservationStore.fetchRecentReservations(2).catch(() => { })
}

onMounted(loadInitialData)
onIonViewWillEnter(loadInitialData)

async function loadMyAccesses(currentPage = page.value) {
  try {
    const data = await accessStore.fetchMyLogs({ page: currentPage, pageSize: pageSize.value })
    page.value = currentPage
    if (currentPage === 1) {
      lastAccess.value = data.results?.[0] || null
    }
  } catch (err) {
    showToast(err.message || 'Error al cargar tus accesos')
  }
}

function prevPage() {
  loadMyAccesses(page.value - 1)
}

function nextPage() {
  loadMyAccesses(page.value + 1)
}

function openSubscribeModal() {
  isSubscribeModalOpen.value = true
}

function closeSubscribeModal() {
  isSubscribeModalOpen.value = false
}

async function handleToggleAutoRenew() {
  try {
    await membershipStore.toggleMyAutoRenew()
    showToast('Renovación automática actualizada', 'success')
  } catch (err) {
    showToast(err.message || 'Error al cambiar la renovación automática')
  }
}

async function onSubscribed() {
  await membershipStore.fetchMyMembership()
}

async function handleCheckIn() {
  try {
    const data = await accessStore.checkIn()
    lastAccess.value = data
    const resultText = data.result === 'PERMITIDO' ? 'permitido' : 'denegado'
    accessMessage.value = `Entrada ${resultText}`
    showToast(`Acceso ${resultText}`, data.result === 'PERMITIDO' ? 'success' : 'danger')
    await loadMyAccesses(1)
  } catch (err) {
    showToast(err.message || 'Error al registrar la entrada')
  }
}

async function handleCheckOut() {
  try {
    const data = await accessStore.checkOut()
    lastAccess.value = data
    accessMessage.value = 'Salida registrada'
    showToast('Salida registrada', 'success')
    await loadMyAccesses(1)
  } catch (err) {
    showToast(err.message || 'Error al registrar la salida')
  }
}

const pagination = computed(() => ({
  page: page.value,
  pageSize: pageSize.value,
  total: accessStore.myCount,
}))

const brand = inject('BRAND')
</script>

<template>
  <ion-page>
    <MobileHeader title="Dashboard" />
    <ion-content :fullscreen="true" class="ion-padding">
      <section class="dashboard-action">
        <div class="main-header page-header">
          <p class="eyebrow">VISTA GENERAL DEL MIEMBRO</p>
          <h2 class="title">Bienvenido a {{ brand }}, {{ meStore.user?.first_name }}</h2>
        </div>

        <div class="access-buttons">
          <button v-if="!canCheckOut" class="btn btn-primary top-action" type="button" :disabled="accessStore.loading"
            @click="handleCheckIn">
            Registrar entrada
          </button>
          <button v-else class="btn btn-secondary top-action" type="button" :disabled="accessStore.loading"
            @click="handleCheckOut">
            Registrar salida
          </button>
        </div>
      </section>

      <p v-if="accessMessage" class="access-message">{{ accessMessage }}</p>

      <SubscribeMembershipModal :show="isSubscribeModalOpen" @close="closeSubscribeModal" @subscribed="onSubscribed" />

      <section v-if="!membershipStore.loading && !membershipStore.hasActiveMembership" class="card membership-alert">
        <div class="membership-alert-content">
          <div>
            <h3>No tienes una membresía activa</h3>
            <p>Suscríbete ahora para poder acceder a los recursos del espacio.</p>
          </div>
          <ion-button class="btn-primary pill-subscribe" style="max-width: 200px;" type="button"
            @click="openSubscribeModal">
            Suscribirme
          </ion-button>
        </div>
      </section>

      <section v-else-if="membershipStore.hasActiveMembership" class="card membership-active">
        <div class="membership-active-content">
          <div>
            <h3>Membresía activa</h3>
            <p>
              {{ membershipStore.myMembership.membership_type_name }}
              <span v-if="membershipStore.myMembership.resource_name">
                ({{ membershipStore.myMembership.resource_name }})
              </span>
            </p>
          </div>
          <div class="membership-active-meta">
            <span class="pill-button pill-button-success pill-subscribe">Activa hasta {{ new
              Date(membershipStore.myMembership.end_date).toLocaleDateString() }}</span>
            <button type="button" class="pill-button pill-subscribe auto-renew-btn"
              :class="membershipStore.myMembership.auto_renew ? 'pill-button-success' : 'pill-button-warn'"
              :disabled="membershipStore.loading" @click="handleToggleAutoRenew">
              {{ membershipStore.myMembership.auto_renew ? 'Renovación automática activada' :
                'Renovación automática desactivada'
              }}
            </button>
          </div>
        </div>
      </section>

      <section class="dashboard-columns">
        <!-- Tus próximas reservas -->
        <div class="dashboard-column">
          <h3 class="header-title">Tus próximas reservas</h3>
          <article>
            <div v-if="reservationStore.loading" class="server-state">Cargando...</div>
            <div v-else-if="!reservationStore.recentReservations.length" class="server-state">
              No tienes reservas.
            </div>
            <div v-else class="reservations-list">
              <div v-for="reservation in reservationStore.recentReservations" :key="reservation.id"
                class="reservation-card">
                <div class="reservation-card-icon">📅</div>
                <h4 class="reservation-resource">{{ reservation.resource_name || 'Recurso' }}</h4>
                <ReservationDateRange class="reservation-date-range" :start-time="reservation.start_time"
                  :end-time="reservation.end_time" size="sm" />
                <div class="reservation-meta">
                  <span class="reservation-state" :class="reservation.state.toLowerCase()">
                    {{ reservation.state === 'Confirmed' ? 'Confirmada' : reservation.state === 'Cancelled' ?
                      'Cancelada' : 'Pendiente' }}
                  </span>
                  <span class="reservation-type">{{ reservation.reservation_type === 'HOURLY' ? 'Por horas' :
                    'Día completo' }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Accesos -->
        <div class="dashboard-column">
          <h3 class="header-title">Tus accesos</h3>
          <DataTableList :items="accessStore.myLogs" key-field="id" :loading="accessStore.loading"
            :pagination="pagination" empty-text="No hay registros de acceso." @prev-page="prevPage"
            @next-page="nextPage">
            <template #row="{ item }">
              <div class="access-row">
                <div class="access-main">
                  <span class="access-type">{{ item.type === 'ENTRADA' ? 'Entrada' : 'Salida' }}</span>
                  <span class="access-date">{{ item.event ? new Date(item.event).toLocaleString('es-ES') : '-' }}</span>
                </div>
                <span class="access-result" :class="item.result.toLowerCase()">
                  {{ item.result === 'PERMITIDO' ? 'Permitido' : 'Denegado' }}
                </span>
              </div>
            </template>
          </DataTableList>
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.dashboard-action {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.dashboard-action button {
  height: fit-content;
}

.main-header {
  margin-bottom: 24px;
}

.access-buttons {
  display: flex;
  gap: var(--space-3);
}

.access-message {
  margin: 0 0 var(--space-4);
  font-size: 0.9rem;
  color: #6b7280;
}

.membership-alert,
.membership-active {
  margin-bottom: var(--space-6);
}

.membership-alert-content,
.membership-active-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.pill-subscribe {
  color: white;
}

.membership-active-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.auto-renew-btn {
  cursor: pointer;
  border: none;
  transition: var(--transition-fast);
}

.auto-renew-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.auto-renew-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.membership-alert h3,
.membership-active h3 {
  margin: 0 0 var(--space-1);
  font-size: 1.1rem;
}

.membership-alert p,
.membership-active p {
  margin: 0;
  color: #6b7280;
  font-size: 0.95rem;
}

.accesses-panel {
  padding: 20px;
}

.dashboard-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  align-items: start;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.header-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--primary);
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.reservation-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
}

.reservation-card-icon {
  font-size: 2rem;
}

.reservation-resource {
  margin: 0;
  font-size: 1.1rem;
  color: var(--primary);
}

.reservation-date {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.reservation-date-range {
  justify-content: center;
}

.reservation-meta {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

.reservation-state {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
  background: #9ca3af;
}

.reservation-state.confirmed {
  background: #0f6a52;
}

.reservation-state.pending {
  background: #f59e0b;
}

.reservation-state.cancelled {
  background: #dc2626;
}

.reservation-type {
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  background: rgba(0, 108, 79, 0.08);
}

.access-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  width: 100%;
}

.access-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.access-type {
  font-weight: 600;
  color: var(--primary);
}

.access-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.access-result {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
  background: #9ca3af;
  flex-shrink: 0;
}

.access-result.permitido {
  background: #0f6a52;
}

.access-result.denegado {
  background: #dc2626;
}

.server-state {
  text-align: center;
  color: #6b7280;
  padding: var(--space-4);
}

@media (max-width: 1024px) {
  .dashboard-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .dashboard-action {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
}
</style>
