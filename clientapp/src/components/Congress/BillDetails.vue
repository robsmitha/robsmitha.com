<template>
    <section class="bg-light-navy bill-hero">
        <v-container class="py-10">
            <template v-if="bill">
                <div class="d-flex align-center flex-wrap ga-3 mb-3">
                    <v-chip size="small" variant="outlined" :color="bill.originChamber === 'Senate' ? 'info' : 'primary'" class="font-mono">
                        {{ bill.type }}{{ bill.number }}
                    </v-chip>
                    <v-chip v-if="bill.policyArea?.name" size="small" variant="tonal" color="violet" class="font-mono">
                        {{ bill.policyArea.name }}
                    </v-chip>
                </div>

                <h1 :class="titleClass" class="text-lightest-slate font-weight-bold mb-3" v-html="bill.title"></h1>

                <p class="font-mono text-caption text-slate mb-8">
                    Introduced {{ moment(bill.introducedDate).format('MMM D, YYYY') }} &middot; {{ bill.originChamber }}
                </p>

                <div v-if="bill.latestAction" class="latest-action-box pa-4 mb-10">
                    <span class="font-mono text-caption text-primary text-uppercase d-block mb-1">
                        Latest Action &middot; {{ moment(bill.latestAction.actionDate).startOf('day').fromNow() }}
                    </span>
                    <p class="text-slate text-body-2 mb-0" v-html="bill.latestAction.text"></p>
                </div>

                <div class="d-flex flex-wrap ga-8 bill-stats">
                    <div>
                        <span class="font-mono text-h5 text-lightest-slate font-weight-bold d-block">{{ bill.cosponsors?.count ?? 0 }}</span>
                        <span class="font-mono text-caption text-slate text-uppercase">Cosponsors</span>
                    </div>
                    <div>
                        <span class="font-mono text-h5 text-lightest-slate font-weight-bold d-block">{{ bill.actions?.count ?? 0 }}</span>
                        <span class="font-mono text-caption text-slate text-uppercase">Actions</span>
                    </div>
                    <div>
                        <span class="font-mono text-h5 text-lightest-slate font-weight-bold d-block">{{ bill.amendments?.count ?? 0 }}</span>
                        <span class="font-mono text-caption text-slate text-uppercase">Amendments</span>
                    </div>
                    <div>
                        <span class="font-mono text-h5 text-lightest-slate font-weight-bold d-block">{{ bill.committees?.count ?? 0 }}</span>
                        <span class="font-mono text-caption text-slate text-uppercase">Committees</span>
                    </div>
                </div>
            </template>
            <v-skeleton-loader v-else color="surface" type="chip, heading, text, text" />
        </v-container>
    </section>

    <v-container v-if="bill" class="py-10">
        <!-- Sponsors -->
        <div class="d-flex align-center mb-6 section-heading">
            <span class="font-mono text-primary text-body-2 mr-3">01.</span>
            <h3 class="text-lightest-slate text-h5 font-weight-bold text-nowrap">Sponsors</h3>
            <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
        </div>

        <div v-if="bill.sponsors?.length" class="d-flex flex-wrap ga-3 mb-10">
            <div v-for="s in bill.sponsors" :key="s.bioguideId" class="sponsor-card pa-4">
                <span class="text-lightest-slate font-weight-bold d-block mb-1">{{ s.fullName }}</span>
                <div class="d-flex align-center ga-2 font-mono text-caption">
                    <v-chip size="x-small" :color="partyColor(s.party)" variant="flat">{{ s.party }}</v-chip>
                    <span class="text-slate">{{ s.state }}<template v-if="s.district !== undefined && s.district !== null">-{{ s.district }}</template></span>
                </div>
            </div>
        </div>
        <p v-else class="text-slate text-body-2 mb-10">No sponsors to display.</p>

        <template v-if="cosponsors.length">
            <p class="font-mono text-caption text-slate text-uppercase mb-4">
                {{ bill.cosponsors?.count ?? cosponsors.length }} Cosponsors
            </p>
            <v-data-iterator :items="cosponsors" :items-per-page="8">
                <template v-slot:default="{ items }">
                    <v-sheet color="surface" rounded="lg" class="result-list mb-4">
                        <div v-for="c in items" :key="c.raw.bioguideId" class="person-row pa-4 d-flex align-center ga-4">
                            <v-chip size="x-small" :color="partyColor(c.raw.party)" variant="flat" class="flex-shrink-0">{{ c.raw.party }}</v-chip>
                            <span class="text-lightest-slate flex-grow-1 min-width-0 text-truncate">{{ c.raw.fullName }}</span>
                            <span class="font-mono text-caption text-slate flex-shrink-0">
                                {{ c.raw.state }}<template v-if="c.raw.district !== undefined && c.raw.district !== null">-{{ c.raw.district }}</template>
                            </span>
                        </div>
                    </v-sheet>
                </template>
                <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
                    <div v-if="pageCount > 1" class="d-flex align-center justify-center pa-2 mb-6">
                        <v-btn :disabled="page === 1" density="comfortable" icon="mdi-arrow-left" variant="outlined" color="primary" @click="prevPage"></v-btn>
                        <div class="mx-4 text-caption font-mono text-slate">Page {{ page }} of {{ pageCount }}</div>
                        <v-btn :disabled="page >= pageCount" density="comfortable" icon="mdi-arrow-right" variant="outlined" color="primary" @click="nextPage"></v-btn>
                    </div>
                </template>
            </v-data-iterator>
        </template>

        <!-- Timeline -->
        <div class="d-flex align-center mb-6 mt-4 section-heading">
            <span class="font-mono text-primary text-body-2 mr-3">02.</span>
            <h3 class="text-lightest-slate text-h5 font-weight-bold text-nowrap">Timeline</h3>
            <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
        </div>

        <v-timeline v-if="actions.length" density="compact" line-color="lightest-navy" side="end" class="mb-10">
            <v-timeline-item v-for="(a, i) in actions" :key="`action_${i}`" size="small" dot-color="primary" icon="mdi-chevron-right" icon-color="navy">
                <v-card color="surface" rounded="lg" flat class="action-card pa-4">
                    <span class="font-mono text-caption text-slate d-block mb-1">
                        {{ moment(a.actionDate).startOf('day').fromNow() }}
                    </span>
                    <p class="text-slate text-body-2 mb-0">{{ a.text }}</p>
                    <a v-if="a.recordedVotes?.length" :href="a.recordedVotes[0].url" target="_blank" class="d-inline-flex align-center ga-1 font-mono text-caption text-primary mt-2 recorded-vote-link">
                        View recorded vote <v-icon size="14">mdi-open-in-new</v-icon>
                    </a>
                </v-card>
            </v-timeline-item>
        </v-timeline>
        <p v-else class="text-slate text-body-2 mb-10">No actions to display.</p>

        <!-- Amendments -->
        <div class="d-flex align-center mb-6 mt-4 section-heading">
            <span class="font-mono text-primary text-body-2 mr-3">03.</span>
            <h3 class="text-lightest-slate text-h5 font-weight-bold text-nowrap">Amendments</h3>
            <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
        </div>

        <div v-if="amendments.length" class="d-flex flex-wrap ga-2 mb-10">
            <a v-for="a in amendments" :key="a.number" :href="a.url" target="_blank" class="amendment-chip-link">
                <v-chip variant="outlined" color="slate" class="font-mono">
                    {{ a.type }}{{ a.number }}
                    <v-icon end size="14">mdi-open-in-new</v-icon>
                </v-chip>
            </a>
        </div>
        <p v-else class="text-slate text-body-2 mb-10">No amendments to display.</p>

        <!-- Cost Estimates -->
        <template v-if="bill.cboCostEstimates?.length">
            <div class="d-flex align-center mb-6 mt-4 section-heading">
                <span class="font-mono text-primary text-body-2 mr-3">04.</span>
                <h3 class="text-lightest-slate text-h5 font-weight-bold text-nowrap">CBO Cost Estimates</h3>
                <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
            </div>
            <v-sheet color="surface" rounded="lg" class="result-list">
                <a v-for="c in bill.cboCostEstimates" :key="c.url" :href="c.url" target="_blank" class="cbo-row pa-4 d-flex align-center ga-4">
                    <v-icon color="primary" size="20">mdi-file-chart-outline</v-icon>
                    <span class="text-slate text-body-2 flex-grow-1">{{ c.description }}</span>
                    <v-icon color="slate" size="18">mdi-open-in-new</v-icon>
                </a>
            </v-sheet>
        </template>
    </v-container>

    <v-container v-else class="py-10">
        <v-skeleton-loader color="surface" type="heading, text, text, divider, list-item-three-line@3" />
    </v-container>
