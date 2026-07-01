<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { IonPage, IonContent, onIonViewWillEnter } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import Card from '@/components/Card.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
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
import { useAnalyticsStore } from '@/stores/analyticsStore'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'

ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale)

const analyticsStore = useAnalyticsStore()
const authStore = useAuthStore()

const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedPeriod = ref('month')

const periodOptions = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
]

// Evolución diaria
const evolutionLineData = computed(() => ({
  labels: analyticsStore.dailyEvolution.map(b => `${b.hour}:00`),
  datasets: [{
    label: 'Personas dentro',
    data: analyticsStore.dailyEvolution.map(b => b.count),
    borderColor: '#003544',
    backgroundColor: 'rgba(0, 53, 68, 0.1)',
    fill: true,
    tension: 0.3,
    pointBackgroundColor: '#003544',
  }],
}))

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
}

function loadEvolution() {
  analyticsStore.fetchDailyEvolution(selectedDate.value).catch(() => { })
}

// Ingresos
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

function loadRevenue() {
  analyticsStore.fetchRevenue(selectedPeriod.value, selectedDate.value).catch(() => { })
}

watch(selectedPeriod, () => loadRevenue())

function downloadCsv() {
  analyticsStore.downloadRevenueCsv(selectedPeriod.value, selectedDate.value)
    .catch(err => showToast(err.message || 'Error al descargar el CSV'))
}

function formatPrice(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(2)} €`
}

onMounted(() => {
  if (!authStore.isAuthenticated) return
  analyticsStore.fetchAnalyticsSummary()
  loadEvolution()
  loadRevenue()
})

onIonViewWillEnter(() => {
  if (!authStore.isAuthenticated) return
  analyticsStore.fetchAnalyticsSummary()
  loadEvolution()
  loadRevenue()
})
</script>

<template>
  <ion-page>
    <MobileHeader title="Reportes" />
    <ion-content :fullscreen="true" class="ion-padding">
      <header class="page-header">
        <p class="eyebrow">ANALÍTICAS GENERALES</p>
        <h1 class="title">Reportes</h1>
      </header>

      <!-- Informe de ingresos -->
      <section class="card panel revenue-header-card">
        <div class="revenue-header-content">
          <h3 class="revenue-title">Informe de ingresos</h3>
          <div class="revenue-controls">
            <PrettyInputSelector v-model="selectedPeriod" :options="periodOptions" placeholder="Período"
              class="revenue-selector" />
            <input v-model="selectedDate" type="date" class="revenue-date-input" @change="loadRevenue" />
            <button type="button" class="btn btn-secondary revenue-export-btn" @click="downloadCsv">
              Exportar CSV
            </button>
          </div>
        </div>
      </section>

      <div class="revenue-metrics">
        <Card label="Facturado" :value="formatPrice(analyticsStore.revenue.facturado)" />
        <Card label="Cobrado" :value="formatPrice(analyticsStore.revenue.cobrado)" />
      </div>

      <section class="reports-grid">
        <Card label="Miembros totales" :value="String(analyticsStore.usersSummary.members_miembro)" />
        <Card label="Miembros itinerantes totales" :value="String(analyticsStore.usersSummary.members_itinerante)" />
      </section>

      <section class="card panel" style="margin-top: 20px;">
        <div class="header">
          <h3>Tendencia en los últimos 12 meses</h3>
          <p class="evolution-subtitle">Facturado y cobrado</p>
        </div>
        <div v-if="analyticsStore.revenue.trend.length" class="chart-wrapper trend-chart">
          <Line :data="trendData" :options="trendOptions" />
        </div>
        <p v-else class="empty-state">No hay datos de tendencia.</p>
      </section>

      <!-- Evolución diaria -->
      <section class="card panel evolution-section">
        <div class="header evolution-header">
          <div>
            <h3>Evolución de ocupación diaria</h3>
            <p class="evolution-subtitle">Personas dentro por hora</p>
          </div>
          <div class="evolution-controls">
            <input id="evolution-date" v-model="selectedDate" type="date" class="evolution-date-input"
              @change="loadEvolution" />
          </div>
        </div>
        <div v-if="analyticsStore.dailyEvolution.length" class="chart-wrapper evolution-chart">
          <Line :data="evolutionLineData" :options="lineOptions" />
        </div>
        <p v-else class="empty-state">No hay datos de evolución para esta fecha.</p>
      </section>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.reports-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  margin-top: var(--space-5);
}

.evolution-section {
  margin-top: var(--space-6);
}

.evolution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.evolution-subtitle {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 0.85rem;
}

.evolution-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.evolution-date-input {
  padding: 8px 12px;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font: inherit;
  font-size: 0.9rem;
}

.evolution-chart {
  height: 320px;
  margin-top: var(--space-4);
  position: relative;
}

.empty-state {
  padding: var(--space-5);
  text-align: center;
  color: #6b7280;
  margin: 0;
}

.revenue-header-card {
  margin-top: var(--space-6);
}

.revenue-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.revenue-title {
  margin: 0;
  font-size: 1.1rem;
  color: var(--primary);
}

.revenue-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.revenue-selector {
  margin: 0;
  min-width: 140px;
}

.revenue-selector:deep(.selector-trigger) {
  padding: 8px 16px;
}

.revenue-select,
.revenue-date-input {
  padding: 8px 12px;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font: inherit;
  font-size: 0.9rem;
  height: 40px;
  box-sizing: border-box;
}

.revenue-export-btn {
  white-space: nowrap;
  height: 40px;
  padding: 0 1rem;
  display: inline-flex;
  align-items: center;
}

.revenue-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  margin: var(--space-4) 0;
}

.trend-chart {
  height: 320px;
  margin-top: var(--space-4);
}

@media (max-width: 1024px) {

  .reports-grid,
  .revenue-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
