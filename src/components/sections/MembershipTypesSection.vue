<script setup>
import { ref } from 'vue'
import DataTableList from '@/components/DataTableList.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import MembershipTypeForm from '@/components/forms/MembershipTypeForm.vue'
import { useMembershipTypeStore } from '@/stores/membershipTypeStore'
import { showToast } from '@/composables/toast'

const membershipTypeStore = useMembershipTypeStore()

const moreActionsOpts = [
  { icon: IconEdit, label: 'Editar', action: 'edit', danger: false },
  { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true },
]

// Modales
const isAddModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedType = ref(null)
const typeToDelete = ref(null)

function openCreateModal() {
  isAddModalOpen.value = true
}

function closeCreateModal() {
  isAddModalOpen.value = false
}

function openEditModal(type) {
  selectedType.value = { ...type }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
}

function onEditModalClosed() {
  selectedType.value = null
}

function openDeleteModal(type) {
  typeToDelete.value = type
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
}

function onDeleteModalClosed() {
  typeToDelete.value = null
}

function handleAction(type, option) {
  if (option.action === 'delete') {
    openDeleteModal(type)
  } else if (option.action === 'edit') {
    openEditModal(type)
  }
}

async function handleCreate(formData) {
  try {
    await membershipTypeStore.createMembershipType(formData)
    showToast('Membresía creada correctamente', 'success')
    closeCreateModal()
  } catch (err) {
    showToast(err.message || 'Error al crear la membresía')
  }
}

async function handleUpdate(formData) {
  try {
    await membershipTypeStore.updateMembershipType(formData)
    showToast('Membresía actualizada correctamente', 'success')
    closeEditModal()
  } catch (err) {
    showToast(err.message || 'Error al actualizar la membresía')
  }
}

async function handleDelete() {
  if (!typeToDelete.value) return
  try {
    await membershipTypeStore.deleteMembershipType(typeToDelete.value.name)
    showToast('Membresía eliminada correctamente')
    closeDeleteModal()
  } catch (err) {
    showToast(err.message || 'Error al eliminar la membresía')
  }
}

defineExpose({ openCreateModal })
</script>

<template>
  <div>
    <h2 class="section-title">Membresías</h2>

    <AppModal :show="isAddModalOpen" title="Añadir membresía" @close="closeCreateModal">
      <MembershipTypeForm :is-edit="false" @submit="handleCreate" @cancel="closeCreateModal" />
    </AppModal>

    <AppModal :show="isEditModalOpen" title="Editar membresía" @close="closeEditModal" @after-close="onEditModalClosed">
      <MembershipTypeForm v-if="selectedType" :is-edit="true" :model-value="selectedType"
        :initial-name="selectedType.name" @submit="handleUpdate" @cancel="closeEditModal" />
    </AppModal>

    <ConfirmModal :show="isDeleteModalOpen" title="Eliminar membresía"
      message="¿Estás seguro de que deseas eliminar la membresía" :item-name="typeToDelete?.name" confirm-label="Eliminar"
      @confirm="handleDelete" @cancel="closeDeleteModal" @closed="onDeleteModalClosed" />

    <DataTableList class="membership-table" :columns="[{ key: 'plan', label: 'MEMBRESÍAS', width: '1fr' }]"
      :items="membershipTypeStore.membershipTypes" key-field="id" :loading="membershipTypeStore.loading"
      :error="!!membershipTypeStore.error"
      :pagination="{ page: membershipTypeStore.page, pageSize: membershipTypeStore.pageSize, total: membershipTypeStore.count }"
      @prev-page="membershipTypeStore.setPage(membershipTypeStore.page - 1)"
      @next-page="membershipTypeStore.setPage(membershipTypeStore.page + 1)">
      <template #row="{ item }">
        <article class="card membership-card">
          <div class="membership-card-top">
            <span class="pill-button" style="margin-left: -5px; color: white;"
              :class="item.is_active ? 'pill-button-success' : 'pill-button-error'">
              {{ item.is_active ? 'Activo' : 'Inactivo' }}
            </span>
            <MoreActionsButton :options="moreActionsOpts" @select="(opt) => handleAction(item, opt)" />
          </div>

          <div class="membership-card-body">
            <h3>{{ item.name }}</h3>
            <p>{{ item.description || 'Sin descripción' }}</p>
          </div>

          <div class="membership-card-footer">
            <div class="price">
              <span class="price-amount">{{ item.monthly_price }} €</span>
              <span class="price-unit">/mes</span>
            </div>
            <span class="membership-meta">{{ item.is_fixed ? 'Escritorio fijo' : 'Escritorio flexible' }}</span>
          </div>
        </article>
      </template>
    </DataTableList>
  </div>
</template>

<style scoped>
.membership-table {
  padding: 0;
}

.membership-table :deep(.data-table-list) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
  gap: var(--space-5);
  padding: var(--space-5);
}

.membership-table :deep(.data-table-list-item) {
  border-top: 0;
  padding: 0;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}

.membership-card {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  box-shadow: none;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
}

.membership-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.membership-card-top .pill-button {
  white-space: normal;
  min-width: 0;
}

.membership-card-body {
  min-width: 0;
}

.membership-card-body h3 {
  margin: var(--space-4) 0 var(--space-2);
  font-size: 1.25rem;
  line-height: 1.2;
  color: var(--on-surface);
  overflow-wrap: break-word;
  word-break: break-word;
}

.membership-card-body p {
  margin: 0;
  font-size: 0.95rem;
  color: #6b7280;
  overflow-wrap: break-word;
  word-break: break-word;
}

.membership-card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-top: var(--space-4);
  min-width: 0;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-wrap: wrap;
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.price-amount {
  font-size: 1.875rem;
  font-weight: 800;
  color: var(--primary);
}

.price-unit {
  font-size: 1rem;
  color: #333;
}

.membership-meta {
  font-size: 0.9rem;
  color: #6b7280;
  overflow-wrap: break-word;
}

@media (max-width: 480px) {
  .membership-table :deep(.data-table-list) {
    padding: var(--space-3);
    gap: var(--space-3);
  }

  .price-amount {
    font-size: 1.5rem;
  }
}
</style>
