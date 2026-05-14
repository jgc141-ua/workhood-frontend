import { watch } from 'vue'

// Crea un objeto de formulario de usuario con valores por defecto
export function createEmptyForm(overrides = {}) {
  return {
    email: overrides.email ?? '',
    first_name: overrides.first_name ?? '',
    last_name: overrides.last_name ?? '',
    phone: overrides.phone ?? '',
    nif_cif: overrides.nif_cif ?? '',
    password: overrides.password ?? '',
    password_confirm: overrides.password_confirm ?? '',
    address: {
      street: overrides.address?.street ?? '',
      city: overrides.address?.city ?? '',
      state: overrides.address?.state ?? '',
      postal_code: overrides.address?.postal_code ?? '',
      country: overrides.address?.country ?? '',
    },
    billing_same_as_address:
      overrides.billing_same_as_address ?? overrides.billing_address === undefined,
    billing_address: {
      street: overrides.billing_address?.street ?? '',
      city: overrides.billing_address?.city ?? '',
      state: overrides.billing_address?.state ?? '',
      postal_code: overrides.billing_address?.postal_code ?? '',
      country: overrides.billing_address?.country ?? '',
    },
    user_legal: {
      terms: overrides.user_legal?.terms ?? false,
      privacy: overrides.user_legal?.privacy ?? false,
      marketing: overrides.user_legal?.marketing ?? false,
    },
  }
}

// Crea el objeto vacío para el prefijo y número de teléfono
export function createEmptyPhoneData() {
  return { phoneCode: '', phone: '' }
}

/* Parsea un numero completo (+34 600000000) en { phoneCode, phone } */
// Separa el prefijo internacional del resto del número
export function parseUserPhone(phone) {
  if (!phone) return { phoneCode: '+34', phone: '' }
  if (phone.startsWith('+')) {
    const splitPhone = phone.split(' ')
    return {
      phoneCode: splitPhone[0],
      phone: splitPhone[1].trim(),
    }
  }
  return { phoneCode: '+34', phone }
}

/* Sincroniza billing_address con address cuando el checkbox esta activo */
// Mantiene la dirección de facturación igual a la dirección personal cuando está activo
export function useBillingSync(form) {
  watch(
    () => form.value.billing_same_as_address,
    (val) => {
      if (val) {
        form.value.billing_address = { ...form.value.address }
      }
    },
  )

  watch(
    () => form.value.address,
    () => {
      if (form.value.billing_same_as_address) {
        form.value.billing_address = { ...form.value.address }
      }
    },
    { deep: true },
  )
}
