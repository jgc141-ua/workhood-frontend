<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { IonPage, IonContent, onIonViewWillEnter } from '@ionic/vue'
import { useMembersStore } from '@/stores/memberStore'

import MobileHeader from '@/components/MobileHeader.vue'
import IconEdit from '@/assets/icons/IconEdit.vue'
import IconSearch from '@/assets/icons/IconSearch.vue'
import IconMembers from '@/assets/icons/IconMembers.vue'
import IconInvoice from '@/assets/icons/IconInvoice.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import RegisterForm from '@/components/forms/RegisterForm.vue'
import EditMemberForm from '@/components/forms/EditMemberForm.vue'
import SubscribeMembershipModal from '@/components/SubscribeMembershipModal.vue'
import DataTableColumns from '@/components/DataTableColumns.vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'
import { useAuthStore } from '@/stores/authStore'
import { useMembershipStore } from '@/stores/membershipStore'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { showToast } from '@/composables/toast'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconTrash from '@/assets/icons/IconTrash.vue'
import MemberMembershipModal from '@/components/MemberMembershipModal.vue'

const brand = inject('BRAND')

// Stores
const auth = useAuthStore()
const membersStore = useMembersStore()
const membershipStore = useMembershipStore()
const invoiceStore = useInvoiceStore()

// Modal añadir miembro
const isAddMemberModalOpen = ref(false)

function openAddMemberModal() {
  isAddMemberModalOpen.value = true
}

function closeAddMemberModal() {
  isAddMemberModalOpen.value = false
}

// Modal editar miembro
const isEditMemberModalOpen = ref(false)
const selectedMember = ref(null)
const isLoadingMemberDetail = ref(false)

async function openEditMemberModal(member) {
  isLoadingMemberDetail.value = true
  try {
    const detail = await membersStore.fetchMemberDetail(member.email)
    selectedMember.value = detail
    isEditMemberModalOpen.value = true
  } catch (err) {
    showToast('Error al cargar los datos del miembro.')
  } finally {
    isLoadingMemberDetail.value = false
  }
}

function closeEditMemberModal() {
  isEditMemberModalOpen.value = false
}

function onEditMemberModalClosed() {
  selectedMember.value = null
}

// Modal eliminar miembro
const isDeleteMemberModalOpen = ref(false)
const memberToDelete = ref(null)

function openDeleteMemberModal(member) {
  memberToDelete.value = member
  isDeleteMemberModalOpen.value = true
}

function closeDeleteMemberModal() {
  isDeleteMemberModalOpen.value = false
}

function onDeleteMemberModalClosed() {
  memberToDelete.value = null
}

// Modal suscribir miembro
const isSubscribeMemberModalOpen = ref(false)
const memberToSubscribe = ref(null)

function openSubscribeMemberModal(member) {
  memberToSubscribe.value = member
  isSubscribeMemberModalOpen.value = true
}

function closeSubscribeMemberModal() {
  isSubscribeMemberModalOpen.value = false
}

function onSubscribeMemberModalClosed() {
  memberToSubscribe.value = null
}

async function handleSubscribedMember() {
  showToast('Miembro suscrito correctamente', 'success')
  await membersStore.fetchMembers()
}

// Modal ver suscripción
const isViewMembershipModalOpen = ref(false)
const memberForMembership = ref(null)
const selectedMembership = ref(null)
const isLoadingMembership = ref(false)

async function openViewMembershipModal(member) {
  memberForMembership.value = member
  selectedMembership.value = null
  isViewMembershipModalOpen.value = true
  isLoadingMembership.value = true

  try {
    selectedMembership.value = await membershipStore.fetchMemberMembership(member.email)
  } catch {
    selectedMembership.value = null
  } finally {
    isLoadingMembership.value = false
  }
}

function closeViewMembershipModal() {
  isViewMembershipModalOpen.value = false
}

function onViewMembershipModalClosed() {
  memberForMembership.value = null
  selectedMembership.value = null
}

// Modal cancelar suscripción
const isCancelMembershipModalOpen = ref(false)
const memberToCancel = ref(null)

function openCancelMembershipModal(member) {
  memberToCancel.value = member
  isCancelMembershipModalOpen.value = true
}

function closeCancelMembershipModal() {
  isCancelMembershipModalOpen.value = false
}

function onCancelMembershipModalClosed() {
  memberToCancel.value = null
}

async function handleCancelMembership() {
  if (!memberToCancel.value) return
  try {
    await membershipStore.cancelMemberMembership(memberToCancel.value.email)
    showToast('Suscripción cancelada de forma inmediata', 'success')
    closeCancelMembershipModal()
    await membersStore.fetchMembers()
  } catch (err) {
    showToast(err.message || 'Error al cancelar la suscripción')
  }
}

