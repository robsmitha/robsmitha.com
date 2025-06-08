<template>
    <v-dialog
      v-model="dialog"
      transition="dialog-bottom-transition"
      width="600px"
    >
        <v-card>
            <v-toolbar color="white">

                <v-toolbar-title>{{ props.budgetId ? 'Edit' : 'New' }} Budget</v-toolbar-title>

                <v-btn
                    icon="mdi-close"
                    @click="dialog = false"
                ></v-btn>
            </v-toolbar>
            <v-divider />
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-text-field v-model="budgetName" label="Budget Name"></v-text-field>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-menu :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <v-text-field v-model="startDateFormatted" label="Start Date" v-bind="props"></v-text-field>
                            </template>
                            <v-date-picker hide-header v-model="startDate"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col>
                        <v-menu :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <v-text-field v-model="endDateFormatted" label="End Date" v-bind="props"></v-text-field>
                            </template>
                            <v-date-picker hide-header v-model="endDate"></v-date-picker>
                        </v-menu>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-combobox
                            v-model="selectedAccounts"
                            clearable
                            chips
                            multiple
                            label="Accounts"
                            :items="store.accessItems"
                            item-value="institutionAccessItemId"
                            item-title="institution.name"
                        ></v-combobox>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-combobox
                            v-model="selectedCategories"
                            clearable
                            chips
                            multiple
                            label="Categories"
                            :items="store.categories"
                            item-value="financialCategoryId"
                            item-title="name"
                        ></v-combobox>
                    </v-col>
                </v-row>
            </v-card-text>
            
        <v-card-actions class="my-2 d-flex justify-end">
            <v-btn
              class="text-none"
              rounded="xl"
              text="Cancel"
              @click="dialog = false"
            ></v-btn>

            <v-btn
              rounded="xl"
              color="primary"
              class="text-none"
              variant="flat"
              @click="saveBudget"
            >
              Save
            </v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useBudgetStore } from "@/store/budget"
import budgetService from "@/services/budget.service"

const props = defineProps(['open', 'budgetId'])
const emit = defineEmits(['close', 'budget-saved'])

const store = useBudgetStore()

const budgetName = ref<string | null>(null)
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const selectedAccounts = ref<any>(null)
const selectedCategories = ref<any>(null)

watch(selectedAccounts, (newValue: any) => {
  if (newValue?.some((a: any) => a.value === 'all')) {
    selectedAccounts.value =  newValue.length > 1 
        ? [] 
        :  store.accessItems.value.filter((c: any) => c.value !== 'all')
  }
})

watch(selectedCategories, (newValue: any) => {
  if (newValue?.some((a: any) => a.value === 'all')) {
    selectedCategories.value = newValue.length > 1
        ? [] 
        : store.categories.value.filter((c: any) => c.value !== 'all')
  }
})

const dialog = computed({
  get() {
    return props.open
  },
  set(newValue) {
    if(!newValue){
        emit('close')
    }
  }
})

const startDateFormatted = computed(() => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions;
  return startDate?.value ? startDate.value.toLocaleDateString('en-US', options) : null;
})

const endDateFormatted = computed(() => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' } as Intl.DateTimeFormatOptions;
  return endDate?.value ? endDate.value.toLocaleDateString('en-US', options) : null;
})

onMounted(async () => {
    loadForm()
    store.fetchCategories()
    store.fetchAccessItems()
})

async function loadForm(){
    if(props.budgetId) {
        const response = await budgetService.getBudget(Number(props.budgetId))
        const existing = response.data
        budgetName.value = existing.budgetName
        startDate.value = new Date(existing.startDate)
        endDate.value = new Date(existing.endDate)
        selectedAccounts.value = existing.budgetAccessItems
        selectedCategories.value = existing.budgetCategories
    } else {
        const date = new Date();
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const defaultBudgetName = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
        budgetName.value = defaultBudgetName
        startDate.value = firstDay
        endDate.value = lastDay
    }
}

async function saveBudget(){
    const data = {
        budgetId: props.budgetId ? Number(props.budgetId) : 0,
        name: budgetName.value,
        startDate: startDate.value,
        endDate: endDate.value,
        categories: selectedCategories.value?.filter((c: any) => c.financialCategoryId > 0),
        budgetAccessItems: selectedAccounts.value
    }
    
    const response = await budgetService.saveBudget(data)
    if(!response.success) {
        if(response.errorMessage){
            console.error(response.errorMessage)
        } else{
            console.error('An error ocurred saving')
        }
        return
    }

    emit('budget-saved')

    dialog.value = false
}
</script>