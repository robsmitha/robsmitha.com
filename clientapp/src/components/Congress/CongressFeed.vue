<template>
    <PageHero eyebrow="> congress.gov API" tone="navy" art="capitol">
        <div class="d-flex align-center flex-wrap ga-3 mb-3">
            <v-menu v-if="overview?.congresses.length" location="bottom start">
                <template #activator="{ props: menuProps }">
                    <button v-bind="menuProps" class="hero-picker d-inline-flex align-center ga-1" aria-label="Choose a Congress">
                        <h1 class="hero-title font-weight-bold">{{ congressName }}</h1>
                        <v-icon size="28" class="hero-picker-icon">mdi-chevron-down</v-icon>
                    </button>
                </template>
                <v-list bg-color="surface" density="compact" max-height="360">
                    <v-list-item
                        v-for="c in overview.congresses"
                        :key="c.number"
                        :active="c.number === congressNumber"
                        color="primary"
                        :to="c.number === currentCongressNumber ? '/congress' : { path: '/congress', query: { congress: c.number } }"
                    >
                        <v-list-item-title class="text-body-2">{{ c.name }}</v-list-item-title>
                        <v-list-item-subtitle class="font-mono text-caption">{{ c.startYear }}&ndash;{{ c.endYear }}</v-list-item-subtitle>
                    </v-list-item>
                </v-list>
            </v-menu>
            <h1 v-else class="hero-title font-weight-bold">{{ congressName }}</h1>
            <span v-if="congressYears" class="font-mono text-caption hero-years">{{ congressYears }}</span>
            <v-skeleton-loader v-else type="chip" class="hero-years-bone" />
        </div>
        <p class="hero-text mb-8">
            <template v-if="isPastCongress">
                Bill activity from the {{ congressName }}, sorted by most recently updated.
                <router-link to="/congress" class="hero-link">Back to the current Congress</router-link>
            </template>
            <template v-else>
                A live feed of bill activity from the Congress.gov API, sorted by most recently updated.
            </template>
        </p>

        <div class="d-flex flex-wrap ga-8 mb-4">
            <div v-for="s in heroStats" :key="s.label">
                <span class="font-mono text-h5 font-weight-bold d-block" :class="s.color ? `text-${s.color}` : ''">
                    {{ overview ? s.value.toLocaleString() : '—' }}
                </span>
                <span class="font-mono text-caption hero-label">{{ s.label }}</span>
            </div>
        </div>
        <div v-if="overview && billsIntroduced" class="chamber-split" role="img" :aria-label="splitLabel">
            <span
                v-for="c in introducedByChamber"
                :key="c.name"
                :class="`bg-${c.color}`"
                :style="{ flexGrow: c.count }"
            ></span>
        </div>
    </PageHero>

    <v-container class="feed py-12">
        <section v-if="laws.length" class="mb-16">
            <SectionHeading index="01" title="Became Law" />
            <p class="text-slate text-body-2 mb-6">
                {{ overview!.laws.count.toLocaleString() }} bills have become law in the {{ congressName }}. Most recent first.
            </p>
            <div class="law-grid">
                <router-link
                    v-for="b in visibleLaws"
                    :key="`${b.type}${b.number}`"
                    :to="`/bill/${b.congress}/${b.type}/${b.number}`"
                    class="law-card pa-4 d-flex flex-column"
                    :style="{ '--chamber': `var(--v-theme-${chamberColor(b.originChamber)})` }"
                >
                    <span class="law-pill font-mono text-caption mb-3">{{ lawLabel(b) }}</span>
                    <p class="law-title text-lightest-slate font-weight-bold text-body-2 mb-4">{{ b.title }}</p>
                    <div class="d-flex align-center justify-space-between ga-2 mt-auto">
                        <span class="bill-badge law-badge font-mono text-caption">{{ b.type }}{{ b.number }}</span>
                        <span v-if="b.latestAction?.actionDate" class="font-mono text-caption text-slate text-no-wrap">
                            {{ moment(b.latestAction.actionDate).format('MMM D, YYYY') }}
                        </span>
                    </div>
                </router-link>
            </div>
            <div class="d-flex flex-wrap align-center ga-4 mt-5">
                <v-btn
                    v-if="laws.length > lawLimit"
                    variant="outlined"
                    color="primary"
                    class="font-mono text-none"
                    @click="showAllLaws = !showAllLaws"
                >
                    {{ showAllLaws ? 'Show fewer' : `Show ${laws.length - lawLimit} more` }}
                </v-btn>
                <a :href="congressGovLawsUrl(congressNumber!)" target="_blank" class="panel-link font-mono text-caption d-inline-flex align-center ga-1">
                    All {{ overview!.laws.count.toLocaleString() }} laws on Congress.gov <v-icon size="12">mdi-open-in-new</v-icon>
                </a>
            </div>
        </section>

        <SectionHeading :index="laws.length ? '02' : '01'" title="Latest Activity" />

        <v-row>
            <v-col cols="12" md="8" class="pr-md-8">
                <div class="d-flex flex-wrap ga-2 mb-10">
                    <v-chip
                        :variant="chamber === null ? 'flat' : 'outlined'"
                        :color="chamber === null ? 'lightest-slate' : 'slate'"
                        class="font-mono"
                        size="small"
                        @click="chamber = null"
                    >
                        All ({{ items.length }})
                    </v-chip>
                    <v-chip
                        v-for="c in chamberStats"
                        :key="c.name"
                        :variant="chamber === c.name ? 'flat' : 'outlined'"
                        :color="chamber === c.name ? c.color : 'slate'"
                        class="font-mono"
                        size="small"
                        @click="chamber = chamber === c.name ? null : c.name"
                    >
                        {{ c.name }} ({{ c.count }})
                    </v-chip>
                </div>

                <BillFeedSkeleton v-if="loading && items.length === 0" :groups="isMobile ? [2, 2] : [3, 3]" />

                <v-infinite-scroll
                    :mode="items.length > 20 ? 'manual' : 'intersect'"
                    color="primary"
                    @load="load"
                >
                    <div v-for="group in groupedItems" :key="group.key" class="day-group">
                        <h3 class="day-label font-mono text-caption text-uppercase mb-3">{{ group.label }}</h3>

                        <div class="d-flex flex-column ga-3">
                            <div
                                v-for="i in group.items"
                                :key="`${i.type}${i.number}`"
                                class="bill-row pa-5"
                                :style="{ '--chamber': `var(--v-theme-${chamberColor(i.originChamber)})` }"
                                role="link"
                                tabindex="0"
                                @click="openBill(i)"
                                @keydown.enter="openBill(i)"
                            >
                                <div class="d-flex align-start ga-4">
                                    <span class="bill-badge font-mono text-caption flex-shrink-0">
                                        {{ i.type }}{{ i.number }}
                                    </span>

                                    <div class="flex-grow-1 min-width-0">
                                        <p class="text-lightest-slate font-weight-bold text-body-1 bill-title mb-1" v-html="i.title"></p>
                                        <p class="text-slate text-body-2 bill-action mb-3" v-html="i.latestAction.text"></p>
                                        <div class="d-flex align-center flex-wrap ga-3 font-mono text-caption text-slate">
                                            <span class="status-pill" :class="`text-${status(i).color}`">
                                                <span class="status-dot" :class="`bg-${status(i).color}`"></span>
                                                {{ status(i).label }}
                                            </span>
                                            <span class="d-flex align-center ga-1">
                                                <v-icon size="14">mdi-bank-outline</v-icon>
                                                {{ i.originChamber }}
                                            </span>
                                            <span v-if="i.latestAction?.actionDate">
                                                Action {{ moment(i.latestAction.actionDate).format('MMM D') }}
                                            </span>
                                        </div>
                                    </div>

                                    <v-icon color="slate" size="18" class="flex-shrink-0 bill-chevron">mdi-arrow-right</v-icon>
                                </div>
                            </div>
                        </div>
                    </div>

                    <template v-slot:loading>
                        <!-- The first page has its own skeleton above; this one is for "load more". -->
                        <BillFeedSkeleton v-if="items.length > 0" :groups="[3]" :show-labels="false" class="w-100" />
                    </template>

                    <template v-slot:empty>
                        <div class="d-flex flex-column align-center py-12 text-center">
                            <v-icon size="40" class="mb-3 text-lightest-navy">mdi-gavel</v-icon>
                            <p class="text-body-2 text-slate">That's every bill we've got &mdash; check back soon.</p>
                        </div>
                    </template>
                </v-infinite-scroll>
            </v-col>

            <v-col cols="12" md="4">
                <aside v-if="overview" class="aside d-flex flex-column ga-4">
                    <!-- Bills introduced, by type -->
                    <div v-if="billsIntroduced" class="panel pa-5">
                        <p class="panel-eyebrow font-mono text-caption text-uppercase mb-4">
                            {{ billsIntroduced.toLocaleString() }} Introduced
                        </p>
                        <div class="d-flex flex-column ga-3">
                            <div v-for="t in introducedByType" :key="t.type">
                                <div class="d-flex align-center justify-space-between font-mono text-caption mb-1">
                                    <span class="text-light-slate">{{ t.label }}</span>
                                    <span class="text-lightest-slate">{{ t.count.toLocaleString() }}</span>
                                </div>
                                <div class="type-track">
                                    <span :class="`bg-${chamberColor(t.chamber)}`" :style="{ width: `${Math.max(t.count / maxTypeCount * 100, 1)}%` }"></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Newly summarized -->
                    <div v-if="overview.summaries.length" class="panel pa-5">
                        <p class="panel-eyebrow font-mono text-caption text-uppercase mb-1">Newly summarized</p>
                        <p class="text-slate text-caption mb-4">Plain-English summaries from the Congressional Research Service.</p>
                        <div class="person-list">
                            <router-link
                                v-for="s in overview.summaries"
                                :key="`${s.bill?.type}${s.bill?.number}${s.versionCode}`"
                                :to="`/bill/${s.bill?.congress}/${s.bill?.type}/${s.bill?.number}`"
                                class="aside-row d-block py-3"
                            >
                                <span class="d-flex align-center ga-2 mb-1">
                                    <span class="font-mono text-caption font-weight-bold" :class="`text-${chamberColor(s.bill?.originChamber)}`">{{ s.bill?.type }}{{ s.bill?.number }}</span>
                                    <span class="font-mono text-caption text-slate text-truncate">{{ s.actionDesc }}</span>
                                </span>
                                <span class="summary-snippet text-light-slate text-body-2">{{ plainText(s.text) }}</span>
                            </router-link>
                        </div>
                    </div>

                    <!-- Civilian nominations -->
                    <div v-if="overview.nominations.items.length" class="panel pa-5">
                        <p class="panel-eyebrow font-mono text-caption text-uppercase mb-1">Nominations</p>
                        <p class="text-slate text-caption mb-4">
                            Recent civilian nominations, out of {{ overview.nominations.count.toLocaleString() }} sent to the Senate.
                        </p>
                        <div class="person-list">
                            <a
                                v-for="n in overview.nominations.items"
                                :key="n.citation"
                                :href="congressGovNominationUrl(n.congress!, n.number!)"
                                target="_blank"
                                class="aside-row d-block py-3"
                            >
                                <span class="d-flex align-center justify-space-between ga-2 mb-1 font-mono text-caption">
                                    <span class="text-info text-truncate">{{ n.organization ?? 'Nomination' }}</span>
                                    <span class="text-slate flex-shrink-0">{{ n.citation }}</span>
                                </span>
                                <span class="summary-snippet text-light-slate text-body-2">{{ n.description }}</span>
                                <span v-if="n.latestAction?.actionDate" class="font-mono text-caption text-slate d-block mt-1">
                                    Latest action {{ moment(n.latestAction.actionDate).format('MMM D, YYYY') }}
                                </span>
                            </a>
                        </div>
                    </div>
                </aside>

                <!-- Aside placeholder while the overview loads. -->
                <div v-else class="aside d-flex flex-column ga-4" aria-busy="true" aria-label="Loading Congress overview">
                    <div v-for="i in 2" :key="i" class="panel pa-5">
                        <v-skeleton-loader type="text" class="bone mb-4" style="width: 40%" />
                        <v-skeleton-loader v-for="j in 4" :key="j" type="text" class="bone mb-3" />
                    </div>
                </div>
            </v-col>
        </v-row>

        <CtaPanel
            class="mt-16"
            tone="teal"
            art="ribbon"
            eyebrow="Under the hood"
            title="Powered by CapitolSharp."
            text="This feed runs on CapitolSharp, my open-source .NET wrapper for the Congress.gov API. Browse the code or use it in your own project."
        >
            <v-btn color="white" variant="flat" rounded="pill" size="large" class="text-none" prepend-icon="mdi-github" href="https://github.com/robsmitha/CapitolSharp" target="_blank">
                View on GitHub
            </v-btn>
            <v-btn color="white" variant="outlined" rounded="pill" size="large" class="text-none" to="/repo/CapitolSharp">
                Explore the repo
            </v-btn>
        </CtaPanel>
    </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import moment from 'moment'
