import { toastController } from '@ionic/vue'

// Muestra un toast de Ionic con el mensaje y color indicados
export async function showToast(message, color = 'danger') {
  const toast = await toastController.create({
    message,
    duration: 5000,
    position: 'top',
    color,
  })
  await toast.present()
}
