import { toastController } from '@ionic/vue'

export async function showToast(message, color = 'danger') {
  const toast = await toastController.create({
    message,
    duration: 5000,
    position: 'top',
    color,
  })
  await toast.present()
}
