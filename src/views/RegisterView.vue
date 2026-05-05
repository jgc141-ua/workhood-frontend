<script setup>
import { inject } from 'vue'
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'
import RegisterForm from '@/components/forms/RegisterForm.vue'

const brand = inject('BRAND')
const auth = useAuthStore()

async function handleRegister(formData) {
  const ok = await auth.register(formData)
  if (!ok) {
    showToast(auth.errors.register || 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.')
  }
}
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page page-auth">
        <div class="card-base auth-card auth-card-wide">
          <template v-if="auth.success">
            <h2 class="heading-auth">Solicitud enviada</h2>
            <br>
            <p class="sub-auth">
              Tu cuenta está <strong>pendiente de aprobación</strong>.
              <br />
              {{ brand }} revisará tu solicitud y recibirás un email de confirmación.
            </p>
            <ion-button href="/login" class="btn-primary" expand="block">
              Volver al inicio de sesión
            </ion-button>
          </template>

          <template v-else>
            <h2 class="heading-auth">Crear cuenta</h2>
            <span class="brand-auth">en {{ brand }}</span>
            <p class="sub-auth">Completa tus datos para solicitar acceso al espacio</p>

            <RegisterForm @submit="handleRegister" />

            <p class="sub-auth">
              ¿Ya tienes cuenta? <a href="/login" class="textLink">Inicia sesión</a>
            </p>
          </template>
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