<script setup>
import { ref } from 'vue'
import DataTableList from '@/components/DataTableList.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconEdit from '@/assets/icons/IconEdit.vue'
import IconTrash from '@/assets/icons/IconTrash.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import BenefitForm from '@/components/forms/BenefitForm.vue'
import { useBenefitStore } from '@/stores/benefitStore'
import { useMembershipTypeStore } from '@/stores/membershipTypeStore'
import { showToast } from '@/composables/toast'

const props = defineProps({
  isCreateOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['update:isCreateOpen'])

const benefitStore = useBenefitStore()
const membershipTypeStore = useMembershipTypeStore()

const moreActionsOpts = [
  { icon: IconEdit, label: 'Editar', action: 'edit', danger: false },
  { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true },
]

// Estado de los modales y elementos seleccionados
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedBenefit = ref(null)
const benefitToDelete = ref(null)

function closeCreateModal() {
  emit('update:isCreateOpen', false)
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

// Crea un nuevo beneficio
async function handleCreate(formData) {
  try {
    await benefitStore.createBenefit(formData)
    showToast('Beneficio creado correctamente', 'success')
    closeCreateModal()
  } catch (err) {
    showToast(err.message || 'Error al crear el beneficio')
  }
}

// Actualiza el beneficio seleccionado
async function handleUpdate(formData) {
  try {
    await benefitStore.updateBenefit(formData)
    showToast('Beneficio actualizado correctamente', 'success')
    closeEditModal()
  } catch (err) {
    showToast(err.message || 'Error al actualizar el beneficio')
  }
}

// Elimina el beneficio seleccionado
async function handleDelete() {
  if (!benefitToDelete.value) return
  try {
    await benefitStore.deleteBenefit(benefitToDelete.value.name)
    await membershipTypeStore.fetchMembershipTypes()
    showToast('Beneficio eliminado correctamente')
  } catch (err) {
    showToast(err.message || 'Error al eliminar el beneficio')
    benefitStore.error = null
  }

  closeDeleteModal()
}
</script>

<template>
  <aside>
    <h2 class="section-title">Beneficios</h2>

    <AppModal :show="props.isCreateOpen" title="Añadir beneficio" @close="closeCreateModal">
      <BenefitForm :is-edit="false" @submit="handleCreate" @cancel="closeCreateModal" />
    </AppModal>

    <AppModal :show="isEditModalOpen" title="Editar beneficio" @close="closeEditModal" @after-close="onEditModalClosed">
      <BenefitForm v-if="selectedBenefit" :is-edit="true" :model-value="selectedBenefit"
        :initial-name="selectedBenefit.name" @submit="handleUpdate" @cancel="closeEditModal" />
    </AppModal>

    <ConfirmModal :show="isDeleteModalOpen" title="Eliminar beneficio"
      message="¿Estás seguro de que deseas eliminar el beneficio" :item-name="benefitToDelete?.name"
      confirm-label="Eliminar" @confirm="handleDelete" @close="closeDeleteModal" @after-close="onDeleteModalClosed" />

    <DataTableList class="benefits-table"
      :items="benefitStore.benefits" key-field="id" :loading="benefitStore.loading" :error="!!benefitStore.error"
      :pagination="{ page: benefitStore.page, pageSize: benefitStore.pageSize, total: benefitStore.count }"
      @prev-page="benefitStore.setPage(benefitStore.page - 1)" @next-page="benefitStore.setPage(benefitStore.page + 1)">
      <template #row="{ item }">
        <div class="benefits-text">
          <h4 class="benefits-name text-truncate" :title="item.name">{{ item.name }}</h4>
          <p v-if="item.description" class="benefits-description text-truncate" :title="item.description">{{
            item.description }}</p>
          <p v-if="item.resource_type_name" class="benefits-resource-type">
            Tipo: {{ item.resource_type_name }}
          </p>
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

.benefits-table :deep(.data-table-pagination) {
  border-top: 1px solid var(--outline-variant);
}

.benefits-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
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

.benefits-resource-type {
  margin: var(--space-1) 0 0;
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: break-word;
  word-break: break-word;
}

.benefits-more-actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}

.benefits-more-actions .pill-button {
  white-space: nowrap;
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
