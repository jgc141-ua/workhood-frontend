<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { IonContent } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import DataTableColumns from '@/components/DataTableColumns.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconInvoice from '@/assets/icons/IconInvoice.vue'
import IconTrash from '@/assets/icons/IconTrash.vue'
import IconDownload from '@/assets/icons/IconDownload.vue'
import InvoiceDetailModal from '@/components/InvoiceDetailModal.vue'
import InvoicePayModal from '@/components/InvoicePayModal.vue'
import AppModal from '@/components/AppModal.vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { usePaymentMethodStore } from '@/stores/paymentMethodStore'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'

const invoiceStore = useInvoiceStore()
const paymentMethodStore = usePaymentMethodStore()
const authStore = useAuthStore()

const selectedState = ref('all')
const selectedEmail = ref('')
const isDetailModalOpen = ref(false)
const isLoadingDetail = ref(false)
const isPayModalOpen = ref(false)
const invoiceToPay = ref(null)

const activePaymentMethods = computed(() =>
  paymentMethodStore.allPaymentMethods.filter((m) => m.is_active)
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

const invoiceColumns = [
  { key: 'invoice_number', label: 'NÚMERO', width: '1fr' },
  { key: 'concept', label: 'CONCEPTO', width: '1.5fr' },
  { key: 'user_email', label: 'MIEMBRO', width: '1fr' },
  { key: 'issue_date', label: 'EMISIÓN', width: '0.75fr' },
  { key: 'due_date', label: 'VENCIM.', width: '0.75fr' },
  { key: 'state', label: 'ESTADO', width: '0.75fr' },
  { key: 'total', label: 'TOTAL', width: '0.5fr' },
  { key: 'actions', label: '', width: '0.25fr' },
]

const moreActionsOpts = [
  { icon: IconDownload, label: 'Descargar PDF', action: 'pdf', danger: false },
  { icon: IconInvoice, label: 'Registrar pago', action: 'pay', danger: false },
  { icon: IconTrash, label: 'Anular', action: 'cancel', danger: true },
]

const pdfAction = [
  { icon: IconDownload, label: 'Descargar PDF', action: 'pdf', danger: false },
]

// Modal de anulación
const isCancelModalOpen = ref(false)
const invoiceToCancel = ref(null)
const cancelReason = ref('')

const pagination = computed(() => ({
  page: invoiceStore.allPage,
  pageSize: invoiceStore.allPageSize,
  total: invoiceStore.allCount,
}))

async function loadInvoices(page = 1) {
  try {
    await invoiceStore.fetchAllInvoices({
      page,
      state: selectedState.value !== 'all' ? selectedState.value : undefined,
      email: selectedEmail.value || undefined,
    })
  } catch (err) {
    showToast(err.message || 'Error al cargar las facturas')
  }
}

async function openDetail(invoice) {
  isDetailModalOpen.value = true
  isLoadingDetail.value = true
  try {
    await invoiceStore.fetchAdminInvoiceDetail(invoice.id)
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
  if (invoiceStore.allPage > 1) loadInvoices(invoiceStore.allPage - 1)
}

function nextPage() {
  if (invoiceStore.allNext) loadInvoices(invoiceStore.allPage + 1)
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

function handleInvoiceAction(invoice, option) {
  if (option.action === 'pay') {
    openPayModal(invoice)
  } else if (option.action === 'cancel') {
    openCancelModal(invoice)
  } else if (option.action === 'pdf') {
    downloadInvoicePdf(invoice)
  }
}

async function downloadInvoicePdf(invoice) {
  try {
    await invoiceStore.downloadPdf(invoice.id, true)
  } catch (err) {
    showToast(err.message || 'Error al descargar el PDF')
  }
}

function invoiceActionOptions(invoice) {
  if (invoice.state === 'EMITIDA' || invoice.state === 'VENCIDA') {
    return moreActionsOpts
  }
  return pdfAction
}

function openCancelModal(invoice) {
  invoiceToCancel.value = invoice
  cancelReason.value = ''
  isCancelModalOpen.value = true
}

function closeCancelModal() {
  isCancelModalOpen.value = false
}

async function handleCancel() {
  if (!invoiceToCancel.value || !cancelReason.value.trim()) {
    showToast('El motivo de anulación es obligatorio')
    return
  }

  try {
    await invoiceStore.cancelInvoice(invoiceToCancel.value.id, cancelReason.value.trim())
    showToast('Factura anulada correctamente', 'success')
    closeCancelModal()
    await loadInvoices()
  } catch (err) {
    showToast(err.message || 'Error al anular la factura')
  }
}

async function handlePay(payload) {
  if (!invoiceToPay.value) return
  try {
    await invoiceStore.registerPayment(invoiceToPay.value.id, payload)
    showToast('Pago registrado correctamente', 'success')
    closePayModal()
    await loadInvoices()
  } catch (err) {
    showToast(err.message || 'Error al registrar el pago')
  }
}

watch(selectedState, () => loadInvoices(1))

let emailSearchTimeout = null
watch(selectedEmail, () => {
  clearTimeout(emailSearchTimeout)
  emailSearchTimeout = setTimeout(() => {
    loadInvoices(1)
  }, 500)
})

onMounted(async () => {
  if (!authStore.isAuthenticated) return
  await loadInvoices()
  if (!paymentMethodStore.allPaymentMethods.length) {
    paymentMethodStore.fetchPaymentMethods().catch(() => { })
  }
})
</script>

<template>
  <MobileHeader title="Facturas" />
  <ion-content :fullscreen="true" class="ion-padding">
    <section class="page-admin">
      <header class="page-header">
        <p class="eyebrow">FACTURACIÓN</p>
        <h1 class="title">Todas las facturas</h1>
      </header>

      <div class="filters">
        <PrettyInputSelector v-model="selectedState" :options="stateOptions" placeholder="Selecciona un estado"
          class="invoices-filter-selector" />
        <input v-model="selectedEmail" type="text" class="invoices-filter-email" placeholder="Filtrar por email" />
      </div>

      <DataTableColumns :columns="invoiceColumns" :items="invoiceStore.allInvoices" key-field="id"
        :loading="invoiceStore.loading" :error="!!invoiceStore.error" :pagination="pagination" @prev-page="prevPage"
        @next-page="nextPage">

        <template #cell-invoice_number="{ item }">
          <button type="button" class="invoice-link" @click="openDetail(item)">
            {{ item.invoice_number }}
          </button>
        </template>

        <template #cell-concept="{ item }">
          <div class="data-table-text text-truncate" :title="item.concept">{{ item.concept }}</div>
        </template>

        <template #cell-issue_date="{ item }">
          <div class="data-table-text">{{ formatDate(item.issue_date) }}</div>
        </template>

        <template #cell-due_date="{ item }">
          <div class="data-table-text">{{ formatDate(item.due_date) }}</div>
        </template>

        <template #cell-state="{ item }">
          <span class="invoice-badge" :class="`invoice-badge--${item.state.toLowerCase()}`">
            {{ stateLabels[item.state] || item.state }}
          </span>
        </template>

        <template #cell-total="{ item }">
          <div class="data-table-text data-table-text--primary">{{ formatPrice(item.total) }}</div>
        </template>

        <template #cell-actions="{ item }">
          <MoreActionsButton v-if="invoiceActionOptions(item).length" :options="invoiceActionOptions(item)"
            @select="(opt) => handleInvoiceAction(item, opt)" />
        </template>
      </DataTableColumns>

      <InvoicePayModal :show="isPayModalOpen" :invoice="invoiceToPay" title="Registrar pago"
        submit-label="Registrar pago" show-member :payment-method-options="paymentMethodOptions"
        :loading="invoiceStore.loading" :error="invoiceStore.error || ''" @close="closePayModal" @pay="handlePay" />

      <InvoiceDetailModal :show="isDetailModalOpen" :loading="isLoadingDetail" :invoice="invoiceStore.currentInvoice"
        show-member @close="closeDetail" />

      <!-- Modal de anulación -->
      <AppModal :show="isCancelModalOpen" title="Anular factura" @close="closeCancelModal">
        <form class="cancel-form" @submit.prevent="handleCancel">
          <p class="cancel-hint" v-if="invoiceToCancel">
            Factura: <strong>{{ invoiceToCancel.invoice_number }}</strong><br />
            Miembro: <strong>{{ invoiceToCancel.user_email }}</strong>
          </p>
          <FormInput v-model="cancelReason" label="Motivo de anulación" placeholder="Describe el motivo de la anulación"
            required />
          <p v-if="invoiceStore.error" class="error-message">{{ invoiceStore.error }}</p>
          <FormActions submit-label="Anular" :disabled="!cancelReason.trim() || invoiceStore.loading"
            :loading="invoiceStore.loading" @cancel="closeCancelModal" />
        </form>
      </AppModal>
    </section>
  </ion-content>
</template>

<style scoped>
.invoices-filter-selector {
  min-width: 220px;
}

.invoices-filter-email {
  min-width: 260px;
  padding: 14px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font: inherit;
  font-size: 0.95rem;
  height: 50px;
  box-sizing: border-box;
  align-self: flex-start;
}

.invoices-filter-email:focus {
  outline: none;
  border-color: var(--secondary);
}

.invoice-link {
  background: transparent;
  border: none;
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.invoice-link:hover {
  opacity: 0.8;
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

.server-state {
  text-align: center;
  color: #6b7280;
  padding: var(--space-4);
}

.cancel-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.cancel-hint {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.6;
}

.error-message {
  color: var(--error);
  font-size: 0.9rem;
  margin: 0;
}
</style>
