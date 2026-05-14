<script setup>
import { ref } from 'vue'
import DataTableList from '@/components/DataTableList.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconEdit from '@/assets/icons/IconEdit.vue'
import IconTrash from '@/assets/icons/IconTrash.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import ResourceTypeForm from '@/components/forms/ResourceTypeForm.vue'
import { useResourceTypeStore } from '@/stores/resourceTypeStore'
import { showToast } from '@/composables/toast'

const props = defineProps({
  isCreateOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['update:isCreateOpen'])

const resourceTypeStore = useResourceTypeStore()

const moreActionsOpts = [
  { icon: IconEdit, label: 'Editar', action: 'edit', danger: false },
  { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true },
]

// Estado de los modales y elementos seleccionados
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedResourceType = ref(null)
const resourceTypeToDelete = ref(null)

function closeCreateModal() {
  emit('update:isCreateOpen', false)
}

function openEditModal(resourceType) {
  selectedResourceType.value = { ...resourceType }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function onEditModalClosed() {
  selectedResourceType.value = null
}

function openDeleteModal(resourceType) {
  resourceTypeToDelete.value = resourceType
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
}

function onDeleteModalClosed() {
  resourceTypeToDelete.value = null
}

function handleAction(resourceType, option) {
  if (option.action === 'delete') {
    openDeleteModal(resourceType)
  } else if (option.action === 'edit') {
    openEditModal(resourceType)
  }
}

// Crea un nuevo tipo de recurso
async function handleCreate(formData) {
  try {
    await resourceTypeStore.createResourceType(formData)
    showToast('Tipo de recurso creado correctamente', 'success')
    closeCreateModal()
  } catch (err) {
    showToast(err.message || 'Error al crear el tipo de recurso')
  }
}

// Actualiza el tipo de recurso seleccionado
async function handleUpdate(formData) {
  try {
    await resourceTypeStore.updateResourceType(formData)
    showToast('Tipo de recurso actualizado correctamente', 'success')
    closeEditModal()
  } catch (err) {
    showToast(err.message || 'Error al actualizar el tipo de recurso')
  }
}

// Elimina el tipo de recurso seleccionado
async function handleDelete() {
  if (!resourceTypeToDelete.value) return
  try {
    await resourceTypeStore.deleteResourceType(resourceTypeToDelete.value.name)
    showToast('Tipo de recurso eliminado correctamente', 'success')
  } catch (err) {
    showToast(err.message || 'Error al eliminar el tipo de recurso')
    resourceTypeStore.error = null
  }

  closeDeleteModal()
}
</script>

<template>
  <aside>
    <h2 class="section-title">Tipos de recursos</h2>

    <AppModal :show="props.isCreateOpen" title="Añadir tipo de recurso" @close="closeCreateModal">
      <ResourceTypeForm :is-edit="false" @submit="handleCreate" @cancel="closeCreateModal" />
    </AppModal>

    <AppModal :show="isEditModalOpen" title="Editar tipo de recurso" @close="closeEditModal"
      @after-close="onEditModalClosed">
      <ResourceTypeForm v-if="selectedResourceType" :is-edit="true" :model-value="selectedResourceType"
        :initial-name="selectedResourceType.name" @submit="handleUpdate" @cancel="closeEditModal" />
    </AppModal>

    <ConfirmModal :show="isDeleteModalOpen" title="Eliminar tipo de recurso"
      message="¿Estás seguro de que deseas eliminar el tipo de recurso" :item-name="resourceTypeToDelete?.name"
      confirm-label="Eliminar" @confirm="handleDelete" @close="closeDeleteModal" @after-close="onDeleteModalClosed" />

    <DataTableList class="resource-types-table"
      :columns="[{ key: 'resourceType', label: 'TIPO DE RECURSO', width: '1fr' }]"
      :items="resourceTypeStore.resourceTypes" key-field="id" :loading="resourceTypeStore.loading"
      :error="!!resourceTypeStore.error"
      :pagination="{ page: resourceTypeStore.page, pageSize: resourceTypeStore.pageSize, total: resourceTypeStore.count }"
      @prev-page="resourceTypeStore.setPage(resourceTypeStore.page - 1)"
      @next-page="resourceTypeStore.setPage(resourceTypeStore.page + 1)">
      <template #row="{ item }">
        <div class="resource-types-text">
          <h4 class="resource-types-name text-truncate" :title="item.name">{{ item.name }}</h4>
          <p class="resource-types-description text-truncate" :title="item.description">{{ item.description }}</p>
        </div>
        <MoreActionsButton :options="moreActionsOpts" @select="(opt) => handleAction(item, opt)" />
      </template>
    </DataTableList>
  </aside>
</template>

<style scoped>
.resource-types-table :deep(.data-table-list) {
  display: flex;
  flex-direction: column;
  border-bottom: 0;
}

.resource-types-table :deep(.data-table-pagination) {
  border-top: 1px solid var(--outline-variant);
}

.resource-types-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.resource-types-name {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  overflow-wrap: break-word;
  word-break: break-word;
}

.resource-types-description {
  margin: 0;
  color: #555;
  font-size: 14px;
  overflow-wrap: break-word;
  word-break: break-word;
}

@media (max-width: 1400px) {
  .resource-types-table :deep(.data-table-pagination) {
    text-align: center;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .resource-types-table :deep(.data-table-list) {
    padding: var(--space-3);
    gap: var(--space-3);
  }
}
</style>