</template>


<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { Bill } from '@/components/Congress/types/BillDetailsResponse.types'
import { Action } from '@/components/Congress/types/BillActionsResponse.types'
import { Cosponsor } from '@/components/Congress/types/BillCosponsorsResponse.types'
import { Amendment } from '@/components/Congress/types/BillAmendmentsResponse.types'
import moment from 'moment'
import { useDisplay } from 'vuetify'
import apiClient from '@/api/elysianClient'

const props = defineProps({
  congress: { type: String },
  billType: { type: String },
  billNumber: { type: String }
})

const { mobile } = useDisplay()
const titleClass = computed(() => mobile.value ? 'text-h5' : 'text-h4')

const bill = ref<Bill>()
const actions = ref<Action[]>([])
const cosponsors = ref<Cosponsor[]>([])
const amendments = ref<Amendment[]>([])

onMounted(() => {
    getBill()
})

async function getBill(){
    const response = await apiClient?.getData(`/api/CongressGetBill?congress=${props.congress}&billType=${props.billType}&billNumber=${props.billNumber}`)
    if (!response?.success){
        console.error("Failed to get bill.")
        return
    }

    bill.value = response.data.billDetails.bill
    actions.value = response.data.billActions.actions
    cosponsors.value = response.data.billCosponsors.cosponsors
    amendments.value = response.data.billAmendments.amendments
}

