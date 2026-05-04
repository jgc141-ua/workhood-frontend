import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMembershipStore = defineStore('memberships', () => {
  // State
  const memberships = ref([
    {
      title: 'Flex Desk Mensual',
      description: 'Acceso 24/7 a áreas comunes',
      price: '$150',
      period: '/mes',
      state: true,
      meta: '4 hrs salas incluidas',
      active: true,
    },
    {
      title: 'Fixed Desk',
      description: 'Escritorio asignado personal',
      price: '$300',
      state: true,
      period: '/mes',
      meta: '10 hrs salas incluidas',
      active: true,
    },
    {
      title: 'Flex Desk Mensual',
      description: 'Acceso 24/7 a áreas comunes',
      price: '$550',
      state: true,
      period: '/mes',
      meta: '4 hrs salas incluidas',
      active: true,
    },
    {
      title: 'Fixed Desk',
      description: 'Escritorio asignado personal',
      price: '$600',
      state: false,
      period: '/mes',
      meta: '10 hrs salas incluidas',
      active: true,
    },
  ])
  const loading = ref(false)
  const error = ref(null)
  const count = ref(memberships.value.length)
  const page = ref(1)
  const pageSize = ref(2)

  // Getters
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))
  const hasNextPage = computed(() => page.value < totalPages.value)
  const hasPreviousPage = computed(() => page.value > 1)

  const paginatedMemberships = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return memberships.value.slice(start, start + pageSize.value).map((item, i) => ({ ...item, idx: start + i }))
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
  const clearMemberships = () => {
    memberships.value = []
    error.value = null
    count.value = 0
    page.value = 1
    pageSize.value = 2
  }

  return {
    memberships,
    loading,
    error,
    count,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    paginatedMemberships,
    setPage,
    setPageSize,
    clearMemberships,
  }
})
