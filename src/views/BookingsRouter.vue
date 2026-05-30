<script setup>
import { computed } from 'vue'
import { IonPage } from '@ionic/vue'
import { useMeStore } from '@/stores/meStore'
import BookingsAdminView from '@/views/BookingsAdminView.vue'
import BookingsMemberView from '@/views/BookingsMemberView.vue'

const meStore = useMeStore()
const isAdmin = computed(() => meStore.user?.role === 'ADMIN')
</script>

<template>
  <ion-page>
    <BookingsAdminView v-if="isAdmin" />
    <BookingsMemberView v-else />
  </ion-page>
</template>
