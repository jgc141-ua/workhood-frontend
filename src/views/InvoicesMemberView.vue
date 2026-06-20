<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { IonContent, onIonViewWillEnter } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import DataTablePagination from '@/components/DataTablePagination.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import InvoiceDetailModal from '@/components/InvoiceDetailModal.vue'
import InvoicePayModal from '@/components/InvoicePayModal.vue'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { usePaymentMethodStore } from '@/stores/paymentMethodStore'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'

const invoiceStore = useInvoiceStore()
const paymentMethodStore = usePaymentMethodStore()
const authStore = useAuthStore()

const selectedState = ref('all')
const isDetailModalOpen = ref(false)
const isLoadingDetail = ref(false)
const isPayModalOpen = ref(false)
const invoiceToPay = ref(null)

const activePaymentMethods = computed(() =>
  paymentMethodStore.allPaymentMethods.filter((m) => m.is_active && m.member_visible)
)

const paymentMethodOptions = computed(() =>
  activePaymentMethods.value.map((m) => ({ value: m.id, label: m.name }))
)

const stateLabels = {
  EMITIDA: 'Emitida',
  PAGADA: 'Pagada',
  VENCIDA: 'Vencida',
  ANULADA: 'Anulada',
}

const stateOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'EMITIDA', label: 'Emitidas' },
  { value: 'PAGADA', label: 'Pagadas' },
  { value: 'VENCIDA', label: 'Vencidas' },
  { value: 'ANULADA', label: 'Anuladas' },
]

const pagination = computed(() => ({
  page: invoiceStore.myPage,
  pageSize: invoiceStore.myPageSize,
  total: invoiceStore.myCount,
}))

async function loadInvoices(page = 1) {
  try {
    await invoiceStore.fetchMyInvoices({
      page,
      state: selectedState.value !== 'all' ? selectedState.value : undefined,
    })
  } catch (err) {
    showToast(err.message || 'Error al cargar tus facturas')
  }
}

async function openDetail(invoice) {
  isDetailModalOpen.value = true
  isLoadingDetail.value = true
  try {
    await invoiceStore.fetchMyInvoiceDetail(invoice.id)
  } catch (err) {
    showToast(err.message || 'Error al cargar la factura')
  } finally {
    isLoadingDetail.value = false
  }
}

function closeDetail() {
  isDetailModalOpen.value = false
}

function prevPage() {
  if (invoiceStore.myPage > 1) loadInvoices(invoiceStore.myPage - 1)
}

function nextPage() {
  if (invoiceStore.myNext) loadInvoices(invoiceStore.myPage + 1)
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-ES')
}

function formatPrice(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(2)} €`
}

function openPayModal(invoice) {
  invoiceToPay.value = invoice
  isPayModalOpen.value = true
}

function closePayModal() {
  isPayModalOpen.value = false
}

async function handlePay(payload) {
  if (!invoiceToPay.value) return
  try {
    await invoiceStore.payInvoice(invoiceToPay.value.id, payload)
    showToast('Factura pagada correctamente', 'success')
    closePayModal()
    await loadInvoices()
  } catch (err) {
    showToast(err.message || 'Error al pagar la factura')
  }
}

watch(selectedState, () => loadInvoices(1))

onMounted(() => {
  if (!authStore.isAuthenticated) return
  loadInvoices()
  if (!paymentMethodStore.allPaymentMethods.length) {
    paymentMethodStore.fetchPaymentMethods().catch(() => {})
  }
})

onIonViewWillEnter(() => {
  if (authStore.isAuthenticated) loadInvoices()
})
</script>

<template>
  <MobileHeader title="Facturas" />
  <ion-content :fullscreen="true" class="ion-padding">
    <section class="page-admin">
      <header class="page-header">
        <p class="eyebrow">FACTURACIÓN</p>
        <h1 class="title">Mis facturas</h1>
      </header>

      <div class="filters">
        <PrettyInputSelector v-model="selectedState" :options="stateOptions" placeholder="Selecciona un estado"
          class="invoices-filter-selector" />
      </div>

      <div v-if="invoiceStore.loading" class="server-state">Cargando facturas...</div>
      <div v-else-if="!invoiceStore.myInvoices.length" class="server-state">
        No tienes facturas.
      </div>

      <div v-else class="invoices-list">
        <article v-for="invoice in invoiceStore.myInvoices" :key="invoice.id" class="card invoice-card">
          <div class="invoice-card-main" @click="openDetail(invoice)">
            <h3 class="invoice-card-number">{{ invoice.invoice_number }}</h3>
            <p class="invoice-card-concept text-truncate">{{ invoice.concept }}</p>
            <p class="invoice-card-date">Emitida: {{ formatDate(invoice.issue_date) }}</p>
            <p class="invoice-card-date">Vencimiento: {{ formatDate(invoice.due_date) }}</p>
          </div>
          <div class="invoice-card-aside">
            <span class="invoice-badge" :class="`invoice-badge--${invoice.state.toLowerCase()}`">
              {{ stateLabels[invoice.state] || invoice.state }}
            </span>
            <span class="invoice-card-total">{{ formatPrice(invoice.total) }}</span>
            <button v-if="invoice.state === 'EMITIDA' || invoice.state === 'VENCIDA'" type="button"
              class="btn btn-primary invoice-pay-btn" @click.stop="openPayModal(invoice)">
              Pagar
            </button>
          </div>
        </article>
      </div>

      <div v-if="invoiceStore.myInvoices.length" class="card pagination-card">
        <DataTablePagination :pagination="pagination" :loading="invoiceStore.loading"
          :items-length="invoiceStore.myInvoices.length" @prev-page="prevPage" @next-page="nextPage" />
      </div>

      <InvoicePayModal :show="isPayModalOpen" :invoice="invoiceToPay" title="Pagar factura"
        submit-label="Pagar" :payment-method-options="paymentMethodOptions"
        :loading="invoiceStore.loading" :error="invoiceStore.error || ''"
        @close="closePayModal" @pay="handlePay" />

      <InvoiceDetailModal :show="isDetailModalOpen" :loading="isLoadingDetail"
        :invoice="invoiceStore.currentInvoice" @close="closeDetail" />
    </section>
  </ion-content>
</template>

<style scoped>
.invoices-filter-selector {
  min-width: 220px;
}

.invoices-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.invoice-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.invoice-card:hover {
  box-shadow: var(--shadow-floating);
}

.invoice-card-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.invoice-card-number {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
}

.invoice-card-concept {
  margin: 0;
  font-size: 0.9rem;
  color: #374151;
}

.invoice-card-date {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.invoice-card-aside {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
  flex-shrink: 0;
}

.invoice-card-total {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary);
}

.invoice-pay-btn {
  min-height: 36px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.invoice-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #fff;
  background: #9ca3af;
}

.invoice-badge--emitida {
  background: #2563eb;
}

.invoice-badge--pagada {
  background: #0f6a52;
}

.invoice-badge--vencida {
  background: #dc2626;
}

.invoice-badge--anulada {
  background: #6b7280;
}

.pagination-card {
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-3);
}

.server-state {
  text-align: center;
  color: #6b7280;
  padding: var(--space-4);
}

@media (max-width: 600px) {
  .invoice-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .invoice-card-aside {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
