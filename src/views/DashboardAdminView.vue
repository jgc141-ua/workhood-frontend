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
import { IonPage, IonContent } from '@ionic/vue'
import { useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import MobileHeader from '@/components/MobileHeader.vue'
import DataTableList from '@/components/DataTableList.vue'
import { useMeStore } from '@/stores/meStore'
import { useAccessStore } from '@/stores/accessStore'
import { useAuthStore } from '@/stores/authStore'
import SpaceScheduleSection from '@/components/sections/SpaceScheduleSection.vue'

const meStore = useMeStore()
const accessStore = useAccessStore()
const authStore = useAuthStore()
const router = useRouter()

const spaceScheduleRef = ref(null)
const recentAccesses = ref([])

onMounted(() => {
  if (!authStore.isAuthenticated) return
  loadRecentAccesses()
})

async function loadRecentAccesses() {
  try {
    const data = await accessStore.fetchLogs({ page: 1, pageSize: 3 })
    recentAccesses.value = data.results || []
  } catch {
    recentAccesses.value = []
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

const stats = [
  { label: 'Desk Occupancy', value: '100%', delta: '+2000%' },
  { label: 'Rooms in Use', value: '12000/15500', delta: '+1000' },
  { label: 'Active Members', value: '50000', delta: '+12' },
]

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
        <div class="main-header page-header">
          <p class="eyebrow">VISTA GENERAL DEL OPERADOR</p>
          <h2 class="title">Bienvenido a {{ brand }}, {{ meStore.user?.first_name }}</h2>
        </div>

        <button class="btn btn-primary top-action" type="button" @click="spaceScheduleRef.openCreateModal()">
          <span>Añadir horario</span>
        </button>
      </section>

      <section class="statsGrid">
        <Card v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" :delta="stat.delta" />
      </section>

      <SpaceScheduleSection ref="spaceScheduleRef" class="dashboard-schedule-section" />

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
                  <p class="access-row-date">{{ item.event ? new Date(item.event).toLocaleString('es-ES') : '-' }}</p>
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
