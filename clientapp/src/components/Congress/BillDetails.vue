<template>
    <PageHero eyebrow="> congress.gov API" tone="navy" art="capitol">
        <template v-if="bill">
            <div class="d-flex align-center flex-wrap ga-2 mb-4">
                <span class="hero-badge font-mono text-caption" :style="{ '--chamber': `var(--v-theme-${chamberColor(bill.originChamber)})` }">
                    {{ bill.type }}{{ bill.number }}
                </span>
                <span class="hero-pill font-mono text-caption" :class="`text-${status.color}`">
                    <span class="status-dot" :class="`bg-${status.color}`"></span>{{ status.label }}
                </span>
                <span v-if="bill.policyArea?.name" class="hero-pill font-mono text-caption">{{ bill.policyArea.name }}</span>
                <span v-for="l in bill.laws ?? []" :key="l.number" class="hero-pill font-mono text-caption text-green">
                    {{ l.type }} {{ l.number }}
                </span>
            </div>

            <h1 class="hero-title font-weight-bold mb-3" v-html="bill.title"></h1>

            <p class="font-mono text-caption hero-meta mb-6">
                Introduced {{ moment(bill.introducedDate).format('MMM D, YYYY') }}
                &middot; {{ bill.originChamber }}
                &middot; {{ ordinal(bill.congress) }} Congress
            </p>

            <div v-if="bill.latestAction" class="latest-action mb-8">
                <span class="font-mono text-caption text-uppercase d-block mb-1 latest-action-label">
                    Latest action &middot; {{ moment(bill.latestAction.actionDate).startOf('day').fromNow() }}
                </span>
                <p class="mb-0" v-html="bill.latestAction.text"></p>
            </div>

            <div class="d-flex flex-wrap ga-8 mb-8">
                <div v-for="s in stats" :key="s.label">
                    <span class="font-mono text-h5 font-weight-bold d-block">{{ s.value }}</span>
                    <span class="font-mono text-caption hero-label">{{ s.label }}</span>
                </div>
            </div>

            <div class="d-flex flex-wrap ga-3">
                <v-btn color="white" variant="flat" rounded="pill" class="text-none" append-icon="mdi-open-in-new" :href="publicUrl" target="_blank">
                    View on Congress.gov
                </v-btn>
                <v-btn color="white" variant="outlined" rounded="pill" class="text-none" append-icon="mdi-open-in-new" :href="`${publicUrl}/text`" target="_blank">
                    Read the text
                </v-btn>
            </div>
        </template>

        <!-- Hero placeholder, laid out like the loaded hero above. -->
        <div v-else aria-busy="true" aria-label="Loading bill">
            <div class="d-flex ga-2 mb-4">
                <v-skeleton-loader type="chip" class="hero-bone" style="width: 76px" />
                <v-skeleton-loader type="chip" class="hero-bone" style="width: 104px" />
                <v-skeleton-loader type="chip" class="hero-bone" style="width: 140px" />
            </div>
            <v-skeleton-loader type="heading" class="hero-bone hero-bone--title mb-2" style="width: 90%" />
            <v-skeleton-loader type="heading" class="hero-bone hero-bone--title mb-5" style="width: 60%" />
            <v-skeleton-loader type="text" class="hero-bone mb-6" style="width: 45%" />
            <v-skeleton-loader type="image" class="hero-bone hero-bone--box mb-8" />
            <div class="d-flex ga-8">
                <v-skeleton-loader v-for="i in 4" :key="i" type="heading" class="hero-bone hero-bone--stat" />
            </div>
        </div>
    </PageHero>

    <v-container v-if="bill" class="bill-body py-12">
        <v-row>
            <v-col cols="12" md="8" class="pr-md-8">
                <section v-if="summaries.length" class="mb-14">
                    <SectionHeading :index="sectionIndex('summary')" title="Summary" />
                    <!-- CRS writes a new summary as the bill changes; newest first. -->
                    <!-- Bills that went all the way can have eight or more versions, too many for chips. -->
                    <v-select
                        v-if="summaries.length > 4"
                        :model-value="summaryIndex"
                        :items="summaries.map((s, i) => ({ title: `${s.actionDesc}${s.actionDate ? ' · ' + moment(s.actionDate).format('MMM D, YYYY') : ''}`, value: i }))"
                        label="Version"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="summary-select font-mono mb-4"
                        @update:model-value="selectSummary"
                    />
                    <div v-else-if="summaries.length > 1" class="d-flex flex-wrap ga-2 mb-4">
                        <v-chip
                            v-for="(s, i) in summaries"
                            :key="`${s.versionCode}_${i}`"
                            :variant="summaryIndex === i ? 'flat' : 'outlined'"
                            :color="summaryIndex === i ? 'primary' : 'slate'"
                            size="small"
                            class="font-mono"
                            @click="selectSummary(i)"
                        >
                            {{ s.actionDesc }}<template v-if="s.actionDate"> &middot; {{ moment(s.actionDate).format('MMM D, YYYY') }}</template>
                        </v-chip>
                    </div>
                    <div class="summary-card pa-5">
                        <p class="font-mono text-caption text-slate mb-3">
                            Congressional Research Service &middot; {{ summary!.actionDesc }}<template v-if="summary!.actionDate">, {{ moment(summary!.actionDate).format('MMM D, YYYY') }}</template>
                        </p>
                        <div
                            class="summary-text text-light-slate text-body-2"
                            :class="{ 'summary-text--clamped': !showFullSummary }"
                            v-html="summary!.text"
                        ></div>
                        <v-btn
                            variant="text"
                            color="primary"
                            density="comfortable"
                            class="font-mono text-none mt-2 px-0"
                            :append-icon="showFullSummary ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                            @click="showFullSummary = !showFullSummary"
                        >
                            {{ showFullSummary ? 'Show less' : 'Read full summary' }}
                        </v-btn>
                    </div>
                </section>

                <section class="mb-14">
                    <SectionHeading :index="sectionIndex('progress')" title="Progress" />
                    <BillProgress
                        :bill-type="bill.type"
                        :origin-chamber="bill.originChamber"
                        :actions="actions"
                        :introduced-date="bill.introducedDate"
                        :became-law="(bill.laws?.length ?? 0) > 0"
                    />
                </section>

                <section v-if="committees.length" class="mb-14">
                    <SectionHeading :index="sectionIndex('committees')" title="Committees" />
                    <div class="d-flex flex-column ga-3">
                        <div
                            v-for="c in committees"
                            :key="c.systemCode"
                            class="committee-card pa-4"
                            :style="{ '--chamber': `var(--v-theme-${chamberColor(c.chamber)})` }"
                        >
                            <div class="d-flex align-center flex-wrap ga-2 mb-3">
                                <span class="chamber-pill font-mono text-caption">{{ c.chamber }}</span>
                                <span class="text-lightest-slate font-weight-bold">{{ c.name }}</span>
                            </div>
                            <ul class="activity-list">
                                <li v-for="(a, i) in sortedActivities(c.activities)" :key="i" class="d-flex ga-3 font-mono text-caption">
                                    <span class="activity-date text-slate">{{ moment(a.date).format('MMM D, YYYY') }}</span>
                                    <span :class="`text-${activityColor(a.name)}`">{{ a.name }}</span>
                                </li>
                            </ul>
                            <div v-for="sc in c.subcommittees ?? []" :key="sc.systemCode" class="subcommittee mt-3 pt-3">
                                <span class="text-light-slate text-body-2 d-block mb-2">{{ sc.name }}</span>
                                <ul class="activity-list">
                                    <li v-for="(a, i) in sortedActivities(sc.activities)" :key="i" class="d-flex ga-3 font-mono text-caption">
                                        <span class="activity-date text-slate">{{ moment(a.date).format('MMM D, YYYY') }}</span>
                                        <span :class="`text-${activityColor(a.name)}`">{{ a.name }}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="mb-14">
                    <SectionHeading :index="sectionIndex('timeline')" title="Timeline" />
                    <div v-if="timeline.length">
                        <div v-for="day in visibleTimeline" :key="day.key" class="day-group">
                            <h3 class="day-label font-mono text-caption text-uppercase mb-3">{{ day.label }}</h3>
                            <div class="d-flex flex-column ga-3">
                                <div
                                    v-for="(a, i) in day.actions"
                                    :key="`${day.key}_${i}`"
                                    class="action-card pa-4"
                                    :style="{ '--kind': `var(--v-theme-${actionKind(a).color})` }"
                                >
                                    <div class="d-flex align-center flex-wrap ga-2 mb-2">
                                        <span class="kind-pill font-mono text-caption">{{ actionKind(a).label }}</span>
                                        <span v-if="a.sourceSystem?.name" class="font-mono text-caption text-slate">{{ sourceLabel(a.sourceSystem.name) }}</span>
                                    </div>
                                    <p class="text-light-slate text-body-2 mb-0">{{ a.text }}</p>
                                    <div v-if="voteTally(a)" class="tally mt-3" :aria-label="`${voteTally(a)!.yeas} yeas, ${voteTally(a)!.nays} nays`">
                                        <div class="tally-bar mb-1">
                                            <span class="bg-green" :style="{ flexGrow: voteTally(a)!.yeas }"></span>
                                            <span class="bg-error" :style="{ flexGrow: voteTally(a)!.nays }"></span>
                                        </div>
                                        <span class="font-mono text-caption">
                                            <span class="text-green">{{ voteTally(a)!.yeas }} Yea</span>
                                            <span class="text-slate"> &middot; </span>
                                            <span class="text-error">{{ voteTally(a)!.nays }} Nay</span>
                                        </span>
                                    </div>
                                    <a
                                        v-for="v in a.recordedVotes ?? []"
                                        :key="v.url"
                                        :href="v.url"
                                        target="_blank"
                                        class="vote-link d-inline-flex align-center ga-1 font-mono text-caption mt-3 mr-3"
                                    >
                                        <v-icon size="14">mdi-vote-outline</v-icon>
                                        {{ v.chamber }} roll call #{{ v.rollNumber }}
                                        <v-icon size="12">mdi-open-in-new</v-icon>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <v-btn
                            v-if="timeline.length > timelineLimit"
                            variant="outlined"
                            color="primary"
                            class="font-mono text-none ml-8"
                            @click="showAllActions = !showAllActions"
                        >
                            {{ showAllActions ? 'Show recent activity' : `Show all ${actionCount} actions` }}
                        </v-btn>
                    </div>
                    <p v-else class="text-slate text-body-2">No actions to display.</p>
                </section>

                <section v-if="amendments.length" class="mb-14">
                    <SectionHeading :index="sectionIndex('amendments')" title="Amendments" />
                    <div class="link-grid">
                        <a
                            v-for="a in visibleAmendments"
                            :key="`${a.type}${a.number}`"
                            :href="congressGovAmendmentUrl(a.congress ?? bill.congress, a.type, a.number)"
                            target="_blank"
                            class="link-card pa-4"
                        >
                            <span class="font-mono font-weight-bold text-lightest-slate d-block">{{ a.type }} {{ a.number }}</span>
                            <span class="font-mono text-caption text-slate">Updated {{ moment(a.updateDate).format('MMM D, YYYY') }}</span>
                            <v-icon class="link-card-icon" size="16" color="slate">mdi-arrow-top-right</v-icon>
                        </a>
                    </div>
                    <v-btn
                        v-if="amendments.length > amendmentLimit"
                        variant="outlined"
                        color="primary"
                        class="font-mono text-none mt-4"
                        @click="showAllAmendments = !showAllAmendments"
                    >
                        {{ showAllAmendments ? 'Show fewer' : `Show all ${amendments.length} amendments` }}
                    </v-btn>
                </section>

                <section v-if="relatedBills.length" class="mb-14">
                    <SectionHeading :index="sectionIndex('related')" title="Related Bills" />
                    <div class="d-flex flex-column ga-3">
                        <router-link
                            v-for="r in visibleRelatedBills"
                            :key="`${r.congress}${r.type}${r.number}`"
                            :to="`/bill/${r.congress}/${r.type}/${r.number}`"
                            class="link-card pa-4 pr-10"
                        >
                            <div class="d-flex align-center flex-wrap ga-2 mb-2">
                                <span class="font-mono font-weight-bold text-lightest-slate">{{ r.type }}{{ r.number }}</span>
                                <span
                                    v-for="rel in relationshipLabels(r)"
                                    :key="rel.label"
                                    class="relation-pill font-mono text-caption"
                                    :class="`text-${rel.color}`"
                                >{{ rel.label }}</span>
                                <span v-if="r.congress !== bill.congress" class="font-mono text-caption text-slate">{{ ordinal(r.congress!) }} Congress</span>
                            </div>
                            <span class="related-title text-light-slate text-body-2">{{ r.title }}</span>
                            <span v-if="r.latestAction?.actionDate" class="font-mono text-caption text-slate d-block mt-2">
                                Latest action {{ moment(r.latestAction.actionDate).format('MMM D, YYYY') }}
                            </span>
                            <v-icon class="link-card-icon" size="16" color="slate">mdi-arrow-right</v-icon>
                        </router-link>
                    </div>
                    <v-btn
                        v-if="relatedBills.length > relatedLimit"
                        variant="outlined"
                        color="primary"
                        class="font-mono text-none mt-4"
                        @click="showAllRelated = !showAllRelated"
                    >
                        {{ showAllRelated ? 'Show fewer' : `Show all ${relatedBills.length} related bills` }}
                    </v-btn>
                </section>

                <section v-if="bill.cboCostEstimates?.length || bill.committeeReports?.length" class="mb-14">
                    <SectionHeading :index="sectionIndex('reports')" title="Reports & Estimates" />
                    <div class="d-flex flex-column ga-3">
                        <a
                            v-for="c in bill.cboCostEstimates ?? []"
                            :key="c.url"
                            :href="c.url"
                            target="_blank"
                            class="link-card pa-4 d-flex align-start ga-4"
                        >
                            <v-icon color="green" size="22">mdi-file-chart-outline</v-icon>
                            <span class="flex-grow-1">
                                <span class="font-mono text-caption text-green d-block mb-1">
                                    CBO cost estimate<template v-if="c.pubDate"> &middot; {{ moment(c.pubDate).format('MMM D, YYYY') }}</template>
                                </span>
                                <span class="text-lightest-slate text-body-2 d-block">{{ c.title }}</span>
                                <span v-if="c.description" class="text-slate text-body-2 d-block mt-1">{{ c.description }}</span>
                            </span>
                        </a>
                        <div v-for="r in bill.committeeReports ?? []" :key="r.citation" class="link-card link-card--static pa-4 d-flex align-center ga-4">
                            <v-icon color="amber" size="22">mdi-file-document-outline</v-icon>
                            <span>
                                <span class="font-mono text-caption text-amber d-block mb-1">Committee report</span>
                                <span class="text-lightest-slate text-body-2">{{ r.citation }}</span>
                            </span>
                        </div>
                    </div>
                </section>
            </v-col>

            <v-col cols="12" md="4">
                <aside class="aside d-flex flex-column ga-4">
                    <!-- Sponsor -->
                    <div v-for="s in bill.sponsors ?? []" :key="s.bioguideId" class="panel pa-5" :style="{ '--party': `var(--v-theme-${partyColor(s.party)})` }">
                        <p class="panel-eyebrow font-mono text-caption text-uppercase mb-4">Sponsor</p>
                        <div class="d-flex align-center ga-4">
                            <span class="initials font-weight-bold">{{ initials(s) }}</span>
                            <div class="min-width-0">
                                <span class="text-lightest-slate font-weight-bold d-block">{{ s.fullName }}</span>
                                <span class="font-mono text-caption text-slate">{{ partyName(s.party) }} &middot; {{ seat(s) }}</span>
                            </div>
                        </div>
                        <a :href="bioguideUrl(s.bioguideId)" target="_blank" class="panel-link font-mono text-caption d-inline-flex align-center ga-1 mt-4">
                            Congressional biography <v-icon size="12">mdi-open-in-new</v-icon>
                        </a>
                    </div>

                    <!-- Cosponsor breakdown -->
                    <div class="panel pa-5">
                        <div class="d-flex align-center justify-space-between mb-4">
                            <p class="panel-eyebrow font-mono text-caption text-uppercase mb-0">
                                {{ bill.cosponsors?.count ?? cosponsors.length }} Cosponsors
                            </p>
                            <span v-if="isBipartisan" class="bipartisan font-mono text-caption">Bipartisan</span>
                        </div>

                        <template v-if="cosponsors.length">
                            <div class="party-split mb-3" role="img" :aria-label="partyBreakdown.map(p => `${p.count} ${p.name}`).join(', ')">
                                <span v-for="p in partyBreakdown" :key="p.party" :class="`bg-${p.color}`" :style="{ flexGrow: p.count }"></span>
                            </div>
                            <div class="d-flex flex-wrap ga-4 mb-5">
                                <span v-for="p in partyBreakdown" :key="p.party" class="d-flex align-center ga-2 font-mono text-caption text-light-slate">
                                    <span class="legend-dot" :class="`bg-${p.color}`"></span>{{ p.count }} {{ p.name }}
                                </span>
                            </div>

                            <div class="d-flex ga-6 mb-5">
                                <div>
                                    <span class="font-mono text-h6 text-lightest-slate font-weight-bold d-block">{{ originalCount }}</span>
                                    <span class="font-mono text-caption text-slate">Original</span>
                                </div>
                                <div>
                                    <span class="font-mono text-h6 text-lightest-slate font-weight-bold d-block">{{ cosponsors.length - originalCount }}</span>
                                    <span class="font-mono text-caption text-slate">Joined later</span>
                                </div>
                                <div>
                                    <span class="font-mono text-h6 text-lightest-slate font-weight-bold d-block">{{ stateCount }}</span>
                                    <span class="font-mono text-caption text-slate">States</span>
                                </div>
                            </div>

                            <p class="font-mono text-caption text-slate text-uppercase mb-2">Top states</p>
                            <div class="d-flex flex-wrap ga-2 mb-5">
                                <span v-for="st in topStates" :key="st.state" class="state-chip font-mono text-caption">
                                    {{ st.state }} <span class="text-slate">{{ st.count }}</span>
                                </span>
                            </div>

                            <v-data-iterator :items="sortedCosponsors" :items-per-page="8">
                                <template v-slot:default="{ items }">
                                    <div class="person-list">
                                        <div v-for="c in items" :key="c.raw.bioguideId" class="person-row py-2 d-flex align-center ga-3">
                                            <span class="legend-dot flex-shrink-0" :class="`bg-${partyColor(c.raw.party)}`"></span>
                                            <span class="text-light-slate text-body-2 flex-grow-1 min-width-0 text-truncate">{{ c.raw.fullName }}</span>
                                            <span v-if="c.raw.isOriginalCosponsor" class="original-tag font-mono">Original</span>
                                        </div>
                                    </div>
                                </template>
                                <template v-slot:footer="{ page, pageCount, prevPage, nextPage }">
                                    <div v-if="pageCount > 1" class="d-flex align-center justify-space-between mt-3">
                                        <v-btn :disabled="page === 1" density="comfortable" size="small" icon="mdi-arrow-left" variant="outlined" color="primary" @click="prevPage"></v-btn>
                                        <span class="text-caption font-mono text-slate">{{ page }} / {{ pageCount }}</span>
                                        <v-btn :disabled="page >= pageCount" density="comfortable" size="small" icon="mdi-arrow-right" variant="outlined" color="primary" @click="nextPage"></v-btn>
                                    </div>
                                </template>
                            </v-data-iterator>
                        </template>
                        <p v-else class="text-slate text-body-2 mb-0">No cosponsors yet.</p>
                    </div>
                </aside>
            </v-col>
        </v-row>

        <CtaPanel
            class="mt-10"
            tone="plum"
            art="arcs"
            eyebrow="Keep exploring"
            title="See what else is moving."
            text="The feed shows the latest bill activity from both chambers, updated as Congress acts."
        >
            <v-btn color="white" variant="flat" rounded="pill" size="large" class="text-none" to="/congress">
                Latest activity
            </v-btn>
            <v-btn color="white" variant="outlined" rounded="pill" size="large" class="text-none" prepend-icon="mdi-github" href="https://github.com/robsmitha/CapitolSharp" target="_blank">
                How it's built
            </v-btn>
        </CtaPanel>
    </v-container>

    <BillDetailsSkeleton v-else />
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { Bill } from '@/components/Congress/types/BillDetailsResponse.types'
import { Action } from '@/components/Congress/types/BillActionsResponse.types'
import { Cosponsor } from '@/components/Congress/types/BillCosponsorsResponse.types'
import { Amendment } from '@/components/Congress/types/BillAmendmentsResponse.types'
import { Summarie } from '@/components/Congress/types/BillSummariesResponse.types'
import { Committee, Activitie } from '@/components/Congress/types/BillCommitteesResponse.types'
import { RelatedBill } from '@/components/Congress/types/BillRelatedbillsResponse.types'
import moment from 'moment'
import apiClient from '@/api/elysianClient'
import {
    chamberColor, partyColor, partyName, billStatus, ordinal,
    congressGovBillUrl, congressGovAmendmentUrl, bioguideUrl
} from '@/components/Congress/congress'

