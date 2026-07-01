<script setup>
import { inject } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'
import RegisterForm from '@/components/forms/RegisterForm.vue'
import { useRouter } from 'vue-router'

const brand = inject('BRAND')
const auth = useAuthStore()

const router = useRouter()

async function handleRegister(formData) {
  const ok = await auth.register(formData)
  if (!ok) {
    const errs = auth.errors
    const message = errs?.email || errs?.register || 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.'
    showToast(message)
  }

  await router.push('/login')
}
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page page-auth">
        <div class="card-base auth-card auth-card-wide">
          <h2 class="heading-auth">Crear cuenta</h2>
          <span class="brand-auth">en {{ brand }}</span>
          <p class="sub-auth">Completa tus datos para acceder al espacio</p>

          <RegisterForm @submit="handleRegister" />

          <p class="sub-auth">
            ¿Ya tienes cuenta? <a href="/login" class="textLink">Inicia sesión</a>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.auth-card-wide {
  width: min(600px, 92vw);
}

@media (max-width: 600px) {
  .auth-card-wide {
    padding: 24px 20px;
    width: 100%;
  }
}
</style>