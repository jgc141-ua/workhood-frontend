<script setup>
import { ref, computed, inject, onMounted, watch } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { useMembersStore } from '@/stores/membersStore'

import MobileHeader from '@/components/MobileHeader.vue'
import IconMoreActions from '@/components/icons/IconMoreActions.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconSearch from '@/components/icons/IconSearch.vue'
import AppModal from '@/components/AppModal.vue'
import RegisterForm from '@/components/forms/RegisterForm.vue'
import EditMemberForm from '@/components/forms/EditMemberForm.vue'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'

const brand = inject('BRAND')
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
const paginationInfo = computed(() => {
  if (!membersStore.count) return { start: 0, end: 0, total: 0 }

  const start = (membersStore.page - 1) * membersStore.pageSize + 1
  const end = Math.min(membersStore.page * membersStore.pageSize, membersStore.count)

  return { start, end, total: membersStore.count }
})

const nextPage = () => membersStore.setPage(membersStore.page + 1)
const prevPage = () => membersStore.setPage(membersStore.page - 1)

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
        <header class="row-between members-top">
          <div class="page-header">
            <p class="eyebrow">RED DE {{ brand?.toUpperCase() }}</p>
            <h1 class="title">Miembros</h1>
          </div>

          <button class="btn btn-primary members-add" type="button" @click="openAddMemberModal">
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

        <div v-if="membersStore.loading" class="server-state">
          Cargando miembros...
        </div>

        <div v-else-if="membersStore.error" class="server-state">
          Error con el servidor
        </div>

        <div v-else-if="!membersStore.members.length" class="server-state">
          No hay miembros para mostrar.
        </div>

        <section v-else class="card members-box">
          <div class="members-table">
            <div class="members-head">
              <div>MIEMBRO</div>
              <div>CONTACTO</div>
              <div>NIF/CIF</div>
              <div>ACCIONES</div>
            </div>

            <div v-for="member in membersStore.members" :key="member.id" class="members-row">
              <div class="members-user">
                <div class="members-avatar members-avatar--fallback" aria-hidden="true">
                  {{ getInitials(member) }}
                </div>
                <div class="members-user-meta">
                  <span class="members-user-name">
                    {{ member.first_name }} {{ member.last_name }}
                  </span>
                </div>
              </div>

              <div>
                <div class="members-text">{{ member.email || '-' }}</div>
                <div class="members-text">{{ member.phone || '-' }}</div>
              </div>

              <div class="members-text">{{ member.nif_cif || '-' }}</div>

              <div class="members-actions">
                <button type="button" class="members-action" aria-label="Editar miembro" @click="openEditMemberModal(member)">
                  <IconEdit />
                </button>
                <button type="button" class="members-action" aria-label="Más acciones">
                  <IconMoreActions />
                </button>
              </div>
            </div>
          </div>

          <div class="members-pagination">
            <p class="members-pagination-info">
              Mostrando {{ paginationInfo.start }}-{{ paginationInfo.end }}
              de {{ paginationInfo.total }} miembros
            </p>

            <div class="members-pagination-controls">
              <button type="button" class="members-page-btn"
                :disabled="!membersStore.hasPreviousPage || membersStore.loading" @click="prevPage">
                Anterior
              </button>

              <span class="members-pagination-current">
                Página {{ membersStore.page }} de {{ membersStore.totalPages }}
              </span>

              <button type="button" class="members-page-btn"
                :disabled="!membersStore.hasNextPage || membersStore.loading" @click="nextPage">
                Siguiente
              </button>
            </div>
          </div>
        </section>
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

.members-top {
  align-items: flex-start;
  gap: var(--space-4);
}

.members-add {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 48px;
  padding: 0.95rem 1.15rem;
}

.members-add-icon {
  font-size: 1rem;
  line-height: 1;
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

.members-box {
  overflow-x: auto;
}

.members-table {
  width: 100%;
}

.members-head,
.members-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 0.25fr;
  gap: var(--space-4);
  align-items: center;
  min-width: 920px;
}

.members-head {
  padding: var(--space-4) var(--space-3);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.members-row {
  padding: var(--space-4) var(--space-3);
  border-top: 1px solid var(--outline-variant);
}

.members-user {
  gap: var(--space-3);
  min-width: 0;
}

.members-avatar {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
}

.members-avatar--img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.members-text {
  color: #4b5563;
  font-size: 0.92rem;
}

.members-plan {
  height: auto;
  padding: 0.48rem 0.8rem;
  border-radius: var(--radius-sm);
  background: var(--surface-container-low);
  color: #425466;
  font-size: 0.82rem;
  font-weight: 600;
  gap: 0;
}

.members-actions {
  gap: var(--space-2);
}

.members-action {
  width: 34px;
  height: 34px;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: #425466;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.members-action:hover {
  background: var(--surface-container-low);
}

.members-action svg {
  width: 16px;
  height: 16px;
}

.members-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-3);
  border-top: 1px solid var(--outline-variant);
}

.members-pagination-info {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.members-pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.members-pagination-current {
  color: var(--on-surface);
  font-size: 0.92rem;
  font-weight: 600;
}

.members-page-btn {
  min-height: 38px;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font: inherit;
  font-weight: 600;
  transition: var(--transition-fast);
}

.members-page-btn:hover:not(:disabled) {
  background: var(--surface-container-low);
}

.members-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .members-pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .members-pagination-controls {
    justify-content: space-between;
  }

  .members-pagination-current {
    text-align: center;
    flex: 1;
  }
}

@media (max-width: 1024px) {

  .members-top,
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

  .members-title {
    font-size: 1.75rem;
  }

  .members-add {
    width: 100%;
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