import { useDisplay } from 'vuetify'
import { useRouter } from 'vue-router'
import apiClient from '@/api/elysianClient'
import {
    chamberColor, billStatus, billTypes, ordinal,
    congressGovLawsUrl, congressGovNominationUrl
} from '@/components/Congress/congress'
import { Bill as LawBill } from '@/components/Congress/types/LawListByCongressResponse.types'
import { Summarie } from '@/components/Congress/types/BillSummariesByCongressResponse.types'
import { Nomination } from '@/components/Congress/types/NominationListByCongressResponse.types'

const props = defineProps({
    // A past Congress to show; the current one when left out.
    congress: { type: Number, required: false }
})

type CongressSummary = { number: number, name: string, startYear: string, endYear: string }

type Overview = {
    congress: CongressSummary
    congresses: CongressSummary[]
    laws: { count: number, bills: LawBill[] }
    billTypes: { type: string, count: number }[]
    summaries: Summarie[]
    nominations: { count: number, items: Nomination[] }
}

const items = ref<any[]>([])
// The Congress the feed reports, used until the overview arrives.
const feedCongress = ref<any>()
const overview = ref<Overview>()
const chamber = ref<string | null>(null)

const router = useRouter()
const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const page = ref(1)
const itemsPerPage = ref(10)
const loading = ref(false)

