<script setup>
import { IonModal, IonHeader, IonToolbar, IonFooter } from '@ionic/vue'

defineProps({
    show: { type: Boolean, default: false },
    title: { type: String, default: '' },
})

defineEmits(['close', 'after-close'])
</script>

<template>
    <ion-modal :is-open="show" @did-dismiss="$emit('after-close')" class="app-modal">
        <div class="card-base app-modal-box">
            <ion-header class="ion-no-border">
                <ion-toolbar>
                    <div class="row-between app-modal-head">
                        <h2 v-if="title" class="app-modal-title">{{ title }}</h2>
                        <button class="app-modal-close" @click="$emit('close')" aria-label="Cerrar modal">✕</button>
                    </div>
                </ion-toolbar>
            </ion-header>

            <div class="app-modal-body">
                <slot />
            </div>

            <ion-footer v-if="$slots.footer" class="ion-no-border">
                <div class="app-modal-footer">
                    <slot name="footer" />
                </div>
            </ion-footer>
        </div>
    </ion-modal>
</template>

<style>
ion-modal.app-modal {
    --width: min(600px, 92vw);
    --height: unset;
    --max-height: min(85vh, 600px);
    --background: transparent;
    --box-shadow: none;
}

ion-modal.app-modal::part(backdrop) {
    background: rgba(17, 24, 39, 0.48);
}

ion-modal.app-modal::part(content) {
    background: transparent;
    box-shadow: none;
    overflow: visible;
}

ion-modal.app-modal .ion-page {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-4);
    background: transparent;
}

ion-modal.app-modal ion-toolbar,
ion-modal.app-modal ion-header,
ion-modal.app-modal ion-footer {
    --background: transparent;
    --border-width: 0;
    background: transparent;
}

.app-modal-box {
    width: min(600px, 92vw);
    max-height: min(85vh, 600px);
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
    overflow: hidden;
}

.app-modal-head {
    margin-bottom: 0;
    padding: var(--space-4);
    border-bottom: 1px solid var(--outline-variant);
}

.app-modal-title {
    margin: 0;
    text-align: left;
}

.app-modal-close {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #e5e7eb;
    color: #6b7280;
    display: grid;
    place-items: center;
    font-size: 0.9rem;
    font-weight: 700;
    flex-shrink: 0;
}

.app-modal-body {
    padding: var(--space-4);
    overflow-y: auto;
    background: var(--surface-container-lowest);
}

.app-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding: var(--space-4);
    border-top: 1px solid var(--outline-variant);
    background: var(--surface-container-lowest);
}

@media (max-width: 600px) {
    .app-modal-box {
        width: 100%;
    }

    .app-modal-head,
    .app-modal-body,
    .app-modal-footer {
        padding: 20px;
    }
}
</style>
