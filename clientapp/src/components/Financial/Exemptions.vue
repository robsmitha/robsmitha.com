<template>

    <ContentHeader
        title="Exemptions"
        :overline="store.budget?.dateRange"
    />

    <v-row class="my-2">
        <v-col>
            <v-data-table
                :headers="excludedHeaders"
                :items="store.budget?.excludedTransactions"
                :loading="store.loadingBudget"
                item-value="transactionId"
                items-per-page="5"
            >
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn 
                        size="small" 
                        color="grey-darken-2" 
                        icon 
                        variant="text" 
                        @click="restoreTransaction(item)">
                        <v-icon>mdi-delete-off-outline</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-col>
    </v-row>
</template>

<script lang="ts" setup>

import { useBudgetStore } from "@/store/budget"

const props = defineProps({
  budgetId: { type: Number }
})

const store = useBudgetStore()

const excludedHeaders = [
    { title: 'Date', key: 'date' },
    { title: 'Transaction', key: 'name' },
    { title: 'Amount', key: 'amount' },
    { title: 'Account', key: 'account.official_name' },
    { title: '', sortable: false, key: 'actions' }
]

async function restoreTransaction(t: any) {
    await store.restoreTransactions(Number(props.budgetId), t)
    await store.fetchBudget(Number(props.budgetId))
}
</script>