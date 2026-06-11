<script setup>
import { onMounted, ref } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import AppModal from '@/components/AppModal.vue'
import MembershipTypesSection from '@/components/sections/MembershipTypesSection.vue'
import BenefitsSection from '@/components/sections/BenefitsSection.vue'
import ResourceTypesSection from '@/components/sections/ResourceTypesSection.vue'
import ResourcesSection from '@/components/sections/ResourcesSection.vue'
import { useMembershipTypeStore } from '@/stores/membershipTypeStore'
import { useBenefitStore } from '@/stores/benefitStore'
import { useResourceTypeStore } from '@/stores/resourceTypeStore'
import { useResourceStore } from '@/stores/resourceStore'
import { useAuthStore } from '@/stores/authStore'

// Stores de catálogo
const membershipTypeStore = useMembershipTypeStore()
const authStore = useAuthStore()
const benefitStore = useBenefitStore()
const resourceTypeStore = useResourceTypeStore()
const resourceStore = useResourceStore()

// Estado de apertura de los modales de creación de cada sección
const isCreateMembershipOpen = ref(false)
const isCreateBenefitOpen = ref(false)
const isCreateResourceTypeOpen = ref(false)
const isCreateResourceOpen = ref(false)

// Modal menú añadir
const isAddMenuModalOpen = ref(false)

function openAddMenuModal() {
  isAddMenuModalOpen.value = true
}

function closeAddMenuModal() {
  isAddMenuModalOpen.value = false
}

// Acciones del menú añadir: activan el modal de creación de cada sección
function addMembership() {
  closeAddMenuModal()
  isCreateMembershipOpen.value = true
}

function addBenefit() {
  closeAddMenuModal()
  isCreateBenefitOpen.value = true
}

function addResourceType() {
  closeAddMenuModal()
  isCreateResourceTypeOpen.value = true
}

function addResource() {
  closeAddMenuModal()
  isCreateResourceOpen.value = true
}

// Carga inicial de los cuatro catálogos
onMounted(async () => {
  if (!authStore.isAuthenticated) return

  const promises = []

  if (!membershipTypeStore.membershipTypes.length) {
    promises.push(membershipTypeStore.fetchMembershipTypes().catch(() => {}))
  }
  if (!benefitStore.benefits.length) {
    promises.push(benefitStore.fetchBenefits().catch(() => {}))
  }
  if (!resourceTypeStore.resourceTypes.length) {
    promises.push(resourceTypeStore.fetchResourceTypes().catch(() => {}))
  }
  if (!resourceStore.resources.length) {
    promises.push(resourceStore.fetchResources().catch(() => {}))
  }

  await Promise.all(promises)
})
</script>

<template>
  <ion-page class="page-memberships">
    <MobileHeader title="Memberships" />

    <ion-content :fullscreen="true" class="ion-padding">
      <!-- Encabezado y acción principal -->
      <header class="row-between">
        <div class="page-header">
          <p class="eyebrow">ADMINISTRACIÓN DE RECURSOS Y MEMBRESÍAS</p>
          <h1 class="title">Membresías, beneficios y recursos</h1>
        </div>

        <button class="btn btn-primary top-action" type="button" @click="openAddMenuModal">
          <span>Añadir</span>
        </button>
      </header>

      <!-- Modal: menú de opciones para añadir -->
      <AppModal :show="isAddMenuModalOpen" title="Añadir" @close="closeAddMenuModal">
        <div class="top-actions-modal">
          <button class="btn btn-secondary top-action" type="button" @click="addMembership">
            <span>Crear una membresía nueva</span>
          </button>
          <button class="btn btn-secondary top-action" type="button" @click="addBenefit">
            <span>Crear un beneficio nuevo</span>
          </button>
          <button class="btn btn-secondary top-action" type="button" @click="addResourceType">
            <span>Crear un tipo de recurso nuevo</span>
          </button>
          <button class="btn btn-secondary top-action" type="button" @click="addResource">
            <span>Crear un recurso nuevo</span>
          </button>
        </div>
      </AppModal>

      <!-- Secciones de membresías y beneficios -->
      <section class="contentGrid">
        <MembershipTypesSection :is-create-open="isCreateMembershipOpen" @update:is-create-open="isCreateMembershipOpen = $event" />
        <BenefitsSection :is-create-open="isCreateBenefitOpen" @update:is-create-open="isCreateBenefitOpen = $event" />
      </section>

      <!-- Secciones de recursos y tipos de recurso -->
      <section class="contentGrid resources-grid">
        <ResourcesSection :is-create-open="isCreateResourceOpen" @update:is-create-open="isCreateResourceOpen = $event" />
        <ResourceTypesSection :is-create-open="isCreateResourceTypeOpen" @update:is-create-open="isCreateResourceTypeOpen = $event" />
      </section>

    </ion-content>
  </ion-page>
</template>

<style scoped>
/* Modal de acciones añadir */
.top-actions-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Grid de secciones */
.contentGrid {
  margin-top: 40px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-6);
  align-items: start;
}

.contentGrid > * {
  min-width: 0;
}

.resources-grid {
  margin-top: var(--space-8);
}

/* Responsive */
@media (max-width: 1024px) {
  .contentGrid {
    grid-template-columns: 1fr;
  }
}

</style>
