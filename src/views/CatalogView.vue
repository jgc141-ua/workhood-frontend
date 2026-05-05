<script setup>
import { inject, ref, onMounted } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import DataTable from '@/components/DataTable.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import AppModal from '@/components/AppModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import MembershipTypeForm from '@/components/forms/MembershipTypeForm.vue'
import BenefitForm from '@/components/forms/BenefitForm.vue'
import { useMembershipTypeStore } from '@/stores/membershipTypeStore'
import { useBenefitStore } from '@/stores/benefitStore'
import { useResourceStore } from '@/stores/resourceStore'
import { showToast } from '@/composables/toast'

const membershipTypeStore = useMembershipTypeStore()
const benefitStore = useBenefitStore()
const resourceStore = useResourceStore()

const resourceColumns = [
    { key: 'name', label: 'RECURSO', width: '1fr' },
    { key: 'type', label: 'TIPO', width: '1fr' },
    { key: 'capacity', label: 'CAPACIDAD', width: '1fr' },
    { key: 'rate', label: 'TARIFA / HORA', width: '1fr' },
    { key: 'status', label: 'ESTADO', width: '1fr' },
]

// Opciones de "Más acciones"
const moreActionsOpts = [
    { icon: IconEdit, label: 'Editar', action: 'edit', danger: false },
    { icon: IconTrash, label: 'Eliminar', action: 'delete', danger: true }
]

// Modal menú añadir
const isAddMenuModalOpen = ref(false)
const openAddMenuModal = () => { isAddMenuModalOpen.value = true }
const closeAddMenuModal = () => { isAddMenuModalOpen.value = false }

// Modal añadir membresía
const isAddMembershipModalOpen = ref(false)
const openAddMembershipModal = () => {
    closeAddMenuModal()
    isAddMembershipModalOpen.value = true
}
const closeAddMembershipModal = () => { isAddMembershipModalOpen.value = false }

// Modal editar membresía
const isEditModalOpen = ref(false)
const selectedType = ref(null)
const openEditModal = (type) => {
    selectedType.value = { ...type }
    isEditModalOpen.value = true
}
const closeEditModal = () => {
    isEditModalOpen.value = false
}
const onEditModalClosed = () => {
    selectedType.value = null
}

// Modal eliminar membresía
const isDeleteModalOpen = ref(false)
const typeToDelete = ref(null)
const openDeleteModal = (type) => {
    typeToDelete.value = type
    isDeleteModalOpen.value = true
}
const closeDeleteModal = () => {
    isDeleteModalOpen.value = false
}
const onDeleteModalClosed = () => {
    typeToDelete.value = null
}

// Modal añadir beneficio
const isAddBenefitModalOpen = ref(false)
const openAddBenefitModal = () => {
    closeAddMenuModal()
    isAddBenefitModalOpen.value = true
}
const closeAddBenefitModal = () => { isAddBenefitModalOpen.value = false }

// Modal editar beneficio
const isEditBenefitModalOpen = ref(false)
const selectedBenefit = ref(null)
const openEditBenefitModal = (benefit) => {
    selectedBenefit.value = { ...benefit }
    isEditBenefitModalOpen.value = true
}
const closeEditBenefitModal = () => {
    isEditBenefitModalOpen.value = false
}
const onEditBenefitModalClosed = () => {
    selectedBenefit.value = null
}

// Modal eliminar beneficio
const isDeleteBenefitModalOpen = ref(false)
const benefitToDelete = ref(null)
const openDeleteBenefitModal = (benefit) => {
    benefitToDelete.value = benefit
    isDeleteBenefitModalOpen.value = true
}
const closeDeleteBenefitModal = () => {
    isDeleteBenefitModalOpen.value = false
}
const onDeleteBenefitModalClosed = () => {
    benefitToDelete.value = null
}

// Acciones del menú de "Más acciones"
function handleMembershipAction(type, option) {
    if (option.action === 'delete') {
        openDeleteModal(type)
    } else if (option.action === 'edit') {
        openEditModal(type)
    }
}

function handleBenefitAction(benefit, option) {
    if (option.action === 'delete') {
        openDeleteBenefitModal(benefit)
    } else if (option.action === 'edit') {
        openEditBenefitModal(benefit)
    }
}

