<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>

    <PageHero eyebrow="> finance / transactions" tone="navy" art="arcs" compact>
        <h1 class="hero-title font-weight-bold mb-4">Transactions</h1>
        <div class="d-flex flex-wrap align-center ga-8">
            <div v-for="s in stats" :key="s.label">
                <span class="font-mono text-h6 font-weight-bold d-block" :class="s.warn ? 'text-warning' : ''">{{ s.value }}</span>
                <span class="font-mono text-caption hero-label">{{ s.label }}</span>
            </div>
            <v-btn color="hero-ink" variant="outlined" rounded="pill" class="text-none" prepend-icon="mdi-format-list-checks" @click="manageOpen = true">
                Rules &amp; categories
            </v-btn>
        </div>
    </PageHero>

    <v-container class="admin-body py-6">
        <v-alert v-if="store.error" type="warning" variant="tonal" density="compact" closable class="mb-4" @click:close="store.error = null">{{ store.error }}</v-alert>

        <!-- Filters: one row above the list -->
        <div class="filters mb-3">
            <v-text-field
                v-model="query" prepend-inner-icon="mdi-magnify" placeholder="Search merchant, note or amount"
                density="compact" variant="outlined" hide-details clearable aria-label="Search transactions"
            />
            <v-select v-model="month" :items="months" density="compact" variant="outlined" hide-details aria-label="Month" />
            <v-select v-model="accountId" :items="accountItems" placeholder="All accounts" clearable density="compact" variant="outlined" hide-details aria-label="Account" />
            <v-select v-model="categoryId" :items="categoryFilterItems" placeholder="All categories" clearable density="compact" variant="outlined" hide-details aria-label="Category" />
        </div>
        <v-chip-group v-model="view" mandatory selected-class="text-primary" class="mb-4" aria-label="Show">
            <v-chip v-for="v in views" :key="v.value" :value="v.value" variant="outlined" size="small" class="font-mono" filter>
                {{ v.title }} {{ store.result?.counts[v.value] ?? '' }}
            </v-chip>
        </v-chip-group>

        <div class="layout" :class="{ 'layout--with-detail': store.selected && lgAndUp }">
            <div class="min-width-0">
                <!-- Bulk changes for checked rows -->
                <div v-if="checked.length" class="bulk d-flex flex-wrap align-center ga-2 pa-3 mb-3">
                    <span class="text-body-2 text-high-emphasis">{{ checked.length }} selected</span>
                    <v-autocomplete v-model="bulkCategory" :items="activeCategories" item-title="name" item-value="financialCategoryId"
                        placeholder="Set category" density="compact" variant="outlined" hide-details class="bulk-field" aria-label="Category for selected" />
                    <v-btn size="small" color="primary" variant="flat" class="text-none" :disabled="!bulkCategory" @click="applyBulk(bulkCategory, null)">Apply</v-btn>
                    <v-btn size="small" variant="outlined" class="text-none" prepend-icon="mdi-eye-off-outline" @click="applyBulk(null, 'Hidden')">Hide</v-btn>
                    <v-btn size="small" variant="text" class="text-none" @click="checked = []">Clear</v-btn>
                </div>

                <div class="list" role="table" aria-label="Transactions">
                    <div v-if="store.loading && !store.result" class="pa-4">
                        <v-skeleton-loader v-for="i in 6" :key="i" type="list-item-two-line" />
                    </div>
                    <p v-else-if="!store.result?.items.length" class="pa-6 text-body-2 text-subtle text-center mb-0">No transactions match these filters.</p>
                    <div
                        v-for="t in store.result?.items ?? []"
                        v-else
                        :key="t.id"
                        class="row"
                        :class="{ 'row--selected': store.selectedId === t.id, 'row--muted': !t.isCounted }"
                        role="row"
                        tabindex="0"
                        @click="select(t)"
                        @keydown.enter="select(t)"
                    >
                        <v-checkbox-btn
                            :model-value="checked.includes(t.id)" density="compact" class="check" :aria-label="`Select ${t.merchant_name || t.name}`"
                            @click.stop @update:model-value="(v: boolean) => toggleChecked(t.id, v)"
                        />
                        <span class="font-mono text-caption text-subtle date">{{ moment(t.date).format('MMM D') }}</span>
                        <span class="min-width-0 merchant">
                            <span class="d-block text-truncate text-high-emphasis">
                                {{ t.merchant_name || t.name }}
                                <v-chip v-if="t.pending" size="x-small" color="info" variant="tonal" class="ml-1 font-mono">Pending</v-chip>
                            </span>
                            <span class="d-block text-truncate font-mono text-caption text-subtle">{{ t.name }}</span>
                        </span>
                        <span class="min-width-0 category">
                            <v-chip size="small" variant="tonal" :color="chipFor(t).color" class="font-mono chip-fit" :prepend-icon="chipFor(t).icon">
                                {{ chipFor(t).label }}
                            </v-chip>
                        </span>
                        <span class="d-none d-md-block font-mono text-caption text-muted text-truncate account">
                            {{ t.account.name }}<template v-if="t.account.mask"> ••{{ t.account.mask }}</template>
                        </span>
                        <span class="font-mono text-right amount" :class="t.amount < 0 ? 'text-success' : 'text-high-emphasis'">{{ money(t.amount) }}</span>
                    </div>
                </div>

                <div v-if="store.pageCount > 1" class="d-flex justify-center mt-4">
                    <v-pagination v-model="page" :length="store.pageCount" density="comfortable" :total-visible="6" />
                </div>
                <p class="text-caption text-subtle mt-3">Charges are positive and money in is negative, as on your statements. Faded rows aren’t counted in budgets.</p>
            </div>

            <div v-if="store.selected && lgAndUp" class="detail-col">
                <TransactionDetail :transaction="store.selected" :categories="store.categories" @close="store.selectedId = null" />
            </div>
        </div>
    </v-container>

    <!-- On smaller screens the details open as a sheet -->
    <v-bottom-sheet :model-value="!!store.selected && !lgAndUp" scrollable @update:model-value="v => { if (!v) store.selectedId = null }">
        <TransactionDetail v-if="store.selected" :transaction="store.selected" :categories="store.categories" @close="store.selectedId = null" />
    </v-bottom-sheet>

    <RulesAndCategoriesDialog :open="manageOpen" @close="manageOpen = false" />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import moment from 'moment'
