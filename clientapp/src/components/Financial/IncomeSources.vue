<template>
    <section>
        <SectionHeading index="01" title="Income sources" />

        <div class="d-flex align-center flex-wrap ga-3 mb-6">
            <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                placeholder="Filter by name"
                clearable
                hide-details
                density="comfortable"
                variant="outlined"
                color="primary"
                base-color="slate"
                class="font-mono filter-field"
                rounded="lg"
            ></v-text-field>
            <div class="d-flex flex-wrap ga-2">
                <v-chip
                    v-for="f in statusFilters"
                    :key="f.key"
                    :variant="statusFilter === f.key ? 'flat' : 'outlined'"
                    :color="statusFilter === f.key ? f.color : 'slate'"
                    size="small"
                    class="font-mono"
                    @click="statusFilter = statusFilter === f.key ? null : f.key"
                >
                    {{ f.label }} ({{ countByStatus(f.key) }})
                </v-chip>
            </div>
            <v-spacer />
            <v-btn color="primary" variant="flat" rounded="pill" class="text-none" prepend-icon="mdi-plus" @click="dialog = true">
                New income source
            </v-btn>
        </div>

        <!-- Placeholder cards laid out like the income cards below. -->
        <div v-if="store.loadingIncome && !store.incomeSourceResponse" class="source-grid" aria-busy="true" aria-label="Loading income sources">
            <div v-for="i in 3" :key="i" class="source-card pa-5">
                <v-skeleton-loader type="text" class="bone bone--line mb-2" style="width: 60%" />
                <v-skeleton-loader type="text" class="bone bone--small mb-5" style="width: 40%" />
                <v-skeleton-loader type="text" class="bone bone--amount mb-3" style="width: 45%" />
                <v-skeleton-loader type="text" class="bone bone--bar mb-5" />
                <v-skeleton-loader type="image" class="bone bone--history" />
            </div>
        </div>

        <div v-else-if="filteredSources.length" class="source-grid" :class="{ 'is-refreshing': store.loadingIncome }">
            <div
                v-for="item in filteredSources"
                :key="item.incomeSource.incomeSourceId"
                class="source-card pa-5 d-flex flex-column"
                :style="{ '--accent': `var(--v-theme-${status(item).color})` }"
            >
                <div class="d-flex align-start ga-3 mb-4">
                    <div class="min-width-0 flex-grow-1">
                        <span class="text-lightest-slate font-weight-bold d-block text-truncate">{{ item.incomeSource.name }}</span>
                        <span class="font-mono text-caption text-slate">
                            {{ item.incomeSource.incomeSourceType }} &middot; due {{ dueLabel(item) }}
                        </span>
                    </div>
                    <span class="status-pill font-mono text-caption flex-shrink-0">{{ status(item).label }}</span>
                </div>

                <div class="mb-2">
                    <span class="font-mono text-h6 font-weight-bold text-lightest-slate">{{ currency(item.currentMonthPaymentTotal) }}</span>
                    <span class="text-slate text-body-2"> of {{ currency(item.incomeSource.amountDue) }}</span>
                </div>
                <div class="track mb-5">
                    <span :style="{ width: `${paidPercent(item)}%` }"></span>
                </div>

                <!-- Last six months: bar height is what was paid relative to what was due. -->
                <div v-if="item.paymentHistory?.length" class="history mb-5" role="img" :aria-label="historyLabel(item)">
                    <div v-for="(h, i) in item.paymentHistory.slice(-6)" :key="i" class="history-col" :title="`${h.month} ${h.year}: ${currency(h.paidAmount)} of ${currency(h.amountDue)}`">
                        <div class="history-bar">
                            <span :class="h.paidAmount >= h.amountDue && h.amountDue > 0 ? 'bg-green' : h.paidAmount > 0 ? 'bg-info' : 'bg-lightest-navy'" :style="{ height: `${historyHeight(h)}%` }"></span>
                        </div>
                        <span class="font-mono history-month">{{ h.month.slice(0, 3) }}</span>
                    </div>
                </div>

                <div class="d-flex align-center ga-1 mt-auto">
                    <v-btn variant="outlined" color="primary" rounded="pill" size="small" class="text-none" prepend-icon="mdi-link-variant" :to="`/account/${institutionAccessItemId}/transactions/${item.incomeSource.incomeSourceId}`">
                        Link payments
                    </v-btn>
                    <v-spacer />
                    <v-btn icon="mdi-clock-outline" variant="text" size="small" color="slate" :aria-label="`Payment history for ${item.incomeSource.name}`" @click="openPaymentHistory(item)"></v-btn>
                    <v-btn icon="mdi-pencil-outline" variant="text" size="small" color="slate" :aria-label="`Edit ${item.incomeSource.name}`" @click="editIncomeSource(item)"></v-btn>
                    <v-btn icon="mdi-delete-outline" variant="text" size="small" color="error" :aria-label="`Delete ${item.incomeSource.name}`" @click="pendingDelete = item"></v-btn>
                </div>
            </div>
        </div>

        <div v-else class="empty-state d-flex flex-column align-center py-12 px-4 text-center">
            <v-icon size="40" class="mb-3 text-slate">mdi-cash-plus</v-icon>
            <p class="text-lightest-slate font-weight-bold mb-1">
                {{ store.incomeSourceResponse?.incomeSources?.length ? 'No income sources match this filter' : 'No income sources yet' }}
            </p>
            <p class="text-body-2 text-slate mb-5">Add rent, loan payments or other income you expect into this account.</p>
            <v-btn variant="outlined" color="primary" rounded="pill" class="text-none" prepend-icon="mdi-plus" @click="dialog = true">
                New income source
            </v-btn>
        </div>
    </section>

    <SaveIncomeSourceDialog
        :open="dialog"
        :income-source-id="selectedincomeSourceId"
        :institution-access-item-id="props.institutionAccessItemId"
        @close="closeIncomeSource"
        @income-saved="store.fetchIncomeSources(Number(props.institutionAccessItemId))"
    />

    <v-dialog v-model="paymentHistoryDialog" max-width="480">
        <v-card color="surface" class="dialog-card" rounded="lg">
            <div class="d-flex align-center ga-3 pa-5">
                <div class="flex-grow-1 min-width-0">
                    <p class="font-mono text-caption text-primary text-uppercase mb-1">Payment history</p>
                    <span class="text-lightest-slate text-h6 font-weight-bold d-block text-truncate">{{ selectedSource?.incomeSource.name }}</span>
                </div>
                <v-btn icon="mdi-close" variant="text" color="slate" @click="closePaymentHistory"></v-btn>
            </div>
            <v-divider color="lightest-navy" />
            <div class="pa-5 d-flex flex-column ga-4">
                <div v-for="(h, index) in [...(selectedSource?.paymentHistory ?? [])].reverse()" :key="index">
                    <div class="d-flex justify-space-between font-mono text-caption mb-1">
                        <span class="text-light-slate">{{ h.month }} {{ h.year }}</span>
                        <span :class="h.paidAmount >= h.amountDue && h.amountDue > 0 ? 'text-green' : 'text-slate'">
                            {{ currency(h.paidAmount) }} <span class="text-slate">/ {{ currency(h.amountDue) }}</span>
                        </span>
                    </div>
                    <div class="track track--thin">
                        <span :class="h.paidAmount >= h.amountDue && h.amountDue > 0 ? 'bg-green' : 'bg-info'" :style="{ width: `${Math.min(100, historyHeight(h))}%` }"></span>
                    </div>
                </div>
                <p v-if="!selectedSource?.paymentHistory?.length" class="text-body-2 text-slate mb-0">No payments recorded yet.</p>
            </div>
        </v-card>
    </v-dialog>

    <!-- Deleting used to happen on a single click; confirm first. -->
    <v-dialog :model-value="!!pendingDelete" max-width="440" @update:model-value="v => { if (!v) pendingDelete = null }">
        <v-card color="surface" class="dialog-card" rounded="lg">
            <div class="pa-5">
                <p class="font-mono text-caption text-error text-uppercase mb-2">Delete income source</p>
                <p class="text-lightest-slate text-body-1 mb-1">Delete <strong>{{ pendingDelete?.incomeSource.name }}</strong>?</p>
                <p class="text-slate text-body-2 mb-0">Its linked payments will no longer count toward this account's income.</p>
            </div>
            <v-divider color="lightest-navy" />
            <div class="d-flex justify-end ga-2 pa-4">
                <v-btn class="text-none" variant="text" color="slate" rounded="pill" @click="pendingDelete = null">Cancel</v-btn>
                <v-btn class="text-none" variant="flat" color="error" rounded="pill" :loading="deleting" @click="confirmDelete">Delete</v-btn>
            </div>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import moment from 'moment'
