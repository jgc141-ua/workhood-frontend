import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useInvoiceStore = defineStore('invoices', () => {
  // State
  const myInvoices = ref([])
  const myCount = ref(0)
  const myPage = ref(1)
  const myPageSize = ref(5)
  const myNext = ref(null)
  const myPrevious = ref(null)

  const allInvoices = ref([])
  const allCount = ref(0)
  const allPage = ref(1)
  const allPageSize = ref(10)
  const allNext = ref(null)
  const allPrevious = ref(null)

  const currentInvoice = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const myTotalPages = computed(() => Math.max(1, Math.ceil(myCount.value / myPageSize.value)))
  const allTotalPages = computed(() => Math.max(1, Math.ceil(allCount.value / allPageSize.value)))

  const tokenStore = useTokenStore()

  // Actions - Mis facturas
  async function fetchMyInvoices(params = {}) {
    loading.value = true
    error.value = null
    try {
      const currentPage = params.page ?? myPage.value
      const currentPageSize = params.pageSize ?? myPageSize.value

      const query = new URLSearchParams()
      query.set('page', currentPage)
      query.set('page_size', currentPageSize)
      if (params.state) query.set('state', params.state)

      const response = await apiFetch(`${ENDPOINTS.myInvoices}?${query.toString()}`, {}, tokenStore)
      await checkResponse(response, 'Error al cargar tus facturas')

      const data = await response.json()
      myInvoices.value = data.results || []
      myCount.value = data.count || 0
      myNext.value = data.next
      myPrevious.value = data.previous
      myPage.value = currentPage
      myPageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar tus facturas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMyInvoiceDetail(id) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      query.set('id', id)

      const response = await apiFetch(`${ENDPOINTS.myInvoiceDetail}?${query.toString()}`, {}, tokenStore)
      await checkResponse(response, 'Error al cargar la factura')

      const data = await response.json()
      currentInvoice.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar la factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actions - Todas las facturas (admin)
  async function fetchAllInvoices(params = {}) {
    loading.value = true
    error.value = null
    try {
      const currentPage = params.page ?? allPage.value
      const currentPageSize = params.pageSize ?? allPageSize.value

      const query = new URLSearchParams()
      query.set('page', currentPage)
      query.set('page_size', currentPageSize)
      if (params.state) query.set('state', params.state)
      if (params.email) query.set('email', params.email)
      if (params.dateFrom) query.set('date_from', params.dateFrom)
      if (params.dateTo) query.set('date_to', params.dateTo)

      const response = await apiFetch(`${ENDPOINTS.allInvoices}?${query.toString()}`, {}, tokenStore)
      await checkResponse(response, 'Error al cargar las facturas')

      const data = await response.json()
      allInvoices.value = data.results || []
      allCount.value = data.count || 0
      allNext.value = data.next
      allPrevious.value = data.previous
      allPage.value = currentPage
      allPageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar las facturas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAdminInvoiceDetail(id) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      query.set('id', id)

      const response = await apiFetch(`${ENDPOINTS.adminInvoiceDetail}?${query.toString()}`, {}, tokenStore)
      await checkResponse(response, 'Error al cargar la factura')

      const data = await response.json()
      currentInvoice.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar la factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearInvoices() {
    myInvoices.value = []
    allInvoices.value = []
    currentInvoice.value = null
    error.value = null
  }

  async function issueInvoice(email, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.invoiceIssue,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, ...payload }),
        },
        tokenStore,
      )
      await checkResponse(response, 'Error al generar la factura')
      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al generar la factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function payInvoice(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.payInvoice,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...payload }),
        },
        tokenStore,
      )
      await checkResponse(response, 'Error al pagar la factura')
      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al pagar la factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function registerPayment(id, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.registerPayment,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...payload }),
        },
        tokenStore,
      )
      await checkResponse(response, 'Error al registrar el pago')
      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al registrar el pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelInvoice(id, reason) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.invoiceCancel,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, reason }),
        },
        tokenStore,
      )
      await checkResponse(response, 'Error al anular la factura')
      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al anular la factura'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    myInvoices,
    myCount,
    myPage,
    myPageSize,
    myNext,
    myPrevious,
    myTotalPages,
    allInvoices,
    allCount,
    allPage,
    allPageSize,
    allNext,
    allPrevious,
    allTotalPages,
    currentInvoice,
    loading,
    error,
    fetchMyInvoices,
    fetchMyInvoiceDetail,
    fetchAllInvoices,
    fetchAdminInvoiceDetail,
    issueInvoice,
    payInvoice,
    registerPayment,
    cancelInvoice,
    clearInvoices,
  }
})