const props = defineProps({
  congress: { type: String },
  billType: { type: String },
  billNumber: { type: String }
})

const bill = ref<Bill>()
const actions = ref<Action[]>([])
const cosponsors = ref<Cosponsor[]>([])
const amendments = ref<Amendment[]>([])
const showAllActions = ref(false)
const timelineLimit = 6
const showAllAmendments = ref(false)
const amendmentLimit = 12
const summaries = ref<Summarie[]>([])
const summaryIndex = ref(0)
const showFullSummary = ref(false)
const committees = ref<Committee[]>([])
const relatedBills = ref<RelatedBill[]>([])
const showAllRelated = ref(false)
const relatedLimit = 6

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
    actions.value = response.data.billActions.actions ?? []
    cosponsors.value = response.data.billCosponsors.cosponsors ?? []
    amendments.value = response.data.billAmendments.amendments ?? []
    // The API lists versions oldest first, and some share a date (introduced and reported
    // the same day), so reverse before the stable sort to keep the later one on top.
    summaries.value = [...(response.data.billSummaries?.summaries ?? [])]
        .reverse()
        .sort((a: Summarie, b: Summarie) => Number(new Date(b.actionDate ?? 0)) - Number(new Date(a.actionDate ?? 0)))
    committees.value = response.data.billCommittees?.committees ?? []
    relatedBills.value = response.data.billRelatedBills?.relatedBills ?? []
}