function partyColor(party: string){
    if (party === 'D') return 'info'
    if (party === 'R') return 'error'
    return 'violet'
}
</script>

<style scoped>
.latest-action-box {
    border-left: 2px solid rgb(var(--v-theme-primary));
    background-color: rgb(var(--v-theme-surface));
    border-radius: 4px;
    max-width: 720px;
}

.bill-stats > div {
    padding-left: 2rem;
    border-left: 1px solid rgb(var(--v-theme-lightest-navy));
}

.bill-stats > div:first-child {
    padding-left: 0;
    border-left: none;
}

.sponsor-card,
.result-list {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-radius: 8px;
}

.result-list {
    overflow: hidden;
}

.person-row,
.cbo-row {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
    text-decoration: none;
    transition: background-color 0.15s ease;
}

.cbo-row:hover {
    background-color: rgba(100, 255, 218, 0.04);
}

.person-row:last-child,
.cbo-row:last-child {
    border-bottom: none;
}

.min-width-0 {
    min-width: 0;
}

.action-card {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: border-color 0.2s ease;
}

.action-card:hover {
    border-color: rgb(var(--v-theme-primary));
}

.recorded-vote-link {
    text-decoration: none;
}

.amendment-chip-link {
    text-decoration: none;
}

@media (max-width: 600px) {
    .bill-stats {
        gap: 1.5rem !important;
    }

    .bill-stats > div {
        padding-left: 0;
        border-left: none;
        min-width: 40%;
    }
}
</style>
