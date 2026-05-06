<script setup>
import { computed, onMounted, ref } from 'vue'
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

const membershipTypeStore = useMembershipTypeStore()
const benefitStore = useBenefitStore()
const resourceTypeStore = useResourceTypeStore()
const resourceStore = useResourceStore()

const membershipSectionRef = ref(null)
const benefitSectionRef = ref(null)
const resourceTypeSectionRef = ref(null)
const resourceSectionRef = ref(null)

const resourceTypeOptions = computed(() =>
  resourceTypeStore.resourceTypes.map((rt) => ({ value: rt.id, label: rt.name }))
)

// Modal menú añadir
const isAddMenuModalOpen = ref(false)
const openAddMenuModal = () => { isAddMenuModalOpen.value = true }
const closeAddMenuModal = () => { isAddMenuModalOpen.value = false }

function addMembership() {
  closeAddMenuModal()
  membershipSectionRef.value?.openCreateModal()
}

function addBenefit() {
  closeAddMenuModal()
  benefitSectionRef.value?.openCreateModal()
}

function addResourceType() {
  closeAddMenuModal()
  resourceTypeSectionRef.value?.openCreateModal()
}

function addResource() {
  closeAddMenuModal()
  resourceSectionRef.value?.openCreateModal()
}

onMounted(async () => {
  try {
    if (!membershipTypeStore.membershipTypes.length) {
      await membershipTypeStore.fetchMembershipTypes()
    }
    if (!benefitStore.benefits.length) {
      await benefitStore.fetchBenefits()
    }
    if (!resourceTypeStore.resourceTypes.length) {
      await resourceTypeStore.fetchResourceTypes()
    }
    if (!resourceStore.resources.length) {
      await resourceStore.fetchResources()
    }
  } catch (err) {
    // Los stores ya registran el error
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

      <section class="contentGrid">
        <MembershipTypesSection ref="membershipSectionRef" />
        <BenefitsSection ref="benefitSectionRef" />
      </section>

      <section class="contentGrid resources-grid">
        <ResourcesSection ref="resourceSectionRef" :resource-type-options="resourceTypeOptions" />
        <ResourceTypesSection ref="resourceTypeSectionRef" />
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

.contentGrid {
  margin-top: 40px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-6);
  align-items: start;
}

.resources-grid {
  margin-top: var(--space-8);
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
}
</style>
