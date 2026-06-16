<script setup>
import { onMounted, ref, watch } from 'vue'

import { IonPage, IonContent } from '@ionic/vue'
import { computed } from 'vue'
import MobileHeader from '@/components/MobileHeader.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import DataTablePagination from '@/components/DataTablePagination.vue'
import { useAccessStore } from '@/stores/accessStore'
import { showToast } from '@/composables/toast'

const accessStore = useAccessStore()

const selectedType = ref('all')
const selectedResult = ref('all')
const selectedEmail = ref('')

const typeOptions = [
  { value: 'all', label: 'Todos los tipos' },
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SALIDA', label: 'Salida' },
]

const resultOptions = [
  { value: 'all', label: 'Todos los resultados' },
  { value: 'PERMITIDO', label: 'Permitido' },
  { value: 'DENEGADO', label: 'Denegado' },
]

const pagination = computed(() => ({
  page: accessStore.page,
  pageSize: accessStore.pageSize,
  total: accessStore.count,
}))

async function loadLogs(page = 1) {
  try {
    await accessStore.fetchLogs({
      page,
      pageSize: 10,
      type: selectedType.value !== 'all' ? selectedType.value : undefined,
      result: selectedResult.value !== 'all' ? selectedResult.value : undefined,
      email: selectedEmail.value || undefined,
    })
  } catch (err) {
    //showToast(err.message || 'Error al cargar los registros de acceso')
  }
}

function prevPage() {
  loadLogs(accessStore.page - 1)
}

function nextPage() {
  loadLogs(accessStore.page + 1)
}

watch([selectedType, selectedResult], () => {
  loadLogs(1)
})

let emailSearchTimeout = null
watch(selectedEmail, () => {
  clearTimeout(emailSearchTimeout)
  emailSearchTimeout = setTimeout(() => {
    loadLogs(1)
  }, 500)
})

onMounted(() => {
  loadLogs()
})
</script>

<template>
  <ion-page>
    <MobileHeader title="Accesos" />
    <ion-content :fullscreen="true" class="ion-padding">
      <section class="accesses-admin">
        <header class="page-header">
          <div>
            <p class="eyebrow">GESTIÓN DE ACCESOS</p>
            <h1 class="title">Registros de acceso</h1>
          </div>
        </header>

        <div class="access-filters">
          <PrettyInputSelector v-model="selectedType" :options="typeOptions" class="access-filter-selector" />
          <PrettyInputSelector v-model="selectedResult" :options="resultOptions" class="access-filter-selector" />
          <input v-model="selectedEmail" type="text" class="access-filter access-filter-email"
            placeholder="Filtrar por email" />
        </div>

        <div v-if="accessStore.loading" class="server-state">Cargando registros...</div>
        <div v-else-if="!accessStore.logs.length" class="server-state">
          No hay registros de acceso.
        </div>

        <div v-else class="access-list">
          <article v-for="access in accessStore.logs" :key="access.id" class="card access-card">
            <div class="access-info">
              <span class="access-type">{{ access.type === 'ENTRADA' ? 'Entrada' : 'Salida' }}</span>
              <span class="access-result" :class="access.result.toLowerCase()">
                {{ access.result === 'PERMITIDO' ? 'Permitido' : 'Denegado' }}
              </span>
            </div>
            <p class="access-user">{{ access.user_name }} ({{ access.user_email }})</p>
            <p v-if="access.membership" class="access-membership">
              {{ access.membership.membership_type_name }}
              <span v-if="access.membership.resource_name">— {{ access.membership.resource_name }}</span>
            </p>
            <p class="access-date">{{ access.event ? new Date(access.event).toLocaleString('es-ES') : '-' }}</p>
          </article>
        </div>

        <div v-if="accessStore.logs.length" class="card access-pagination-card">
          <DataTablePagination :pagination="pagination" :loading="accessStore.loading"
            :items-length="accessStore.logs.length" @prev-page="prevPage" @next-page="nextPage" />
        </div>
      </section>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.accesses-admin {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.access-filters {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.access-filter-selector {
  min-width: 220px;
}

.access-filter-email {
  min-width: 260px;
}

.access-filter {
  padding: 14px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font: inherit;
  font-size: 0.95rem;
  height: fit-content;
  align-self: flex-start;
  box-sizing: border-box;
}

.access-filter:focus {
  outline: none;
  border-color: var(--secondary);
}

.access-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.access-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-4);
}

.access-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.access-type {
  font-weight: 600;
  color: var(--primary);
}

.access-result {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.75rem;
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

.access-user,
.access-membership,
.access-date {
  margin: 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.server-state {
  text-align: center;
  color: #6b7280;
  padding: var(--space-4);
}

.access-pagination-card {
  padding: 0;
}
</style>
