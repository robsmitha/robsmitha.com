<template>
    <v-sheet color="grey-darken-4">
        <v-container>
            <v-row  v-if="bill">
                <v-col cols="12">
                    <span class="text-h4 font-weight-thin d-block">{{ bill.type }}{{ bill.number }}</span>
                    <span class="text-subtitle d-block">Introduced: {{ getDateDisplayText(bill.introducedDate) }}</span>
                </v-col>
            </v-row>
            <v-skeleton-loader v-else color="grey-darken-4" type="subtitle"></v-skeleton-loader>
        </v-container>
    </v-sheet>
    <v-sheet class="py-5">
        <v-container>
            <template v-if="bill">
                <v-card flat>
                    <v-card-text class="text-body-1">
                        {{ bill.title }}
                    </v-card-text>

                    <v-card-title class="text-body-1">Sponsors</v-card-title>
                    <v-list v-if="bill.sponsors && bill.sponsors.length > 0" density="compact" class="py-0">
                        <v-list-item v-for="s in bill.sponsors" :key="s.bioguideId" class="text-body-2">
                            <v-list-item-title>
                                {{ s.fullName }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                    <v-card-text v-else class="text-body-2">
                        No sponsors to display
                    </v-card-text>

                    <v-card-title class="text-body-1">Cosponsors</v-card-title>
                    <v-data-table 
                        density="compact" 
                        :headers="cosponsorHeaders"
                        :items="cosponsors"
                        :items-per-page="5"
                        :items-per-page-options="itemsPerPageOptions"
                    ></v-data-table>

                    <template v-if="bill.cboCostEstimates">
                        <v-card-title class="text-body-1">CBO Cost Estimates</v-card-title>
                        <v-list density="compact" class="py-0">
                            <v-list-item v-for="c in bill.cboCostEstimates" :key="c.url">
                                <v-list-item-subtitle class="text-body-2">
                                    {{ c.description }}
                                </v-list-item-subtitle>
                                <template v-slot:append>
                                    <v-btn :href="c.url" target="_blank" variant="text" color="grey-lighten-1" icon="mdi-open-in-new">
                                    </v-btn>
                                </template>
                            </v-list-item>
                        </v-list>
                    </template>

                    <v-card-title class="text-body-1">Timeline</v-card-title>
                    <template v-if="actions">
                        <v-timeline density="compact" side="end">
                            <v-timeline-item v-for="(a, i) in actions" :key="`action_${i}`" size="small" dot-color="grey">
                                <div>
                                    <div class="text-grey-darken-1 text-caption">{{ moment(a.actionDate).startOf('day').fromNow() }}</div>
                                    <!-- <div class="text-h6">{{ a.sourceSystem.name }}</div> -->
                                    <p class="text-body-2">
                                        {{ a.text }}
                                    </p>
                                </div>
                            </v-timeline-item>
                        </v-timeline>
                    </template>

                    <v-card-title class="text-body-1">Amendments</v-card-title>
                    <v-list v-if="amendments.length > 0" density="compact" class="py-0">
                        <v-list-item v-for="a in amendments" :key="a.number">
                            <v-list-item-subtitle class="text-body-2">
                                {{ a.type }}
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-list>
                    <v-card-text v-else class="text-body-2">
                        No amendments to display
                    </v-card-text>
                </v-card>
            </template>
            <template v-else>
                <v-skeleton-loader
                    color="transparent"
                    class="mx-auto border-0"
                    type="article, table-heading, table-thead, table-tbody, avatar, text"
                    ></v-skeleton-loader>
                <v-skeleton-loader
                    color="transparent"
                    class="mx-auto border-0"
                    type="avatar, text, article"
                    ></v-skeleton-loader>
            </template>
        </v-container>
    </v-sheet>
</template>


<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Bill } from '@/components/Congress/types/BillDetailsResponse.types'
import { Action } from '@/components/Congress/types/BillActionsResponse.types'
import { Cosponsor } from '@/components/Congress/types/BillCosponsorsResponse.types'
import { Amendment } from '@/components/Congress/types/BillAmendmentsResponse.types'
import moment from 'moment'
import apiClient from '@/api/elysianClient'

const props = defineProps({
  congress: { type: String },
  billType: { type: String },
  billNumber: { type: String }
})

const itemsPerPageOptions = [
    {value: 5, title: '5'},
    {value: 10, title: '10'},
    {value: 25, title: '25'}
]
const cosponsorHeaders = [
    { title: 'Name', key: 'fullName' },
    { title: 'Party', key: 'party' },
    { title: 'State', key: 'state' },
    { title: 'District', key: 'district' }
]

const loading = ref(false)
const bill = ref<Bill>()
const actions = ref<Action[]>([])
const cosponsors = ref<Cosponsor[]>([])
const amendments = ref<Amendment[]>([])

onMounted(() => {
    getBill()
})

async function getBill(){
    loading.value = true
    const response = await apiClient?.getData(`/api/CongressGetBill?congress=${props.congress}&billType=${props.billType}&billNumber=${props.billNumber}`)
    if (!response?.success){
        console.error("Failed to get bill.")
        return
    }
    
    bill.value = response.data.billDetails.bill
    actions.value = response.data.billActions.actions
    cosponsors.value = response.data.billCosponsors.cosponsors
    amendments.value = response.data.billAmendments.amendments
    loading.value = false
}

function getDateDisplayText(dateString: any){
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