import { useTransactionsStore } from '@/store/transactions'
import { useConnectionsStore } from '@/store/connections'
import type { Transaction, TransactionView, Treatment } from '@/services/transaction.service'

const store = useTransactionsStore()
const connections = useConnectionsStore()
const { lgAndUp } = useDisplay()

const breadcrumbs = [
    { title: 'HOME', disabled: false, to: '/' },
    { title: 'TRANSACTIONS', disabled: true },
]

const manageOpen = ref(false)
const checked = ref<number[]>([])
const bulkCategory = ref<number | null>(null)

onMounted(async () => {
    await Promise.all([store.search(), store.fetchCategories(), connections.connections ? Promise.resolve() : connections.fetch()])
})

// Filters write through to the store; typing waits a moment before searching
const query = ref(store.q)
let typing: ReturnType<typeof setTimeout> | undefined
watch(query, value => {
    clearTimeout(typing)
    typing = setTimeout(() => store.setFilters({ q: value ?? '' }), 350)
})

const month = computed({ get: () => store.month, set: v => store.setFilters({ month: v }) })
const accountId = computed({ get: () => store.accountId, set: v => store.setFilters({ accountId: v ?? null }) })
const categoryId = computed({ get: () => store.categoryId, set: v => store.setFilters({ categoryId: v ?? null }) })
const view = computed({ get: () => store.view, set: (v: TransactionView) => store.setFilters({ view: v }) })
const page = computed({ get: () => store.page, set: v => { store.page = v; store.search() } })

const months = computed(() => {
    const items = [{ title: 'All time', value: '' }]
    const d = moment().startOf('month')
    for (let i = 0; i < 13; i++) {
        items.push({ title: d.format('MMMM YYYY'), value: d.format('YYYY-MM') })
        d.subtract(1, 'month')
    }
    return items
})

const accountItems = computed(() => (connections.connections ?? []).flatMap(c =>
    c.accounts.map(a => ({ title: `${a.name}${a.mask ? ` ••${a.mask}` : ''}`, value: a.financialAccountId }))))

const activeCategories = computed(() => store.categories.filter(c => !c.isArchived))
const categoryFilterItems = computed(() => [
    { title: 'No category', value: 0 },
    ...activeCategories.value.map(c => ({ title: c.name, value: c.financialCategoryId })),
])

const views: { title: string, value: TransactionView }[] = [
    { title: 'All', value: 'all' },
    { title: 'Spending', value: 'spending' },
    { title: 'Not counted', value: 'notCounted' },
    { title: 'Needs review', value: 'review' },
    { title: 'Pending', value: 'pending' },
]

