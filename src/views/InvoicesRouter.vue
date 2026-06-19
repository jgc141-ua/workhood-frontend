<script setup>
import { computed } from 'vue'
import { IonPage } from '@ionic/vue'
import { useMeStore } from '@/stores/meStore'
import InvoicesAdminView from '@/views/InvoicesAdminView.vue'
import InvoicesMemberView from '@/views/InvoicesMemberView.vue'

const meStore = useMeStore()
const isAdmin = computed(() => meStore.user?.role === 'ADMIN')
</script>

<template>
  <ion-page>
    <InvoicesAdminView v-if="isAdmin" />
    <InvoicesMemberView v-else />
  </ion-page>
</template>
