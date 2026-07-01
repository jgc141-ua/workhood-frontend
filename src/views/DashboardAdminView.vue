<script setup>
import { computed, inject, onMounted, ref } from 'vue'

import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'
import { IonPage, IonContent } from '@ionic/vue'
import { useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import MobileHeader from '@/components/MobileHeader.vue'
import DataTableList from '@/components/DataTableList.vue'
import { useMeStore } from '@/stores/meStore'
import { useAccessStore } from '@/stores/accessStore'
import { useAuthStore } from '@/stores/authStore'
import { usePaymentMethodStore } from '@/stores/paymentMethodStore'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import { useDateFormat } from '@/composables/useDateFormat'
import SpaceScheduleSection from '@/components/sections/SpaceScheduleSection.vue'
import PaymentMethodsSection from '@/components/sections/PaymentMethodsSection.vue'

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale)

const meStore = useMeStore()
const accessStore = useAccessStore()
const { formatDDMMYYYYHHMM } = useDateFormat()
const authStore = useAuthStore()
const paymentMethodStore = usePaymentMethodStore()
const analyticsStore = useAnalyticsStore()
const router = useRouter()

const spaceScheduleRef = ref(null)
const paymentMethodRef = ref(null)
const recentAccesses = ref([])

onMounted(() => {
  if (!authStore.isAuthenticated) return
  loadRecentAccesses()
  if (!paymentMethodStore.allPaymentMethods.length) {
    paymentMethodStore.fetchPaymentMethods().catch(() => { })
  }
  analyticsStore.fetchAnalyticsSummary()
  // Carga la tendencia anual para la card del dashboard
  loadAnnualTrend()
})

async function loadRecentAccesses() {
  try {
    const data = await accessStore.fetchLogs({ page: 1, pageSize: 3 })
    recentAccesses.value = data.results || []
  } catch {
    recentAccesses.value = []
  }
}

function loadAnnualTrend() {
  const today = new Date().toISOString().split('T')[0]
  analyticsStore.fetchRevenue('month', today).catch(() => { })
}

const stats = computed(() => [
  { label: 'Personas dentro', value: String(analyticsStore.activeCheckinsCount), to: '/reports' },
  {
    label: 'Recursos en uso',
    value: `${analyticsStore.resourcesSummary.resources_active}/${analyticsStore.resourcesSummary.resources_total}`,
    to: '/reports',
  },
  {
    label: 'Usuarios Activos',
    value: String(analyticsStore.usersSummary.members_total),
    to: '/reports',
  },
])

// Gráfica de tendencia (mismo formato que ReportsView)
const trendData = computed(() => ({
  labels: analyticsStore.revenue.trend.map(t => {
    const [y, m] = t.month.split('-')
    return `${m}-${y}`
  }),
  datasets: [
    {
      label: 'Facturado',
      data: analyticsStore.revenue.trend.map(t => t.facturado),
      borderColor: '#003544',
      backgroundColor: 'rgba(0, 53, 68, 0.1)',
      fill: false,
      tension: 0.3,
    },
    {
      label: 'Cobrado',
      data: analyticsStore.revenue.trend.map(t => t.cobrado),
      borderColor: '#01696f',
      backgroundColor: 'rgba(1, 105, 111, 0.1)',
      fill: false,
      tension: 0.3,
    },
  ],
}))

const trendOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
  scales: { y: { beginAtZero: true } },
}

function formatPrice(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(2)} €`
}

const brand = inject('BRAND')
</script>

<template>
  <ion-page>
    <MobileHeader title="Dashboard" />
    <ion-content :fullscreen="true" class="ion-padding">
      <section class="dashboard-action">
        <div class="main-header page-header">
          <p class="eyebrow">VISTA GENERAL DEL OPERADOR</p>
          <h2 class="title">Bienvenido a {{ brand }}, {{ meStore.user?.first_name }}</h2>
        </div>

        <button class="btn btn-primary top-action" type="button" @click="spaceScheduleRef.openCreateModal()">
          <span>Añadir horario</span>
        </button>
      </section>

      <section class="statsGrid">
        <Card v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" :to="stat.to" />
      </section>

      <SpaceScheduleSection ref="spaceScheduleRef" class="dashboard-schedule-section" />

      <section class="contentGrid">
        <div>
          <section class="card panel revenue-trend-card" @click="router.push('/reports')" role="button" tabindex="0"
            @keydown.enter="router.push('/reports')">
            <div class="header">
              <div>
                <h3>Tendencia de ingresos</h3>
                <p>Facturado y cobrado</p>
              </div>
              <span class="pill-button">Último mes</span>
            </div>
            <div v-if="analyticsStore.revenue.trend.length" class="chart-wrapper">
              <Line :data="trendData" :options="trendOptions" />
            </div>
            <p v-else class="empty-state">No hay datos de tendencia.</p>
          </section>
        </div>

        <aside>
          <section class="card panel activities">
            <div class="header">
              <h3>Últimos accesos</h3>
            </div>
            <DataTableList class="accesses-table" :items="recentAccesses" key-field="id" :loading="accessStore.loading"
              empty-text="No hay registros de acceso.">
              <template #row="{ item }">
                <div class="access-row">
                  <div class="access-row-main">
                    <span class="access-row-type">{{ item.type === 'ENTRADA' ? 'Entrada' : 'Salida' }}</span>
                    <span class="access-result" :class="item.result.toLowerCase()">
                      {{ item.result === 'PERMITIDO' ? 'Permitido' : 'Denegado' }}
                    </span>
                  </div>
                  <p class="access-row-user">{{ item.user_name }}</p>
                  <p class="access-row-date">{{ formatDDMMYYYYHHMM(item.event) }}</p>
                </div>
              </template>
            </DataTableList>
            <div class="access-view-all">
              <button type="button" class="btn btn-text" @click="router.push('/accesses')">
                Ver más
              </button>
            </div>
          </section>
        </aside>
      </section>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.activities :deep(.card) {
  box-shadow: none;
  padding: 0px;
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

.main-header {
  margin-bottom: 24px;
}

.dashboard-schedule-section {
  margin-bottom: var(--space-6);
}

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

.actions,
.activities {
  padding-bottom: 14px;
}

.panel {
  padding: 20px;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 20px;
  gap: 14px;
}

.activityList {
  display: flex;
  flex-direction: column;
}

.access-result {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #fff;
  background: #9ca3af;
}

.access-result.permitido {
  background: #0f6a52;
}

.access-result.denegado {
  background: #dc2626;
}

.access-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.access-row-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.access-row-type {
  font-weight: 600;
  color: var(--primary);
}

.access-row-user,
.access-row-date {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.access-view-all {
  display: flex;
  justify-content: center;
  padding-top: var(--space-3);
}

.revenue-trend-card {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.revenue-trend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26, 28, 30, 0.1);
}

.revenue-trend-card .chart-wrapper {
  min-height: 400px;
  position: relative;
}

@media (max-width: 1024px) {

  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .statsGrid {
    grid-template-columns: 1fr;
  }
}
</style>