import { useIncomeStore } from "@/store/income"
import incomeService from '@/services/income.service'
import { IncomeSourceSummary, PaymentHistoryItem } from '@/store/types'
import { currency } from '@/filters/currencyFilter'

const props = defineProps({
  institutionAccessItemId: { type: Number }
})

const store = useIncomeStore()

const dialog = ref(false)
const paymentHistoryDialog = ref(false)
const selectedincomeSourceId = ref<number | null>(null)
const selectedSource = ref<IncomeSourceSummary | null>(null)
const pendingDelete = ref<IncomeSourceSummary | null>(null)
const deleting = ref(false)
const search = ref('')
const statusFilter = ref<string | null>(null)

type StatusKey = 'paid' | 'partial' | 'overdue' | 'upcoming'

function statusKey(item: IncomeSourceSummary): StatusKey {
    if (item.currentMonthPaid) return 'paid'
    if (item.currentMonthPaymentTotal > 0) return 'partial'
    if (item.currentMonthPastDue) return 'overdue'
    return 'upcoming'
}

const statusMap: Record<StatusKey, { label: string, color: string }> = {
    paid: { label: 'Paid', color: 'green' },
    partial: { label: 'Partially paid', color: 'info' },
    overdue: { label: 'Past due', color: 'error' },
    upcoming: { label: 'Not paid yet', color: 'slate' },
}

