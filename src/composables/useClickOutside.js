import { onMounted, onUnmounted } from 'vue'

/**
 * Detecta clicks fuera de un elemento referenciado y ejecuta un callback.
 *
 * @param {import('vue').Ref<HTMLElement|null>} elementRef - Referencia al elemento.
 * @param {Function} callback - Función a ejecutar cuando se pulse fuera.
 */
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
