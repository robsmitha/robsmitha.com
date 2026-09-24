<template>
    <section>
        <SectionHeading index="01" title="Exemptions" />
        <div class="d-flex align-center flex-wrap ga-3 mb-6">
            <p class="text-slate text-body-2 mb-0 flex-grow-1">
                Transactions excluded from this budget's totals, such as transfers or one-off purchases. Restore one to count it again.
            </p>
            <span v-if="excluded.length" class="total-pill font-mono text-caption">
                {{ excluded.length }} exempt &middot; {{ currency(excludedTotal) }}
            </span>
        </div>

        <div class="table-card">
            <v-data-table
                :headers="excludedHeaders"
                :items="excluded"
                :loading="store.loadingBudget"
                item-value="transaction_id"
                items-per-page="10"
                class="styled-table"
            >
                <template v-slot:loading>
                    <v-skeleton-loader v-for="i in 4" :key="i" type="text" class="bone bone--row" />
                </template>
                <template v-slot:no-data>
                    <div class="d-flex flex-column align-center py-10">
                        <v-icon size="40" class="mb-3 text-slate">mdi-cancel</v-icon>
                        <p class="text-body-2 text-slate mb-0">Nothing is exempt. Every transaction counts toward this budget.</p>
                    </div>
                </template>
                <template v-slot:[`item.date`]="{ item }">
                    <span class="font-mono text-caption text-slate text-no-wrap">{{ moment(item.date).format('MMM D, YYYY') }}</span>
                </template>
                <template v-slot:[`item.name`]="{ item }">
                    <span class="text-light-slate">{{ item.merchant_name || item.name }}</span>
                </template>
                <template v-slot:[`item.amount`]="{ item }">
                    <span class="font-mono text-body-2 text-slate text-no-wrap exempt-amount">{{ currency(item.amount) }}</span>
                </template>
                <template v-slot:[`item.account.official_name`]="{ item }">
                    <span class="text-slate text-body-2">{{ item.account?.official_name || item.account?.name }}</span>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                        size="small"
                        color="primary"
                        variant="text"
                        rounded="pill"
                        class="text-none"
                        prepend-icon="mdi-restore"
                        @click="restoreTransaction(item)"
                    >
                        Restore
                    </v-btn>
                </template>
            </v-data-table>
        </div>
    </section>
</template>

<script lang="ts" setup>

import { computed } from 'vue'
import moment from 'moment'
import { useBudgetStore } from "@/store/budget"
import { currency } from '@/filters/currencyFilter'

const props = defineProps({
  budgetId: { type: Number }
})

const store = useBudgetStore()

const excludedHeaders = [
    { title: 'Date', key: 'date' },
    { title: 'Transaction', key: 'name' },
    { title: 'Amount', key: 'amount' },
    { title: 'Account', key: 'account.official_name' },
    { title: '', sortable: false, key: 'actions', align: 'end' as const }
]

const excluded = computed<any[]>(() => store.budget?.excludedTransactions ?? [])
const excludedTotal = computed(() => excluded.value.reduce((sum: number, t: any) => sum + Number(t.amount), 0))

async function restoreTransaction(t: any) {
    await store.restoreTransactions(Number(props.budgetId), t)
    await store.fetchBudget(Number(props.budgetId))
}
</script>

<style scoped>
.total-pill {
    padding: 2px 10px;
    border-radius: 999px;
    color: rgb(var(--v-theme-light-slate));
    background: rgba(var(--v-theme-on-surface), 0.06);
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

/* Struck through, since it isn't counted. */
.exempt-amount {
    text-decoration: line-through;
    text-decoration-color: rgba(var(--v-theme-slate), 0.6);
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