async function handleDeleteMember() {
  if (!memberToDelete.value) return
  try {
    await membersStore.deleteMember(memberToDelete.value.email)
    showToast('Miembro eliminado correctamente', 'success')
  } catch (err) {
    showToast(err.message || 'Error al eliminar el miembro')
  }

  closeDeleteMemberModal()
}

// Modal generar factura
const isIssueInvoiceModalOpen = ref(false)
const memberToInvoice = ref(null)
const invoiceForm = ref({
  concept: '',
  amount: '',
  iva_rate: '',
})

function openIssueInvoiceModal(member) {
  memberToInvoice.value = member
  invoiceForm.value = {
    concept: '',
    amount: '',
    iva_rate: '',
  }
  isIssueInvoiceModalOpen.value = true
}

function closeIssueInvoiceModal() {
  isIssueInvoiceModalOpen.value = false
}

function onIssueInvoiceModalClosed() {
  memberToInvoice.value = null
  invoiceForm.value = { concept: '', amount: '', iva_rate: '' }
}

async function handleIssueInvoice() {
  if (!memberToInvoice.value) return
  if (!invoiceForm.value.concept || !invoiceForm.value.amount) {
    showToast('Concepto e importe son obligatorios')
    return
  }

  const payload = {
    concept: invoiceForm.value.concept,
    amount: Number(invoiceForm.value.amount),
  }
  if (invoiceForm.value.iva_rate !== '') {
    payload.iva_rate = Number(invoiceForm.value.iva_rate)
  }

  try {
    await invoiceStore.issueInvoice(memberToInvoice.value.email, payload)
    showToast('Factura generada correctamente', 'success')
    closeIssueInvoiceModal()
  } catch (err) {
    showToast(err.message || 'Error al generar la factura')
  }
}

// Búsqueda con debounce
const searchInput = ref('')
let debounceTimer = null

watch(searchInput, (value) => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    membersStore.setSearch(value)
  }, 350)
})

// Tabs
// El count usa membersStore.count para reflejar el total real del backend
const activeTab = ref('all')

const tabs = computed(() => [
  { name: 'all', label: 'Todos los miembros', count: membersStore.count }
])

// Paginación
function nextPage() {
  membersStore.setPage(membersStore.page + 1)
}

function prevPage() {
  membersStore.setPage(membersStore.page - 1)
}

const memberColumns = [
  { key: 'member', label: 'MIEMBRO', width: '1fr' },
  { key: 'contact', label: 'CONTACTO', width: '1fr' },
  { key: 'nif', label: 'NIF/CIF', width: '1fr' },
  { key: 'subscription', label: 'SUSCRIPCIÓN', width: '1fr' },
  { key: 'actions', label: '', width: '0.25fr' },
]

// Helpers
function getInitials(member) {
  const first = member.first_name?.[0] || ''
  const last = member.last_name?.[0] || ''
  return `${first}${last}`.toUpperCase()
}

