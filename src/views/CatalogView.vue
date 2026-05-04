<script setup>
import { inject, ref } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import DataTable from '@/components/DataTable.vue'
import MoreActionsButton from '@/components/MoreActionsButton.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconTrash from '@/components/icons/IconTrash.vue'
import AppModal from '@/components/AppModal.vue'
import { useMembershipStore } from '@/stores/membershipStore'
import { useBenefitStore } from '@/stores/benefitStore'
import { useResourceStore } from '@/stores/resourceStore'

const membershipStore = useMembershipStore()
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

// Acciones del menú de "Más acciones"
function handleMembershipAction(membership, option) {
    if (option.action === 'delete') {
        // TODO: implementar llamada al store para eliminar membresía
        console.log('Eliminar membresía:', membership.id)
    } else if (option.action === 'edit') {
        // TODO: implementar llamada al store para editar membresía
        console.log('Editar membresía:', membership.id)
    }
}

// Modal añadir
const isAddModalOpen = ref(false)
const openAddModal = () => { isAddModalOpen.value = true }
const closeAddModal = () => { isAddModalOpen.value = false }

// Añadir nuevos (modal)
const addMembership = () => {
    console.log('Nueva membresía')
    closeAddModal()
}
const addBenefit = () => {
    console.log('Nuevo beneficio')
    closeAddModal()
}
const addResource = () => {
    console.log('Nuevo recurso')
    closeAddModal()
}
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

                <button class="btn btn-primary top-action" type="button" @click="openAddModal">
                    <span>Añadir</span>
                </button>
            </header>

            <AppModal :show="isAddModalOpen" title="Añadir" @close="closeAddModal">
                <div class="top-actions-modal">
                    <button class="btn btn-secondary top-action" type="button" @click="addMembership">
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

            <section class="contentGrid">
                <div class="mainColumn">
                    <h2 class="section-title">Membresías Activas</h2>

                    <DataTable class="memberships-table" :columns="[{ key: 'plan', label: 'MEMBRESÍAS', width: '1fr' }]"
                        :items="membershipStore.paginatedMemberships" key-field="idx" variant="list"
                        :pagination="{ page: membershipStore.page, pageSize: membershipStore.pageSize, total: membershipStore.count }"
                        @prev-page="membershipStore.setPage(membershipStore.page - 1)"
                        @next-page="membershipStore.setPage(membershipStore.page + 1)">
                        <template #row="{ item }">
                            <article class="card membership-card">
                                <div class="membership-card-top">
                                    <span class="pill-button" style="margin-left: -5px; color: white;"
                                        :class="item.state ? 'pill-button-success' : 'pill-button-error'">{{ item.state
                                            ? 'Activo' :
                                            'Inactivo' }}</span>
                                    <MoreActionsButton :options="moreActionsOpts"
                                        @select="(opt) => handleMembershipAction(item, opt)" />
                                </div>

                                <div class="membership-card-body">
                                    <h3>{{ item.title }}</h3>
                                    <p>{{ item.description }}</p>
                                </div>

                                <div class="membership-card-footer">
                                    <div class="price">
                                        <span class="price-amount">{{ item.price }}</span>
                                        <span class="price-unit">{{ item.period }}</span>
                                    </div>
                                    <span class="membership-meta">{{ item.meta }}</span>
                                </div>
                            </article>
                        </template>
                    </DataTable>
                </div>

                <aside>
                    <h2 class="section-title">Beneficios</h2>
                    <DataTable class="benefits-datatable"
                        :columns="[{ key: 'benefit', label: 'BENEFICIO', width: '1fr' }]"
                        :items="benefitStore.paginatedBenefits" key-field="idx" variant="list"
                        :pagination="{ page: benefitStore.page, pageSize: benefitStore.pageSize, total: benefitStore.count }"
                        @prev-page="benefitStore.setPage(benefitStore.page - 1)"
                        @next-page="benefitStore.setPage(benefitStore.page + 1)">
                        <template #row="{ item }">
                            <div class="benefits-table">
                                <h4 class="benefits-name">{{ item.name }}</h4>
                                <p class="benefits-description">{{ item.description }}</p>
                            </div>
                            <div class="pill-button" v-if="item.quantity != null">{{ item.quantity }} horas</div>
                            <div class="pill-button" v-else>Ilimitado</div>
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
    gap: 20px;
}

.memberships-table {
    padding: 20px;
    padding-bottom: 0;
}

.memberships-table :deep(.data-table-list) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
    padding: 13px;
}

.memberships-table :deep(.data-table-list-item) {
    border-top: 0;
    padding: 0;
    padding-bottom: 20px;
}

.membership-card {
    width: 100%;
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: none;
    border: 1px solid var(--outline-variant);
    border-radius: var(--radius-md);
    background: var(--surface-container-lowest);
}

.membership-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.membership-card-body h3 {
    margin: var(--space-4) 0 var(--space-2);
    font-size: 1.25rem;
    line-height: 1.2;
    color: var(--on-surface);
}

.membership-card-body p {
    margin: 0;
    font-size: 0.95rem;
    color: #6b7280;
}

.membership-card-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
    margin-top: var(--space-4);
}

.benefits-datatable {
    padding-top: 0;
}

.benefits-datatable :deep(.data-table-list-item:first-child) {
    padding-top: 10px;
}

.benefits-table {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-left: 10px;
}

.benefits-name {
    margin-bottom: 4px;
    font-size: 17px;
    font-weight: 600;
}

.benefits-description {
    margin: 0;
    color: #555;
    font-size: 14px;
}

.price {
    display: flex;
    align-items: baseline;
    gap: 4px;
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

@media (max-width: 1200px) {
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

@media (max-width: 600px) {
    .membership-card {
        padding: var(--space-4);
        min-height: auto;
    }

    .memberships-table :deep(.data-table-list) {
        grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    .price-amount {
        font-size: 1.5rem;
    }
}
</style>
