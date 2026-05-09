import { onMounted, onUnmounted } from 'vue'

// Detecta clicks fuera de un elemento referenciado y ejecuta un callback.
export function useClickOutside(elementRef, callback) {
  function handleClick(event) {
    if (elementRef.value && !elementRef.value.contains(event.target)) {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClick)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClick)
  })
}
