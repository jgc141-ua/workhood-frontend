import { watch } from 'vue'

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
      terms_date: overrides.user_legal?.terms_date ?? null,
      privacy: overrides.user_legal?.privacy ?? false,
      privacy_date: overrides.user_legal?.privacy_date ?? null,
      marketing: overrides.user_legal?.marketing ?? false,
      marketing_date: overrides.user_legal?.marketing_date ?? null,
    },
  }
}

export function createEmptyPhoneData() {
  return { phoneCode: '', phone: '' }
}

/* Parsea un numero completo (+34 600000000) en { phoneCode, phone } */
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

/* Actualiza las fechas ISO de consentimiento legal al marcar/desmarcar */
export function useLegalDates(form) {
  watch(
    () => form.value.user_legal.terms,
    (val) => {
      form.value.user_legal.terms_date = val ? new Date().toISOString() : null
    },
  )

  watch(
    () => form.value.user_legal.privacy,
    (val) => {
      form.value.user_legal.privacy_date = val ? new Date().toISOString() : null
    },
  )

  watch(
    () => form.value.user_legal.marketing,
    (val) => {
      form.value.user_legal.marketing_date = val ? new Date().toISOString() : null
    },
  )
}
