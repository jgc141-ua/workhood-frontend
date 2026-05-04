<script setup>
import { computed, inject } from 'vue'
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
import Card from '@/components/Card.vue'
import ActionCard from '@/components/ActionCard.vue'
import MobileHeader from '@/components/MobileHeader.vue'
import { useAuthStore } from '@/stores/authStore'
import { useMeStore } from '@/stores/meStore'

const auth = useAuthStore()
const meStore = useMeStore()

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
      <div class="main-header page-header">
        <p class="eyebrow">VISTA GENERAL DEL {{ meStore.user?.role.toUpperCase() }}</p>
        <h2 class="title">Bienvenido a {{ brand }}, {{ meStore.user?.first_name }}</h2>
      </div>

      <section class="statsGrid">
        <Card v-for="stat in stats" :key="stat.label" :label="stat.label" :value="stat.value" :delta="stat.delta" />
      </section>

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
          <div class="card panel actions" style="background-color: #e8e8ec">
            <div class="header">
              <h3>Action Required</h3>
            </div>
            <ActionCard v-for="action in actions" :key="action.title" v-bind="action" />
          </div>

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
.activities :deep(.card) {
  box-shadow: none;
  padding: 10px;
}

.main-header {
  margin-bottom: 24px;
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

.activityList {
  display: flex;
  flex-direction: column;
}

@media (max-width: 1024px) {
  .statsGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 991.98px) {
  .page-header {
    display: none;
  }
}

@media (max-width: 600px) {
  .statsGrid {
    grid-template-columns: 1fr;
  }
}
</style>