// Registro
async function handleRegister(formData) {
  const ok = await auth.register(formData)

  if (!ok) {
    showToast(auth.errors.register || 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.')
  } else {
    showToast('Miembro registrado correctamente', 'success')
    closeAddMemberModal()
    // Recargamos la última página para que aparezca el nuevo miembro
    await membersStore.fetchMembers({ page: membersStore.totalPages })
  }
}

// Edición
async function handleUpdateMember(formData) {
  try {
    await membersStore.updateMember(selectedMember.value.email, formData)
    showToast('Miembro actualizado correctamente', 'success')
    closeEditMemberModal()
  } catch (err) {
    showToast(err.message || 'Error al actualizar el miembro. Por favor, inténtalo de nuevo.')
  }
}

// Acciones del menú de "Más acciones"
function handleMemberAction(member, option) {
  if (option.action === 'delete') {
    openDeleteMemberModal(member)
  } else if (option.action === 'edit') {
    openEditMemberModal(member)
  } else if (option.action === 'subscribe') {
    openSubscribeMemberModal(member)
  } else if (option.action === 'cancel-membership') {
    openCancelMembershipModal(member)
  } else if (option.action === 'issue-invoice') {
    openIssueInvoiceModal(member)
  }
}

function memberActionOptions(member) {
  const options = [
    { icon: IconEdit, label: 'Editar', action: 'edit', danger: false },
    { icon: IconInvoice, label: 'Generar factura', action: 'issue-invoice', danger: false },
  ]

  if (member.active_membership) {
    options.push({ icon: IconTrash, label: 'Cancelar suscripción (inmediato)', action: 'cancel-membership', danger: true })
  } else {
    options.push({ icon: IconMembers, label: 'Suscribir', action: 'subscribe', danger: false })
  }

  options.push(
    { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true },
  )

  return options
}

// Carga inicial y recarga al entrar a la vista
onMounted(async () => {
  await membersStore.fetchMembers().catch(() => { })
})

onIonViewWillEnter(async () => {
  await membersStore.fetchMembers().catch(() => { })
})
</script>

<template>
  <ion-page class="page-members">
    <MobileHeader title="Miembros" />

    <ion-content :fullscreen="true" class="ion-padding">
      <section class="members">
        <!-- Encabezado y acción principal -->
        <header class="row-between">
          <div class="page-header">
            <p class="eyebrow">RED DE {{ brand?.toUpperCase() }}</p>
            <h1 class="title">Miembros</h1>
          </div>

          <button class="btn btn-primary top-action" type="button" @click="openAddMemberModal">
            <span>Añadir miembro</span>
          </button>
        </header>

        <!-- Modal: añadir miembro -->
        <AppModal :show="isAddMemberModalOpen" title="Añadir miembro" @close="closeAddMemberModal">
          <RegisterForm @submit="handleRegister" />
        </AppModal>

        <!-- Modal: editar miembro -->
        <AppModal :show="isEditMemberModalOpen" title="Editar miembro" @close="closeEditMemberModal"
          @after-close="onEditMemberModalClosed">
          <EditMemberForm v-if="selectedMember" :member-data="selectedMember" @submit="handleUpdateMember"
            @cancel="closeEditMemberModal" />
        </AppModal>

        <!-- Modal: confirmar eliminación -->
        <ConfirmModal :show="isDeleteMemberModalOpen" title="Eliminar miembro"
          message="¿Estás seguro de que deseas eliminar al miembro" :item-name="memberToDelete?.email"
          confirm-label="Eliminar" @confirm="handleDeleteMember" @close="closeDeleteMemberModal"
          @after-close="onDeleteMemberModalClosed" />

        <!-- Modal: suscribir miembro -->
        <SubscribeMembershipModal :show="isSubscribeMemberModalOpen" :member-email="memberToSubscribe?.email"
          @close="closeSubscribeMemberModal" @subscribed="handleSubscribedMember"
          @after-close="onSubscribeMemberModalClosed" />

        <!-- Modal: ver suscripción -->
        <MemberMembershipModal :show="isViewMembershipModalOpen" :member="memberForMembership"
          :membership="selectedMembership" :loading="isLoadingMembership" @close="closeViewMembershipModal"
          @after-close="onViewMembershipModalClosed" />

        <!-- Modal: cancelar suscripción -->
        <ConfirmModal :show="isCancelMembershipModalOpen" title="Cancelar suscripción"
          message="¿Estás seguro de que deseas cancelar de forma inmediata la suscripción de"
          :item-name="memberToCancel?.email" confirm-label="Cancelar ahora" confirm-danger
          @confirm="handleCancelMembership" @close="closeCancelMembershipModal"
          @after-close="onCancelMembershipModalClosed" />

        <!-- Modal: generar factura -->
        <AppModal :show="isIssueInvoiceModalOpen" title="Generar factura" @close="closeIssueInvoiceModal"
          @after-close="onIssueInvoiceModalClosed">
          <form class="invoice-issue-form" @submit.prevent="handleIssueInvoice">
            <p class="invoice-issue-hint">
              Generar factura a: <strong>{{ memberToInvoice?.email }}</strong>
            </p>
            <FormInput v-model="invoiceForm.concept" label="Concepto" placeholder="Ej: Membresía Flex - junio 2026"
              required />
            <FormInput v-model="invoiceForm.amount" label="Importe (€)" type="number" step="0.01" min="0"
              placeholder="Ej: 50.00" required />
            <FormInput v-model="invoiceForm.iva_rate" label="IVA (opcional, ej: 0.21 para 21%)" type="number"
              step="0.01" min="0" max="1" placeholder="0.21 (por defecto)" />
            <FormActions submit-label="Generar" :disabled="invoiceStore.loading" :loading="invoiceStore.loading"
              @cancel="closeIssueInvoiceModal" />
          </form>
        </AppModal>

        <!-- Barra de filtros y búsqueda -->
        <section class="members-bar">
          <div class="members-tabs" role="tablist" aria-label="Filtros de miembros">
            <button v-for="tab in tabs" :key="tab.name" type="button" class="members-tab"
              :class="{ 'members-tab-active': activeTab === tab.name }" @click="activeTab = tab.name">
              <span>{{ tab.label }}</span>
              <span v-if="tab.count !== undefined" class="members-tab-count">{{ tab.count }}</span>
            </button>
          </div>

          <div class="input-wrap members-search" role="search">
            <IconSearch />
            <input v-model="searchInput" type="text" placeholder="Buscar por nombre, email o NIF/CIF..."
              aria-label="Buscar miembros" />
          </div>
        </section>

        <!-- Tabla de miembros -->
        <DataTableColumns :columns="memberColumns" :items="membersStore.members" key-field="id"
          :loading="membersStore.loading" :error="membersStore.error"
          :pagination="{ page: membersStore.page, pageSize: membersStore.pageSize, total: membersStore.count }"
          @prev-page="prevPage" @next-page="nextPage">

          <template #cell-member="{ item }">
            <div class="members-user">
              <div class="members-avatar members-avatar--fallback" aria-hidden="true">
                {{ getInitials(item) }}
              </div>
              <div class="members-user-meta">
                <span class="members-user-name">
                  {{ item.first_name }} {{ item.last_name }}
                </span>
              </div>
            </div>
          </template>

          <template #cell-contact="{ item }">
            <div class="data-table-text">{{ item.email || '-' }}</div>
            <div class="data-table-text">{{ item.phone || '-' }}</div>
          </template>

          <template #cell-nif="{ item }">
            <div class="data-table-text">{{ item.nif_cif || '-' }}</div>
          </template>

          <template #cell-subscription="{ item }">
            <button type="button" class="subscription-badge"
              :class="item.active_membership ? 'subscription-badge--active' : 'subscription-badge--inactive'"
              @click="openViewMembershipModal(item)">
              {{ item.active_membership ? item.active_membership.membership_type_name : 'Sin suscripción' }}
            </button>
          </template>

          <template #cell-actions="{ item }">
            <div class="members-actions">
              <MoreActionsButton :options="memberActionOptions(item)"
                @select="(opt) => handleMemberAction(item, opt)" />
            </div>
          </template>
        </DataTableColumns>
      </section>
    </ion-content>
  </ion-page>
</template>

<style scoped>
/* Layout principal */
.members {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Barra de filtros y búsqueda */
.members-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
}

.members-tabs,
.members-actions,
.members-user {
  display: flex;
  align-items: center;
}

.members-tabs {
  gap: var(--space-2);
  flex-wrap: wrap;
}

.members-tab {
  border: 0;
  background: transparent;
  color: #4b5563;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font: inherit;
  font-weight: 600;
  transition: var(--transition-fast);
}

.members-tab:hover {
  background: var(--surface-container-high);
}

.members-tab-active {
  background: var(--surface-container-lowest);
  color: var(--primary);
  box-shadow: var(--shadow-floating);
}

.members-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  margin-left: var(--space-2);
  padding: 0 var(--space-2);
  border-radius: var(--radius-full);
  background: var(--surface-container-high);
  color: #6b7280;
  font-size: 0.72rem;
  font-weight: 700;
}

