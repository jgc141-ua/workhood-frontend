<script setup>
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCountryPhoneStore } from '@/stores/countryPhoneStore'
import IconDropdown from './icons/IconDropdown.vue'

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

const isOpen = ref(false)

const flagUrl = (code) => `https://flagcdn.com/24x18/${code.toLowerCase()}.png`

const selectCountry = (country) => {
    countryPhoneStore.selectCountry(country)
    isOpen.value = false
    props.phoneData.phoneCode = country.phoneCode
    emit('field-input', 'phone')
}

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
                <div class="country-input" @click="isOpen = !isOpen">
                    <img :src="flagUrl(selectedCountry.code)" class="flag" />
                    <span class="code">{{ selectedCountry.phoneCode }}</span>
                    <IconDropdown :isOpen="isOpen" />
                </div>
                <div v-if="isOpen" class="dropdown" @click.stop>
                    <div v-for="country in countries" :key="country.code" class="option"
                        @click="selectCountry(country)">
                        <img :src="flagUrl(country.code)" class="flag" />
                        <span class="code">{{ country.phoneCode }}</span>
                    </div>
                </div>
            </div>
            <div class="input-wrap">
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
    align-items: stretch;
}

.input-wrap {
    flex: 1;
    min-width: 0;
}

.country-field {
    position: relative;
    text-align: center;
    border: 1px solid #ddd;
    border-radius: var(--radius-md);
    background: white;
}

.country-input {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
    height: 100%;
    border-radius: inherit;
}

.country-input:hover {
    background: #f8f9fa;
}

.flag {
    width: 20px;
    height: 15px;
    border-radius: 2px;
    object-fit: cover;
}

.code {
    font-weight: 600;
    font-size: 0.9rem;
    min-width: 40px;
}

.dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    max-height: 280px;
    overflow-y: auto;
    background: white;
    border: 1px solid #ddd;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 10;
}

.option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
    transition: background 0.2s;
    border-bottom: 1px solid #f5f5f5;
}

.option:hover {
    background: #f8f9fa;
}

.option .code {
    font-size: 0.9rem;
    font-weight: 600;
}
</style>
