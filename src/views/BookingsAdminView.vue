<script setup>
import { IonContent } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
</script>

<template>
  <MobileHeader title="Bookings" />
  <ion-content :fullscreen="true" class="ion-padding">
      <header class="page-header">
        <p class="eyebrow">GESTION DE RESERVAS (ADMIN)</p>
        <h1 class="title">Bookings Admin</h1>
      </header>
  </ion-content>
</template>
