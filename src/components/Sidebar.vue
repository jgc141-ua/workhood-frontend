<script setup>
import { useRouter, useRoute } from 'vue-router'
import { menuController } from '@ionic/vue'
import { IonContent, IonList, IonItem, IonButton } from '@ionic/vue'
import IconBurger from '@/components/icons/IconBurguer.vue'
import IconDashboard from '@/components/icons/IconDashboard.vue'
import IconDashboardFilled from '@/components/icons/IconDashboardFilled.vue'
import IconBookings from '@/components/icons/IconBookings.vue'
import IconBookingsFilled from '@/components/icons/IconBookingsFilled.vue'
import IconMembers from '@/components/icons/IconMembers.vue'
import IconMembersFilled from '@/components/icons/IconMembersFilled.vue'
import IconReport from '@/components/icons/IconReport.vue'
import IconReportFilled from '@/components/icons/IconReportFilled.vue'
import IconLogout from '@/components/icons/IconLogout.vue'
import { useAuthStore } from '@/stores/authStore'
import { useMeStore } from '@/stores/meStore'
import IconProfile from '@/components/icons/IconProfile.vue'
import IconProfileFilled from '@/components/icons/IconProfileFilled.vue'

import { ref, computed, inject } from 'vue'

const route = useRoute()
const router = useRouter()

const isCollapsed = ref(true)
const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  emit('collapse-change', isCollapsed.value)
}

const emit = defineEmits(['collapse-change'])

// Detectamos si estamos en móvil para forzar el menú expandido
const isMobile = ref(window.innerWidth < 992)
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 992
})
const showText = computed(() => !isCollapsed.value || isMobile.value)

const closeMenu = async () => {
  await menuController.close('main-menu')
}

const meStore = useMeStore()
const auth = useAuthStore()

const items = computed(() => {
  const baseItems = [
    { label: 'Dashboard', to: '/', icon: IconDashboard, iconFilled: IconDashboardFilled },
    { label: 'Bookings', to: '/bookings', icon: IconBookings, iconFilled: IconBookingsFilled },
    { label: 'My profile', to: '/me', icon: IconProfile, iconFilled: IconProfileFilled },
  ]

  if (meStore.user?.role === 'ADMIN') {
    baseItems.splice(2, 0,
      { label: 'Members', to: '/members', icon: IconMembers, iconFilled: IconMembersFilled },
      { label: 'Reports', to: '/reports', icon: IconReport, iconFilled: IconReportFilled }
    )
  }

  return baseItems
})

const handleLogout = async () => {
  if (isMobile.value) await closeMenu()
  await auth.logout()
  router.push('/login')
}

const brand = inject('BRAND')
const subtitle = inject('SUBTITLE')
</script>

<template>
  <ion-content class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="brand">
      <div class="brand-icon-wrapper" @click="isMobile ? closeMenu() : toggleSidebar()">
        <IconBurger v-if="isCollapsed && !isMobile" class="burguerIcon" />
        <span v-else class="closeIcon">×</span>
      </div>
      <div class="brand-text" v-show="showText">
        <h1 class="title">{{ brand }}</h1>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
    </div>

    <ion-button class="primaryAction" expand="block">
      <span v-if="isCollapsed && !isMobile" class="primaryIcon">+</span>
      <span v-show="showText">New Booking</span>
    </ion-button>

    <ion-list lines="none" class="nav-list">
      <ion-item v-for="item in items" :key="item.label" :router-link="item.to" router-direction="root" detail="false"
        lines="none" :class="['link', { 'router-link-active': route.path === item.to }]"
        @click="isMobile && closeMenu()">
        <span class="linkIcon" aria-hidden="true">
          <component :is="route.path === item.to ? item.iconFilled : item.icon" />
        </span>
        <span class="linkLabel" v-show="showText">{{ item.label }}</span>
      </ion-item>
    </ion-list>

    <ion-item lines="none" class="link logout-link" @click="handleLogout">
      <span class="linkIcon" aria-hidden="true">
        <IconLogout />
      </span>
      <span class="linkLabel" v-show="showText">Logout</span>
    </ion-item>
  </ion-content>
</template>

<style scoped>
.sidebar {
  user-select: none;
  position: relative;
  width: 260px;
  height: 100%;
  --background: rgba(232, 232, 234, 0.82);
  --padding-start: 16px;
  --padding-end: 16px;
  --padding-top: 20px;
  --padding-bottom: max(20px, env(safe-area-inset-bottom));
  --offset-top: 0;
  --offset-bottom: 0;
  --overflow: hidden;
  color: #1a1c1e;
}

.sidebar::part(background) {
  backdrop-filter: blur(24px);
  box-shadow: 0 12px 32px rgba(26, 28, 30, 0.06);
}

.sidebar::part(scroll) {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.brand-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #003544, #004d61);
  box-shadow: 0 12px 32px rgba(26, 28, 30, 0.12);
  flex-shrink: 0;
  cursor: pointer;
}

.brand-icon-wrapper:hover {
  box-shadow: 0 16px 36px rgba(26, 28, 30, 0.18);
}

.brand-icon-wrapper:active {
  transform: scale(0.96);
}

.burguerIcon {
  width: 20px;
  height: 20px;
  color: #ffffff;
}

.closeIcon {
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
  user-select: none;
  display: grid;
  place-items: center;
  line-height: 1;
  height: 100%;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.3px;
}

