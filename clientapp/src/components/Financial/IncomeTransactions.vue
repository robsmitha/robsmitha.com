<template>
    <section>
        <SectionHeading index="01" title="Transactions" />
        <p class="text-slate text-body-2 mb-6">
            Deposits into this account. Select transactions and link them to an income source to count them as payments.
        </p>

        <div class="toolbar d-flex align-center flex-wrap ga-3 pa-4 mb-4" :class="{ 'toolbar--active': selectedTransactions.length }">
            <span class="font-mono text-caption text-light-slate text-no-wrap">
                {{ selectedTransactions.length ? `${selectedTransactions.length} selected · ${currency(selectedTotal)}` : 'Select transactions to link' }}
            </span>
            <v-autocomplete
                v-model="selectedIncomeSourceIdId"
                :items="store.incomeSourceResponse?.incomeSources"
                :disabled="!selectedTransactions.length || store.loadingIncome"
                clearable
                placeholder="Choose an income source"
                item-value="incomeSource.incomeSourceId"
                item-title="incomeSource.name"
                variant="outlined"
                color="primary"
                base-color="slate"
                class="font-mono source-picker"
                hide-details
                density="compact"
                rounded="lg"
                prepend-inner-icon="mdi-link-variant"
            ></v-autocomplete>
            <v-btn
                color="primary"
                variant="flat"
                rounded="pill"
                class="text-none"
                :disabled="!selectedIncomeSourceIdId || !selectedTransactions.length"
                :loading="saving"
                @click="assignTransaction"
            >
                Link payments
            </v-btn>
        </div>

        <div class="table-card">
            <v-data-table
                v-model="selectedTransactions"
                :headers="headers"
                :items="store?.transactions"
                :loading="store.loadingTransactions"
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
                        <p class="text-body-2 text-slate mb-0">No deposits found for this account.</p>
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
                    <span class="font-mono text-body-2 text-green text-no-wrap">{{ currency(item.amount) }}</span>
                    <span v-if="item.pending" class="pending-pill font-mono ml-2">Pending</span>
                </template>
                <template v-slot:[`item.account.official_name`]="{ item }">
                    <span class="text-slate text-body-2">{{ item.account?.official_name || item.account?.name }}</span>
                    <span v-if="item.account?.mask" class="font-mono text-caption text-slate"> &bull;&bull;{{ item.account.mask }}</span>
                </template>
                <template v-slot:[`item.incomePayment.incomeSourceName`]="{ item }">
                    <span v-if="item.incomePayment?.incomeSourceName" class="source-pill font-mono text-caption">
                        <v-icon size="12">mdi-link-variant</v-icon>{{ item.incomePayment.incomeSourceName }}
                    </span>
                    <span v-else class="text-slate">—</span>
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn
                        v-if="!!item.incomePayment?.incomePaymentId"
                        size="small"
                        color="slate"
                        icon="mdi-link-variant-off"
                        variant="text"
                        :aria-label="`Unlink ${item.name}`"
                        @click="unAssignTransaction(item)"
                    ></v-btn>
                </template>
            </v-data-table>
        </div>
    </section>
</template>

<script lang="ts" setup>

import { ref, computed, watch } from 'vue'
import moment from 'moment'
import { useIncomeStore } from '@/store/income'
import incomeService from '@/services/income.service'
import { IncomePayment, IncomeSourceSummary, Transaction } from '@/store/types'
import { currency } from '@/filters/currencyFilter'

const props = defineProps({
  institutionAccessItemId: { type: Number },
  incomeSourceId: { type: Number }
})

const store = useIncomeStore()

const headers = [
    { title: 'Date', key: 'date' },
    { title: 'Transaction', key: 'name' },
    { title: 'Amount', key: 'amount' },
    { title: 'Account', key: 'account.official_name' },
    { title: 'Income source', key: 'incomePayment.incomeSourceName' },
    { title: '', sortable: false, key: 'actions' }
]

const selectedTransactions = ref<Transaction[]>([])
const selectedIncomeSourceIdId = ref<number | IncomeSourceSummary | undefined>()
const saving = ref(false)

const selectedTotal = computed(() => selectedTransactions.value.reduce((sum, t) => sum + Number(t.amount), 0))

// Arriving from an income source's "Link payments" button preselects that source.
watch(() => store.incomeSourceResponse?.incomeSources, (val: IncomeSourceSummary[] | undefined) => {
    if(val){
        const item = val.find(i => i.incomeSource.incomeSourceId === Number(props.incomeSourceId))
        selectedIncomeSourceIdId.value = item
    }
}, {
    immediate: true
})

async function assignTransaction() {
    saving.value = true
    for (const t of selectedTransactions.value) {
        const incomeSourceId = typeof selectedIncomeSourceIdId.value === 'number'
            ? Number(selectedIncomeSourceIdId.value)
            : Number(selectedIncomeSourceIdId.value!.incomeSource.incomeSourceId)
        await incomeService.saveIncomePayment({
            incomePaymentId: t.incomePayment ? Number(t.incomePayment.incomePaymentId) : 0,
            transactionId: t.transaction_id,
            incomeSourceId: incomeSourceId,
            paymentDate: t.authorized_date ?? new Date(),
            amount: Number(t.amount),
            paymentMemo: t.name,
            isManualAdjustment: false
        } as IncomePayment);
    }
    await Promise.all([
        store.fetchTransactions(Number(props.institutionAccessItemId)),
        store.fetchIncomeSources(Number(props.institutionAccessItemId))
    ])
    selectedTransactions.value = [];
    selectedIncomeSourceIdId.value = undefined;
    saving.value = false
}

async function unAssignTransaction(item: Transaction) {
    await incomeService.deleteIncomePayment({ incomePaymentId: Number(item.incomePayment.incomePaymentId)})
    store.fetchTransactions(Number(props.institutionAccessItemId))
    store.fetchIncomeSources(Number(props.institutionAccessItemId))
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

.source-picker {
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

.source-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 1px 9px;
    border-radius: 999px;
    color: rgb(var(--v-theme-info));
    background: rgba(var(--v-theme-info), 0.12);
    white-space: nowrap;
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
