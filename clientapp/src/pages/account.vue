<template>
    <v-breadcrumbs :items="breadcrumbs" class="px-4 pt-4 font-mono text-caption"></v-breadcrumbs>
    <v-navigation-drawer
        v-model="drawer"
        :rail="rail"
        permanent
        color="light-navy"
        class="account-drawer"
      >
        <template v-slot:prepend>
          <v-list-item
                lines="two"
                :class="{ 'pl-2': rail }"
                to="income"
            >
                <template v-slot:prepend>
                    <v-avatar color="surface" class="ml-2">
                        <v-icon color="primary" :size="rail ? 'xsmall': 'large'">mdi-bank</v-icon>
                    </v-avatar>
                </template>
                <template v-if="!rail" v-slot:title>
                    <span class="text-lightest-slate font-weight-bold">Account</span>
                </template>
                <template v-slot:subtitle>
                    <v-progress-linear
                      v-if="store.loadingTransactions"
                      color="primary"
                      class="mt-2 mb-1"
                      height="6"
                      indeterminate
                      rounded
                    ></v-progress-linear>
                    <span v-else class="font-mono text-caption text-slate">{{ store.transactionsResponse?.institutionName }}</span>
                </template>
            </v-list-item>
        </template>

        <v-divider color="lightest-navy"></v-divider>

        <v-list density="compact" nav>
            <v-list-item prepend-icon="mdi-currency-usd" title="Dashboard" value="income" :to="`/account/${institutionAccessItemId}/income`"></v-list-item>
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
          <v-divider color="lightest-navy"></v-divider>
          <v-list-item :class="{ 'pl-2': rail }">
            <v-menu
              v-if="!rail"
              v-model:open="selectMenu"
              location="bottom"
              transition="scale-transition"
            >
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  block
                  variant="text"
                  color="slate"
                  class="font-mono text-none"
                >
                  {{ store.selectedMonthlyTimeline?.text || '' }}
                </v-btn>
              </template>

              <v-list bg-color="surface">
                <v-list-item
                  v-for="option in store.incomeSourceResponse?.monthlyTimelineList"
                  :key="option.text"
                  @click="() => { store.selectedMonthlyTimeline = option; selectMenu = false }"
                >
                  <v-list-item-title>{{ option.text }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <template v-slot:append>
                <v-btn
                    :icon="rail ? 'mdi-arrow-collapse-right' : 'mdi-arrow-collapse-left'"
                    variant="text"
                    color="slate"
                    size="small"
                    class="ml-0"
                    @click="rail = !rail"
                ></v-btn>
            </template>
          </v-list-item>
        </template>
    </v-navigation-drawer>


    <v-sheet color="background" class="h-100">
        <v-container fluid>
          <router-view />
        </v-container>
    </v-sheet>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import { useIncomeStore } from "@/store/income"
import { MonthlyTimeline } from '@/store/types'

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
const selectMenu = ref(false)

const isMobile = computed(() => mobile.value);

watch(() => store.selectedMonthlyTimeline, (val: MonthlyTimeline | null, oldVal: MonthlyTimeline | null) => {
  if(val && val.text !== oldVal?.text) {
    store.fetchIncomeSources(Number(props.institutionAccessItemId))
  }
})

onMounted(async () => {
    rail.value = isMobile.value
    store.fetchIncomeSources(Number(props.institutionAccessItemId))
    store.fetchTransactions(Number(props.institutionAccessItemId))
})
</script>

<style scoped>
.account-drawer :deep(.v-navigation-drawer__border) {
    background-color: rgb(var(--v-theme-lightest-navy));
    opacity: 1;
}
</style>

