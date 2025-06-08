<template>
    <v-dialog
      v-model="dialog"
      :max-width="400"
    >
        <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
                <div class="text-h5 text-medium-emphasis ps-2">
                    Save Estimate
                </div>

                <v-btn
                    icon="mdi-close"
                    variant="text"
                    @click="dialog = false"
                ></v-btn>
            </v-card-title>
            <v-divider />
            <v-card-text>
                <v-row>
                    <v-col>
                        <v-text-field v-model="estimate" :label="`${props.categoryName} Estimate`"></v-text-field>
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
                  class="text-none"
                  color="primary"
                  rounded="xl"
                  text="Save"
                  variant="flat"
                  @click="saveEstimate"
                ></v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>


<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useBudgetStore } from "@/store/budget"
import budgetService from "@/services/budget.service"
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const props = defineProps(['open', 'budgetId', 'categoryName', 'categoryEstimate'])
const emit = defineEmits(['close', 'estimate-saved'])

const store = useBudgetStore()
const estimate = ref(0)

const dialog = computed({
  get() {
    return props.open
  },
  set(newValue) {
    if(!newValue){
        estimate.value = 0
        emit('close')
    }
  }
})



watch(() => props.categoryEstimate, (newVal) => {
  estimate.value = newVal
})

async function saveEstimate() {
    await store.updateBudgetCategoryEstimate(Number(props.budgetId), props.categoryName, Number(estimate.value))

    emit('estimate-saved')

    dialog.value = false
}


</script>