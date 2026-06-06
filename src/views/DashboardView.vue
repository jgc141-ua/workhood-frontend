<script setup>
import { computed, inject, onMounted, ref } from 'vue'

import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import Card from '@/components/Card.vue'
import ActionCard from '@/components/ActionCard.vue'
import MobileHeader from '@/components/MobileHeader.vue'
import { useMeStore } from '@/stores/meStore'
import { useMembershipStore } from '@/stores/membershipStore'
import { useAccessStore } from '@/stores/accessStore'
import { showToast } from '@/composables/toast'
import SubscribeMembershipModal from '@/components/SubscribeMembershipModal.vue'
import SpaceScheduleSection from '@/components/sections/SpaceScheduleSection.vue'

const meStore = useMeStore()
const membershipStore = useMembershipStore()
const accessStore = useAccessStore()

const spaceScheduleRef = ref(null)

const isSubscribeModalOpen = ref(false)
const isAdmin = computed(() => meStore.user?.role === 'ADMIN')
const accessMessage = ref('')
const lastAccess = ref(null)

const canCheckOut = computed(() => {
  if (!lastAccess.value) return false
  return lastAccess.value.type === 'ENTRADA' && lastAccess.value.result === 'PERMITIDO'
})

// Carga de la membresía y el último acceso del usuario autenticado
onMounted(() => {
  if (!isAdmin.value) {
    membershipStore.fetchMyMembership().catch(() => { })
    loadLastAccess()
  }
})

async function loadLastAccess() {
  try {
    const data = await accessStore.fetchMyLogs({ page: 1, pageSize: 1 })
    lastAccess.value = data.results?.[0] || null
  } catch {
    lastAccess.value = null
  }
}

function openSubscribeModal() {
  isSubscribeModalOpen.value = true
}

function closeSubscribeModal() {
  isSubscribeModalOpen.value = false
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
  } catch (err) {
    showToast(err.message || 'Error al registrar la salida')
  }
}

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps({
  datos: {
    type: Array,
    default: () => [
      { mes: 'Enero', valor: 1200 },
      { mes: 'Febrero', valor: 980 },
      { mes: 'Marzo', valor: 1450 },
      { mes: 'Abril', valor: 1320 },
      { mes: 'Mayo', valor: 1750 },
      { mes: 'Junio', valor: 1100 },
      { mes: 'Julio', valor: 1600 },
      { mes: 'Agosto', valor: 1380 },
      { mes: 'Septiembre', valor: 1900 },
      { mes: 'Octubre', valor: 2100 },
      { mes: 'Noviembre', valor: 2400 },
      { mes: 'Diciembre', valor: 2800 },
    ],
  },
})

// Mockups
const stats = [
  { label: 'Desk Occupancy', value: '100%', delta: '+2000%' },
  { label: 'Rooms in Use', value: '12000/15500', delta: '+1000' },
  { label: 'Active Members', value: '50000', delta: '+12' },
  { label: 'Pending Approvals', value: '40000', delta: '-18200' },
]

const actions = [
  {
    title: 'Boardroom Booking Request',
    meta: 'TechNova Corp • Tomorrow, 2:00 PM',
    detail: '',
    icon: '▣',
    buttons: ['Approve', 'Review'],
    primaryButton: 'Approve',
  },
  {
    title: 'New Member Registration',
    meta: 'Alex Rivera • Requires ID verification',
    detail: '',
    icon: '◫',
    buttons: ['Verify Details'],
    primaryButton: 'Verify Details',
  },
]

const activity = [
  { title: 'Marcus Chen checked in.', meta: 'Hot Desk Area • 2 mins ago', icon: '↗' },
  { title: 'Design Team Alpha started a meeting.', meta: 'Studio B • 15 mins ago', icon: '◧' },
  { title: 'Elena Rodriguez checked out.', meta: 'Private Office 4 • 45 mins ago', icon: '↩' },
  { title: 'Coffee machine restocked.', meta: 'Main Kitchen • 1 hour ago', icon: '☕' },
]

// Chart
const chartData = computed(() => ({
  labels: props.datos.map((d) => d.mes),
  datasets: [
    {
      label: 'Ventas mensuales',
      backgroundColor: '#01696f',
      data: props.datos.map((d) => d.valor),
    },
  ],
}))

// Estático: no necesita ser computed ni reactive
const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Reporte de ventas' },
  },
}

const brand = inject('BRAND')
</script>