const chamberStats = computed(() => {
    const names = Array.from(new Set(items.value.map(i => i.originChamber).filter(Boolean))).sort()
    return names.map(name => ({
        name,
        color: chamberColor(name),
        count: items.value.filter(i => i.originChamber === name).length
    }))
})

// Hero: the Congress being shown, and its totals from the overview.
const congressNumber = computed<number | undefined>(() => props.congress ?? overview.value?.congress.number ?? feedCongress.value?.number)
const currentCongressNumber = computed(() => overview.value?.congresses[0]?.number)
const isPastCongress = computed(() => props.congress !== undefined && props.congress !== currentCongressNumber.value)
const congressName = computed(() =>
    overview.value?.congress.name ?? feedCongress.value?.name ?? (props.congress ? `${ordinal(props.congress)} Congress` : 'Congress'))
const congressYears = computed(() => {
    const c = overview.value?.congress ?? feedCongress.value
    return c?.startYear ? `${c.startYear}–${c.endYear}` : ''
})

const introducedByType = computed(() => billTypes
    .map(t => ({ ...t, count: overview.value?.billTypes.find(b => b.type === t.type)?.count ?? 0 }))
    .filter(t => t.count > 0))
const billsIntroduced = computed(() => introducedByType.value.reduce((n, t) => n + t.count, 0))
const maxTypeCount = computed(() => Math.max(...introducedByType.value.map(t => t.count), 1))

