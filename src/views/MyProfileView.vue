<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { IonPage, IonContent, IonButton } from '@ionic/vue'
import { useMeStore } from '@/stores/meStore'
import { useCountryPhoneStore } from '@/stores/countryPhoneStore'
import { showToast } from '@/composables/toast'
import PersonalForm from '@/components/forms/PersonalForm.vue'
import AddressForm from '@/components/forms/AddressForm.vue'
import PasswordForm from '@/components/forms/PasswordForm.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'
import MobileHeader from '@/components/MobileHeader.vue'
import IconDropdown from '@/assets/icons/IconDropdown.vue'
import {
    createEmptyForm,
    createEmptyPhoneData,
    parseUserPhone,
    useBillingSync,
} from '@/composables/userForm'

// Stores
const meStore = useMeStore()
const countryPhoneStore = useCountryPhoneStore()

// Estados
const personalRef = ref(null)
const addressRef = ref(null)
const billingRef = ref(null)
const passwordRef = ref(null)

const isPersonalValid = ref(false)
const isAddressValid = ref(false)
const isBillingAddressValid = ref(true)
const isPasswordValid = ref(true)


const isDataReady = ref(false)
const notData = ref(false)
const isSaving = ref(false)
const openSections = ref(new Set(['']))
const originalSnapshot = ref('')

// Formulario
const form = ref(createEmptyForm())
const phoneData = ref(createEmptyPhoneData())

// Sincronizar dirección de facturación
useBillingSync(form)

// Helpers
function buildPayload() {
    const payload = {
        email: form.value.email,
        first_name: form.value.first_name,
        last_name: form.value.last_name,
        phone: phoneData.value.phoneCode + ' ' + phoneData.value.phone.trim(),
        nif_cif: form.value.nif_cif,
        address: { ...form.value.address },
        billing_same_as_address: form.value.billing_same_as_address,
        user_legal: {
            marketing: form.value.user_legal.marketing,
        },
    }

    if (form.value.billing_same_as_address) {
        payload.billing_address = payload.address
    } else {
        payload.billing_address = { ...form.value.billing_address }
    }

    if (form.value.password?.trim()) {
        payload.password = form.value.password
        payload.password_confirm = form.value.password_confirm
    }

    return payload
}

function buildSnapshot() {
    const payload = buildPayload()
    delete payload.password
    delete payload.password_confirm
    return payload
}

// Cargar datos del usuario
async function loadUserData() {
    let u = meStore.user

    if (!u) return

    if (!u.email) {
        try {
            await meStore.fetchMe()
            u = meStore.user
        } catch {
            notData.value = true
            return
        }
    }

    form.value = createEmptyForm(u)

    const parsed = parseUserPhone(u.phone)
    phoneData.value = parsed

    await countryPhoneStore.fetchAllCountries()
    countryPhoneStore.selectCountryByPhoneCode(parsed.phoneCode)

    isDataReady.value = true
    originalSnapshot.value = JSON.stringify(buildSnapshot())

    await nextTick()
    personalRef.value?.verifyValidity()
    addressRef.value?.verifyValidity()
    if (!form.value.billing_same_as_address) {
        billingRef.value?.verifyValidity()
    }
    passwordRef.value?.verifyValidity()
}

watch(() => meStore.user, loadUserData, { immediate: true })

// Verificaciones
const isFormValid = computed(() => {
    const billingOk = form.value.billing_same_as_address || isBillingAddressValid.value
    return isPersonalValid.value && isAddressValid.value && isPasswordValid.value && billingOk
})

const hasChanges = computed(() => {
    if (form.value.password?.trim()) return true
    return JSON.stringify(buildSnapshot()) !== originalSnapshot.value
})

// Secciones
function toggleSection(key) {
    const next = new Set(openSections.value)
    if (next.has(key)) {
        next.delete(key)
    } else {
        next.add(key)
    }
    openSections.value = next
}

function isOpen(key) {
    return openSections.value.has(key)
}

// Guardar
async function handleSave() {
    if (!isFormValid.value) {
        showToast('Revisa los campos marcados antes de guardar.')
        return
    }

    if (!hasChanges.value) {
        showToast('No hay cambios para guardar.')
        return
    }

    isSaving.value = true
    try {
        await meStore.updateProfile(buildPayload())
        showToast('Perfil actualizado correctamente.', 'success')
        form.value.password = ''
        form.value.password_confirm = ''
        isPasswordValid.value = true
        originalSnapshot.value = JSON.stringify(buildSnapshot())
    } catch (err) {
        showToast(err.message || 'Error de red. Por favor, intentalo de nuevo mas tarde.')
    } finally {
        isSaving.value = false
    }
}
</script>

