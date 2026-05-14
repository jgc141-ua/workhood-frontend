import { ref, watch } from 'vue'

// Composable para validar que un nombre no esté duplicado en una lista de items.
export function useDuplicateNameCheck(nameRef, itemsRef, message) {
  const error = ref('')

  // Limpia el error cuando el nombre cambia
  watch(nameRef, () => {
    error.value = ''
  })

  // Valida si el nombre objetivo ya existe en la lista, ignorando el nombre inicial
  function validate(targetName, initialName = '') {
    const target = targetName.toLowerCase()
    const initial = initialName.toLowerCase()

    const isDuplicate =
      target !== initial && itemsRef.value.some((item) => item.name.toLowerCase() === target)

    error.value = isDuplicate ? message : ''
    return !isDuplicate
  }

  return { error, validate }
}