const stats = computed(() => {
    const r = store.result
    return [
        { label: 'Shown', value: r ? r.counts.all : '—' },
        { label: 'Counted as spending', value: r ? money(r.countedTotal) : '—' },
        { label: 'Pending', value: r ? r.counts.pending : '—' },
        { label: 'Needs review', value: r ? r.counts.review : '—', warn: !!r?.counts.review },
    ]
})

const treatmentChip: Record<Treatment, { label: string, color: string, icon: string }> = {
    Spending: { label: '', color: 'subtle', icon: '' },
    Refund: { label: 'Refund', color: 'success', icon: 'mdi-cash-refund' },
    Transfer: { label: 'Transfer', color: 'subtle', icon: 'mdi-bank-transfer' },
    CardPayment: { label: 'Card payment', color: 'subtle', icon: 'mdi-credit-card-check-outline' },
    Income: { label: 'Income', color: 'info', icon: 'mdi-cash-plus' },
    Hidden: { label: 'Hidden', color: 'subtle', icon: 'mdi-eye-off-outline' },
}

function chipFor (t: Transaction): { label: string, color: string, icon: string | undefined } {
    if (t.treatment !== 'Spending') {
        const chip = treatmentChip[t.treatment]
        return { ...chip, label: t.treatment === 'Refund' && t.category ? `Refund · ${t.category.name}` : chip.label }
    }
    if (t.splits.length) return { label: `Split · ${t.splits.length}`, color: 'subtle', icon: 'mdi-call-split' }
    if (!t.category) return { label: 'Needs a category', color: 'warning', icon: 'mdi-help-circle-outline' }
    return { label: t.category.name, color: 'subtle', icon: undefined }
}

function select (t: Transaction) {
    store.selectedId = t.id
}

function toggleChecked (id: number, on: boolean) {
    checked.value = on ? [...checked.value, id] : checked.value.filter(x => x !== id)
}

async function applyBulk (category: number | null, treatment: Treatment | null) {
    await store.bulkUpdate(checked.value, category, treatment)
    checked.value = []
    bulkCategory.value = null
}

function money (amount: number) {
    const text = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(amount))
    return amount < 0 ? `−${text}` : text
}
</script>

<style scoped>
.admin-body {
    max-width: 1200px;
}

.hero-title {
    font-size: clamp(1.6rem, 1.5vw + 1rem, 2.2rem);
    line-height: 1.1;
}

.hero-label {
    opacity: 0.7;
}

.filters {
    display: grid;
    grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr));
    gap: 8px;
}

@media (max-width: 760px) {
    .filters {
        grid-template-columns: minmax(0, 1fr);
    }
}

.layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
    align-items: start;
}

.layout--with-detail {
    grid-template-columns: minmax(0, 1fr) 360px;
}

.detail-col {
    position: sticky;
    top: 80px;
}

.min-width-0 {
    min-width: 0;
}

.list {
    border-radius: 12px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface));
    overflow: hidden;
}

.row {
    display: grid;
    grid-template-columns: 32px 52px minmax(0, 1.6fr) minmax(0, 1fr) 96px;
    gap: 4px 12px;
    align-items: center;
    padding: 10px 16px;
    cursor: pointer;
}

@media (min-width: 960px) {
    .row {
        grid-template-columns: 32px 52px minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 0.9fr) 104px;
    }
}

@media (max-width: 600px) {
    .row {
        grid-template-columns: 28px 44px minmax(0, 1fr) auto;
    }

    .row .category {
        grid-column: 3 / -1;
        grid-row: 2;
    }
}

.row + .row {
    border-top: 1px solid rgb(var(--v-theme-border));
}

/* Vuetify places selection controls in a named "control" area meant for its form layout; here it's a plain cell */
.row .check {
    grid-area: auto;
    flex: none;
}

.row:hover,
.row:focus-visible {
    background: rgb(var(--v-theme-surface-raised));
    outline: none;
}

.row--selected {
    background: rgba(var(--v-theme-primary), 0.08);
    box-shadow: inset 3px 0 0 rgb(var(--v-theme-primary));
}

.row--muted {
    opacity: 0.68;
}

.chip-fit {
    max-width: 100%;
}

.chip-fit :deep(.v-chip__content) {
    overflow: hidden;
    text-overflow: ellipsis;
}

.bulk {
    border-radius: 12px;
    border: 1px solid rgba(var(--v-theme-primary), 0.4);
    background: rgba(var(--v-theme-primary), 0.06);
}

.bulk-field {
    min-width: 200px;
    max-width: 280px;
}
</style>
