<template>
    <v-dialog :model-value="!!goal" max-width="560" scrollable @update:model-value="v => { if (!v) $emit('close') }">
        <v-card v-if="draft" color="surface" rounded="lg">
            <v-card-title class="text-subtitle-1 font-weight-bold pt-4 px-5">{{ draft.savingsGoalId ? `Edit ${draft.name}` : 'New goal' }}</v-card-title>
            <v-card-text class="px-5">
                <div class="grid">
                    <v-text-field v-model="draft.name" label="Name" density="compact" variant="outlined" hide-details class="span-2" />
                    <v-select v-model="draft.icon" :items="icons" label="Icon" density="compact" variant="outlined" hide-details>
                        <template #selection="{ item }"><v-icon size="18" class="mr-2">{{ item.value }}</v-icon>{{ item.title }}</template>
                        <template #item="{ props: itemProps, item }"><v-list-item v-bind="itemProps" :prepend-icon="item.value" /></template>
                    </v-select>
                    <v-text-field v-model.number="draft.targetAmount" type="number" min="0" step="10" prefix="$" label="Amount" density="compact" variant="outlined" hide-details />
                    <v-text-field v-model="draft.dueDate" type="date" label="Due" density="compact" variant="outlined" hide-details />
                    <v-select v-model="repeat" :items="repeats" label="Repeats" density="compact" variant="outlined" hide-details />
                    <v-select v-model="draft.linkedAccountId" :items="accountItems" label="Where it’s kept (optional)" density="compact" variant="outlined" hide-details class="span-2" />
                    <v-checkbox v-if="draft.linkedAccountId" v-model="dedicated" density="compact" hide-details color="primary" class="span-2"
                        label="This account is only for this goal (its balance is what’s saved)" />
                    <v-text-field v-if="!dedicated" v-model.number="draft.startingBalance" type="number" min="0" prefix="$" label="Already saved" density="compact" variant="outlined" hide-details />
                </div>

                <p v-if="preview" class="text-body-2 text-muted mt-4 mb-0">{{ preview }}</p>
                <p v-if="error" class="text-caption text-error mt-3 mb-0" role="alert">{{ error }}</p>
            </v-card-text>
            <v-card-actions class="px-5 pb-4">
                <v-btn v-if="draft.savingsGoalId" variant="text" color="error" class="text-none" @click="archive">Archive</v-btn>
                <v-spacer />
                <v-btn variant="text" class="text-none" @click="$emit('close')">Cancel</v-btn>
                <v-btn color="primary" variant="flat" class="text-none" :loading="busy" :disabled="!draft.name || !draft.targetAmount || !draft.dueDate" @click="save">
                    {{ draft.savingsGoalId ? 'Save' : 'Create goal' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useGoalsStore } from '@/store/goals'
import type { Goal, GoalCycle, GoalCycleEnd } from '@/services/goal.service'
import { money } from '@/composables/budgetFormat'

const props = defineProps<{ goal: Partial<Goal> | null }>()
const emit = defineEmits<{ close: [] }>()

const store = useGoalsStore()
const draft = ref<Partial<Goal> | null>(null)
const repeat = ref('Annual|Reset')
const dedicated = ref(false)
const busy = ref(false)
const error = ref<string | null>(null)

const icons = [
    { title: 'Home', value: 'mdi-home-city-outline' },
    { title: 'Car', value: 'mdi-car-outline' },
    { title: 'Safety net', value: 'mdi-lifebuoy' },
    { title: 'Gifts', value: 'mdi-gift-outline' },
    { title: 'Travel', value: 'mdi-airplane' },
    { title: 'Health', value: 'mdi-hospital-box-outline' },
    { title: 'School', value: 'mdi-school-outline' },
    { title: 'Pets', value: 'mdi-paw' },
    { title: 'Savings', value: 'mdi-piggy-bank-outline' },
]

const repeats = [
    { title: 'Every year · start over at $0', value: 'Annual|Reset' },
    { title: 'Every year · keep the extra', value: 'Annual|RollOverSurplus' },
    { title: 'Every 6 months', value: 'Semiannual|Reset' },
    { title: 'Every 3 months', value: 'Quarterly|Reset' },
    { title: 'Once', value: 'OneTime|Reset' },
]

const accountItems = computed(() => [
    { title: 'Not linked · I’ll log contributions', value: null },
    ...(store.data?.accounts ?? []).map(a => ({ title: a.name, value: a.financialAccountId })),
])

watch(() => props.goal, g => {
    draft.value = g ? { icon: 'mdi-piggy-bank-outline', startingBalance: 0, linkedAccountId: null, ...g } : null
    repeat.value = g?.cycle ? `${g.cycle}|${g.cycleEnd ?? 'Reset'}` : 'Annual|Reset'
    dedicated.value = g?.fundingMode === 'Dedicated'
    error.value = null
}, { immediate: true })

watch(() => draft.value?.linkedAccountId, id => { if (!id) dedicated.value = false })

/** "That's $150 a month for 8 months", worked out the same way as the server */
const preview = computed(() => {
    const d = draft.value
    if (!d?.targetAmount || !d.dueDate || dedicated.value) return ''
    const now = new Date()
    const [y, m] = d.dueDate.split('-').map(Number)
    const months = Math.max(1, (y * 12 + m) - (now.getFullYear() * 12 + now.getMonth() + 1) + 1)
    const per = Math.ceil(Math.max(0, d.targetAmount - (d.startingBalance ?? 0)) / months * 100) / 100
    return `That’s ${money(per)} a month for ${months} month${months === 1 ? '' : 's'}. It comes off safe to spend.`
})

async function save () {
    const [cycle, cycleEnd] = repeat.value.split('|') as [GoalCycle, GoalCycleEnd]
    busy.value = true
    error.value = await store.saveGoal({
        ...draft.value,
        cycle,
        cycleEnd,
        fundingMode: dedicated.value ? 'Dedicated' : 'Shared',
        startingBalance: dedicated.value ? 0 : Number(draft.value!.startingBalance) || 0,
    })
    busy.value = false
    if (!error.value) emit('close')
}

async function archive () {
    await store.archiveGoal(draft.value!.savingsGoalId!)
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
