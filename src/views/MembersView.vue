<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { useMembersStore } from '@/stores/memberStore'

import MobileHeader from '@/components/MobileHeader.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import AppModal from '@/components/AppModal.vue'
import RegisterForm from '@/components/forms/RegisterForm.vue'
import EditMemberForm from '@/components/forms/EditMemberForm.vue'
import DataTable from '@/components/DataTable.vue'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconTrash from '@/components/icons/IconTrash.vue'

const brand = inject('BRAND')

// Stores
const auth = useAuthStore()
const membersStore = useMembersStore()

// Modal añadir
const isAddMemberModalOpen = ref(false)
const openAddMemberModal = () => { isAddMemberModalOpen.value = true }
const closeAddMemberModal = () => { isAddMemberModalOpen.value = false }

// Modal editar
const isEditMemberModalOpen = ref(false)
const selectedMember = ref(null)
const isLoadingMemberDetail = ref(false)

const openEditMemberModal = async (member) => {
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

const closeEditMemberModal = () => {
  selectedMember.value = null
  isEditMemberModalOpen.value = false
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
const nextPage = () => membersStore.setPage(membersStore.page + 1)
const prevPage = () => membersStore.setPage(membersStore.page - 1)

const memberColumns = [
  { key: 'member', label: 'MIEMBRO', width: '1fr' },
  { key: 'contact', label: 'CONTACTO', width: '1fr' },
  { key: 'nif', label: 'NIF/CIF', width: '1fr' },
  { key: 'actions', label: 'ACCIONES', width: '0.25fr' },
]

// Helpers
const getInitials = (member) => {
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
    // TODO: implementar llamada al store para eliminar miembro
    console.log('Eliminar miembro:', member.email)
  }
}

// Carga inicial
onMounted(async () => {
  if (membersStore.members.length) return

  try {
    await membersStore.fetchMembers()
  } catch (err) {
    console.error(err)
  }
})
</script>

<template>
  <ion-page class="page-members">
    <MobileHeader title="Miembros" />

    <ion-content :fullscreen="true" class="ion-padding">
      <section class="members">
        <header class="row-between">
          <div class="page-header">
            <p class="eyebrow">RED DE {{ brand?.toUpperCase() }}</p>
            <h1 class="title">Miembros</h1>
          </div>

          <button class="btn btn-primary top-action" type="button" @click="openAddMemberModal">
            <span>Añadir miembro</span>
          </button>
        </header>

        <AppModal :show="isAddMemberModalOpen" title="Añadir miembro" @close="closeAddMemberModal">
          <RegisterForm @submit="handleRegister" />
        </AppModal>

        <AppModal :show="isEditMemberModalOpen" title="Editar miembro" @close="closeEditMemberModal">
          <EditMemberForm v-if="selectedMember" :member-data="selectedMember" @submit="handleUpdateMember" />
        </AppModal>

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

        <DataTable :columns="memberColumns" :items="membersStore.members" key-field="id" :loading="membersStore.loading"
          :error="membersStore.error"
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

          <template #cell-actions="{ item }">
            <div class="members-actions">
              <button type="button" class="btn-action" aria-label="Editar miembro" @click="openEditMemberModal(item)">
                <IconEdit />
              </button>
              <MoreActionsButton :options="[
                { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true }
              ]" @select="(opt) => handleMemberAction(item, opt)" />
            </div>
          </template>
        </DataTable>
      </section>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.members {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

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

@media (max-width: 991.98px) {
  .page-header {
    display: none;
  }
}
</style>