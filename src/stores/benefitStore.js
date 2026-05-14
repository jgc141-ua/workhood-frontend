import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useBenefitStore = defineStore('benefits', () => {
  // State
  const allBenefits = ref([])
  const benefits = ref([])
  const loading = ref(false)
  const error = ref(null)
  const page = ref(1)
  const pageSize = ref(3)

  // Getters
  const count = computed(() => allBenefits.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))

  const tokenStore = useTokenStore()

  // Helpers
  function applyPagination() {
    const start = (page.value - 1) * pageSize.value
    benefits.value = allBenefits.value.slice(start, start + pageSize.value)
  }

  function setPage(newPage) {
    if (newPage < 1 || newPage > totalPages.value) return
    page.value = newPage
    applyPagination()
  }

  function setPageSize(newPageSize) {
    pageSize.value = newPageSize
    page.value = 1
    applyPagination()
  }

  // Actions
  async function fetchBenefits() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(ENDPOINTS.benefits, {}, tokenStore)
      await checkResponse(response, 'Error al cargar beneficios')

      const data = await response.json()
      allBenefits.value = Array.isArray(data) ? data : data.results || []
      page.value = 1
      applyPagination()

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar beneficios'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createBenefit(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.benefitCreate,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al crear el beneficio')

      await fetchBenefits()
      return benefits.value
    } catch (err) {
      error.value = err.message || 'Error al crear el beneficio'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateBenefit(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.benefitUpdate,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al actualizar el beneficio')

      await fetchBenefits()
      return benefits.value
    } catch (err) {
      error.value = err.message || 'Error al actualizar el beneficio'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteBenefit(name) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.benefitDelete,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al eliminar el beneficio')

      await fetchBenefits()
      return true
    } catch (err) {
      error.value = err.message || 'Error al eliminar el beneficio'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearBenefits() {
    allBenefits.value = []
    benefits.value = []
    error.value = null
    page.value = 1
    pageSize.value = 3
  }

  return {
    allBenefits,
    benefits,
    loading,
    error,
    count,
    page,
    pageSize,
    totalPages,
    fetchBenefits,
    createBenefit,
    updateBenefit,
    deleteBenefit,
    setPage,
    setPageSize,
    clearBenefits,
  }
})
