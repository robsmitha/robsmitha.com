<template>
    <PageHero eyebrow="> congress.gov API" tone="navy" art="capitol">
        <div class="d-flex align-center flex-wrap ga-3 mb-3">
            <h1 class="hero-title font-weight-bold">
                {{ congress?.name ?? 'Congress' }}
            </h1>
            <span v-if="congress" class="font-mono text-caption hero-years">
                {{ congress.startYear }}&ndash;{{ congress.endYear }}
            </span>
            <v-skeleton-loader v-else type="chip" class="hero-years-bone" />
        </div>
        <p class="hero-text mb-8">
            A live feed of bill activity from the Congress.gov API, sorted by most recently updated.
        </p>

        <div class="d-flex flex-wrap ga-8 mb-4">
            <div>
                <span class="font-mono text-h5 font-weight-bold d-block">{{ items.length || '—' }}</span>
                <span class="font-mono text-caption hero-label">Bills loaded</span>
            </div>
            <div v-for="c in chamberStats" :key="c.name">
                <span class="font-mono text-h5 font-weight-bold d-block" :class="`text-${c.color}`">{{ c.count }}</span>
                <span class="font-mono text-caption hero-label">{{ c.name }}</span>
            </div>
        </div>
        <div v-if="items.length" class="chamber-split" role="img" :aria-label="splitLabel">
            <span
                v-for="c in chamberStats"
                :key="c.name"
                :class="`bg-${c.color}`"
                :style="{ flexGrow: c.count }"
            ></span>
        </div>
    </PageHero>

    <v-container class="feed py-12">
        <SectionHeading index="01" title="Latest Activity" />

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
import { chamberColor, billStatus } from '@/components/Congress/congress'

const items = ref<any[]>([])
const congress = ref<any>()
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

const splitLabel = computed(() => chamberStats.value.map(c => `${c.count} ${c.name}`).join(', '))

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
    router.push(`bill/${congress.value.number}/${i.type}/${i.number}`)
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
        const response = await apiClient?.getData(`/api/CongressFeed?offset=${offset}`)
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
            congress.value = data.congressDetails
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
onMounted(() => load({ done: () => {} }))
</script>

<style scoped>
.feed {
    max-width: 1100px;
}

.hero-title {
    font-size: clamp(1.8rem, 2vw + 1rem, 2.6rem);
    line-height: 1.1;
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

@media (prefers-reduced-motion: reduce) {
    .bill-row {
        transition: none;
    }

    .bill-row:hover {
        transform: none;
    }
}
</style>