function truncateDescription(text, maxLength = 35) {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
}

// Crear membresía
async function handleCreate(formData) {
    try {
        await membershipTypeStore.createMembershipType(formData)
        showToast('Membresía creada correctamente', 'success')
        closeAddMembershipModal()
    } catch (err) {
        showToast(err.message || 'Error al crear la membresía')
    }
}

// Actualizar membresía
async function handleUpdate(formData) {
    try {
        await membershipTypeStore.updateMembershipType(formData)
        showToast('Membresía actualizada correctamente', 'success')
        closeEditModal()
    } catch (err) {
        showToast(err.message || 'Error al actualizar la membresía')
    }
}

// Eliminar membresía
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

// Crear beneficio
async function handleCreateBenefit(formData) {
    try {
        await benefitStore.createBenefit(formData)
        showToast('Beneficio creado correctamente', 'success')
        closeAddBenefitModal()
    } catch (err) {
        showToast(err.message || 'Error al crear el beneficio')
    }
}

// Actualizar beneficio
async function handleUpdateBenefit(formData) {
    try {
        await benefitStore.updateBenefit(formData)
        showToast('Beneficio actualizado correctamente', 'success')
        closeEditBenefitModal()
    } catch (err) {
        showToast(err.message || 'Error al actualizar el beneficio')
    }
}

// Eliminar beneficio
async function handleDeleteBenefit() {
    if (!benefitToDelete.value) return
    try {
        await benefitStore.deleteBenefit(benefitToDelete.value.name)
        showToast('Beneficio eliminado correctamente')
        closeDeleteBenefitModal()
    } catch (err) {
        showToast(err.message || 'Error al eliminar el beneficio')
    }
}

// Añadir nuevos (modal)
const addBenefit = () => {
    openAddBenefitModal()
}

const addResource = () => {
    closeAddMenuModal()
}

// Carga inicial
onMounted(async () => {
    try {
        if (!membershipTypeStore.membershipTypes.length) {
            await membershipTypeStore.fetchMembershipTypes()
        }
        if (!benefitStore.benefits.length) {
            await benefitStore.fetchBenefits()
        }
    } catch (err) {
        console.error(err)
    }
})
</script>