const status = computed(() => billStatus(bill.value?.latestAction?.text))
const publicUrl = computed(() => bill.value ? congressGovBillUrl(bill.value.congress, bill.value.type, bill.value.number) : '')

const stats = computed(() => {
    const b = bill.value
    if (!b) return []
    return [
        { label: 'Cosponsors', value: b.cosponsors?.count ?? cosponsors.value.length },
        { label: 'Actions', value: b.actions?.count ?? actions.value.length },
        { label: 'Amendments', value: b.amendments?.count ?? amendments.value.length },
        { label: 'Committees', value: b.committees?.count ?? 0 },
        { label: 'Days since introduced', value: moment().startOf('day').diff(moment(b.introducedDate).startOf('day'), 'days') },
    ]
})

// Sections are numbered in the order they appear, skipping ones with no data.
const sectionIndex = (key: string) => {
    const order: string[] = []
    if (summaries.value.length) order.push('summary')
    order.push('progress')
    if (committees.value.length) order.push('committees')
    order.push('timeline')
    if (amendments.value.length) order.push('amendments')
    if (relatedBills.value.length) order.push('related')
    if (bill.value?.cboCostEstimates?.length || bill.value?.committeeReports?.length) order.push('reports')
    return String(order.indexOf(key) + 1).padStart(2, '0')
}