.subtitle {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  opacity: 0.55;
  letter-spacing: 0.2px;
}

/* Botón principal */
.primaryAction {
  --background: linear-gradient(135deg, #003544, #004d61);
  --background-activated: linear-gradient(135deg, #003544, #004d61);
  --background-hover: linear-gradient(135deg, #004d61, #006c8f);
  --color: #fff;
  --border-radius: 14px;
  --box-shadow: 0 12px 32px rgba(26, 28, 30, 0.12);
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
  --margin-top: 0;
  --margin-bottom: 0;
  --margin-start: 0;
  --margin-end: 0;
  height: 44px;
  width: 100%;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: normal;
  transition:
    transform 0.2s ease,
    opacity 0.2s ease
}

.primaryAction:hover {
  opacity: 0.85;
}

.primaryAction:active {
  transform: scale(0.96);
}

.primaryAction::part(native) {
  padding: 0 14px;
}

.primaryIcon {
  font-size: 25px;
  line-height: 1;
  font-weight: 700;
  margin-right: 8px;
  margin-top: -4px;
}

/* Listas */
ion-list {
  background: transparent;
  padding: 0;
  margin: 0;
}

.nav-list,
.footer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logout-link {
  margin-top: auto;
}

/* Items de navegación */
ion-item.link {
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 44px;
  --background: transparent;
  --background-hover: rgba(255, 255, 255, 0.6);
  --background-activated: transparent;
  --color: #425466;
  --border-radius: 12px;
  --highlight-height: 0;
  --ripple-color: transparent;
  --detail-icon-color: transparent;
  --detail-icon-opacity: 0;

  display: flex;
  align-items: center;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

ion-item.link::part(native) {
  border-radius: 12px;
  padding: 0 14px;
  width: 100%;
  display: flex;
  align-items: center;
}

ion-item.link:hover {
  --color: #003544;
  --background: rgba(255, 255, 255, 0.6);
}

ion-item.link.router-link-active {
  --background: #fff;
  --color: #003544;
}

ion-item.link.router-link-active::part(native) {
  box-shadow: 0 10px 22px rgba(26, 28, 30, 0.05);
}

/* Contenedor del icono - cuadrado con padding simétrico */
.linkIcon {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 18px;
  margin-right: 12px;
  border-radius: 12px;
}

.linkLabel {
  font-size: 14px;
  font-weight: 500;
}

/* Estado colapsado */
.sidebar.collapsed {
  width: 72px;
  --padding-start: 14px;
  --padding-end: 14px;
  --padding-top: 20px;
  --padding-bottom: 20px;
}

.sidebar.collapsed::part(scroll) {
  align-items: center;
}

.sidebar.collapsed .brand {
  justify-content: center;
}

.sidebar.collapsed ion-item.link::part(native) {
  justify-content: center;
  padding: 0;
  width: 44px;
  height: 44px;
  margin: 0 auto;
}

.sidebar.collapsed .linkIcon {
  margin-right: 0;
}

.sidebar.collapsed ion-button.primaryAction {
  width: 44px;
  min-width: 44px;
}

.sidebar.collapsed ion-button.primaryAction::part(native) {
  justify-content: center;
  padding: 0;
}

.sidebar.collapsed .primaryIcon {
  margin-right: 0;
}

/* Responsive general del sidebar (solo móvil, cuando es overlay) */
@media (max-width: 991.98px) {
  .sidebar {
    width: calc(100vw - 20px);
    height: calc(100dvh - 20px);
    margin: 10px;
    --padding-start: 10px;
    --padding-end: 10px;
    --padding-top: 10px;
    --padding-bottom: max(10px, env(safe-area-inset-bottom));
    --overflow: hidden;
  }

  .sidebar.collapsed {
    width: calc(100vw - 20px);
    height: calc(100dvh - 20px);
    margin: 10px;
  }

  .sidebar::part(scroll) {
    gap: 8px;
  }

  .nav-list {
    gap: 2px;
  }

  .brand {
    padding: 2px 0;
  }

  .primaryAction {
    height: 40px;
    font-size: 13px;
  }

  .linkIcon {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }

  .linkLabel {
    font-size: 13px;
  }
}

/* Móvil: forzar menú expandido y botón de cerrar */
@media (max-width: 991.98px) {
  .close-btn {
    display: none;
  }

  .sidebar.collapsed {
    width: 260px;
    --padding-start: 16px;
    --padding-end: 16px;
    --padding-top: 20px;
    --padding-bottom: max(20px, env(safe-area-inset-bottom));
  }

  .sidebar.collapsed::part(scroll) {
    align-items: stretch;
  }

  .sidebar.collapsed .brand {
    justify-content: flex-start;
  }

  .sidebar.collapsed ion-item.link::part(native) {
    justify-content: flex-start;
    padding: 0 14px;
    width: 100%;
    height: auto;
    margin: 0;
  }

  .sidebar.collapsed .linkIcon {
    margin-right: 12px;
  }

  .sidebar.collapsed ion-button.primaryAction {
    width: 100%;
    min-width: 0;
  }

  .sidebar.collapsed ion-button.primaryAction::part(native) {
    justify-content: center;
    padding: 0 14px;
  }

  .sidebar.collapsed .primaryIcon {
    margin-right: 8px;
  }
}
</style>