<template>
    <ion-page>
        <MobileHeader title="Mi perfil" />

        <ion-content :fullscreen="true" class="ion-padding">
            <div class="profile">
                <!-- Cabecera de la página -->
                <header class="page-header">
                    <p class="eyebrow">TU CUENTA</p>
                    <h1 class="title">Mi perfil</h1>
                </header>

                <!-- Formulario del perfil cargado -->
                <div v-if="isDataReady">
                    <div class="profile-grid">
                        <!-- Datos personales -->
                        <section class="card profile-section">
                            <button type="button" class="section-header" :class="{ 'is-open': isOpen('personal') }"
                                @click="toggleSection('personal')">
                                <h3 class="section-title">Datos personales</h3>
                                <IconDropdown :isOpen="isOpen('personal')" />
                            </button>
                            <div class="section-body" :class="{ 'is-open': isOpen('personal') }">
                                <div class="section-body-inner">
                                    <PersonalForm ref="personalRef" :form="form" :phoneData="phoneData"
                                        @isValid="isPersonalValid = $event" />
                                </div>
                            </div>
                        </section>

                        <!-- Seguridad -->
                        <section class="card profile-section">
                            <button type="button" class="section-header" :class="{ 'is-open': isOpen('security') }"
                                @click="toggleSection('security')">
                                <h3 class="section-title">Seguridad</h3>
                                <IconDropdown :isOpen="isOpen('security')" />
                            </button>
                            <div class="section-body" :class="{ 'is-open': isOpen('security') }">
                                <div class="section-body-inner">
                                    <PasswordForm ref="passwordRef" :form="form" :optional="true"
                                        @isValid="isPasswordValid = $event" />
                                    <p class="profile-hint">
                                        Deja los campos en blanco si no deseas cambiar la contrasena.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <!-- Direccion -->
                        <section class="card profile-section">
                            <button type="button" class="section-header" :class="{ 'is-open': isOpen('address') }"
                                @click="toggleSection('address')">
                                <h3 class="section-title">Direccion</h3>
                                <IconDropdown :isOpen="isOpen('address')" />
                            </button>
                            <div class="section-body" :class="{ 'is-open': isOpen('address') }">
                                <div class="section-body-inner">
                                    <AddressForm ref="addressRef" :form="form.address" title=""
                                        @isValid="isAddressValid = $event" />
                                </div>
                            </div>
                        </section>

                        <!-- Direccion de facturacion -->
                        <section class="card profile-section">
                            <button type="button" class="section-header"
                                :class="{ 'is-open': isOpen('billing_address') }"
                                @click="toggleSection('billing_address')">
                                <h3 class="section-title">Direccion de facturacion</h3>
                                <IconDropdown :isOpen="isOpen('billing_address')" />
                            </button>
                            <div class="section-body" :class="{ 'is-open': isOpen('billing_address') }">
                                <div class="section-body-inner">
                                    <PrettyCheckbox v-model="form.billing_same_as_address"
                                        text="La direccion de facturacion es la misma que la direccion personal" />
                                    <transition name="slide-down">
                                        <AddressForm ref="billingRef" v-if="!form.billing_same_as_address"
                                            :form="form.billing_address" title=""
                                            @isValid="isBillingAddressValid = $event" />
                                    </transition>
                                </div>
                            </div>
                        </section>

                        <!-- Preferencias -->
                        <section class="card profile-section">
                            <button type="button" class="section-header" :class="{ 'is-open': isOpen('preferences') }"
                                @click="toggleSection('preferences')">
                                <h3 class="section-title">Preferencias</h3>
                                <IconDropdown :isOpen="isOpen('preferences')" />
                            </button>
                            <div class="section-body" :class="{ 'is-open': isOpen('preferences') }">
                                <div class="section-body-inner">
                                    <PrettyCheckbox v-model="form.user_legal.marketing"
                                        text="Acepto recibir comunicaciones comerciales" />
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Botón de guardado -->
                    <div class="profile-actions">
                        <ion-button class="btn-primary" style="margin-top: var(--space-6);" expand="block"
                            :disabled="!isFormValid || !hasChanges || isSaving" @click="handleSave">
                            Guardar cambios
                        </ion-button>
                    </div>
                </div>

                <!-- Estados de carga y error -->
                <div class="server-state" v-else-if="!notData">
                    Cargando mi perfil...
                </div>

                <div class="server-state" v-else>
                    Error con el servidor
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<style scoped>
/* Layout del perfil */
.profile {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding-bottom: var(--space-8);
}

/* Grid de secciones */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
  align-items: start;
}

/* Tarjeta de sección plegable */
.profile-section {
  overflow-x: hidden;
  max-width: 100%;
  padding: var(--space-4) var(--space-6);
}

.profile-section * {
  max-width: 100%;
  box-sizing: border-box;

}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2) 0;
  background: none;
  border: none;
  cursor: pointer;
}

.section-header .section-title {
  margin: 0;
  font-size: 1.05rem;
}

.section-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s ease;
}

.section-body.is-open {
  grid-template-rows: 1fr;
}

.section-body-inner {
  overflow: hidden;
}

/* Ajuste de formularios anidados */
.profile-section :deep(.step) {
  max-width: none;
  margin: 0;
}

.profile-section :deep(.address-form) {
  max-width: none;
  margin: 0;
}

.profile-hint {
  margin: var(--space-2) 0 0;
  color: #6b7280;
  font-size: 0.8rem;
}

/* Acciones del perfil */
.profile-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

/* Transición de despliegue */
.slide-down-enter-active,
.slide-down-leave-active {
  overflow: hidden;
  transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 600px;
  opacity: 1;
}

/* Responsive */
@media (max-width: 1024px) {
    .profile-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 600px) {
    .profile {
        gap: var(--space-4);
    }

    .profile-grid {
        gap: var(--space-4);
    }

    .profile-section {
        padding: var(--space-3) var(--space-4);
    }

    .profile-actions {
        flex-direction: column;
        align-items: stretch;
    }
}

@media (max-width: 991.98px) {
    .page-header {
        display: none;
    }
}
</style>
