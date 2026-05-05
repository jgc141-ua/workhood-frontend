import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'

export const useMembershipTypeStore = defineStore('membershipTypes', () => {
  // State
  const membershipTypes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const count = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const page = ref(1)
  const pageSize = ref(2)

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
    await fetchMembershipTypes({ page: newPage })
  }

  const setPageSize = async (newPageSize) => {
    pageSize.value = newPageSize
    await fetchMembershipTypes({ page: 1 })
  }

  // Actions
  const fetchMembershipTypes = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const currentPage = params.page ?? page.value
      const currentPageSize = params.pageSize ?? pageSize.value

      const query = new URLSearchParams()
      query.set('page', currentPage)
      query.set('page_size', currentPageSize)

      const response = await apiFetch(`${ENDPOINTS.membershipTypes}?${query.toString()}`, {}, tokenStore)
      await checkResponse(response, 'Error al cargar membresías')

      const data = await response.json()
      membershipTypes.value = data.results || []
      count.value = data.count || 0
      next.value = data.next
      previous.value = data.previous
      page.value = currentPage
      pageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar membresías'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createMembershipType = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.membershipTypeCreate,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al crear la membresía')

      const created = await response.json()
      await fetchMembershipTypes()
      return created
    } catch (err) {
      error.value = err.message || 'Error al crear la membresía'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMembershipType = async (payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.membershipTypeUpdate,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al actualizar la membresía')

      const updated = await response.json()
      const index = membershipTypes.value.findIndex((m) => m.name === payload.name)
      if (index !== -1) membershipTypes.value[index] = { ...membershipTypes.value[index], ...updated }

      return updated
    } catch (err) {
      error.value = err.message || 'Error al actualizar la membresía'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteMembershipType = async (name) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.membershipTypeDelete,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al eliminar la membresía')

      await fetchMembershipTypes()
      return true
    } catch (err) {
      error.value = err.message || 'Error al eliminar la membresía'
      throw err
    } finally {
      loading.value = false
    }
  }

  const clearMembershipTypes = () => {
    membershipTypes.value = []
    error.value = null
    count.value = 0
    next.value = null
    previous.value = null
    page.value = 1
    pageSize.value = 10
  }

  return {
    membershipTypes,
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
    fetchMembershipTypes,
    createMembershipType,
    updateMembershipType,
    deleteMembershipType,
    setPage,
    setPageSize,
    clearMembershipTypes,
  }
})
