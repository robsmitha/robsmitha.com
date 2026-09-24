<template>
    <section>
        <SectionHeading index="01" title="Transactions" />
        <p class="text-slate text-body-2 mb-6">
            Spending in this budget's date range. Select transactions to categorize them, or exempt ones that shouldn't count.
        </p>

        <div class="toolbar d-flex align-center flex-wrap ga-3 pa-4 mb-4" :class="{ 'toolbar--active': selectedTransactions.length }">
            <span class="font-mono text-caption text-light-slate text-no-wrap">
                {{ selectedTransactions.length ? `${selectedTransactions.length} selected · ${currency(selectedTotal)}` : 'Select transactions to categorize' }}
            </span>
            <v-autocomplete
                v-model="selectedCategoryId"
                :items="store.categories"
                :disabled="!selectedTransactions.length || store.loadingBudget"
                clearable
                placeholder="Choose a category"
                item-value="financialCategoryId"
                item-title="name"
                variant="outlined"
                color="primary"
                base-color="slate"
                class="font-mono category-picker"
                hide-details
                density="compact"
                rounded="lg"
                prepend-inner-icon="mdi-tag-outline"
            ></v-autocomplete>
            <v-btn
                color="primary"
                variant="flat"
                rounded="pill"
                class="text-none"
                :disabled="!selectedCategoryId || !selectedTransactions.length"
                :loading="store.loadingBudget"
                @click="saveCategories"
            >
                Set category
            </v-btn>
        </div>

        <div class="table-card">
            <v-data-table
                v-model="selectedTransactions"
                :headers="headers"
                :items="transactions"
                :loading="store.loadingBudget"
                item-value="transaction_id"
                items-per-page="10"
                return-object
                show-select
                class="styled-table"
            >
                <template v-slot:loading>
                    <v-skeleton-loader v-for="i in 5" :key="i" type="text" class="bone bone--row" />
                </template>
                <template v-slot:no-data>
                    <div class="d-flex flex-column align-center py-10">
                        <v-icon size="40" class="mb-3 text-slate">mdi-swap-horizontal</v-icon>
                        <p class="text-body-2 text-slate mb-0">No transactions in this budget's date range.</p>
                    </div>
                </template>
                <template v-slot:[`item.date`]="{ item }">
                    <span class="font-mono text-caption text-slate text-no-wrap">{{ moment(item.date).format('MMM D, YYYY') }}</span>
                </template>
                <template v-slot:[`item.name`]="{ item }">
                    <span class="text-lightest-slate d-block">{{ item.merchant_name || item.name }}</span>
                    <span v-if="item.merchant_name && item.merchant_name !== item.name" class="text-slate text-caption">{{ item.name }}</span>
                </template>
                <template v-slot:[`item.amount`]="{ item }">
                    <span class="font-mono text-body-2 text-lightest-slate text-no-wrap">{{ currency(item.amount) }}</span>
                    <span v-if="item.pending" class="pending-pill font-mono ml-2">Pending</span>
                </template>
                <template v-slot:[`item.category.name`]="{ item }">
                    <span v-if="item.category?.name" class="category-pill font-mono text-caption">{{ item.category.name }}</span>
                    <span v-else class="uncategorized-pill font-mono text-caption">Uncategorized</span>
                </template>
                <template v-slot:[`item.account.official_name`]="{ item }">
                    <span class="text-slate text-body-2">{{ item.account?.official_name || item.account?.name }}</span>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                        size="small"
                        color="slate"
                        icon="mdi-cancel"
                        variant="text"
                        :aria-label="`Exempt ${item.name} from this budget`"
                        title="Exempt from this budget"
                        @click="excludeTransactions(item)"
                    ></v-btn>
                </template>
            </v-data-table>
        </div>
    </section>
</template>

<script lang="ts" setup>

import { ref, computed, onMounted } from 'vue'
import moment from 'moment'
import { useBudgetStore } from "@/store/budget"
import { currency } from '@/filters/currencyFilter'

const props = defineProps({
  budgetId: { type: Number }
})

const store = useBudgetStore()

const headers = [
    { title: 'Date', key: 'date' },
    { title: 'Transaction', key: 'name' },
    { title: 'Amount', key: 'amount' },
    { title: 'Category', key: 'category.name' },
    { title: 'Account', key: 'account.official_name' },
    { title: '', sortable: false, key: 'actions' }
]

const transactions = computed<any[]>(() => store.budget?.transactions ?? [])
const selectedTransactions = ref<any[]>([])
const selectedCategoryId = ref<any>(null)

const selectedTotal = computed(() => selectedTransactions.value.reduce((sum: number, t: any) => sum + Number(t.amount), 0))

onMounted(async () => {
    store.fetchCategories()
})

async function saveCategories(e: Event) {
    e.stopPropagation()
    if(selectedCategoryId.value && selectedTransactions.value.length > 0){
        await store.setTransactionsCategory(Number(props.budgetId), selectedCategoryId.value, selectedTransactions.value)
        await store.fetchBudget(Number(props.budgetId))

        selectedCategoryId.value = null
        selectedTransactions.value = []
    }
}

async function excludeTransactions(t: any) {
    await store.excludeTransactions(Number(props.budgetId), t)
    await store.fetchBudget(Number(props.budgetId))
}

</script>

<style scoped>
.toolbar {
    border-radius: 12px;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    background: rgb(var(--v-theme-surface));
    transition: border-color 0.2s ease;
}

.toolbar--active {
    border-color: rgba(var(--v-theme-primary), 0.6);
}

.category-picker {
    flex: 1 1 240px;
    max-width: 380px;
}

.table-card {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    background: rgb(var(--v-theme-surface));
}

.styled-table {
    background: transparent;
}

.styled-table :deep(th) {
    font-family: var(--font-mono);
    font-size: 0.75rem !important;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgb(var(--v-theme-slate)) !important;
}

.styled-table :deep(tbody tr:hover) {
    background: rgba(var(--v-theme-primary), 0.04);
}

.pending-pill {
    font-size: 0.6875rem;
    padding: 1px 7px;
    border-radius: 999px;
    color: rgb(var(--v-theme-amber));
    background: rgba(var(--v-theme-amber), 0.14);
}

.category-pill,
.uncategorized-pill {
    padding: 1px 9px;
    border-radius: 999px;
    white-space: nowrap;
}

.category-pill {
    color: rgb(var(--v-theme-violet));
    background: rgba(var(--v-theme-violet), 0.14);
}

.uncategorized-pill {
    color: rgb(var(--v-theme-amber));
    background: rgba(var(--v-theme-amber), 0.1);
}

/* Placeholder bones: strip Vuetify's built-in margins and tone the color down
   (the theme's border-opacity of 1 would otherwise make every bone solid white). */
.bone {
    background: transparent;
}

.bone--row {
    height: 52px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.bone--row :deep(.v-skeleton-loader__text) {
    margin: 0;
    max-width: none;
    width: 100%;
    height: 12px;
    background: rgba(var(--v-theme-on-surface), 0.08);
}
</style>
