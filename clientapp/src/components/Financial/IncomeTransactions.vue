<template>

    <v-row>
        <v-col>
            <ContentHeader
                title="Transactions"
            />
        </v-col>
        <v-col class="text-right">
            <v-btn variant="flat" color="primary" rounded="xl" :disabled="!selectedIncomeSourceIdId" :loading="store.loadingTransactions" @click="assignTransaction" :icon="$vuetify.display.mobile">
                <v-icon>mdi-check</v-icon> <span v-if="!$vuetify.display.mobile">Save</span>
            </v-btn>
        </v-col>
    </v-row>

    <v-divider class="mt-3 mb-5" thickness="5px" length="50px" />

    <v-card>
        <v-data-table
            v-model="selectedTransactions"
            :headers="headers"
            :items="store?.transactions"
            :loading="store.loadingTransactions"
            item-value="transactionId"
            items-per-page="5"
            return-object
            show-select
        >
            <template v-slot:top>
                <v-container class="pb-0" fluid>
                    <v-row>
                        <v-col>
                            <v-autocomplete
                                v-model="selectedIncomeSourceIdId"
                                :items="store.incomeSources"
                                :disabled="!selectedTransactions || selectedTransactions.length === 0 || store.loadingIncome"
                                clearable
                                chips
                                label="Link Transactions"
                                item-value="incomeSource.incomeSourceId"
                                item-title="incomeSource.name"
                                variant="outlined"
                                hide-details
                                density="compact"
                                rounded="xl"
                                prepend-icon="mdi-link"
                            >
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                </v-container>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
                <v-btn v-if="!!item.incomePayment?.incomePaymentId" size="small" color="grey-darken-2" icon variant="text" @click="unAssignTransaction(item)">
                    <v-icon>mdi-link-off</v-icon>
                </v-btn>
            </template>
        </v-data-table>
    </v-card>
</template>

<script lang="ts" setup>

import { ref, watch } from 'vue'
import { useIncomeStore } from '@/store/income'
import incomeService from '@/services/income.service'
import { IncomePayment, IncomeSource, IncomeSourceSummary, Transaction } from '@/store/types'

const props = defineProps({
  institutionAccessItemId: { type: Number },
  incomeSourceId: { type: Number }
})

const store = useIncomeStore()

const headers = [
    { title: 'Date', key: 'date' },
    { title: 'Transaction', key: 'name' },
    { title: 'Amount', key: 'amount' },
    { title: 'Pending', key: 'pending' },
    { title: 'Account', key: 'account.official_name' },
    { title: 'Income Source', key: 'incomePayment.incomeSourceName' },
    { title: '', sortable: false, key: 'actions' }
]

const selectedTransactions = ref<Transaction[]>([])
const selectedIncomeSourceIdId = ref<number | IncomeSourceSummary | undefined>()


watch(() => store.incomeSources, (val: IncomeSourceSummary[]) => {
    if(val){
        const item = val.find(i => i.incomeSource.incomeSourceId === Number(props.incomeSourceId))
        selectedIncomeSourceIdId.value = item
    }
}, {
    immediate: true
})
async function assignTransaction() {
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
    store.fetchTransactions(Number(props.institutionAccessItemId))
    store.fetchIncomeSources(Number(props.institutionAccessItemId))
    selectedTransactions.value = [];
    selectedIncomeSourceIdId.value = undefined;
}

async function unAssignTransaction(item: Transaction) {
    await incomeService.deleteIncomePayment({ incomePaymentId: Number(item.incomePayment.incomePaymentId)})
    store.fetchTransactions(Number(props.institutionAccessItemId))
    store.fetchIncomeSources(Number(props.institutionAccessItemId))
}

</script>