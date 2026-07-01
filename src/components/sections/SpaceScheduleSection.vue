<script setup>
import { ref, onMounted } from 'vue'
import DataTableColumns from '@/components/DataTableColumns.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconEdit from '@/assets/icons/IconEdit.vue'
import IconTrash from '@/assets/icons/IconTrash.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import FormInput from '@/components/forms/FormInput.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'
import FormActions from '@/components/forms/FormActions.vue'
import { useSpaceScheduleStore } from '@/stores/spaceScheduleStore'
import { showToast } from '@/composables/toast'
import { useDateFormat } from '@/composables/useDateFormat'

const spaceScheduleStore = useSpaceScheduleStore()

const scheduleColumns = [
  { key: 'start_date', label: 'INICIO', width: '1fr' },
  { key: 'end_date', label: 'FIN', width: '1fr' },
  { key: 'opening_time', label: 'APERTURA', width: '1fr' },
  { key: 'closing_time', label: 'CIERRE', width: '1fr' },
  { key: 'is_open', label: 'ESTADO', width: '1fr' },
  { key: 'actions', label: '', width: 'auto' },
]

const moreActionsOpts = [
  { icon: IconEdit, label: 'Editar', action: 'edit', danger: false },
  { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true },
]

const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const selectedSchedule = ref(null)
const scheduleToDelete = ref(null)

const form = ref({
  start_date: '',
  end_date: '',
  opening_time: '',
  closing_time: '',
  is_open: true,
})

onMounted(() => {
  spaceScheduleStore.fetchSchedules().catch(() => { })
})

function resetForm() {
  form.value = {
    start_date: '',
    end_date: '',
    opening_time: '',
    closing_time: '',
    is_open: true,
  }
}

function openCreateModal() {
  resetForm()
  isCreateModalOpen.value = true
}

function closeCreateModal() {
  isCreateModalOpen.value = false
}

function openEditModal(schedule) {
  selectedSchedule.value = { ...schedule }
  form.value = {
    start_date: schedule.start_date,
    end_date: schedule.end_date || '',
    opening_time: schedule.opening_time,
    closing_time: schedule.closing_time,
    is_open: schedule.is_open,
  }
  isEditModalOpen.value = true
}

function closeEditModal() {
  isEditModalOpen.value = false
  selectedSchedule.value = null
}

function openDeleteModal(schedule) {
  scheduleToDelete.value = schedule
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
  scheduleToDelete.value = null
}

function handleAction(schedule, option) {
  if (option.action === 'delete') {
    openDeleteModal(schedule)
  } else if (option.action === 'edit') {
    openEditModal(schedule)
  }
}

function buildPayload() {
  const isOpen = form.value.is_open
  return {
    start_date: form.value.start_date,
    end_date: form.value.end_date || null,
    opening_time: isOpen ? form.value.opening_time : null,
    closing_time: isOpen ? form.value.closing_time : null,
    is_open: isOpen,
  }
}

async function handleCreate() {
  try {
    await spaceScheduleStore.createSchedule(buildPayload())
    showToast('Horario creado correctamente', 'success')
    closeCreateModal()
  } catch (err) {
    showToast(err.message || 'Error al crear el horario')
  }
}

async function handleUpdate() {
  if (!selectedSchedule.value) return
  try {
    await spaceScheduleStore.updateSchedule({
      id: selectedSchedule.value.id,
      ...buildPayload(),
    })
    showToast('Horario actualizado correctamente', 'success')
    closeEditModal()
  } catch (err) {
    showToast(err.message || 'Error al actualizar el horario')
  }
}

async function handleDelete() {
  if (!scheduleToDelete.value) return
  try {
    await spaceScheduleStore.deleteSchedule(scheduleToDelete.value.id)
    showToast('Horario eliminado correctamente', 'success')
  } catch (err) {
    showToast(err.message || 'Error al eliminar el horario')
    spaceScheduleStore.error = null
  }
  closeDeleteModal()
}

const { formatDDMMYYYY, formatDDMMYYYYHHMM } = useDateFormat()

defineExpose({
  openCreateModal
})
</script>

<template>
  <div class="space-schedule">
    <AppModal :show="isCreateModalOpen" title="Añadir horario" @close="closeCreateModal">
      <form class="schedule-form" @submit.prevent="handleCreate">
        <FormInput v-model="form.start_date" label="Fecha de inicio" type="date" required />
        <FormInput v-model="form.end_date" label="Fecha de fin (opcional)" type="date" />
        <FormInput v-model="form.opening_time" label="Hora de apertura" type="time" :required="form.is_open" />
        <FormInput v-model="form.closing_time" label="Hora de cierre" type="time" :required="form.is_open" />
        <PrettyCheckbox v-model="form.is_open" text="Abierto" />
        <FormActions submit-label="Crear" :disabled="spaceScheduleStore.loading" @cancel="closeCreateModal" />
      </form>
    </AppModal>

    <AppModal :show="isEditModalOpen" title="Editar horario" @close="closeEditModal">
      <form v-if="selectedSchedule" class="schedule-form" @submit.prevent="handleUpdate">
        <FormInput v-model="form.start_date" label="Fecha de inicio" type="date" required />
        <FormInput v-model="form.end_date" label="Fecha de fin (opcional)" type="date" />
        <FormInput v-model="form.opening_time" label="Hora de apertura" type="time" :required="form.is_open" />
        <FormInput v-model="form.closing_time" label="Hora de cierre" type="time" :required="form.is_open" />
        <PrettyCheckbox v-model="form.is_open" text="Abierto" />
        <FormActions submit-label="Guardar" :disabled="spaceScheduleStore.loading" @cancel="closeEditModal" />
      </form>
    </AppModal>

    <ConfirmModal :show="isDeleteModalOpen" title="Eliminar horario"
      message="¿Estás seguro de que deseas eliminar el horario?" confirm-label="Eliminar" @confirm="handleDelete"
      @close="closeDeleteModal" />

    <DataTableColumns class="schedules-table" :columns="scheduleColumns" :items="spaceScheduleStore.schedules"
      key-field="id" :loading="spaceScheduleStore.loading" :error="!!spaceScheduleStore.error"
      empty-text="No hay horarios configurados." :pagination="{
        page: spaceScheduleStore.page,
        pageSize: spaceScheduleStore.pageSize,
        total: spaceScheduleStore.count,
      }" @prev-page="spaceScheduleStore.setPage(spaceScheduleStore.page - 1)"
      @next-page="spaceScheduleStore.setPage(spaceScheduleStore.page + 1)">
      <template #cell-start_date="{ item }">
        {{ formatDDMMYYYY(item.start_date) }}
      </template>
      <template #cell-end_date="{ item }">
        {{ item.end_date ? formatDDMMYYYY(item.end_date) : 'Indefinido' }}
      </template>
      <template #cell-is_open="{ item }">
        <span class="pill-button" style="color: white;"
          :class="item.is_open ? 'pill-button-success' : 'pill-button-warn'">
          {{ item.is_open ? 'Abierto' : 'Cerrado' }}
        </span>
      </template>
      <template #cell-actions="{ item }">
        <MoreActionsButton :options="moreActionsOpts" @select="(opt) => handleAction(item, opt)" />
      </template>
    </DataTableColumns>
  </div>
</template>

<style scoped>
.schedule-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.schedules-table :deep(.data-table-head),
.schedules-table :deep(.data-table-row) {
  gap: var(--space-3);
  padding: var(--space-3);
}
</style>
