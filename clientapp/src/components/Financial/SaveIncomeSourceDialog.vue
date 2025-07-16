<template>
    <v-dialog
      v-model="dialog"
      transition="dialog-bottom-transition"
      width="600px"
    >
    <v-card>
            <v-toolbar color="white">

                <v-toolbar-title>{{ props.incomeSourceId ? 'Edit' : 'New' }} Revenue Source</v-toolbar-title>

                <v-btn
                    icon="mdi-close"
                    @click="dialog = false"
                ></v-btn>
            </v-toolbar>
            <v-divider />
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-text-field v-model="name" label="Name"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-select v-model="incomeSourceType" label="Income Type" :items="['Rent', 'Loan', 'Other']"></v-select>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-textarea v-model="description" label="Description"></v-textarea>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="amountDue" label="Amount Due"></v-text-field>
                    </v-col>
                    <v-col>
                        <v-select v-model="dayOfMonthDue" label="Day Of Month Due" :items="Array.from({ length: 28 }, (_, i) => i + 1)"></v-select>
                    </v-col>
                </v-row>
                <!-- <v-row>
                    <v-col>
                        <v-menu :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <v-text-field v-model="startDateFormatted" label="Start Date" clearable @click:clear="startDate = null" v-bind="props"></v-text-field>
                            </template>
                            <v-date-picker hide-header v-model="startDate"></v-date-picker>
                        </v-menu>
                    </v-col>
                    <v-col>
                        <v-menu :close-on-content-click="false">
                            <template v-slot:activator="{ props }">
                                <v-text-field v-model="endDateFormatted" label="End Date" clearable @click:clear="endDate = null" v-bind="props"></v-text-field>
                            </template>
                            <v-date-picker hide-header v-model="endDate"></v-date-picker>
                        </v-menu>
                    </v-col>
                </v-row> -->
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
              @click="saveIncomeSource"
            >
              Save
            </v-btn>
        </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useIncomeStore } from "@/store/income"
import incomeService from '@/services/income.service'
import { IncomeSource } from '@/store/types'

const props = defineProps(['open', 'incomeSourceId', 'institutionAccessItemId'])
const emit = defineEmits(['close', 'income-saved'])
const store = useIncomeStore()

const name = ref<string>('')
const description = ref<string>('')
const startDate = ref<Date | null>(null)
const endDate = ref<Date | null>(null)
const amountDue = ref<number | null>(null)
const incomeSourceType = ref<string>('')
const dayOfMonthDue = ref<number>(15)

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

watch(() => props.open, () => {
  loadForm()
}, {
  immediate: true
})

onMounted(async () => {
    loadForm()
})

async function loadForm(){
    if(props.incomeSourceId) {
        const response = await incomeService.getIncomeSource(Number(props.incomeSourceId))
        const existing = response.data
        name.value = existing.name
        startDate.value = existing.startDate && new Date(existing.startDate)
        endDate.value = existing.endDate && new Date(existing.endDate)
        description.value = existing.description
        amountDue.value = existing.amountDue
        dayOfMonthDue.value = existing.dayOfMonthDue
        incomeSourceType.value = existing.incomeSourceType
    } else {
        name.value = ''
        startDate.value = null
        endDate.value = null
        description.value = ''
        amountDue.value = null
        dayOfMonthDue.value = 15
        incomeSourceType.value = ''
    }
}

async function saveIncomeSource(){
    const data: IncomeSource = {
        incomeSourceId: props.incomeSourceId ? Number(props.incomeSourceId) : 0,
        name: name.value,
        description: description.value,
        startDate: startDate.value,
        endDate: endDate.value,
        institutionAccessItemId: Number(props.institutionAccessItemId),
        amountDue: Number(amountDue.value),
        dayOfMonthDue: dayOfMonthDue.value,
        incomeSourceType: incomeSourceType.value,
        expectedPaymentMemos: [],
        isExisting: !!props.incomeSourceId
    }
    
    const response = await incomeService.saveIncomeSource(data)
    if(!response.success) {
        if(response.errorMessage){
            console.error(response.errorMessage)
        } else{
            console.error('An error ocurred saving')
        }
        return
    }

    emit('income-saved')

    dialog.value = false
}
</script>