// Timeline: the API often lists the same action once per chamber's records, so
// merge exact duplicates, then group what's left by day, newest first.
const timeline = computed(() => {
    const seen = new Set<string>()
    const days = new Map<string, { key: string, label: string, actions: Action[] }>()
    const sorted = [...actions.value].sort((a, b) => Number(new Date(b.actionDate)) - Number(new Date(a.actionDate)))
    for (const a of sorted) {
        const key = moment(a.actionDate).format('YYYY-MM-DD')
        const id = `${key}|${a.text}`
        if (seen.has(id)) continue
        seen.add(id)
        if (!days.has(key)) {
            days.set(key, { key, label: moment(a.actionDate).format('dddd, MMM D, YYYY'), actions: [] })
        }
        days.get(key)!.actions.push(a)
    }
    return Array.from(days.values())
})

const actionCount = computed(() => timeline.value.reduce((n, d) => n + d.actions.length, 0))
const visibleTimeline = computed(() => showAllActions.value ? timeline.value : timeline.value.slice(0, timelineLimit))

function actionKind(a: Action): { label: string, color: string } {
    switch (a.type) {
        case 'IntroReferral': return { label: 'Introduced', color: 'light-slate' }
        case 'Committee': return { label: 'Committee', color: 'amber' }
        case 'Calendars': return { label: 'Calendar', color: 'amber' }
        case 'Floor': return { label: 'Floor', color: 'violet' }
        case 'Discharge': return { label: 'Discharge', color: 'amber' }
        case 'ResolvingDifferences': return { label: 'Resolving differences', color: 'info' }
        case 'President': return { label: 'President', color: 'green' }
        case 'BecameLaw': return { label: 'Became law', color: 'green' }
        case 'Veto': return { label: 'Veto', color: 'error' }
        case 'NotUsed': return { label: 'Update', color: 'light-slate' }
        default: return { label: a.type || 'Action', color: 'light-slate' }
    }
}

