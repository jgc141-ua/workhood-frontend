<script setup>
import { ref } from 'vue'
import DataTableColumns from '@/components/DataTableColumns.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import ResourceForm from '@/components/forms/ResourceForm.vue'
import { useResourceStore } from '@/stores/resourceStore'
import { showToast } from '@/composables/toast'

const props = defineProps({
  resourceTypeOptions: {
    type: Array,
    default: () => [],
  },
})

const resourceStore = useResourceStore()

const resourceColumns = [
  { key: 'name', label: 'RECURSO', width: '1.5fr' },
  { key: 'resource_type_name', label: 'TIPO', width: '1fr' },
  { key: 'capacity', label: 'CAPACIDAD', width: '1fr' },
  { key: 'status', label: 'ESTADO', width: '1fr' },
  { key: 'actions', label: '', width: 'auto' },
]

const moreActionsOpts = [
  { icon: IconEdit, label: 'Editar', action: 'edit', danger: false },
  { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true },
]

// Modales
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedResource = ref(null)
const resourceToDelete = ref(null)

function openCreateModal() {
  isAddModalOpen.value = true
}

function closeCreateModal() {
  isAddModalOpen.value = false
}

function openEditModal(resource) {
  selectedResource.value = { ...resource }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function onEditModalClosed() {
  selectedResource.value = null
}

function openDeleteModal(resource) {
  resourceToDelete.value = resource
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
}

function onDeleteModalClosed() {
  resourceToDelete.value = null
}

function handleAction(resource, option) {
  if (option.action === 'delete') {
    openDeleteModal(resource)
  } else if (option.action === 'edit') {
    openEditModal(resource)
  }
}

async function handleCreate(formData) {
  try {
    await resourceStore.createResource(formData)
    showToast('Recurso creado correctamente', 'success')
    closeCreateModal()
  } catch (err) {
    showToast(err.message || 'Error al crear el recurso')
  }
}

async function handleUpdate(formData) {
  try {
    await resourceStore.updateResource(formData)
    showToast('Recurso actualizado correctamente', 'success')
    closeEditModal()
  } catch (err) {
    showToast(err.message || 'Error al actualizar el recurso')
  }
}

async function handleDelete() {
  if (!resourceToDelete.value) return
  try {
    await resourceStore.deleteResource(resourceToDelete.value.id)
    showToast('Recurso eliminado correctamente')
    closeDeleteModal()
  } catch (err) {
    showToast(err.message || 'Error al eliminar el recurso')
  }
}

defineExpose({ openCreateModal })
</script>

<template>
  <div>
    <h2 class="section-title">Recursos</h2>

    <AppModal :show="isAddModalOpen" title="Añadir recurso" @close="closeCreateModal">
      <ResourceForm :is-edit="false" :resource-type-options="resourceTypeOptions" @submit="handleCreate"
        @cancel="closeCreateModal" />
    </AppModal>

    <AppModal :show="isEditModalOpen" title="Editar recurso" @close="closeEditModal" @after-close="onEditModalClosed">
      <ResourceForm v-if="selectedResource" :is-edit="true" :model-value="selectedResource"
        :resource-type-options="resourceTypeOptions" @submit="handleUpdate" @cancel="closeEditModal" />
    </AppModal>

    <ConfirmModal :show="isDeleteModalOpen" title="Eliminar recurso"
      message="¿Estás seguro de que deseas eliminar el recurso" :item-name="resourceToDelete?.name"
      confirm-label="Eliminar" @confirm="handleDelete" @cancel="closeDeleteModal" @closed="onDeleteModalClosed" />

    <DataTableColumns class="resources-table" :columns="resourceColumns" :items="resourceStore.resources" key-field="id"
      :loading="resourceStore.loading" :error="!!resourceStore.error"
      :pagination="{ page: resourceStore.page, pageSize: resourceStore.pageSize, total: resourceStore.count }"
      @prev-page="resourceStore.setPage(resourceStore.page - 1)"
      @next-page="resourceStore.setPage(resourceStore.page + 1)">
      <template #cell-status="{ item }">
        <span class="pill-button" style="color: white;"
          :class="item.availability ? 'pill-button-success' : 'pill-button-warn'">
          {{ item.availability ? 'Disponible' : 'No disponible' }}
        </span>
      </template>
      <template #cell-capacity="{ item }">
        {{ item.capacity }} {{ item.capacity > 1 ? 'personas' : 'persona' }}
      </template>
      <template #cell-actions="{ item }">
        <MoreActionsButton :options="moreActionsOpts" @select="(opt) => handleAction(item, opt)" />
      </template>
    </DataTableColumns>
  </div>
</template>

<style scoped>
.resources-table {
  padding: 0;
}

.resources-table :deep(.data-table) {
  min-width: 0;
}

.resources-table :deep(.data-table-head),
.resources-table :deep(.data-table-row) {
  gap: var(--space-3);
  padding: var(--space-3);
}
</style>
