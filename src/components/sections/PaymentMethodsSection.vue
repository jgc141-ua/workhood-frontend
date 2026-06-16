<script setup>
import { ref } from 'vue'
import DataTableList from '@/components/DataTableList.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconEdit from '@/assets/icons/IconEdit.vue'
import IconTrash from '@/assets/icons/IconTrash.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import PaymentMethodForm from '@/components/forms/PaymentMethodForm.vue'
import { usePaymentMethodStore } from '@/stores/paymentMethodStore'
import { showToast } from '@/composables/toast'

const props = defineProps({
  isCreateOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['update:isCreateOpen'])

const paymentMethodStore = usePaymentMethodStore()

const moreActionsOpts = [
  { icon: IconEdit, label: 'Editar', action: 'edit', danger: false },
  { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true },
]

const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedPaymentMethod = ref(null)
const paymentMethodToDelete = ref(null)

function closeCreateModal() {
  emit('update:isCreateOpen', false)
}

function openEditModal(paymentMethod) {
  selectedPaymentMethod.value = { ...paymentMethod }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function onEditModalClosed() {
  selectedPaymentMethod.value = null
}

function openDeleteModal(paymentMethod) {
  paymentMethodToDelete.value = paymentMethod
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
}

function onDeleteModalClosed() {
  paymentMethodToDelete.value = null
}

function handleAction(paymentMethod, option) {
  if (option.action === 'delete') {
    openDeleteModal(paymentMethod)
  } else if (option.action === 'edit') {
    openEditModal(paymentMethod)
  }
}

async function handleCreate(formData) {
  try {
    await paymentMethodStore.createPaymentMethod(formData)
    showToast('Método de pago creado correctamente', 'success')
    closeCreateModal()
  } catch (err) {
    showToast(err.message || 'Error al crear el método de pago')
  }
}

async function handleUpdate(formData) {
  try {
    await paymentMethodStore.updatePaymentMethod(formData)
    showToast('Método de pago actualizado correctamente', 'success')
    closeEditModal()
  } catch (err) {
    showToast(err.message || 'Error al actualizar el método de pago')
  }
}

async function handleDelete() {
  if (!paymentMethodToDelete.value) return
  try {
    await paymentMethodStore.deletePaymentMethod(paymentMethodToDelete.value.name)
    showToast('Método de pago eliminado correctamente', 'success')
  } catch (err) {
    showToast(err.message || 'Error al eliminar el método de pago')
    paymentMethodStore.error = null
  }

  closeDeleteModal()
}

defineExpose({
  openCreateModal: () => {
    emit('update:isCreateOpen', true)
  },
})
</script>

<template>
  <div class="payment-method">
    <h2 class="section-title">Métodos de pago</h2>

    <AppModal :show="props.isCreateOpen" title="Añadir método de pago" @close="closeCreateModal">
      <PaymentMethodForm :is-edit="false" @submit="handleCreate" @cancel="closeCreateModal" />
    </AppModal>

    <AppModal :show="isEditModalOpen" title="Editar método de pago" @close="closeEditModal"
      @after-close="onEditModalClosed">
      <PaymentMethodForm v-if="selectedPaymentMethod" :is-edit="true" :model-value="selectedPaymentMethod"
        :initial-name="selectedPaymentMethod.name" @submit="handleUpdate" @cancel="closeEditModal" />
    </AppModal>

    <ConfirmModal :show="isDeleteModalOpen" title="Eliminar método de pago"
      message="¿Estás seguro de que deseas eliminar el método de pago" :item-name="paymentMethodToDelete?.name"
      confirm-label="Eliminar" @confirm="handleDelete" @close="closeDeleteModal" @after-close="onDeleteModalClosed" />

    <DataTableList class="payment-methods-table" :items="paymentMethodStore.paymentMethods" key-field="id"
      :loading="paymentMethodStore.loading" :error="!!paymentMethodStore.error"
      :pagination="{ page: paymentMethodStore.page, pageSize: paymentMethodStore.pageSize, total: paymentMethodStore.count }"
      @prev-page="paymentMethodStore.setPage(paymentMethodStore.page - 1)"
      @next-page="paymentMethodStore.setPage(paymentMethodStore.page + 1)">
      <template #row="{ item }">
        <div class="payment-methods-text">
          <h4 class="payment-methods-name text-truncate" :title="item.name">{{ item.name }}</h4>
        </div>
        <div class="payment-methods-more-actions">
          <div class="pill-button" :class="item.is_active ? 'pill-button-success' : 'pill-button-warn'">
            {{ item.is_active ? 'Activo' : 'Inactivo' }}
          </div>
          <MoreActionsButton :options="moreActionsOpts" @select="(opt) => handleAction(item, opt)" />
        </div>
      </template>
    </DataTableList>
  </div>
</template>

<style scoped>
.payment-methods-table :deep(.data-table-list) {
  display: flex;
  flex-direction: column;
  border-bottom: 0;
}

.payment-methods-table :deep(.data-table-pagination) {
  border-top: 1px solid var(--outline-variant);
}

.payment-methods-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.payment-methods-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  overflow-wrap: break-word;
  word-break: break-word;
}

.payment-methods-more-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}

.payment-methods-more-actions .pill-button {
  white-space: nowrap;
  min-width: 0;
  color: white;
}

@media (max-width: 1400px) {
  .payment-methods-table :deep(.data-table-pagination) {
    text-align: center;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .payment-methods-table :deep(.data-table-list) {
    padding: var(--space-3);
    gap: var(--space-3);
  }
}
</style>