const visibleAmendments = computed(() => showAllAmendments.value ? amendments.value : amendments.value.slice(0, amendmentLimit))

// Summary
const summary = computed(() => summaries.value[summaryIndex.value])

function selectSummary(i: number) {
    summaryIndex.value = i
    showFullSummary.value = false
}

// Committees: activities in the order they happened, e.g. referred, then markup, then reported.
const sortedActivities = (activities?: Activitie[]) =>
    [...(activities ?? [])].sort((a, b) => Number(new Date(a.date ?? 0)) - Number(new Date(b.date ?? 0)))

function activityColor(name?: string): string {
    if (/reported/i.test(name ?? '')) return 'green'
    if (/markup/i.test(name ?? '')) return 'violet'
    if (/hearing/i.test(name ?? '')) return 'info'
    if (/discharged/i.test(name ?? '')) return 'amber'
    return 'light-slate'
}

// Related bills: several sources (CRS, House, Senate) can name the same relationship, so show each kind once.
const visibleRelatedBills = computed(() => showAllRelated.value ? relatedBills.value : relatedBills.value.slice(0, relatedLimit))

function relationshipLabels(r: RelatedBill): { label: string, color: string }[] {
    const types = new Set((r.relationshipDetails ?? []).map(d => d.type).filter((t): t is string => !!t))
    return Array.from(types).map(label => ({
        label,
        color: /identical/i.test(label) ? 'violet' : /procedural/i.test(label) ? 'amber' : 'light-slate'
    }))
}

