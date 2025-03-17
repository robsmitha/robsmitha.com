<template>

    <ContentHeader
        title="Transactions"
        :overline="store.budget?.dateRange"
    />

    <v-row class="my-2">
        <v-col cols="9" md="11" class="pr-1">
            <v-autocomplete
                v-model="selectedCategoryId"
                :items="store.categories"
                :disabled="!selectedTransactions || selectedTransactions.length === 0 || store.loadingBudget"
                clearable
                chips
                label="Categories"
                item-value="financialCategoryId"
                item-title="name"
                variant="outlined"
                hide-details
                density="compact"
            >
            </v-autocomplete>
        </v-col>
        <v-col cols="3" md="1" class="pl-1">
            <v-btn 
                color="green-darken-4" 
                variant="tonal" 
                class="h-100" 
                block 
                :disabled="!selectedCategoryId" 
                :loading="store.loadingBudget" 
                @click="saveCategories"
            >
                <v-icon>mdi-content-save</v-icon> Save
            </v-btn>
        </v-col>
    </v-row>
    <v-card>
        <v-card-text>
            <v-data-table
                v-model="selectedTransactions"
                :headers="headers"
                :items="store.budget?.transactions"
                :loading="store.loadingBudget"
                item-value="transactionId"
                items-per-page="5"
                return-object
                show-select
            >
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn size="small" color="grey-darken-2" icon variant="text" @click="excludeTransactions(item)">
                        <v-icon>mdi-delete-outline</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script lang="ts" setup>

import { ref, onMounted } from 'vue'
import { useBudgetStore } from "@/store/budget"

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

const selectedTransactions = ref<any>(null)
const selectedCategoryId = ref<any>(null)

onMounted(async () => {
    store.fetchCategories()
})

async function saveCategories(e: Event) {
    e.stopPropagation()
    if(selectedCategoryId.value && selectedTransactions.value.length > 0){
        await store.setTransactionsCategory(Number(props.budgetId), selectedCategoryId.value, selectedTransactions.value)
        await store.fetchBudget(Number(props.budgetId))

        selectedCategoryId.value = null
        selectedTransactions.value = null
    }
}

async function excludeTransactions(t: any) {
    await store.excludeTransactions(Number(props.budgetId), t)
    await store.fetchBudget(Number(props.budgetId))
}

</script>