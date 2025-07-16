<template>
    <v-row>
        <v-col>
            <ContentHeader
                title="Revenue"
            />
        </v-col>
        <v-col class="text-right">
            <v-btn variant="flat" color="primary" rounded="xl" @click="dialog = true" :icon="$vuetify.display.mobile">
                <v-icon>mdi-plus</v-icon> <span v-if="!$vuetify.display.mobile">New</span>
            </v-btn>
        </v-col>
    </v-row>
    <v-divider class="mt-3 mb-5" thickness="5px" length="50px" />

    <v-row>
        <v-col>
            <v-card>
                <v-data-table 
                    :headers="headers" 
                    :items="store.incomeSources"
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
                                        rounded
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
                            <td v-if="!isMobile">{{ new Date(item.dueDate).toLocaleDateString() }}</td>
                            <td>
                                <v-tooltip v-if="item.currentMonthPaid" location="top">
                                    <template #activator="{ props }">
                                        <span v-bind="props">
                                            <v-chip
                                                
                                                size="small"
                                                color="green-darken-3"
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
                                                color="blue-darken-3"
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
                                                color="red-darken-3"
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
                                    <v-btn v-bind="props" size="x-small" color="grey-darken-1" variant="text" icon class="text-none mr-1" @click="editIncomeSource(item)">
                                        <v-icon>mdi-pencil</v-icon>
                                    </v-btn>
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="Payment History" location="top">
                                    <template #activator="{ props }">
                                    <v-btn v-bind="props" size="x-small" color="grey-darken-1" variant="text" icon class="text-none mr-1" @click="openPaymentHistory(item)">
                                        <v-icon>mdi-clock-outline</v-icon>
                                    </v-btn>
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="Link Transactions" location="top">
                                    <template #activator="{ props }">
                                    <v-btn v-bind="props" size="x-small" color="grey-darken-1" variant="text" icon class="text-none mr-1" :to="`/account/${institutionAccessItemId}/transactions/${item.incomeSource.incomeSourceId}`">
                                        <v-icon>mdi-link</v-icon>
                                    </v-btn>
                                    </template>
                                </v-tooltip>

                                <v-tooltip text="Delete" location="top">
                                    <template #activator="{ props }">
                                    <v-btn v-bind="props" size="x-small" color="grey-darken-1" variant="text" icon class="text-none" @click="deleteIncomeSource(item)">
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
        { title: 'Due Date', key: 'incomeSource.dueDate' },
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