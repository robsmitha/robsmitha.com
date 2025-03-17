<template>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    
    <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
      >
        <template v-slot:prepend>
          <v-list-item
                lines="two"
                title="Budget"
                :class="{ 'pl-2': rail }"
                to="edit"
            >
                <template v-slot:prepend>
                    <v-avatar color="green-darken-4" class="ml-2">
                        <v-icon color="white" :size="rail ? 'xsmall': 'large'">mdi-currency-usd</v-icon>
                    </v-avatar>
                </template>
                <template v-slot:subtitle>
                    <v-progress-linear
                      v-if="store.loadingBudget"
                      color="green-darken-4"
                      class="mt-2 mb-1"
                      height="6"
                      indeterminate
                      rounded
                    ></v-progress-linear>
                    <span v-else>{{ store.budget?.budgetName }}</span>
                </template>
            </v-list-item>
        </template>

        <v-divider></v-divider>

        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-chart-pie" title="Estimate" value="edit" to="edit"></v-list-item>
            <v-list-item prepend-icon="mdi-credit-card-outline" title="Transactions" value="transactions" to="transactions">
              <template v-slot:append>
                <v-badge
                  color="error"
                  :content="transactionCount"
                  inline
                ></v-badge>
              </template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-credit-card-off-outline" title="Exemptions" value="exemptions" to="exemptions">
              <template v-slot:append>
                <v-badge
                  :content="excludedCount"
                  inline
                ></v-badge>
              </template>
            </v-list-item>
            <v-list-item prepend-icon="mdi-bank" title="Accounts" value="accounts" to="accounts"></v-list-item>
        </v-list>
        
        <template v-slot:append>
          <v-list-item
                :class="{ 'pl-2': rail }"
            >
                <template v-slot:append>
                    <v-btn
                        :icon="rail ? 'mdi-arrow-collapse-right' : 'mdi-arrow-collapse-left'"
                        variant="text"
                        size="small"
                        class="ml-0"
                        @click="rail = !rail"
                    ></v-btn>
                </template>
            </v-list-item>
        </template>
    </v-navigation-drawer>

    
    <v-sheet color="grey-lighten-4" class="h-100">
        <v-container fluid>
          <router-view />
        </v-container>
    </v-sheet>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import budgetService from "@/services/budget.service"
import { useDisplay } from 'vuetify'
import { useBudgetStore } from "@/store/budget"

const props = defineProps({
  budgetId: { type: String }
})

const store = useBudgetStore()
const { mobile } = useDisplay()

const breadcrumbs = computed(() => [
  {
    title: 'HOME',
    disabled: false,
    to: '/',
  },
  {
    title: 'DASHBOARD',
    disabled: false,
    to: '/dashboard',
  },
  {
    title: store.budget?.budgetName?.toUpperCase() ?? 'BUDGET',
    disabled: true
  }
])

const drawer = ref(true)
const rail = ref(true)

const isMobile = computed(() => mobile.value);

const transactionCount = computed(() => store.budget?.transactions?.filter((c: any) => c.hasTransactionCategory)?.length ?? 0)
const excludedCount = computed(() => store.budget?.excludedTransactions?.length ?? 0)

onMounted(async () => {
    rail.value = isMobile.value
    store.fetchBudget(Number(props.budgetId))
})


</script>