const introducedByChamber = computed(() => ['House', 'Senate'].map(name => ({
    name,
    color: chamberColor(name),
    count: introducedByType.value.filter(t => t.chamber === name).reduce((n, t) => n + t.count, 0)
})))

const heroStats = computed(() => [
    { label: 'Bills introduced', value: billsIntroduced.value, color: '' },
    ...introducedByChamber.value.map(c => ({ label: c.name, value: c.count, color: c.color })),
    { label: 'Became law', value: overview.value?.laws.count ?? 0, color: 'green' },
    { label: 'Nominations', value: overview.value?.nominations.count ?? 0, color: '' },
])

const splitLabel = computed(() => introducedByChamber.value.map(c => `${c.count} ${c.name}`).join(', '))

// Became law
const laws = computed(() => overview.value?.laws.bills ?? [])
const showAllLaws = ref(false)
const lawLimit = 6
const visibleLaws = computed(() => showAllLaws.value ? laws.value : laws.value.slice(0, lawLimit))
const lawLabel = (b: LawBill) => {
    const law = b.laws?.[0]
    return law ? `${law.type === 'Private Law' ? 'Private' : 'Public'} Law ${law.number}` : 'Law'
}

// CRS summaries arrive as HTML; the aside only needs a plain snippet.
const plainText = (html?: string) => new DOMParser().parseFromString(html ?? '', 'text/html').body.textContent?.trim() ?? ''