// Roll call actions carry the tally in their text, e.g. "Yeas and Nays: 387 - 26" or "Yea-Nay Vote. 88 - 4".
function voteTally(a: Action): { yeas: number, nays: number } | undefined {
    if (!a.recordedVotes?.length) return undefined
    const match = /(\d{1,3})\s*-\s*(\d{1,3})/.exec(a.text ?? '')
    if (!match) return undefined
    return { yeas: Number(match[1]), nays: Number(match[2]) }
}

function sourceLabel(name: string) {
    if (/senate/i.test(name)) return 'Senate'
    if (/house/i.test(name)) return 'House'
    return 'Library of Congress'
}

// Cosponsors
const sortedCosponsors = computed(() =>
    [...cosponsors.value].sort((a, b) => Number(new Date(a.sponsorshipDate)) - Number(new Date(b.sponsorshipDate)))
)

const partyBreakdown = computed(() => {
    const counts = new Map<string, number>()
    for (const c of cosponsors.value) counts.set(c.party, (counts.get(c.party) ?? 0) + 1)
    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([party, count]) => ({ party, count, name: partyName(party), color: partyColor(party) }))
})

const isBipartisan = computed(() => {
    const parties = new Set([...(bill.value?.sponsors ?? []), ...cosponsors.value].map(p => p.party))
    return parties.has('D') && parties.has('R')
})