<template>
    <ion-page class="page-memberships">
        <MobileHeader title="Memberships" />

        <ion-content :fullscreen="true" class="ion-padding">
            <header class="row-between">
                <div class="page-header">
                    <p class="eyebrow">ADMINISTRACIÓN DE RECURSOS Y MEMBRESÍAS</p>
                    <h1 class="title">Membresías, beneficios y recursos</h1>
                </div>

                <button class="btn btn-primary top-action" type="button" @click="openAddMenuModal">
                    <span>Añadir</span>
                </button>
            </header>

            <AppModal :show="isAddMenuModalOpen" title="Añadir" @close="closeAddMenuModal">
                <div class="top-actions-modal">
                    <button class="btn btn-secondary top-action" type="button" @click="openAddMembershipModal">
                        <span>Crear una membresía nueva</span>
                    </button>
                    <button class="btn btn-secondary top-action" type="button" @click="addBenefit">
                        <span>Crear un beneficio nuevo</span>
                    </button>
                    <button class="btn btn-secondary top-action" type="button" @click="addResource">
                        <span>Crear un recurso nuevo</span>
                    </button>
                </div>
            </AppModal>
            <AppModal :show="isAddMembershipModalOpen" title="Añadir membresía" @close="closeAddMembershipModal">
                <MembershipTypeForm :is-edit="false" @submit="handleCreate" @cancel="closeAddMembershipModal" />
            </AppModal>

            <AppModal :show="isEditModalOpen" title="Editar membresía" @close="closeEditModal"
                @after-close="onEditModalClosed">
                <MembershipTypeForm v-if="selectedType" :is-edit="true" :model-value="selectedType"
                    :initial-name="selectedType.name" @submit="handleUpdate" @cancel="closeEditModal" />
            </AppModal>

            <ConfirmModal :show="isDeleteModalOpen" title="Eliminar membresía"
                message="¿Estás seguro de que deseas eliminar la membresía" :item-name="typeToDelete?.name"
                confirm-label="Eliminar" @confirm="handleDelete" @cancel="closeDeleteModal"
                @closed="onDeleteModalClosed" />

            <AppModal :show="isAddBenefitModalOpen" title="Añadir beneficio" @close="closeAddBenefitModal">
                <BenefitForm :is-edit="false" @submit="handleCreateBenefit" @cancel="closeAddBenefitModal" />
            </AppModal>

            <AppModal :show="isEditBenefitModalOpen" title="Editar beneficio" @close="closeEditBenefitModal"
                @after-close="onEditBenefitModalClosed">
                <BenefitForm v-if="selectedBenefit" :is-edit="true" :model-value="selectedBenefit"
                    :initial-name="selectedBenefit.name" @submit="handleUpdateBenefit"
                    @cancel="closeEditBenefitModal" />
            </AppModal>

            <ConfirmModal :show="isDeleteBenefitModalOpen" title="Eliminar beneficio"
                message="¿Estás seguro de que deseas eliminar el beneficio" :item-name="benefitToDelete?.name"
                confirm-label="Eliminar" @confirm="handleDeleteBenefit" @cancel="closeDeleteBenefitModal"
                @closed="onDeleteBenefitModalClosed" />

            <section class="contentGrid">

                <div>
                    <h2 class="section-title">Membresías</h2>

                    <DataTable class="membership-table" :columns="[{ key: 'plan', label: 'MEMBRESÍAS', width: '1fr' }]"
                        :items="membershipTypeStore.membershipTypes" key-field="id" variant="list"
                        :loading="membershipTypeStore.loading" :error="!!membershipTypeStore.error"
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
                                    <MoreActionsButton :options="moreActionsOpts"
                                        @select="(opt) => handleMembershipAction(item, opt)" />
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
                                    <span class="membership-meta">{{ item.is_fixed ? 'Escritorio fijo' :
                                        'Escritorio flexible' }}</span>
                                </div>
                            </article>
                        </template>
                    </DataTable>
                </div>

                <aside>
                    <h2 class="section-title">Beneficios</h2>
                    <DataTable class="benefits-table" :columns="[{ key: 'benefit', label: 'BENEFICIO', width: '1fr' }]"
                        :items="benefitStore.benefits" key-field="id" variant="list"
                        :loading="benefitStore.loading" :error="!!benefitStore.error"
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
                                <MoreActionsButton :options="moreActionsOpts"
                                    @select="(opt) => handleBenefitAction(item, opt)" />
                            </div>
                        </template>
                    </DataTable>
                </aside>
            </section>

            <section class="resources">
                <div class="resources-header">
                    <h2 class="section-title">Activos Físicos y Recursos</h2>
                    <a href="#" class="textLink">Ver todos</a>
                </div>

                <DataTable :columns="resourceColumns" :items="resourceStore.paginatedResources" key-field="idx"
                    :pagination="{ page: resourceStore.page, pageSize: resourceStore.pageSize, total: resourceStore.count }"
                    @prev-page="resourceStore.setPage(resourceStore.page - 1)"
                    @next-page="resourceStore.setPage(resourceStore.page + 1)">
                    <template #cell-status="{ item }">
                        <span class="pill-button" style="color: white;"
                            :class="item.status === 'Disponible' ? 'pill-button-success' : 'pill-button-warn'">
                            {{ item.status }}
                        </span>
                    </template>
                </DataTable>
            </section>
        </ion-content>
    </ion-page>
</template>

<style scoped>
.top-actions-modal {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
}

.membership-table {
    padding: 0 0 0 0;
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

.resources {
    margin-top: var(--space-8);
}

.resources-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-5);
    gap: var(--space-4);
}

.contentGrid {
    margin-top: 40px;
}

@media (max-width: 1400px) {
    .benefits-table :deep(.data-table-pagination) {
        text-align: center;
        align-items: center;
        justify-content: center;
        flex-direction: column;
    }
}

@media (max-width: 1024px) {
    .contentGrid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 991.98px) {
    .page-header {
        display: none;
    }

    .resources-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--space-3);
    }
}

@media (max-width: 480px) {

    .membership-table :deep(.data-table-list),
    .benefits-table :deep(.data-table-list) {
        padding: var(--space-3);
        gap: var(--space-3);
    }

    .price-amount {
        font-size: 1.5rem;
    }
}
</style>
