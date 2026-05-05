import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'

export const useBenefitStore = defineStore('benefits', () => {
  // State
  const benefits = ref([])
  const loading = ref(false)
  const error = ref(null)
  const count = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const page = ref(1)
  const pageSize = ref(3)

  // Getters
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))
  const hasNextPage = computed(() => !!next.value)
  const hasPreviousPage = computed(() => !!previous.value)

  const tokenStore = useTokenStore()

  const checkResponse = async (response, defaultMsg) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.detail || defaultMsg)
    }
  }

  // Setters
  const setPage = async (newPage) => {
    if (newPage < 1) return
    await fetchBenefits({ page: newPage })
  }

  const setPageSize = async (newPageSize) => {
    pageSize.value = newPageSize
    await fetchBenefits({ page: 1 })
  }

  // Actions
  const fetchBenefits = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const currentPage = params.page ?? page.value
      const currentPageSize = params.pageSize ?? pageSize.value

      const query = new URLSearchParams()
      query.set('page', currentPage)
      query.set('page_size', currentPageSize)

      const response = await apiFetch(`${ENDPOINTS.benefits}?${query.toString()}`, {}, tokenStore)
      await checkResponse(response, 'Error al cargar beneficios')

      const data = await response.json()
      benefits.value = data.results || []
      count.value = data.count || 0
      next.value = data.next
      previous.value = data.previous
      page.value = currentPage
      pageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar beneficios'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createBenefit = async (payload) => {
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

      const created = await response.json()
      await fetchBenefits()
      return created
    } catch (err) {
      error.value = err.message || 'Error al crear el beneficio'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateBenefit = async (payload) => {
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

      const updated = await response.json()
      const index = benefits.value.findIndex((b) => b.name === payload.name)
      if (index !== -1) benefits.value[index] = { ...benefits.value[index], ...updated }

      return updated
    } catch (err) {
      error.value = err.message || 'Error al actualizar el beneficio'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteBenefit = async (name) => {
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

  const clearBenefits = () => {
    benefits.value = []
    error.value = null
    count.value = 0
    next.value = null
    previous.value = null
    page.value = 1
    pageSize.value = 3
  }

  return {
    benefits,
    loading,
    error,
    count,
    next,
    previous,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetchBenefits,
    createBenefit,
    updateBenefit,
    deleteBenefit,
    setPage,
    setPageSize,
    clearBenefits,
  }
})