<template>
  <ion-page>
    <MobileHeader title="Dashboard" />
    <ion-content :fullscreen="true" class="ion-padding">
      <section class="dashboard-action">
        <!-- Cabecera del dashboard -->
        <div class="main-header page-header">
          <p class="eyebrow">VISTA GENERAL DEL {{ meStore.user?.role.toUpperCase() }}</p>
          <h2 class="title">Bienvenido a {{ brand }}, {{ meStore.user?.first_name }}</h2>
        </div>

        <button v-if="isAdmin" class="btn btn-primary top-action" type="button"
          @click="spaceScheduleRef.openCreateModal()">
          <span>Añadir horario</span>
        </button>

        <!-- Acceso rápido para clientes -->
        <section v-else class="access-quick-actions">
          <div class="access-buttons">
            <button v-if="!canCheckOut" class="btn btn-primary top-action" type="button" :disabled="accessStore.loading"
              @click="handleCheckIn">
              Registrar entrada
            </button>
            <button v-else class="btn btn-secondary" type="button" :disabled="accessStore.loading"
              @click="handleCheckOut">
              Registrar salida
            </button>
          </div>
        </section>
      </section>

      <!-- Modal de suscripción -->
      <SubscribeMembershipModal :show="isSubscribeModalOpen" @close="closeSubscribeModal" @subscribed="onSubscribed" />

      <!-- Alerta de membresía inactiva -->
      <section v-if="!isAdmin && !membershipStore.loading && !membershipStore.hasActiveMembership"
        class="card membership-alert">
        <div class="membership-alert-content">
          <div>
            <h3>No tienes una membresía activa</h3>
            <p>Suscríbete ahora para poder acceder a los recursos del espacio.</p>
          </div>
          <ion-button class="btn-primary pill-subscribe" type="button" @click="openSubscribeModal">
            Suscribirme
          </ion-button>
        </div>
      </section>

      <!-- Tarjeta de membresía activa -->
      <section v-else-if="membershipStore.hasActiveMembership" class="card membership-active">
        <div class="membership-active-content">
          <div>
            <h3>Membresía activa</h3>
            <p>
              {{ membershipStore.myMembership.membership_type_name }}
              <span v-if="membershipStore.myMembership.resource_name">
                — {{ membershipStore.myMembership.resource_name }}
              </span>
            </p>
          </div>
          <div class="membership-active-meta">
            <span class="pill-button pill-button-success pill-subscribe">Activa hasta {{ new
              Date(membershipStore.myMembership.end_date).toLocaleDateString() }}</span>
            <span class="pill-button"
              :class="membershipStore.myMembership.auto_renew ? 'pill-button-success' : 'pill-button-warn'">
              {{ membershipStore.myMembership.auto_renew ? 'Renovación automática' : 'Sin renovación automática' }}
            </span>
          </div>
        </div>
      </section>

      <!-- Grid de estadísticas -->
      <section class="statsGrid">
        <Card v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" :delta="stat.delta" />
      </section>

      <!-- Gestión de horarios del espacio (solo admin) -->
      <SpaceScheduleSection v-if="isAdmin" ref="spaceScheduleRef" class="dashboard-schedule-section" />

      <!-- Contenido principal: gráfico y paneles laterales -->
      <section class="contentGrid">
        <div>
          <section class="card panel">
            <div class="header">
              <div>
                <h3>Revenue Growth</h3>
                <p>Monthly recurring revenue vs ad-hoc bookings</p>
              </div>
              <button class="pill-button" type="button">This Year <span>⌄</span></button>
            </div>
            <div class="chart-wrapper">
              <Bar :data="chartData" :options="chartOptions" />
            </div>
          </section>
        </div>

        <aside>
          <!-- Panel de acciones pendientes -->
          <div class="card panel actions" style="background-color: #e8e8ec">
            <div class="header">
              <h3>Action Required</h3>
            </div>
            <ActionCard v-for="action in actions" :key="action.title" v-bind="action" />
          </div>

          <!-- Panel de actividad reciente -->
          <section class="card panel activities">
            <div class="header">
              <h3>Recent Activity</h3>
              <!-- style="margin: 0"<button class="textLink" type="button">View All</button>-->
            </div>
            <div class="activityList">
              <ActionCard v-for="item in activity" :key="item.title" v-bind="item" />
            </div>
          </section>
        </aside>
      </section>
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* Panel de actividad */
.activities :deep(.card) {
  box-shadow: none;
  padding: 10px;
}

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

/* Cabecera del dashboard */
.main-header {
  margin-bottom: 24px;
}

.dashboard-schedule-section {
  margin-bottom: var(--space-6);
}

/* Cabeceras de panel */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 8px 8px 8px;
}

.header h3 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #003544;
}

.header p {
  margin: 0;
  color: #6a7280;
  font-size: 13px;
}

/* Paneles y estadísticas */
.actions,
.activities {
  padding-bottom: 14px;
}

.panel {
  padding: 20px;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin-bottom: 20px;
  gap: 14px;
}

.textLink {
  background: transparent;
  color: #667085;
  padding: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.pill-subscribe {
  max-width: max-content;
  color: white;
}

.activityList {
  display: flex;
  flex-direction: column;
}

/* Responsive */
@media (max-width: 1024px) {
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
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

.membership-active-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
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

@media (max-width: 600px) {
  .statsGrid {
    grid-template-columns: 1fr;
  }
}

/* Acceso rápido */
.access-quick-actions {
  margin-bottom: var(--space-6);
}

.access-buttons {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.access-message {
  margin: var(--space-2) 0 0;
  font-size: 0.9rem;
  color: #6b7280;
}
</style>
