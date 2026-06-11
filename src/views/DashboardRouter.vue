<script setup>
import { computed } from 'vue'
import { IonPage } from '@ionic/vue'
import { useMeStore } from '@/stores/meStore'
import DashboardAdminView from '@/views/DashboardAdminView.vue'
import DashboardMemberView from '@/views/DashboardMemberView.vue'

const meStore = useMeStore()
const isAdmin = computed(() => meStore.user?.role === 'ADMIN')
</script>

<template>
  <ion-page>
    <DashboardAdminView v-if="isAdmin" />
    <DashboardMemberView v-else />
  </ion-page>
</template>