async function loadOverview() {
    const query = props.congress ? `?congress=${props.congress}` : ''
    const response = await apiClient?.getData(`/api/CongressOverview${query}`)
    if (!response?.success) {
        console.error("Failed to get Congress overview.")
        return
    }
    overview.value = response.data
}

const filteredItems = computed(() => {
    if (!chamber.value) return items.value
    return items.value.filter(i => i.originChamber === chamber.value)
})

// Group the feed by the day each bill was last updated, like a timeline.
const groupedItems = computed(() => {
    const groups = new Map<string, { key: string, label: string, items: any[] }>()
    for (const i of filteredItems.value) {
        const day = moment(i.updateDate).startOf('day')
        const key = day.format('YYYY-MM-DD')
        if (!groups.has(key)) {
            groups.set(key, { key, label: dayLabel(day), items: [] })
        }
        groups.get(key)!.items.push(i)
    }
    return Array.from(groups.values())
})

function dayLabel(day: moment.Moment) {
    const today = moment().startOf('day')
    if (day.isSame(today)) return 'Today'
    if (day.isSame(today.clone().subtract(1, 'day'))) return 'Yesterday'
    return day.format('dddd, MMM D')
}

const status = (i: any) => billStatus(i.latestAction?.text)

function openBill(i: any) {
    router.push(`/bill/${congressNumber.value}/${i.type}/${i.number}`)
}

async function load({ done } : any) {
    // The first page is requested on mount and the infinite scroll can ask again
    // while it's in flight; skip the duplicate so no page is fetched twice.
    if (loading.value) {
        done('ok')
        return
    }
    loading.value = true
    const offset = (page.value - 1) * itemsPerPage.value

    try {
        const congressQuery = props.congress ? `&congress=${props.congress}` : ''
        const response = await apiClient?.getData(`/api/CongressFeed?offset=${offset}${congressQuery}`)
        if (!response?.success){
            console.error("Failed to get feed.")
            done('error')
            return
        }
        const data = response.data
        if (data.billList.bills.length === 0){
            done('empty')
        }
        else {
            feedCongress.value = data.congressDetails
            items.value.push(...data.billList.bills)
            done('ok')
        }
        page.value++
    } finally {
        loading.value = false
    }
}

// The hero pushes the infinite scroll's trigger below the fold, so load the
// first page up front instead of waiting for the reader to scroll to it.
onMounted(() => {
    load({ done: () => {} })
    loadOverview()
})
</script>

<style scoped>
.feed {
    max-width: 1100px;
}

.hero-title {
    font-size: clamp(1.8rem, 2vw + 1rem, 2.6rem);
    line-height: 1.1;
}

.hero-picker {
    color: inherit;
    text-align: left;
    border-radius: 8px;
}

.hero-picker-icon {
    opacity: 0.6;
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.hero-picker:hover .hero-picker-icon,
.hero-picker:focus-visible .hero-picker-icon {
    opacity: 1;
    transform: translateY(2px);
}

.hero-link {
    color: inherit;
    font-weight: 600;
}

.hero-years {
    padding: 3px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.35);
}

