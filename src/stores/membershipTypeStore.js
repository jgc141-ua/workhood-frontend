import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useMembershipTypeStore = defineStore('membershipTypes', () => {
  // State
  const allMembershipTypes = ref([])
  const membershipTypes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const page = ref(1)
  const pageSize = ref(2)

  // Getters
  const count = computed(() => allMembershipTypes.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))

  const tokenStore = useTokenStore()

  // Helpers
  function applyPagination() {
    const start = (page.value - 1) * pageSize.value
    membershipTypes.value = allMembershipTypes.value.slice(start, start + pageSize.value)
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
  async function fetchActiveMembershipTypes() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(ENDPOINTS.membershipTypesActive, {}, tokenStore)
      await checkResponse(response, 'Error al cargar membresías activas')

      const data = await response.json()
      allMembershipTypes.value = Array.isArray(data) ? data : data.results || []
      page.value = 1
      applyPagination()

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar membresías activas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMembershipTypes() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(ENDPOINTS.membershipTypes, {}, tokenStore)
      await checkResponse(response, 'Error al cargar membresías')

      const data = await response.json()
      allMembershipTypes.value = Array.isArray(data) ? data : data.results || []
      page.value = 1
      applyPagination()

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar membresías'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createMembershipType(payload) {
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

      await fetchMembershipTypes()
      return membershipTypes.value
    } catch (err) {
      error.value = err.message || 'Error al crear la membresía'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateMembershipType(payload) {
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

      await fetchMembershipTypes()
      return membershipTypes.value
    } catch (err) {
      error.value = err.message || 'Error al actualizar la membresía'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteMembershipType(name) {
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

  function clearMembershipTypes() {
    allMembershipTypes.value = []
    membershipTypes.value = []
    error.value = null
    page.value = 1
    pageSize.value = 2
  }

  return {
    allMembershipTypes,
    membershipTypes,
    loading,
    error,
    count,
    page,
    pageSize,
    totalPages,
    fetchMembershipTypes,
    fetchActiveMembershipTypes,
    createMembershipType,
    updateMembershipType,
    deleteMembershipType,
    setPage,
    setPageSize,
    clearMembershipTypes,
  }
})
