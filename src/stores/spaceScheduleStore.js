import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useSpaceScheduleStore = defineStore('spaceSchedules', () => {
  // State
  const schedules = ref([])
  const loading = ref(false)
  const error = ref(null)
  const count = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const page = ref(1)
  const pageSize = ref(5)

  const tokenStore = useTokenStore()

  async function setPage(newPage) {
    if (newPage < 1) return
    await fetchSchedules({ page: newPage })
  }

  // Actions
  async function fetchSchedules(params = {}) {
    loading.value = true
    error.value = null
    try {
      const currentPage = params.page ?? page.value
      const currentPageSize = params.pageSize ?? pageSize.value

      const query = new URLSearchParams()
      query.set('page', currentPage)
      query.set('page_size', currentPageSize)

      const response = await apiFetch(
        `${ENDPOINTS.spaceSchedules}?${query.toString()}`,
        {},
        tokenStore,
      )
      await checkResponse(response, 'Error al cargar los horarios')

      const data = await response.json()
      schedules.value = data.results || []
      count.value = data.count || 0
      next.value = data.next
      previous.value = data.previous
      page.value = currentPage
      pageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar los horarios'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createSchedule(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.spaceScheduleCreate,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al crear el horario')

      const created = await response.json()
      await fetchSchedules()
      return created
    } catch (err) {
      error.value = err.message || 'Error al crear el horario'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSchedule(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.spaceScheduleUpdate,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al actualizar el horario')

      const updated = await response.json()
      const index = schedules.value.findIndex((s) => s.id === payload.id)
      if (index !== -1) schedules.value[index] = { ...schedules.value[index], ...updated }

      return updated
    } catch (err) {
      error.value = err.message || 'Error al actualizar el horario'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSchedule(id) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.spaceScheduleDelete,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al eliminar el horario')

      await fetchSchedules()
      return true
    } catch (err) {
      error.value = err.message || 'Error al eliminar el horario'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    schedules,
    loading,
    error,
    count,
    next,
    previous,
    page,
    pageSize,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    setPage,
  }
})
