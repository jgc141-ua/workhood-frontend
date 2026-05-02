<script setup>
import { ref, inject } from 'vue'
import { IonPage, IonSplitPane, IonMenu, IonRouterOutlet } from '@ionic/vue'
import Sidebar from '@/components/Sidebar.vue'

const brand = inject('BRAND')
const subtitle = inject('SUBTITLE')

const isSidebarCollapsed = ref(true)
</script>

<template>
  <ion-page>
    <ion-split-pane content-id="main-content" when="lg" :class="{ 'menu-collapsed': isSidebarCollapsed }">
      <ion-menu content-id="main-content" side="start" menu-id="main-menu" type="overlay">
        <Sidebar :brand="brand" :subtitle="subtitle" @collapse-change="isSidebarCollapsed = $event" />
      </ion-menu>

      <div id="main-content">
        <ion-router-outlet />
      </div>
    </ion-split-pane>
  </ion-page>
</template>

<style scoped>
ion-split-pane {
  --side-width: 260px;
  --side-min-width: 72px;
  --side-max-width: 260px;
  --background: #f9f9fc;
}

ion-split-pane.menu-collapsed {
  --side-width: 72px;
  --side-min-width: 72px;
  --side-max-width: 72px;
}

ion-menu {
  --background: transparent;
  --width: 260px;
  --min-width: 72px;
}

ion-split-pane.menu-collapsed ion-menu {
  --width: 72px;
  --min-width: 72px;
}

#main-content {
  position: relative;
  width: 100%;
  height: 100%;
  background: #f9f9fc;
}

/* En móvil forzar menú overlay siempre ancho completo */
@media (max-width: 991.98px) {
  ion-split-pane ion-menu,
  ion-split-pane.menu-collapsed ion-menu {
    --width: 260px;
    --min-width: 260px;
    height: 100dvh;
  }

  ion-menu::part(container) {
    height: 100dvh;
  }
}
</style>
