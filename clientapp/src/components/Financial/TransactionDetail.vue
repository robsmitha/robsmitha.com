<template>
    <section class="detail pa-5" aria-label="Transaction details">
        <div class="d-flex align-start ga-3 mb-4">
            <div class="min-width-0 flex-grow-1">
                <h2 class="text-subtitle-1 font-weight-bold text-high-emphasis text-truncate">{{ merchant }}</h2>
                <p class="font-mono text-caption text-subtle mb-0 text-truncate">
                    {{ transaction.name }} · {{ moment(transaction.date).format('MMM D') }} · {{ transaction.account.name }}<template v-if="transaction.account.mask"> ••{{ transaction.account.mask }}</template>
                </p>
            </div>
            <span class="font-mono font-weight-bold" :class="transaction.amount < 0 ? 'text-success' : 'text-high-emphasis'">{{ money(transaction.amount) }}</span>
        </div>

        <div class="d-flex align-center justify-space-between mb-2">
            <span class="label">Count it as</span>
            <span v-if="draft.treatment === transaction.treatment" class="font-mono text-caption text-subtle">{{ sourceLabel(transaction.treatmentSource) }}</span>
        </div>
        <v-btn-toggle v-model="draft.treatment" mandatory density="compact" color="primary" variant="outlined" divided class="treatments mb-5">
            <v-btn v-for="t in treatments" :key="t.value" :value="t.value" size="small" class="text-none">{{ t.title }}</v-btn>
        </v-btn-toggle>

        <template v-if="counted">
            <div class="d-flex align-center justify-space-between mb-2">
                <span class="label">{{ splitting ? 'Split' : 'Category' }}</span>
                <v-btn size="small" variant="text" color="primary" class="text-none" :prepend-icon="splitting ? 'mdi-close' : 'mdi-call-split'" @click="toggleSplit">
                    {{ splitting ? 'Don’t split' : 'Split' }}
                </v-btn>
            </div>

            <v-autocomplete
                v-if="!splitting"
                v-model="draft.categoryId"
                :items="categoryItems"
                item-title="name" item-value="financialCategoryId"
                placeholder="Choose a category"
                density="compact" variant="outlined" clearable hide-details
                class="mb-5"
                aria-label="Category"
            />

            <div v-else class="d-flex flex-column ga-2 mb-2">
                <div v-for="(line, i) in draft.splits" :key="i" class="d-flex ga-2">
                    <v-autocomplete
                        v-model="line.categoryId" :items="categoryItems" item-title="name" item-value="financialCategoryId"
                        density="compact" variant="outlined" hide-details class="flex-grow-1" :aria-label="`Split line ${i + 1} category`"
                    />
                    <v-text-field
                        v-model.number="line.amount" type="number" step="0.01" density="compact" variant="outlined" hide-details
                        class="amount-input" :aria-label="`Split line ${i + 1} amount`"
                    />
                    <v-btn icon="mdi-close" size="small" variant="text" :aria-label="`Remove split line ${i + 1}`" :disabled="draft.splits.length <= 2" @click="draft.splits.splice(i, 1)" />
                </div>
                <div class="d-flex align-center justify-space-between">
                    <v-btn size="small" variant="text" color="primary" class="text-none" prepend-icon="mdi-plus" @click="draft.splits.push({ categoryId: null, amount: 0 })">Add line</v-btn>
                    <span class="font-mono text-caption" :class="splitBalanced ? 'text-success' : 'text-warning'">
                        {{ splitBalanced ? `Adds up to ${money(transaction.amount)}` : `${money(splitRemaining)} left to assign` }}
                    </span>
                </div>
            </div>
        </template>

        <span class="label d-block mb-2 mt-3">Note</span>
        <v-textarea v-model="draft.notes" rows="2" auto-grow density="compact" variant="outlined" hide-details placeholder="Add a note" class="mb-4" aria-label="Note" />

        <div class="always pa-3 mb-4">
            <v-checkbox v-model="draft.always" density="compact" hide-details color="primary">
                <template #label>
                    <span class="text-body-2">Always do this for <strong>{{ merchant }}</strong></span>
                </template>
            </v-checkbox>
            <div v-if="draft.always" class="pl-8">
                <v-checkbox v-model="draft.applyToPast" density="compact" hide-details color="primary">
                    <template #label>
                        <span class="text-caption">Also update past ones<template v-if="pastMatches !== null"> ({{ pastMatches }} found)</template></span>
                    </template>
                </v-checkbox>
            </div>
        </div>

        <p v-if="error" class="text-caption text-error mb-3" role="alert">{{ error }}</p>

        <div class="d-flex ga-2">
            <v-btn color="primary" variant="flat" class="text-none flex-grow-1" :loading="saving" :disabled="!canSave" @click="save">Save</v-btn>
            <v-btn variant="outlined" class="text-none" @click="$emit('close')">Close</v-btn>
        </div>
        <v-btn
            v-if="transaction.treatmentSource === 'User' || transaction.categorySource === 'User'"
            variant="text" size="small" class="text-none mt-2" prepend-icon="mdi-restore" @click="resetToAutomatic"
        >Go back to automatic</v-btn>
    </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import moment from 'moment'
import transactionService, { type Category, type Source, type Transaction, type Treatment, type TransactionUpdate } from '@/services/transaction.service'
import { useTransactionsStore } from '@/store/transactions'

const props = defineProps<{ transaction: Transaction, categories: Category[] }>()
const emit = defineEmits<{ close: [], saved: [message: string] }>()

const store = useTransactionsStore()

const treatments: { title: string, value: Treatment }[] = [
    { title: 'Spending', value: 'Spending' },
    { title: 'Refund', value: 'Refund' },
    { title: 'Transfer', value: 'Transfer' },
    { title: 'Card payment', value: 'CardPayment' },
    { title: 'Income', value: 'Income' },
    { title: 'Hide', value: 'Hidden' },
]

