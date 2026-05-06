<script setup>
import { ref } from 'vue'
import DataTableList from '@/components/DataTableList.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import BenefitForm from '@/components/forms/BenefitForm.vue'
import { useBenefitStore } from '@/stores/benefitStore'
import { showToast } from '@/composables/toast'

const benefitStore = useBenefitStore()

const moreActionsOpts = [
  { icon: IconEdit, label: 'Editar', action: 'edit', danger: false },
  { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true },
]

// Modales
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedBenefit = ref(null)
const benefitToDelete = ref(null)

function openCreateModal() {
  isAddModalOpen.value = true
}

function closeCreateModal() {
  isAddModalOpen.value = false
}

function openEditModal(benefit) {
  selectedBenefit.value = { ...benefit }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function onEditModalClosed() {
  selectedBenefit.value = null
}

function openDeleteModal(benefit) {
  benefitToDelete.value = benefit
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
}

function onDeleteModalClosed() {
  benefitToDelete.value = null
}

function handleAction(benefit, option) {
  if (option.action === 'delete') {
    openDeleteModal(benefit)
  } else if (option.action === 'edit') {
    openEditModal(benefit)
  }
}

function truncateDescription(text, maxLength = 35) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

async function handleCreate(formData) {
  try {
    await benefitStore.createBenefit(formData)
    showToast('Beneficio creado correctamente', 'success')
    closeCreateModal()
  } catch (err) {
    showToast(err.message || 'Error al crear el beneficio')
  }
}

async function handleUpdate(formData) {
  try {
    await benefitStore.updateBenefit(formData)
    showToast('Beneficio actualizado correctamente', 'success')
    closeEditModal()
  } catch (err) {
    showToast(err.message || 'Error al actualizar el beneficio')
  }
}

async function handleDelete() {
  if (!benefitToDelete.value) return
  try {
    await benefitStore.deleteBenefit(benefitToDelete.value.name)
    showToast('Beneficio eliminado correctamente')
    closeDeleteModal()
  } catch (err) {
    showToast(err.message || 'Error al eliminar el beneficio')
  }
}

defineExpose({ openCreateModal })
</script>

<template>
  <aside>
    <h2 class="section-title">Beneficios</h2>

    <AppModal :show="isAddModalOpen" title="Añadir beneficio" @close="closeCreateModal">
      <BenefitForm :is-edit="false" @submit="handleCreate" @cancel="closeCreateModal" />
    </AppModal>

    <AppModal :show="isEditModalOpen" title="Editar beneficio" @close="closeEditModal" @after-close="onEditModalClosed">
      <BenefitForm v-if="selectedBenefit" :is-edit="true" :model-value="selectedBenefit"
        :initial-name="selectedBenefit.name" @submit="handleUpdate" @cancel="closeEditModal" />
    </AppModal>

    <ConfirmModal :show="isDeleteModalOpen" title="Eliminar beneficio"
      message="¿Estás seguro de que deseas eliminar el beneficio" :item-name="benefitToDelete?.name" confirm-label="Eliminar"
      @confirm="handleDelete" @cancel="closeDeleteModal" @closed="onDeleteModalClosed" />

    <DataTableList class="benefits-table" :columns="[{ key: 'benefit', label: 'BENEFICIO', width: '1fr' }]"
      :items="benefitStore.benefits" key-field="id" :loading="benefitStore.loading" :error="!!benefitStore.error"
      :pagination="{ page: benefitStore.page, pageSize: benefitStore.pageSize, total: benefitStore.count }"
      @prev-page="benefitStore.setPage(benefitStore.page - 1)"
      @next-page="benefitStore.setPage(benefitStore.page + 1)">
      <template #row="{ item }">
        <div class="benefits-text">
          <h4 class="benefits-name">{{ item.name }}</h4>
          <p class="benefits-description">{{ truncateDescription(item.description) }}</p>
        </div>
        <div class="benefits-more-actions">
          <div class="pill-button" v-if="item.quantity != null">
            {{ item.quantity }} {{ item.quantity > 1 ? 'horas' : 'hora' }}
          </div>
          <div class="pill-button" v-else>Ilimitado</div>
          <MoreActionsButton :options="moreActionsOpts" @select="(opt) => handleAction(item, opt)" />
        </div>
      </template>
    </DataTableList>
  </aside>
</template>

<style scoped>
.benefits-table :deep(.data-table-list) {
  display: flex;
  flex-direction: column;
  border-bottom: 0;
}

.benefits-table :deep(.data-table-list-item) {
  border-top: 0;
  border-bottom: 1px solid var(--outline-variant);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  padding: var(--space-4);
  flex-wrap: wrap;
}

.benefits-table :deep(.data-table-list-item:last-child) {
  border-bottom: 0;
}

.benefits-table :deep(.data-table-pagination) {
  border-top: 1px solid var(--outline-variant);
}

.benefits-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.benefits-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  overflow-wrap: break-word;
  word-break: break-word;
}

.benefits-description {
  margin: 0;
  color: #555;
  font-size: 14px;
  overflow-wrap: break-word;
  word-break: break-word;
}

.benefits-more-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  min-width: 0;
  flex-shrink: 0;
}

.benefits-more-actions .pill-button {
  white-space: normal;
  min-width: 0;
}

@media (max-width: 1400px) {
  .benefits-table :deep(.data-table-pagination) {
    text-align: center;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .benefits-table :deep(.data-table-list) {
    padding: var(--space-3);
    gap: var(--space-3);
  }
}
</style>