.members-search {
  position: relative;
  width: min(320px, 100%);
  flex-shrink: 0;
  padding-left: 42px;
}

.members-search input {
  width: 100%;
  padding: 12px 0;
  border: 0;
  outline: none;
  background: transparent;
  font: inherit;
  font-size: 0.9rem;
  color: var(--on-surface);
}

.members-search input::placeholder {
  color: #6b7280;
}

/* Avatar y datos del miembro */
.members-user {
  gap: var(--space-3);
}

.members-avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.members-avatar--fallback {
  display: grid;
  place-items: center;
  background: var(--surface-container-high);
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 700;
}

.members-user-meta {
  min-width: 0;
}

.members-user-name {
  display: block;
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--on-surface);
}

.members-actions {
  gap: var(--space-2);
}

/* Estado de suscripción */
.subscription-badge {
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: var(--transition-fast);
}

.subscription-badge--active {
  background: var(--success-text);
  color: white;
}

.subscription-badge--inactive {
  background: var(--surface-container-high);
  color: #6b7280;
}

.subscription-badge:hover {
  opacity: 0.85;
}

/* Responsive */
@media (max-width: 1024px) {

  .row-between,
  .members-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .members-search {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .members {
    gap: var(--space-4);
  }

  .members-tab {
    padding: 0.68rem 0.9rem;
  }
}

/* Modal generar factura */
.invoice-issue-form {
  display: flex;
  flex-direction: column;
}

.invoice-issue-hint {
  margin: 0 0 var(--space-3);
  font-size: 0.9rem;
  color: #6b7280;
}
</style>