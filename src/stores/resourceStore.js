import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useResourceStore = defineStore('resources', () => {
  // State
  const resources = ref([
    { name: 'Sala de Juntas A', type: 'Espacio', capacity: '8 personas', rate: '$25.00', status: 'Disponible' },
    { name: 'Proyector 4K', type: 'Equipo', capacity: '-', rate: '$10.00', status: 'En Mantenimiento' },
    { name: 'Hot Desks Zona B', type: 'Área', capacity: '20 personas', rate: '-', status: 'Disponible' },
  ])
  const loading = ref(false)
  const error = ref(null)
  const count = ref(resources.value.length)
  const page = ref(1)
  const pageSize = ref(5)

  // Getters
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPreviousPage = computed(() => page.value > 1)

  const paginatedResources = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return resources.value.slice(start, start + pageSize.value).map((item, i) => ({ ...item, idx: start + i }))
  })

  // Setters
  const setPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages.value) return
    page.value = newPage
  }

  const setPageSize = (newPageSize) => {
    pageSize.value = newPageSize
    page.value = 1
  }

  // Actions
  const clearResources = () => {
    resources.value = []
    error.value = null
    count.value = 0
    page.value = 1
    pageSize.value = 5
  }

  return {
    resources,
    loading,
    error,
    count,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    paginatedResources,
    setPage,
    setPageSize,
    clearResources,
  }
})
