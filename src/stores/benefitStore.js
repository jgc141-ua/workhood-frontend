import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBenefitStore = defineStore('benefits', () => {
  // State
  const benefits = ref([
    { name: 'WiFi Alta Velocidad', description: 'Incluido en todos', quantity: 5 },
    { name: 'Café & Té', description: 'Incluido en todos', quantity: null },
    { name: 'WiFi Alta Velocidad', description: 'Incluido en todos', quantity: 5 },
    { name: 'Café & Té', description: 'Incluido en todos', quantity: null },
    { name: 'WiFi Alta Velocidad', description: 'Incluido en todos', quantity: 5 },
    { name: 'Café & Té', description: 'Incluido en todos', quantity: null },
    { name: 'WiFi Alta Velocidad', description: 'Incluido en todos', quantity: 5 },
    { name: 'Café & Té', description: 'Incluido en todos', quantity: null },
    { name: 'WiFi Alta Velocidad', description: 'Incluido en todos', quantity: 5 },
    { name: 'Café & Té', description: 'Incluido en todos', quantity: null },
    { name: 'WiFi Alta Velocidad', description: 'Incluido en todos', quantity: 5 },
    { name: 'Café & Té', description: 'Incluido en todos', quantity: null },
    { name: 'Café & Té', description: 'Incluido en todos', quantity: null },
  ])
  const loading = ref(false)
  const error = ref(null)
  const count = ref(benefits.value.length)
  const page = ref(1)
  const pageSize = ref(3)

  // Getters
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPreviousPage = computed(() => page.value > 1)

  const paginatedBenefits = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return benefits.value.slice(start, start + pageSize.value).map((item, i) => ({ ...item, idx: start + i }))
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
  const clearBenefits = () => {
    benefits.value = []
    error.value = null
    count.value = 0
    page.value = 1
    pageSize.value = 3
  }

  return {
    benefits,
    loading,
    error,
    count,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    paginatedBenefits,
    setPage,
    setPageSize,
    clearBenefits,
  }
})
