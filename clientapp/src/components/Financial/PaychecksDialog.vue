<template>
    <v-dialog :model-value="open" max-width="600" scrollable @update:model-value="v => { if (!v) $emit('close') }">
        <v-card color="surface" rounded="lg">
            <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-5">Income</v-card-title>
            <v-card-text class="px-5" style="max-height: 70vh">
                <p class="text-body-2 text-muted mb-4">
                    Paychecks count in the month of their payday. Ones still to come count at their usual amount.
                </p>

                <span class="label d-block mb-2">Paychecks</span>
                <p v-if="!store.streams.length" class="text-body-2 text-subtle mb-4">None yet. Paychecks show up here once a few have arrived.</p>
                <ul class="list mb-4">
                    <li v-for="s in store.streams" :key="s.incomeStreamId" class="py-3">
                        <template v-if="editing?.incomeStreamId === s.incomeStreamId">
                            <div class="edit-grid">
                                <v-text-field v-model="editing.name" label="Name" density="compact" variant="outlined" hide-details />
                                <v-select v-model="editing.frequency" :items="frequencies" label="How often" density="compact" variant="outlined" hide-details />
                                <v-text-field v-model="editing.anchorDate" type="date" label="A recent payday" density="compact" variant="outlined" hide-details />
                                <v-text-field v-model.number="editing.expectedAmount" type="number" step="0.01" prefix="$" label="Usual take-home" density="compact" variant="outlined" hide-details />
                            </div>
                            <div class="d-flex ga-2 mt-3">
                                <v-btn size="small" color="primary" variant="flat" class="text-none" :loading="busy" @click="save(editing)">Save</v-btn>
                                <v-btn size="small" variant="text" class="text-none" @click="editing = null">Cancel</v-btn>
                            </div>
                        </template>
                        <div v-else class="d-flex align-center ga-3">
                            <v-icon class="text-subtle">mdi-cash-plus</v-icon>
                            <div class="flex-grow-1 min-width-0">
                                <span class="d-block text-body-2 text-high-emphasis text-truncate">{{ s.name }}</span>
                                <span class="d-block font-mono text-caption text-subtle">
                                    {{ frequencyLabel[s.frequency] }}<template v-if="s.nextPayday"> · next {{ dayDate(s.nextPayday) }}</template>
                                </span>
                            </div>
                            <span class="font-mono text-body-2 text-high-emphasis">{{ money(s.expectedAmount) }}</span>
                            <v-btn icon="mdi-pencil-outline" variant="text" size="small" :aria-label="`Edit ${s.name}`" @click="editing = { ...s }" />
                            <v-btn icon="mdi-close" variant="text" size="small" :aria-label="`Stop counting ${s.name}`" @click="store.removeStream(s.incomeStreamId)" />
                        </div>
                    </li>
                </ul>

                <template v-if="store.proposals.length">
                    <span class="label d-block mb-2">Found in your deposits</span>
                    <ul class="list mb-4">
                        <li v-for="p in store.proposals" :key="p.merchantKey" class="d-flex align-center ga-3 py-3">
                            <v-icon class="text-subtle">mdi-help-circle-outline</v-icon>
                            <div class="flex-grow-1 min-width-0">
                                <span class="d-block text-body-2 text-high-emphasis text-truncate">{{ p.name }}</span>
                                <span class="d-block font-mono text-caption text-subtle">{{ frequencyLabel[p.frequency] }} · {{ p.deposits }} deposits · about {{ money(p.expectedAmount) }}</span>
                            </div>
                            <v-btn size="small" variant="outlined" color="primary" class="text-none" prepend-icon="mdi-plus" :loading="busy" @click="save(p)">Count it</v-btn>
                        </li>
                    </ul>
                </template>

                <span class="label d-block mb-2">{{ monthTitle }}</span>
                <v-checkbox v-model="useOverride" density="compact" hide-details color="primary" label="Type in this month’s income instead" />
                <div v-if="useOverride" class="d-flex ga-2 mt-2">
                    <v-text-field v-model.number="override" type="number" step="0.01" prefix="$" density="compact" variant="outlined" hide-details aria-label="This month’s income" />
                    <v-btn color="primary" variant="flat" class="text-none" :loading="busy" @click="saveOverride(override)">Save</v-btn>
                </div>

                <p v-if="error" class="text-caption text-error mt-3" role="alert">{{ error }}</p>
            </v-card-text>
            <v-card-actions class="justify-end">
                <v-btn variant="text" class="text-none" @click="$emit('close')">Done</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBudgetStore } from '@/store/budget'
import type { IncomeStream, PayFrequency } from '@/services/budget.service'
import { dayDate, money, monthName } from '@/composables/budgetFormat'

const props = defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const store = useBudgetStore()
const editing = ref<IncomeStream | null>(null)
const busy = ref(false)
const error = ref<string | null>(null)
const useOverride = ref(false)
const override = ref<number | null>(null)

const frequencyLabel: Record<PayFrequency, string> = { Weekly: 'Every week', Biweekly: 'Every 2 weeks', Semimonthly: 'Twice a month', Monthly: 'Monthly' }
const frequencies = Object.entries(frequencyLabel).map(([value, title]) => ({ value, title }))

const monthTitle = computed(() => `${monthName(store.month)} ${store.year}`)

watch(() => props.open, open => {
    if (!open) return
    store.fetchStreams()
    editing.value = null
    error.value = null
    useOverride.value = store.data?.income.override != null
    override.value = store.data?.income.override ?? store.data?.income.total ?? null
})

// Turning the box off goes back to counting paychecks
watch(useOverride, on => {
    if (!on && store.data?.income.override != null) saveOverride(null)
})

async function save (stream: IncomeStream) {
    busy.value = true
    error.value = await store.saveStream(stream)
    busy.value = false
    if (!error.value) editing.value = null
}

async function saveOverride (amount: number | null) {
    busy.value = true
    error.value = await store.setIncomeOverride(amount)
    busy.value = false
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

.min-width-0 {
    min-width: 0;
}

.edit-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
}

@media (max-width: 520px) {
    .edit-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
