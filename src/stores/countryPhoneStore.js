import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCountryPhoneStore = defineStore('countryPhone', () => {
  const countries = ref([
    { code: 'ES', phoneCode: '+34' },
    { code: 'FR', phoneCode: '+33' },
    { code: 'DE', phoneCode: '+49' },
    { code: 'GB', phoneCode: '+44' },
    { code: 'US', phoneCode: '+1' },
    { code: 'IT', phoneCode: '+39' },
    { code: 'PT', phoneCode: '+351' },
  ])

  const selectedCountry = ref({ code: 'ES', phoneCode: '+34' })
  const isLoaded = ref(false)

  const CORRECTED_ROOTS = {
    AX: '+358',
    EH: '+212',
    KZ: '+7',
    RU: '+7',
    US: '+1',
    VA: '+379',
    SJ: '+47',
  }

  async function fetchAllCountries() {
    if (isLoaded.value) return

    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=cca2,idd')
      const data = await response.json()

      countries.value = data
        .filter((c) => c.cca2 && c.idd?.root)
        .map((c) => {
          const raw = c.idd.root + (c.idd.suffixes?.[0] || '')
          const code = c.cca2
          return { code, phoneCode: CORRECTED_ROOTS[code] || raw }
        })
        .sort((a, b) => a.code.localeCompare(b.code))

      // No forzar selectedCountry a ES para no sobreescribir la elección del usuario
    } catch (error) {
      console.error('Error al cargar la lista de países:', error)
    } finally {
      isLoaded.value = true
    }
  }

  function selectCountry(country) {
    selectedCountry.value = country
  }

  function selectCountryByPhoneCode(phoneCode) {
    if (!phoneCode) return

    let code = String(phoneCode).trim()
    if (!code.startsWith('+')) code = `+${code}`

    const found = countries.value.find(
      (c) => c.phoneCode === code || (c.phoneCode && c.phoneCode.startsWith(code)),
    )
    if (found) selectCountry(found)
  }

  return { countries, selectedCountry, isLoaded, fetchAllCountries, selectCountry, selectCountryByPhoneCode }
})
