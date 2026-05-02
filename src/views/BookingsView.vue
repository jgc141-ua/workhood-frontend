<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
</script>

<template>
  <ion-page>
    <MobileHeader title="Bookings" />
    <ion-content :fullscreen="true" class="ion-padding">
      <header class="page-header">
        <p class="eyebrow">GESTION DE RESERVAS</p>
        <h1 class="title">Bookings</h1>
      </header>
    </ion-content>
  </ion-page>
</template>

<style scoped>
@media (max-width: 991.98px) {
  .page-header {
    display: none;
  }
}
</style>
