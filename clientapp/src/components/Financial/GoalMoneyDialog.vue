<template>
    <v-dialog :model-value="!!goal" max-width="520" scrollable @update:model-value="v => { if (!v) $emit('close') }">
        <v-card v-if="goal" color="surface" rounded="lg">
            <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-5">Add money to {{ goal.name }}</v-card-title>
            <v-card-text class="px-5" style="max-height: 70vh">
                <template v-if="transfers.length">
                    <span class="label d-block mb-2">From a recent transfer</span>
                    <ul class="list mb-4">
                        <li v-for="t in transfers" :key="t.bankTransactionId" class="d-flex align-center ga-3 py-2">
                            <span class="font-mono text-caption text-subtle date">{{ shortDate(t.date) }}</span>
                            <span class="flex-grow-1 min-width-0 text-body-2">
                                <span class="d-block text-high-emphasis text-truncate">{{ t.name }}</span>
                                <span class="d-block font-mono text-caption text-subtle text-truncate">into {{ t.accountName }}</span>
                            </span>
                            <span class="font-mono text-body-2 text-high-emphasis">{{ money(t.amount) }}</span>
                            <v-btn size="small" variant="outlined" color="primary" class="text-none" :loading="busy === t.bankTransactionId" @click="useTransfer(t.bankTransactionId)">Count it</v-btn>
                        </li>
                    </ul>
                </template>

                <span class="label d-block mb-2">{{ transfers.length ? 'Or type an amount' : 'Amount' }}</span>
                <div class="grid">
                    <v-text-field v-model.number="amount" type="number" step="0.01" prefix="$" label="Amount" density="compact" variant="outlined" hide-details />
                    <v-text-field v-model="date" type="date" label="Date" density="compact" variant="outlined" hide-details />
                    <v-text-field v-model="note" label="Note (optional)" density="compact" variant="outlined" hide-details class="span-2" />
                </div>
                <p class="text-caption text-subtle mt-2 mb-0">Use a negative amount when money comes out, like paying the bill.</p>
                <p v-if="error" class="text-caption text-error mt-3 mb-0" role="alert">{{ error }}</p>
            </v-card-text>
            <v-card-actions class="px-5 pb-4">
                <v-spacer />
                <v-btn variant="text" class="text-none" @click="$emit('close')">Cancel</v-btn>
                <v-btn color="primary" variant="flat" class="text-none" :disabled="!amount" :loading="busy === 'manual'" @click="addManual">Add</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGoalsStore } from '@/store/goals'
import { localToday } from '@/services/budget.service'
import type { Goal } from '@/services/goal.service'
import { money, shortDate } from '@/composables/budgetFormat'

const props = defineProps<{ goal: Goal | null }>()
const emit = defineEmits<{ close: [] }>()

const store = useGoalsStore()
const amount = ref<number | null>(null)
const date = ref(localToday())
const note = ref('')
const busy = ref<number | 'manual' | null>(null)
const error = ref<string | null>(null)

watch(() => props.goal, () => {
    amount.value = props.goal ? Math.max(0, props.goal.requiredMonthly - props.goal.contributedThisMonth) || null : null
    date.value = localToday()
    note.value = ''
    error.value = null
})

/** Transfers into the goal's own account first */
const transfers = computed(() => {
    const list = store.data?.transfers ?? []
    const linked = props.goal?.linkedAccountName
    return [...list].sort((a, b) => Number(b.accountName === linked) - Number(a.accountName === linked)).slice(0, 6)
})

async function finish (result: string | null) {
    busy.value = null
    error.value = result
    if (!result) emit('close')
}

async function useTransfer (id: number) {
    busy.value = id
    await finish(await store.addContribution({ savingsGoalId: props.goal!.savingsGoalId, bankTransactionId: id }))
}

async function addManual () {
    busy.value = 'manual'
    await finish(await store.addContribution({ savingsGoalId: props.goal!.savingsGoalId, amount: Number(amount.value), date: date.value, note: note.value || null }))
}
</script>

<style scoped>
.label {
    font-family: var(--font-mono, monospace);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgb(var(--v-theme-subtle));
}

.list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.list > li + li {
    border-top: 1px solid rgb(var(--v-theme-border));
}

.date {
    width: 48px;
    flex: none;
}

.min-width-0 {
    min-width: 0;
}

.grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.span-2 {
    grid-column: 1 / -1;
}
</style>
