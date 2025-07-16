<template>
    <v-breadcrumbs bg-color="grey-darken-4" :items="breadcrumbs"></v-breadcrumbs>
    <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        color="grey-darken-4"
      >
        <template v-slot:prepend>
          <v-list-item
                lines="two"
                title="Account"
                :class="{ 'pl-2': rail }"
                to="income"
            >
                <template v-slot:prepend>
                    <v-avatar color="blue-darken-4" class="ml-2">
                        <v-icon color="white" :size="rail ? 'xsmall': 'large'">mdi-bank</v-icon>
                    </v-avatar>
                </template>
                <template v-slot:subtitle>
                    <v-progress-linear
                      v-if="store.loadingTransactions"
                      color="blue-darken-4"
                      class="mt-2 mb-1"
                      height="6"
                      indeterminate
                      rounded
                    ></v-progress-linear>
                    <span v-else>{{ store.transactionsResponse?.institutionName }}</span>
                </template>
            </v-list-item>
        </template>

        <v-divider></v-divider>

        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-currency-usd" title="Revenue" value="income" :to="`/account/${institutionAccessItemId}/income`"></v-list-item>
            <v-list-item prepend-icon="mdi-link" title="Transactions" value="transactions" :to="`/account/${institutionAccessItemId}/transactions`">
              <template v-slot:append>
                <v-badge
                  color="error"
                  :content="store.transactions?.length ?? 0"
                  inline
                ></v-badge>
              </template>
            </v-list-item>
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
import { useDisplay } from 'vuetify'
import { useIncomeStore } from "@/store/income"

const props = defineProps({
  institutionAccessItemId: { type: Number }
})

const store = useIncomeStore()
const { mobile } = useDisplay()

const breadcrumbs = computed(() => {
  return store.transactionsResponse?.institutionName ? [
    {
      title: 'HOME',
      disabled: false,
      to: '/',
    },
    {
      title: 'ACCOUNTS',
      disabled: false,
      to: '/accounts',
    },
    {
      title: store.transactionsResponse.institutionName,
      disabled: true
    }
  ]
  : [
    {
      title: 'HOME',
      disabled: false,
      to: '/',
    },
    {
      title: 'ACCOUNTS',
      disabled: false,
      to: '/accounts',
    }
  ]
}) 
  

const drawer = ref(true)
const rail = ref(true)

const isMobile = computed(() => mobile.value);

onMounted(async () => {
    rail.value = isMobile.value
    store.fetchIncomeSources(Number(props.institutionAccessItemId))
    store.fetchTransactions(Number(props.institutionAccessItemId))
})
</script>