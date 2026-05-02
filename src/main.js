import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'

import App from './App.vue'
import router from './router'

// Estilos base de Ionic
import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/display.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'

const brand = 'Workhood'
document.title = brand

const app = createApp(App)
const pinia = createPinia()

app.provide('BRAND', brand)
app.provide('SUBTITLE', 'Coworking')
app.provide('CONTACT_EMAIL', 'legal@workhood.es')
app.provide(
  'ADDRESS',
  'Carr. de San Vicente del Raspeig, s/n, 03690 San Vicente del Raspeig, Alicante',
)

app.use(IonicVue)
app.use(pinia)
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})
