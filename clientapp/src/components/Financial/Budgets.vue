<template>
    
    <v-row class="mt-3">
        <v-col>
            <ContentHeader
                title="Spending"
            />
        </v-col>
        <v-col class="text-right">
            <v-btn variant="flat" color="primary" size="large" rounded="xl" @click="dialog = true" :icon="$vuetify.display.mobile">
                <v-icon>mdi-plus</v-icon> <span v-if="!$vuetify.display.mobile">New</span>
            </v-btn>
        </v-col>
    </v-row>
    <v-divider class="mt-3 mb-5" thickness="5px" length="50px" />
    
    <v-row v-if="loading" class="mb-3">
        <v-col v-for="i in 3" :key="`${i}loading`" cols="12" sm="4">
            <v-skeleton-loader
            class="mx-auto border"
            type="chip, text, paragraph, text"
            boilerplate
            ></v-skeleton-loader>
        </v-col>
    </v-row>
    
    <v-row v-else class="mb-5">
        <v-col v-for="b in recentBudgets" :key="b.budget.budgetId" cols="12" sm="4">
            <v-card :to="`/budget/${b.budget.budgetId}/edit`">
                <v-card-title class="text-overline">
                    {{ b.budget.name }}

                    <div class="text-green-darken-3 text-h3 font-weight-bold">{{ b.totalPercent }}%</div>

                    <div class="text-h6 text-medium-emphasis font-weight-regular">
                    ${{ b.estimateTotal - b.transactionsTotal }} remaining
                    </div>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear
                    color="green-darken-3"
                    height="5"
                    :model-value="b.totalPercent"
                    rounded="pill"
                    >
                    </v-progress-linear>

                    <div class="d-flex justify-space-between py-3">
                        <span class="text-green-darken-3 font-weight-medium">
                            ${{ b.transactionsTotal }} spent
                        </span>

                        <span class="text-medium-emphasis"> ${{ b.estimateTotal }} total estimate</span>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
    
    <ContentHeader
        title="Past Spending"
    />
    <v-divider class="mt-3 mb-5" thickness="5px" length="50px" />

    <v-row v-if="loading" class="mb-5">
        <v-col v-for="i in 2" :key="`${i}loading`" cols="12" sm="4">
            <v-skeleton-loader
            class="mx-auto border"
            type="chip, text, paragraph, text"
            boilerplate
            ></v-skeleton-loader>
        </v-col>
    </v-row>
    <v-row v-else-if="pastBudgets.length > 0">
        <v-col v-for="b in pastBudgets" :key="b.budget.budgetId" cols="12" sm="4">
            <v-card :to="`/budget/${b.budget.budgetId}/edit`">
                <v-card-title class="text-overline">
                    {{ b.budget.name }}

                    <div class="text-green-darken-3 text-h3 font-weight-bold">{{ b.totalPercent }}%</div>

                    <div class="text-h6 text-medium-emphasis font-weight-regular">
                    ${{ b.estimateTotal - b.transactionsTotal }} remaining
                    </div>
                </v-card-title>
                <v-card-text>
                    <v-progress-linear
                    color="green-darken-3"
                    height="5"
                    :model-value="b.totalPercent"
                    rounded="pill"
                    >
                    </v-progress-linear>

                    <div class="d-flex justify-space-between py-3">
                        <span class="text-green-darken-3 font-weight-medium">
                            ${{ b.transactionsTotal }} spent
                        </span>

                        <span class="text-medium-emphasis"> ${{ b.estimateTotal }} total estimate</span>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>

    <SaveBudgetDialog :open="dialog" @close="dialog = false" @budget-saved="loadBudgets" />
</template>


<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import budgetService from "@/services/budget.service"

const dialog = ref(false)
const budgets = ref<any>(null)
const loading = ref(false)

onMounted(async () => {
    loadBudgets()
})

const recentBudgets = computed(() => {
    const now = new Date();
    return budgets.value ? budgets.value.filter((b: any) => new Date(b.budget.endDate) >= now) : [];
});

const pastBudgets = computed(() => {
    const now = new Date()
    const past = budgets.value ? budgets.value.filter((b: any) => new Date(b.budget.endDate) < now) : []
    return past
});

async function loadBudgets(){
    loading.value = true
    const response = await budgetService.getBudgets()
    loading.value = false
    if(!response.success){
        return
    }
    budgets.value = response?.data
}


</script>