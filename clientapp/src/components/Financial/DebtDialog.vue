<template>
    <v-dialog :model-value="!!debt" max-width="560" scrollable @update:model-value="v => { if (!v) $emit('close') }">
        <v-card v-if="draft" color="surface" rounded="lg">
            <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-5">{{ draft.debtId ? draft.name : 'Add a debt' }}</v-card-title>
            <v-card-text class="px-5">
                <p v-if="draft.source === 'Linked'" class="text-body-2 text-muted mb-4">
                    The balance comes from {{ draft.detail ?? 'your bank' }} each time it syncs. The bank doesn’t share the APR or minimum, so enter them from your statement.
                </p>

                <div class="grid">
                    <v-text-field v-if="draft.source === 'Manual'" v-model="draft.name" label="Name" density="compact" variant="outlined" hide-details class="span-2" />
                    <v-text-field v-if="draft.source === 'Manual'" v-model.number="draft.balance" type="number" step="0.01" prefix="$" label="Balance owed" density="compact" variant="outlined" hide-details />
                    <v-text-field v-model.number="draft.apr" type="number" step="0.01" suffix="%" label="APR" density="compact" variant="outlined" hide-details />
                    <v-text-field v-model.number="draft.minimumPayment" type="number" step="1" prefix="$" label="Minimum payment" density="compact" variant="outlined" hide-details />
                    <v-text-field v-model.number="draft.dueDay" type="number" min="1" max="31" label="Due day (optional)" density="compact" variant="outlined" hide-details />
                </div>

                <v-checkbox v-model="hasPromo" density="compact" hide-details color="primary" class="mt-3" label="There’s a promotional rate" />
                <div v-if="hasPromo" class="grid mt-2">
                    <v-text-field v-model.number="draft.promoApr" type="number" step="0.01" suffix="%" label="Promo APR" density="compact" variant="outlined" hide-details />
                    <v-text-field v-model="draft.promoEndsOn" type="date" label="Promo ends" density="compact" variant="outlined" hide-details />
                    <v-checkbox v-model="draft.isDeferredInterest" density="compact" hide-details color="primary" class="span-2"
                        label="Deferred interest (unpaid balances are charged interest back to the start)" />
                </div>

                <v-checkbox v-if="draft.source === 'Linked'" v-model="draft.isActive" density="compact" hide-details color="primary" class="mt-2"
                    label="Include in the payoff plan" />

                <p v-if="error" class="text-caption text-error mt-3 mb-0" role="alert">{{ error }}</p>
            </v-card-text>
            <v-card-actions class="px-5 pb-4">
                <v-btn v-if="draft.source === 'Manual' && draft.debtId" variant="text" color="error" class="text-none" @click="remove">Delete</v-btn>
                <v-spacer />
                <v-btn variant="text" class="text-none" @click="$emit('close')">Cancel</v-btn>
                <v-btn color="primary" variant="flat" class="text-none" :loading="busy" @click="save">Save</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDebtStore } from '@/store/debt'
import type { Debt } from '@/services/debt.service'

const props = defineProps<{ debt: Partial<Debt> | null }>()
const emit = defineEmits<{ close: [] }>()

const store = useDebtStore()
const draft = ref<Partial<Debt> | null>(null)
const hasPromo = ref(false)
const busy = ref(false)
const error = ref<string | null>(null)

watch(() => props.debt, d => {
    draft.value = d ? { source: 'Manual', isActive: true, apr: 0, minimumPayment: 0, ...d } : null
    hasPromo.value = d?.promoApr != null
    error.value = null
}, { immediate: true })

async function save () {
    const d = { ...draft.value! }
    if (!hasPromo.value) {
        d.promoApr = null
        d.promoEndsOn = null
        d.isDeferredInterest = false
    }
    if (!d.dueDay) d.dueDay = null
    busy.value = true
    error.value = await store.saveDebt(d)
    busy.value = false
    if (!error.value) emit('close')
}

async function remove () {
    await store.removeDebt(draft.value!.debtId!)
    emit('close')
}
</script>

<style scoped>
.grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.span-2 {
    grid-column: 1 / -1;
}

@media (max-width: 520px) {
    .grid {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
