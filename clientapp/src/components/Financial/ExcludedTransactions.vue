<template>
    <v-row>
        <v-col>
            <span class="text-h4 font-weight-medium d-block">Excluded Transactions</span>
            <span class="text-caption text-grey-darken-1 d-block">
                {{ store.budget?.dateRange }}
            </span>
        </v-col>
    </v-row>
    
    <v-row>
        <v-col>
            <v-data-table
                :headers="headers"
                :items="store.budget?.excludedTransactions"
                :loading="loading"
                item-value="transactionId"
                items-per-page="5"
            >
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn size="small" color="grey-darken-2" icon variant="text" @click="restoreTransactions(item)">
                        <v-icon>mdi-recycle</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script lang="ts" setup>

import { ref, watch, computed, onMounted } from 'vue'
import { useBudgetStore } from "@/store/budget"
import budgetService from "@/services/budget.service"

const props = defineProps({
  budgetId: { type: String }
})

const store = useBudgetStore()
const loading = ref(false)
const headers = [
    { title: 'Date', key: 'date' },
    { title: 'Transaction', key: 'name' },
    { title: 'Amount', key: 'amount' },
    { title: 'Account', key: 'account.official_name' },
    { title: '', sortable: false, key: 'actions' }
]

async function restoreTransactions(t:any) {
    loading.value = true
    await budgetService.setRestoredTransaction({
        transactionId: t.transaction_id,
        budgetId: Number(props.budgetId)
    })
    store.fetchBudget(Number(props.budgetId))
    loading.value = false
}
</script>