<template>
    <v-sheet color="grey-lighten-4">
        <v-container>
            <template v-if="bill">
                <v-card>
                    <v-card-item>
                        <v-card-title>
                            {{ bill.type }}{{ bill.number }}
                        </v-card-title>
                        <v-card-subtitle>
                            <span class="me-1">Introduced: {{ getDateDisplayText(bill.introducedDate) }}</span>
                        </v-card-subtitle>
                        <v-card-text class="text-body-2">
                            {{ bill.title }}
                        </v-card-text>

                        <v-card-title class="text-body-1">Sponsors</v-card-title>
                        <v-list v-if="bill.sponsors" density="compact" class="py-0">
                            <v-list-item v-for="s in bill.sponsors" :key="s.bioguideId" class="text-body-2">
                                <v-list-item-text>
                                    {{ s.fullName }}
                                </v-list-item-text>
                            </v-list-item>
                        </v-list>
                        <v-card-text v-else class="text-body-2">
                            No sponsors to display
                        </v-card-text>

                        <v-card-title class="text-body-1">Latest Action</v-card-title>
                        <v-card-subtitle>
                            <span class="me-1">{{ getDateDisplayText(bill.latestAction.actionDate) }}</span>
                        </v-card-subtitle>
                        <v-card-text class="text-body-2">
                            {{ bill.latestAction.text }}
                        </v-card-text>

                        <v-card-title class="text-body-1">CBO Cost Estimates</v-card-title>
                        <v-list v-if="bill.cboCostEstimates" density="compact" class="py-0">
                            <v-list-item v-for="c in bill.cboCostEstimates" :key="c.url">
                                <v-list-item-text class="text-body-2">
                                    {{ c.description }}
                                </v-list-item-text>
                                <template v-slot:append>
                                    <v-btn :href="c.url" target="_blank" variant="text" color="grey-lighten-1" icon="mdi-open-in-new">
                                    </v-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-card-item>
                </v-card>
            </template>
            <template v-else>
                <v-skeleton-loader
                    class="mx-auto border"
                    type="article, paragraph, article, paragraph"
                    ></v-skeleton-loader>
            </template>
        </v-container>
    </v-sheet>
</template>


<script lang="ts" setup>
import { onMounted, ref, defineProps } from 'vue'

const props = defineProps({
  congress: { type: String },
  billType: { type: String },
  billNumber: { type: String }
})

const loading = ref(false)
const bill = ref()

onMounted(() => {
    getBill()
})

async function getBill(){
    loading.value = true
    const response = await fetch(`/api/CongressGetBill?congress=${props.congress}&billType=${props.billType}&billNumber=${props.billNumber}`)
    if (!response.ok){
        console.error("Failed to get bill.")
        return
    }
    const data = await response.json()
    bill.value = data.bill
    console.log("data.bill", data.bill)
    loading.value = false
}

function getDateDisplayText(dateString){
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, '0') // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()

    let hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const ampm = hours >= 12 ? 'pm' : 'am'

    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    const formattedHours = String(hours)
    return `${month}/${day}/${year} ${formattedHours}:${minutes}${ampm}`
}
</script>