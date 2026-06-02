<script setup>
import { IonPage, IonContent } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
</script>

<template>
  <ion-page>
    <MobileHeader title="Reportes" />
    <ion-content :fullscreen="true" class="ion-padding">
      <header class="page-header">
        <p class="eyebrow">INFORMES Y ESTADISTICAS</p>
        <h1 class="title">Reportes</h1>
      </header>
    </ion-content>
  </ion-page>
</template>