const originalCount = computed(() => cosponsors.value.filter(c => c.isOriginalCosponsor).length)
const stateCount = computed(() => new Set(cosponsors.value.map(c => c.state)).size)

const topStates = computed(() => {
    const counts = new Map<string, number>()
    for (const c of cosponsors.value) counts.set(c.state, (counts.get(c.state) ?? 0) + 1)
    return Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([state, count]) => ({ state, count }))
})

const initials = (p: { firstName?: string, lastName?: string, fullName: string }) =>
    `${p.firstName?.[0] ?? ''}${p.lastName?.[0] ?? ''}` || p.fullName.slice(0, 2)

const seat = (p: { state: string, district?: number }) =>
    p.district !== undefined && p.district !== null ? `${p.state}-${p.district}` : p.state
</script>

<style scoped>
.bill-body {
    max-width: 1100px;
}

.min-width-0 {
    min-width: 0;
}

/* Hero */
.hero-title {
    font-size: clamp(1.4rem, 1.2vw + 1rem, 2.1rem);
    line-height: 1.2;
    text-wrap: balance;
}

.hero-badge {
    padding: 3px 10px;
    border-radius: 6px;
    font-weight: 700;
    color: rgb(var(--chamber));
    background: rgba(var(--chamber), 0.18);
}

.hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.85);
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.hero-meta,
.hero-label {
    opacity: 0.7;
}

.latest-action {
    padding: 0.9rem 1.1rem;
    border-radius: 10px;
    border-left: 3px solid rgb(var(--v-theme-primary));
    background: rgba(255, 255, 255, 0.06);
    max-width: 60ch;
    font-size: 0.9375rem;
}

.latest-action-label {
    letter-spacing: 0.06em;
    opacity: 0.7;
}

/* Summary */
.summary-card {
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgb(var(--v-theme-primary));
}

.summary-select {
    max-width: 420px;
}

.summary-text {
    line-height: 1.7;
    max-width: 70ch;
}

.summary-text :deep(p) {
    margin-bottom: 0.75rem;
}

.summary-text :deep(strong) {
    color: rgb(var(--v-theme-lightest-slate));
}

.summary-text :deep(ul) {
    padding-left: 1.25rem;
    margin-bottom: 0.75rem;
}

.summary-text--clamped {
    max-height: 11rem;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, black 60%, transparent);
}

