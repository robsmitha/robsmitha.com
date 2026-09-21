<template>
    <v-row>
        <v-col>
            <ContentHeader
                :title="store.selectedMonthlyTimeline?.text"
            />
        </v-col>
        <v-col class="text-right">
            <v-btn variant="outlined" color="primary" class="font-mono text-none" @click="dialog = true" :icon="$vuetify.display.mobile">
                <v-icon>mdi-plus</v-icon> <span v-if="!$vuetify.display.mobile">New</span>
            </v-btn>
        </v-col>
    </v-row>
    <v-divider class="mt-3 mb-5" color="primary" thickness="4" length="48" />

    <div class="d-flex flex-wrap ga-8 income-stats mb-8">
        <div>
            <div class="d-flex align-center ga-2">
                <v-icon color="info" size="20">mdi-cash-multiple</v-icon>
                <span class="font-mono text-caption text-slate text-uppercase">Total Due</span>
            </div>
            <span class="font-mono text-h5 text-info font-weight-bold d-block">${{ store.incomeSourceResponse?.totalDue.toFixed(2) }}</span>
        </div>

        <div>
            <div class="d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-check-circle</v-icon>
                <span class="font-mono text-caption text-slate text-uppercase">Total Paid</span>
            </div>
            <span class="font-mono text-h5 text-primary font-weight-bold d-block">${{ store.incomeSourceResponse?.totalPaid.toFixed(2) }}</span>
        </div>

        <div>
            <div class="d-flex align-center ga-2">
                <v-icon color="error" size="20">mdi-alert-circle</v-icon>
                <span class="font-mono text-caption text-slate text-uppercase">Total Overdue</span>
            </div>
            <span class="font-mono text-h5 text-error font-weight-bold d-block">${{ store.incomeSourceResponse?.totalOverdue.toFixed(2) }}</span>
        </div>

        <div>
            <div class="d-flex align-center ga-2">
                <v-icon color="slate" size="20">mdi-calendar-clock</v-icon>
                <span class="font-mono text-caption text-slate text-uppercase">Next Due Date</span>
            </div>
            <span v-if="store.incomeSourceResponse?.nextDueDate" class="font-mono text-h5 text-lightest-slate font-weight-bold d-block">
                {{ store.incomeSourceResponse.nextDueDate.startsWith('0001-01-01') ? 'None' : new Date(store.incomeSourceResponse.nextDueDate).toLocaleDateString('en-US') }}
            </span>
        </div>
    </div>

    <v-row dense>
        <v-col>
            <v-card color="surface" class="income-table-card">
                <v-data-table
                    :headers="headers"
                    :items="store.incomeSourceResponse?.incomeSources"
                    :custom-filter="filter"
                    :search="search"
                    item-value="name"
                    items-per-page="5"
                >
                    <template v-slot:top>
                        <v-container class="pb-0" fluid>
                            <v-row>
                                <v-col>
                                    <v-text-field
                                        v-model="search"
                                        prepend-icon="mdi-filter"
                                        label="Filter"
                                        clearable
                                        variant="outlined"
                                        color="primary"
                                        base-color="slate"
                                        class="font-mono"
                                        rounded="lg"
                                        density="compact"
                                        hide-details
                                    >
                                    </v-text-field>
                                </v-col>
                            </v-row>
                        </v-container>
                    </template>
                    <template v-slot:item="{ item }">
                        <tr class="text-no-wrap">
                            <td>{{ item.incomeSource.name }}</td>
                            <td v-if="!isMobile">{{ item.incomeSource.amountDue.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}</td>
                            <td>
                                <v-tooltip v-if="item.currentMonthPaid" location="top">
                                    <template #activator="{ props }">
                                        <span v-bind="props">
                                            <v-chip
                                                size="small"
                                                color="primary"
                                                variant="tonal"
                                                class="font-mono"
                                            >
                                                Paid
                                            </v-chip>
                                        </span>
                                    </template>
                                    <span>
                                        Paid:
                                        {{ item.currentMonthPaymentTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
                                    </span>
                                </v-tooltip>
                                <v-tooltip v-else-if="item.currentMonthPaymentTotal > 0" location="top">
                                    <template #activator="{ props }">
                                        <span v-bind="props">
                                            <v-chip
                                                size="small"
                                                color="info"
                                                variant="tonal"
                                                class="font-mono"
                                            >
                                                Partially Paid
                                            </v-chip>
                                        </span>
                                    </template>
                                    <span>
                                        Paid:
                                        {{ item.currentMonthPaymentTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
                                    </span>
                                </v-tooltip>
                                <v-tooltip v-else-if="item.currentMonthPastDue" location="top">
                                    <template #activator="{ props }">
                                        <span v-bind="props">
                                            <v-chip
                                                size="small"
                                                color="error"
                                                variant="tonal"
                                                class="font-mono"
                                            >
                                                Past Due
                                            </v-chip>
                                        </span>
                                    </template>
                                    <span>
                                        Due:
                                        {{ new Date(item.dueDate).toLocaleDateString() }}
                                    </span>
                                </v-tooltip>
                                <v-tooltip v-else location="top">
                                    <template #activator="{ props }">
                                        <span v-bind="props">
                                            <v-chip
                                                size="small"
                                                color="slate"
                                                variant="outlined"
                                                class="font-mono"
                                            >
                                                No Payment
                                            </v-chip>
                                        </span>
                                    </template>
                                    <span>
                                        Due:
                                        {{ new Date(item.dueDate).toLocaleDateString() }}
                                    </span>
                                </v-tooltip>
                            </td>
                            <td>
                                <v-tooltip text="Edit" location="top">
                                    <template #activator="{ props }">
                                    <v-btn v-bind="props" size="x-small" color="slate" variant="text" icon class="text-none mr-1" @click="editIncomeSource(item)">
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="Payment History" location="top">
                                    <template #activator="{ props }">
                                    <v-btn v-bind="props" size="x-small" color="slate" variant="text" icon class="text-none mr-1" @click="openPaymentHistory(item)">
                                        <v-icon>mdi-clock-outline</v-icon>
                                    </v-btn>
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="Link Transactions" location="top">
                                    <template #activator="{ props }">
                                    <v-btn v-bind="props" size="x-small" color="slate" variant="text" icon class="text-none mr-1" :to="`/account/${institutionAccessItemId}/transactions/${item.incomeSource.incomeSourceId}`">
                                        <v-icon>mdi-link</v-icon>
                                    </v-btn>
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="Delete" location="top">
                                    <template #activator="{ props }">
                                    <v-btn v-bind="props" size="x-small" color="slate" variant="text" icon class="text-none" @click="deleteIncomeSource(item)">
                                        <v-icon>mdi-trash-can</v-icon>
                                    </v-btn>
                                    </template>
                                </v-tooltip>
                            </td>

                        </tr>
                    </template>
                </v-data-table>
            </v-card>
        </v-col>
    </v-row>

    <SaveIncomeSourceDialog 
        :open="dialog" 
        :income-source-id="selectedincomeSourceId" 
        :institution-access-item-id="props.institutionAccessItemId" 
        @close="closeIncomeSource"
        @income-saved="store.fetchIncomeSources(Number(props.institutionAccessItemId))" 
    />
    <v-dialog
        v-model="paymentHistoryDialog"
        :max-width="500"
    >
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <div>
                    <v-icon color="grey-darken-3" size="small">mdi-clock-outline</v-icon>
                    <span class="ml-2">Payment History</span>
                </div>

                <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="closePaymentHistory"
                ></v-btn>
              </v-card-title>
              <v-divider />
              <v-list>
                <v-list-item 
                    v-for="(i, index) in selectedPaymentHistory" 
                    :key="index" 
                    :title="`${i.month} ${i.year}`" 
                    :subtitle="`Paid: ${i.paidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`">
                    <v-divider class="mt-2" />
                </v-list-item>
              </v-list>
        </v-card>
    </v-dialog>
    <v-dialog
        v-model="snackbar"
        :max-width="500"
    >
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <div>
                    <v-icon color="red-darken-3" size="small">mdi-alert</v-icon>
                    <span class="ml-2">Request Failed</span>
                </div>

                <v-btn
                  icon="mdi-close"
                  variant="text"
                  @click="snackbar = false"
                ></v-btn>
              </v-card-title>
              <v-divider />
              <v-card-text class="pt-2">
                {{ errorMessage }}
              </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useIncomeStore } from "@/store/income"
import { useDisplay } from 'vuetify'
import incomeService from '@/services/income.service'
import { IncomeSourceSummary } from '@/store/types'

const props = defineProps({
  institutionAccessItemId: { type: Number }
})

const store = useIncomeStore()
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)
const headers = isMobile.value 
    ? [
        { title: 'Name', key: 'incomeSource.name' },
        { title: 'Status', key: 'incomeSource.dayOfMonthDue' },
        { title: '', key: 'actions', sortable: false }
    ]
    : [
        { title: 'Name', key: 'incomeSource.name' },
        { title: 'Amount Due', key: 'incomeSource.amountDue' },
        { title: 'Status', key: 'incomeSource.dayOfMonthDue' },
        { title: '', key: 'actions', sortable: false }
    ];
type MonthlyPayment = {
  month: string;
  year: number;
  paidAmount: number;
  amountDue: number;
};
const dialog = ref(false)
const paymentHistoryDialog = ref(false)
const selectedincomeSourceId = ref<number | null>(null)
const search = ref('')
const snackbar = ref(false)
const errorMessage = ref('')
const selectedPaymentHistory = ref<MonthlyPayment[] | null>(null)

function filter (value: string, query: string) {
    const upperCaseQuery = query.toLocaleUpperCase()
    return value != null &&
        upperCaseQuery != null &&
        typeof value === 'string' &&
        value.toString().toLocaleUpperCase().indexOf(upperCaseQuery) !== -1
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
    paymentHistoryDialog.value = true
    selectedPaymentHistory.value = item.paymentHistory
}

function closePaymentHistory(){
    paymentHistoryDialog.value = false;
    selectedPaymentHistory.value = null;
}

async function deleteIncomeSource(item: IncomeSourceSummary) {
    await incomeService.deleteIncomeSource({ incomeSourceId: item.incomeSource.incomeSourceId })
    await store.fetchIncomeSources(Number(props.institutionAccessItemId));

}
</script>

<style scoped>
.income-stats > div {
    padding-left: 2rem;
    border-left: 1px solid rgb(var(--v-theme-lightest-navy));
}

.income-stats > div:first-child {
    padding-left: 0;
    border-left: none;
}

.income-table-card {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}

@media (max-width: 600px) {
    .income-stats {
        gap: 1.5rem !important;
    }

    .income-stats > div {
        padding-left: 0;
        border-left: none;
        min-width: 40%;
    }
}
</style>
