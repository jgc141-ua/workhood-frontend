import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'

export const useMembersStore = defineStore('members', () => {
  // State
  const members = ref([])
  const loading = ref(false)
  const error = ref(null)
  const count = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const page = ref(1)
  const pageSize = ref(10)
  const search = ref('')

  // Getters
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))
  const hasNextPage = computed(() => !!next.value)
  const hasPreviousPage = computed(() => !!previous.value)

  const tokenStore = useTokenStore()

  // Setters
  const setPage = async (newPage) => {
    if (newPage < 1) return
    await fetchMembers({ page: newPage })
  }

  const setSearch = async (newSearch) => {
    search.value = newSearch
    await fetchMembers({ page: 1, search: newSearch })
  }

  const setPageSize = async (newPageSize) => {
    pageSize.value = newPageSize
    await fetchMembers({ page: 1, pageSize: newPageSize })
  }

  // Helper
  const checkResponse = (response, forbiddenMsg, defaultMsg) => {
    if (response.status === 403) throw new Error(forbiddenMsg)
    if (!response.ok) throw new Error(defaultMsg)
  }

  // Actions
  const fetchMembers = async (params = {}) => {
    loading.value = true
    error.value = null
    try {
      const currentPage = params.page ?? page.value
      const currentPageSize = params.pageSize ?? pageSize.value
      const currentSearch = params.search ?? search.value

      const query = new URLSearchParams()
      query.set('page', currentPage)
      query.set('page_size', currentPageSize)
      if (currentSearch?.trim()) query.set('search', currentSearch.trim())

      const response = await apiFetch(`${ENDPOINTS.members}?${query.toString()}`, {}, tokenStore)
      checkResponse(
        response,
        'No tienes permisos para ver los miembros',
        'Error al cargar miembros',
      )

      const data = await response.json()
      members.value = data.results || []
      count.value = data.count || 0
      next.value = data.next
      previous.value = data.previous
      page.value = currentPage
      pageSize.value = currentPageSize
      search.value = currentSearch

      return data
    } catch (err) {
      error.value = err.message || 'Error inesperado'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMemberDetail = async (email) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        `${ENDPOINTS.memberDetail}${encodeURIComponent(email)}/`,
        {},
        tokenStore,
      )
      checkResponse(response, null, 'Error al cargar los datos del miembro')
      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error inesperado'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateMember = async (email, payload) => {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        `${ENDPOINTS.memberDetail}${encodeURIComponent(email)}/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail || 'Error al actualizar el miembro')
      }

      const updated = await response.json()
      const index = members.value.findIndex((m) => m.email === email)
      if (index !== -1) members.value[index] = { ...members.value[index], ...updated }

      return updated
    } catch (err) {
      error.value = err.message || 'Error inesperado'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Limpiar datos de la tabla de miembros
  const clearMembers = () => {
    members.value = []
    error.value = null
    count.value = 0
    next.value = null
    previous.value = null
    page.value = 1
    pageSize.value = 10
    search.value = ''
  }

  return {
    members,
    loading,
    error,
    count,
    next,
    previous,
    page,
    pageSize,
    search,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    fetchMembers,
    setPage,
    setSearch,
    setPageSize,
    fetchMemberDetail,
    updateMember,
    clearMembers,
  }
})