type Draft = {
    treatment: Treatment
    categoryId: number | null
    splits: { categoryId: number | null, amount: number }[]
    notes: string
    always: boolean
    applyToPast: boolean
}

const draft = reactive<Draft>({ treatment: 'Spending', categoryId: null, splits: [], notes: '', always: false, applyToPast: true })
const splitting = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const pastMatches = ref<number | null>(null)

function reset () {
    draft.treatment = props.transaction.treatment
    draft.categoryId = props.transaction.category?.financialCategoryId ?? null
    draft.splits = props.transaction.splits.map(s => ({ categoryId: s.categoryId, amount: s.amount }))
    draft.notes = props.transaction.notes ?? ''
    draft.always = false
    draft.applyToPast = true
    splitting.value = props.transaction.splits.length > 0
    error.value = null
    pastMatches.value = null
}

watch(() => props.transaction, reset, { immediate: true })

const merchant = computed(() => props.transaction.merchant_name || props.transaction.name)
const counted = computed(() => draft.treatment === 'Spending' || draft.treatment === 'Refund')
const categoryItems = computed(() => props.categories.filter(c => !c.isArchived))

const splitRemaining = computed(() => Math.round((props.transaction.amount - draft.splits.reduce((n, s) => n + (Number(s.amount) || 0), 0)) * 100) / 100)
const splitBalanced = computed(() => Math.abs(splitRemaining.value) < 0.005)
const canSave = computed(() => !splitting.value || !counted.value || (splitBalanced.value && draft.splits.length >= 2))

function toggleSplit () {
    splitting.value = !splitting.value
    if (splitting.value && draft.splits.length < 2) {
        // Start with everything in the current category and an empty second line
        draft.splits = [{ categoryId: draft.categoryId, amount: props.transaction.amount }, { categoryId: null, amount: 0 }]
    }
}

function sourceLabel (source: Source) {
    return source === 'User' ? 'set by you' : source === 'Rule' ? 'set by a rule' : 'automatic'
}

// How many past transactions the "always" rule would change, shown before saving
watch(() => [draft.always, draft.categoryId, draft.treatment], async () => {
    if (!draft.always) return
    const response = await transactionService.previewRule({
        field: 'Merchant',
        match: 'Equals',
        value: merchant.value,
        direction: props.transaction.amount >= 0 ? 'Out' : 'In',
        setCategoryId: counted.value ? draft.categoryId : null,
        setTreatment: draft.treatment !== props.transaction.treatment ? draft.treatment : null,
    })
    pastMatches.value = response.success ? response.data.matches : null
})

async function save () {
    saving.value = true
    const t = props.transaction
    const update: TransactionUpdate = { id: t.id, notes: draft.notes }
    if (draft.treatment !== t.treatment) update.treatment = draft.treatment
    if (counted.value) {
        if (splitting.value) {
            update.splits = draft.splits.map(s => ({ categoryId: s.categoryId, amount: Number(s.amount) }))
        } else {
            if (t.splits.length) update.splits = []
            if (draft.categoryId !== (t.category?.financialCategoryId ?? null)) {
                if (draft.categoryId) update.categoryId = draft.categoryId
                else update.clearCategory = true
            }
        }
    }
    if (draft.always) {
        update.createRule = { field: 'Merchant', value: merchant.value, applyToPast: draft.applyToPast }
    }
    const message = savedMessage(update)
    error.value = await store.update(update)
    saving.value = false
    if (!error.value) emit('saved', message)
}

/** What the snackbar says after a save, e.g. "Zaxby's assigned to Restaurants" */
function savedMessage (update: TransactionUpdate) {
    const name = merchant.value
    const categoryName = (id: number | null) => props.categories.find(c => c.financialCategoryId === id)?.name ?? 'a category'
    const treatmentName = treatments.find(t => t.value === draft.treatment)?.title ?? draft.treatment
    let text: string
    if (!counted.value) {
        text = draft.treatment === 'Hidden' ? `${name} hidden` : `${name} counted as ${treatmentName}`
    } else if (update.splits?.length) {
        text = `${name} split across ${[...new Set(update.splits.map(s => categoryName(s.categoryId)))].join(', ')}`
    } else if (update.clearCategory) {
        text = `${name} no longer has a category`
    } else if (draft.categoryId) {
        text = `${name} assigned to ${categoryName(draft.categoryId)}${draft.treatment === 'Refund' ? ' (refund)' : ''}`
    } else {
        text = `${name} saved`
    }
    if (update.createRule) {
        text += draft.applyToPast && pastMatches.value ? ` · rule saved, ${pastMatches.value} past updated` : ' · rule saved for next time'
    }
    return text
}

async function resetToAutomatic () {
    saving.value = true
    error.value = await store.update({ id: props.transaction.id, resetTreatment: true, resetCategory: true })
    saving.value = false
    if (!error.value) emit('saved', `${merchant.value} is back to automatic`)
}

function money (amount: number) {
    const text = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount))
    return amount < 0 ? `−${text}` : text
}
</script>

<style scoped>
.detail {
    border-radius: 12px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface));
}

.min-width-0 {
    min-width: 0;
}

.label {
    font-family: var(--font-mono, monospace);
    font-size: 0.7rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgb(var(--v-theme-subtle));
}

.treatments {
    flex-wrap: wrap;
    height: auto !important;
}

.treatments :deep(.v-btn) {
    min-height: 36px;
    padding: 0 14px;
}

.amount-input {
    max-width: 110px;
}

.always {
    border-radius: 8px;
    background: rgb(var(--v-theme-surface-raised));
}
</style>