.hero-years-bone {
    width: 88px;
    background: transparent;
}

.hero-years-bone :deep(.v-skeleton-loader__chip) {
    margin: 0;
    height: 24px;
    max-width: none;
    width: 100%;
    background: rgba(255, 255, 255, 0.12);
}

.hero-text {
    max-width: 48ch;
    opacity: 0.82;
}

.hero-label {
    opacity: 0.7;
}

.chamber-split {
    display: flex;
    gap: 3px;
    height: 6px;
    max-width: 360px;
    border-radius: 999px;
    overflow: hidden;
}

/* Timeline: a rail down the left with a dot for each day. */
.day-group {
    position: relative;
    /* Leave room for the dot, which sits on the rail and would otherwise be
       clipped by the infinite scroll container. */
    margin-left: 6px;
    padding-left: 1.75rem;
    padding-bottom: 2.5rem;
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

.bill-row {
    cursor: pointer;
    border-radius: 12px;
    background:
        radial-gradient(90% 120% at 0% 0%, rgba(var(--chamber), 0.1), transparent 60%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgba(var(--chamber), 0.6);
    transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.bill-row:hover,
.bill-row:focus-visible {
    transform: translateX(4px);
    border-color: rgba(var(--chamber), 0.6);
    border-left-color: rgb(var(--chamber));
    box-shadow: 0 16px 36px -20px rgba(var(--chamber), 0.6);
    outline: none;
}

.bill-row:hover .bill-chevron {
    color: rgb(var(--chamber)) !important;
}

.bill-badge {
    min-width: 76px;
    text-align: center;
    padding: 3px 10px;
    border-radius: 6px;
    font-weight: 700;
    color: rgb(var(--chamber));
    background: rgba(var(--chamber), 0.14);
}

.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
}

.min-width-0 {
    min-width: 0;
}

.bill-title,
.bill-action {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.bill-action {
    font-style: italic;
}

/* Became law */
.law-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 0.75rem;
}

.law-card {
    text-decoration: none;
    border-radius: 12px;
    background:
        radial-gradient(90% 120% at 0% 0%, rgba(var(--v-theme-green), 0.08), transparent 60%),
        rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: border-color 0.2s ease, transform 0.2s ease;
}

.law-card:hover,
.law-card:focus-visible {
    border-color: rgba(var(--v-theme-green), 0.6);
    transform: translateY(-2px);
    outline: none;
}

.law-pill {
    align-self: flex-start;
    white-space: nowrap;
    padding: 1px 9px;
    border-radius: 999px;
    color: rgb(var(--v-theme-green));
    background: rgba(var(--v-theme-green), 0.14);
}

.law-title {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.law-badge {
    min-width: 0;
}

/* Aside, same panels as the bill page. Not sticky: with three panels it's taller
   than the screen, and sticking would hide the bottom of it. */

.panel {
    border-radius: 14px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}

.panel-eyebrow {
    color: rgb(var(--v-theme-primary));
    letter-spacing: 0.08em;
}

.panel-link {
    text-decoration: none;
    color: rgb(var(--v-theme-info));
}

.panel-link:hover {
    text-decoration: underline;
}

.type-track {
    height: 6px;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(var(--v-theme-on-surface), 0.06);
}

.type-track span {
    display: block;
    height: 100%;
    border-radius: 999px;
}

.person-list {
    border-top: 1px solid rgb(var(--v-theme-lightest-navy));
}

.aside-row {
    text-decoration: none;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.aside-row:hover .summary-snippet {
    color: rgb(var(--v-theme-lightest-slate)) !important;
}

.summary-snippet {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.bone {
    background: transparent;
}

.bone :deep(.v-skeleton-loader__text) {
    margin: 0;
    max-width: none;
}

@media (prefers-reduced-motion: reduce) {
    .bill-row,
    .law-card {
        transition: none;
    }

    .bill-row:hover,
    .law-card:hover {
        transform: none;
    }
}
</style>