/* Committees */
.committee-card {
    border-radius: 12px;
    background:
        radial-gradient(90% 120% at 0% 0%, rgba(var(--chamber), 0.08), transparent 60%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgba(var(--chamber), 0.7);
}

.chamber-pill {
    padding: 1px 9px;
    border-radius: 999px;
    color: rgb(var(--chamber));
    background: rgba(var(--chamber), 0.14);
}

.activity-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.activity-date {
    flex-shrink: 0;
    width: 7.5rem;
}

.subcommittee {
    border-top: 1px dashed rgb(var(--v-theme-lightest-navy));
}

/* Related bills */
.related-title {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.relation-pill {
    padding: 1px 9px;
    border-radius: 999px;
    background: rgba(var(--v-theme-on-surface), 0.06);
}

/* Timeline, same rail as the feed */
.day-group {
    position: relative;
    margin-left: 6px;
    padding-left: 1.75rem;
    padding-bottom: 2rem;
    border-left: 1px solid rgb(var(--v-theme-lightest-navy));
}

.day-group::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 0.35rem;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 4px rgb(var(--v-theme-background));
}

.day-label {
    color: rgb(var(--v-theme-light-slate));
    letter-spacing: 0.08em;
}

.action-card {
    border-radius: 12px;
    background:
        radial-gradient(90% 120% at 0% 0%, rgba(var(--kind), 0.08), transparent 60%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgba(var(--kind), 0.7);
}

.kind-pill {
    padding: 1px 9px;
    border-radius: 999px;
    color: rgb(var(--kind));
    background: rgba(var(--kind), 0.14);
}

.vote-link {
    text-decoration: none;
    color: rgb(var(--v-theme-info));
}

.vote-link:hover {
    text-decoration: underline;
}

.tally {
    max-width: 320px;
}

.tally-bar {
    display: flex;
    gap: 2px;
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
}

/* Amendments and reports */
.link-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 0.75rem;
}

.link-card {
    position: relative;
    display: block;
    text-decoration: none;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: border-color 0.2s ease, transform 0.2s ease;
}

a.link-card:hover {
    border-color: rgb(var(--v-theme-primary));
    transform: translateY(-2px);
}

.link-card-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
}

/* Aside */
.aside {
    position: sticky;
    top: 88px;
}

.panel {
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}

.panel-eyebrow {
    color: rgb(var(--v-theme-primary));
    letter-spacing: 0.08em;
}

.initials {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: rgb(var(--party));
    background: rgba(var(--party), 0.15);
    box-shadow: 0 0 0 2px rgba(var(--party), 0.6);
}

.panel-link {
    text-decoration: none;
    color: rgb(var(--v-theme-info));
}

.panel-link:hover {
    text-decoration: underline;
}

.bipartisan {
    padding: 2px 10px;
    border-radius: 999px;
    color: rgb(var(--v-theme-lightest-slate));
    background: linear-gradient(90deg, rgba(var(--v-theme-info), 0.35), rgba(var(--v-theme-error), 0.35));
}

.party-split {
    display: flex;
    gap: 3px;
    height: 8px;
    border-radius: 999px;
    overflow: hidden;
}

.legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.state-chip {
    padding: 2px 10px;
    border-radius: 6px;
    color: rgb(var(--v-theme-lightest-slate));
    background: rgba(var(--v-theme-on-surface), 0.06);
}

.person-list {
    border-top: 1px solid rgb(var(--v-theme-lightest-navy));
}

.person-row {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.original-tag {
    font-size: 0.6875rem;
    padding: 1px 7px;
    border-radius: 999px;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.12);
}

/* Hero placeholder bones, on the navy hero rather than a card surface. */
.hero-bone {
    background: transparent;
}

.hero-bone :deep(.v-skeleton-loader__chip),
.hero-bone :deep(.v-skeleton-loader__heading),
.hero-bone :deep(.v-skeleton-loader__text),
.hero-bone :deep(.v-skeleton-loader__image) {
    margin: 0;
    max-width: none;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
}

.hero-bone :deep(.v-skeleton-loader__chip) {
    height: 24px;
}

.hero-bone--title :deep(.v-skeleton-loader__heading) {
    height: 28px;
    border-radius: 8px;
}

.hero-bone--box {
    max-width: 60ch;
}

.hero-bone--box :deep(.v-skeleton-loader__image) {
    height: 72px;
    border-radius: 10px;
}

.hero-bone--stat {
    width: 64px;
}

.hero-bone--stat :deep(.v-skeleton-loader__heading) {
    height: 40px;
    border-radius: 8px;
}

@media (max-width: 960px) {
    .aside {
        position: static;
    }
}
</style>
