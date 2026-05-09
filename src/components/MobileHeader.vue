<script setup>
import { menuController } from '@ionic/vue'
import IconBurger from '@/assets/icons/IconBurguer.vue'

defineProps({
  title: {
    type: String,
    default: '',
  },
})

const openMenu = async () => {
  await menuController.open('main-menu')
}
</script>

<template>
  <header class="mobile-header">
    <div class="brand-icon-wrapper" @click="openMenu">
      <IconBurger class="burguerIcon" />
    </div>
    <h1 class="page-title">{{ title }}</h1>
  </header>
</template>

<style scoped>
.mobile-header {
  display: none;
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 12px 20px;
  background: rgba(249, 249, 252, 0.92);
  backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--outline-variant);
  align-items: center;
  gap: 12px;
}

.brand-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #003544, #004d61);
  box-shadow: 0 8px 24px rgba(26, 28, 30, 0.12);
  flex-shrink: 0;
  cursor: pointer;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.brand-icon-wrapper:hover {
  box-shadow: 0 12px 28px rgba(26, 28, 30, 0.18);
}

.brand-icon-wrapper:active {
  transform: scale(0.96);
}

.burguerIcon {
  width: 18px;
  height: 18px;
  color: #ffffff;
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: #003544;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

@media (max-width: 991.98px) {
  .mobile-header {
    display: flex;
  }
}
</style>
