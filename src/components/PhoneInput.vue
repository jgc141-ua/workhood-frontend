<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCountryPhoneStore } from '@/stores/countryPhoneStore'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'

const props = defineProps({
    phoneData: {
        type: Object,
        required: true
    },
    touched: {
        type: Object,
        required: true,
    },
    errors: {
        type: Object,
        required: true,
    },
})

const emit = defineEmits(['field-blur', 'field-input'])

const countryPhoneStore = useCountryPhoneStore()
const { countries, selectedCountry } = storeToRefs(countryPhoneStore)

const flagUrl = (code) => `https://flagcdn.com/24x18/${code.toLowerCase()}.png`

const countryOptions = computed(() =>
    countries.value.map((country) => ({
        value: country.code,
        label: country.phoneCode,
        imgs: flagUrl(country.code)
    }))
)

const selectedCountryCode = computed({
    get: () => selectedCountry.value.code,
    set: (code) => {
        const country = countries.value.find((c) => c.code === code)
        if (!country) return

        countryPhoneStore.selectCountry(country)
        props.phoneData.phoneCode = country.phoneCode
        emit('field-input', 'phone')
    },
})

onMounted(async () => {
    await countryPhoneStore.fetchAllCountries()
})

watch(() => props.phoneData.phoneCode, (phoneCode) => {
    if (phoneCode?.trim()) {
        countryPhoneStore.selectCountryByPhoneCode(phoneCode)
    } else {
        props.phoneData.phoneCode = selectedCountry.value.phoneCode
    }
}, { immediate: true })
</script>

<template>
    <div class="field">
        <label for="phone">Teléfono</label>
        <div class="phone-field">
            <div class="country-field">
                <PrettyInputSelector class="phone-country-selector" v-model="selectedCountryCode"
                    :options="countryOptions" placeholder="País" search-placeholder="Buscar país..." />
            </div>
            <div class="input-wrap" style="height: 51px;">
                <input id="phone" v-model="phoneData.phone" type="tel" placeholder="600 000 000" required
                    @blur="emit('field-blur', 'phone')" @input="emit('field-input', 'phone')" />
            </div>
        </div>
        <div v-if="touched.phone && errors.phone" class="error-message">
            {{ errors.phone }}
        </div>
    </div>
</template>

<style scoped>
.phone-field {
    display: flex;
    flex-direction: row;
    gap: 10px;
    margin-bottom: -10px;
}

.phone-country-selector:deep(.selector-img-option) {
    margin-right: 15px;
}

.phone-country-selector:deep(.selector-option),
.phone-country-selector:deep(.selector-value) {
    font-weight: 600;
    font-size: 0.9rem;
    min-width: 40px;
}

.input-wrap {
    flex: 1;
    min-width: 0;
}

.country-field {
    flex: 0 0 auto;
    min-width: 130px;
    width: 130px;
}
</style>