const status = (item: IncomeSourceSummary) => statusMap[statusKey(item)]

const statusFilters = (Object.keys(statusMap) as StatusKey[]).map(key => ({ key, ...statusMap[key] }))

const countByStatus = (key: string) => (store.incomeSourceResponse?.incomeSources ?? []).filter(i => statusKey(i) === key).length

const filteredSources = computed(() => {
    const term = search.value?.toLowerCase() ?? ''
    return (store.incomeSourceResponse?.incomeSources ?? []).filter(i =>
        (!statusFilter.value || statusKey(i) === statusFilter.value) &&
        (!term || i.incomeSource.name.toLowerCase().includes(term))
    )
})

const paidPercent = (item: IncomeSourceSummary) =>
    item.incomeSource.amountDue > 0 ? Math.min(100, Math.round((item.currentMonthPaymentTotal / item.incomeSource.amountDue) * 100)) : 0

const historyHeight = (h: PaymentHistoryItem) =>
    h.amountDue > 0 ? Math.max(h.paidAmount > 0 ? 8 : 0, Math.min(100, Math.round((h.paidAmount / h.amountDue) * 100))) : 0

const historyLabel = (item: IncomeSourceSummary) =>
    item.paymentHistory.slice(-6).map(h => `${h.month}: ${currency(h.paidAmount)} of ${currency(h.amountDue)}`).join(', ')

function dueLabel(item: IncomeSourceSummary) {
    const due = moment(item.dueDate)
    return due.isValid() && due.year() > 1 ? due.format('MMM D') : `day ${item.incomeSource.dayOfMonthDue}`
}

function editIncomeSource(item: IncomeSourceSummary) {
    dialog.value = true
    selectedincomeSourceId.value = item.incomeSource.incomeSourceId
}

function closeIncomeSource(){
    dialog.value = false;
    selectedincomeSourceId.value = null;
}

function openPaymentHistory(item: IncomeSourceSummary) {
    selectedSource.value = item
    paymentHistoryDialog.value = true
}

function closePaymentHistory(){
    paymentHistoryDialog.value = false;
    selectedSource.value = null;
}

async function confirmDelete() {
    if (!pendingDelete.value) return
    deleting.value = true
    await incomeService.deleteIncomeSource({ incomeSourceId: pendingDelete.value.incomeSource.incomeSourceId })
    await store.fetchIncomeSources(Number(props.institutionAccessItemId))
    deleting.value = false
    pendingDelete.value = null
}
</script>

<style scoped>
.filter-field {
    flex: 1 1 220px;
    max-width: 320px;
}

.source-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
    transition: opacity 0.2s ease;
}

.source-grid.is-refreshing {
    opacity: 0.6;
}

.source-card {
    border-radius: 12px;
    background:
        radial-gradient(120% 90% at 100% 0%, rgba(var(--accent, var(--v-theme-slate)), 0.12), transparent 55%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgba(var(--accent, var(--v-theme-slate)), 0.7);
}

.min-width-0 {
    min-width: 0;
}

.status-pill {
    padding: 1px 9px;
    border-radius: 999px;
    color: rgb(var(--accent));
    background: rgba(var(--accent), 0.14);
}

.track {
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
    background: rgb(var(--v-theme-lightest-navy));
}

.track--thin {
    height: 4px;
}

.track > span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: rgb(var(--accent, var(--v-theme-green)));
}

.history {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
}

.history-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.history-bar {
    width: 100%;
    height: 36px;
    display: flex;
    align-items: flex-end;
    border-radius: 4px;
    background: rgba(var(--v-theme-on-surface), 0.04);
    overflow: hidden;
}

.history-bar > span {
    display: block;
    width: 100%;
    border-radius: 4px 4px 0 0;
}

.history-month {
    font-size: 0.6875rem;
    color: rgb(var(--v-theme-slate));
}

.empty-state {
    border-radius: 12px;
    border: 1px dashed rgb(var(--v-theme-lightest-navy));
}

.dialog-card {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}

/* Placeholder bones: strip Vuetify's built-in margins and tone the color down
   (the theme's border-opacity of 1 would otherwise make every bone solid white). */
.bone {
    background: transparent;
}

.bone :deep(.v-skeleton-loader__text),
.bone :deep(.v-skeleton-loader__image) {
    margin: 0;
    max-width: none;
    width: 100%;
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.bone--line :deep(.v-skeleton-loader__text) {
    height: 14px;
}

.bone--small :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.bone--amount :deep(.v-skeleton-loader__text) {
    height: 20px;
}

.bone--bar :deep(.v-skeleton-loader__text) {
    height: 6px;
    border-radius: 999px;
}

.bone--history :deep(.v-skeleton-loader__image) {
    height: 52px;
    border-radius: 6px;
}
</style>
