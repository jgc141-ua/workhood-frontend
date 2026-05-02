<script setup>
import { reactive, inject } from 'vue'
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'
import { showToast } from '@/composables/toast'

const brand = inject('BRAND')
const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', password: '', remember: false })

async function handleLogin() {
  const ok = await auth.login(form.email, form.password, form.remember)
  if (ok) {
    router.push('/')
  } else {
    showToast(auth.errors.login || 'Credenciales incorrectas. Por favor, inténtalo de nuevo.')
  }
}
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page page-auth">
        <div class="card-base auth-card">
          <h2 class="heading-auth">Bienvenido</h2>
          <span class="brand-auth">a {{ brand }}</span>
          <p class="sub-auth">Inicia sesión para acceder a tu panel de control</p>

          <form @submit.prevent="handleLogin">
            <div class="field">
              <label for="email">Email</label>
              <div class="input-wrap">
                <input id="email" v-model="form.email" type="email" placeholder="nombre@email.com" />
              </div>
            </div>

            <div class="field">
              <label for="password">Contraseña</label>
              <div class="input-wrap">
                <input id="password" v-model="form.password" type="password" placeholder="••••••••" />
              </div>
            </div>

            <PrettyCheckbox v-model="form.remember" text="Recordarme" />

            <ion-button type="submit" class="btn-primary" expand="block" :disabled="auth.loading">
              {{ auth.loading ? 'Iniciando sesión…' : 'Iniciar sesión' }}
            </ion-button>
          </form>

          <p class="sub-auth">
            ¿No tienes una cuenta? <a href="/register" class="textLink">Regístrate</a>
            <br />
            ¿Has olvidado tu contraseña? <a href="/forgot-password" class="textLink">Recupera tu contraseña</a>
          </p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
