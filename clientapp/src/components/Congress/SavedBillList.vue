<template>
    <PageHero eyebrow="> your activity" tone="navy" art="capitol">
        <h1 class="hero-title font-weight-bold mb-3">Saved Bills</h1>
        <p class="hero-text mb-8">
            Bills you bookmarked from the Congress feed. We check Congress.gov for new actions and flag
            the ones that moved since you last looked.
        </p>
        <div class="d-flex flex-wrap ga-8">
            <div v-for="s in heroStats" :key="s.label">
                <span class="font-mono text-h5 font-weight-bold d-block" :class="s.color ? `text-${s.color}` : ''">
                    {{ congressStore.loaded ? s.value.toLocaleString() : '—' }}
                </span>
                <span class="font-mono text-caption hero-label">{{ s.label }}</span>
            </div>
        </div>
    </PageHero>

    <v-container class="saved py-12">
        <!-- Not signed in (the route is protected in production, but not on the dev server). -->
        <div v-if="auth.checked && !auth.signedIn" class="empty d-flex flex-column align-center py-12 text-center">
            <v-icon size="40" class="mb-3 text-lightest-navy">mdi-bookmark-outline</v-icon>
            <p class="text-body-1 text-lightest-slate mb-1">Sign in to see your saved bills</p>
            <p class="text-body-2 text-slate mb-6">Bookmark bills from the Congress feed to follow them here.</p>
            <v-btn color="primary" variant="outlined" rounded="pill" class="text-none" prepend-icon="mdi-login" :href="signInUrl">
                Sign in
            </v-btn>
        </div>

        <BillFeedSkeleton v-else-if="!congressStore.loaded" :groups="[3]" :show-labels="false" />

        <div v-else-if="congressStore.trackedBills.length === 0" class="empty d-flex flex-column align-center py-12 text-center">
            <v-icon size="40" class="mb-3 text-lightest-navy">mdi-bookmark-multiple-outline</v-icon>
            <p class="text-body-1 text-lightest-slate mb-1">No saved bills yet</p>
            <p class="text-body-2 text-slate mb-6">
                Use the <v-icon size="16">mdi-bookmark-outline</v-icon> button on any bill in the feed to follow it here.
            </p>
            <v-btn color="primary" variant="outlined" rounded="pill" class="text-none" append-icon="mdi-arrow-right" to="/congress">
                Browse the Congress feed
            </v-btn>
        </div>

        <template v-else>
            <div class="d-flex flex-wrap align-center justify-space-between ga-4 mb-8">
                <div class="d-flex flex-wrap ga-2">
                    <v-chip
                        v-for="f in filters"
                        :key="f.value"
                        :variant="filter === f.value ? 'flat' : 'outlined'"
                        :color="filter === f.value ? f.color : 'slate'"
                        class="font-mono"
                        size="small"
                        @click="filter = f.value"
                    >
                        {{ f.label }} ({{ f.count }})
                    </v-chip>
                </div>
                <div class="d-flex align-center ga-2">
                    <v-select
                        v-if="congresses.length > 1"
                        v-model="congressFilter"
                        :items="congressOptions"
                        density="compact"
                        variant="outlined"
                        base-color="slate"
                        color="primary"
                        class="font-mono toolbar-select"
                        hide-details
                        aria-label="Congress"
                    ></v-select>
                    <v-btn-toggle v-model="sort" mandatory density="compact" variant="outlined" color="primary" class="font-mono" divided>
                        <v-btn value="activity" size="small" class="text-none">Latest action</v-btn>
                        <v-btn value="saved" size="small" class="text-none">Recently saved</v-btn>
                    </v-btn-toggle>
                </div>
            </div>

            <div v-if="visibleBills.length" class="d-flex flex-column ga-3">
                <div
                    v-for="b in visibleBills"
                    :key="b.billTrackingId"
                    class="bill-row pa-5"
                    :style="{ '--chamber': `var(--v-theme-${chamberColor(b.originChamber ?? undefined)})` }"
                    role="link"
                    tabindex="0"
                    @click="openBill(b)"
                    @keydown.enter.self="openBill(b)"
                >
                    <div class="d-flex align-start ga-4">
                        <span class="bill-badge font-mono text-caption flex-shrink-0">
                            {{ b.billType }}{{ b.billNumber }}
                        </span>

                        <div class="flex-grow-1 min-width-0">
                            <p v-if="b.hasUnseenActivity" class="new-activity font-mono text-caption mb-1">
                                <span class="new-activity-dot"></span>New activity
                            </p>
                            <p class="text-lightest-slate font-weight-bold text-body-1 bill-title mb-1" v-html="b.title"></p>
                            <p v-if="b.latestActionText" class="text-slate text-body-2 bill-action mb-3" v-html="b.latestActionText"></p>

                            <div class="d-flex align-center flex-wrap ga-3 font-mono text-caption text-slate">
                                <span class="status-pill" :class="`text-${status(b).color}`">
                                    <span class="status-dot" :class="`bg-${status(b).color}`"></span>
                                    {{ status(b).label }}
                                </span>
                                <span v-if="b.lawNumber" class="text-green">Law {{ b.lawNumber }}</span>
                                <span v-if="b.latestActionDate">Action {{ moment(b.latestActionDate).format('MMM D, YYYY') }}</span>
                                <span v-if="b.sponsorName" class="d-flex align-center ga-1 min-width-0">
                                    <span class="status-dot" :class="`bg-${partyColor(b.sponsorParty ?? undefined)}`"></span>
                                    <span class="text-truncate">{{ b.sponsorName }}</span>
                                </span>
                                <span v-if="b.policyArea">{{ b.policyArea }}</span>
                                <span>{{ ordinal(b.congress) }} Congress</span>
                                <span>Saved {{ moment(b.savedAt).format('MMM D') }}</span>
                            </div>

                            <TrackedBillNotes
                                :bill="b"
                                :editing="editingId === b.billTrackingId"
                                class="mt-4"
                                @update:editing="(editing: boolean) => editingId = editing ? b.billTrackingId : null"
                            />
                        </div>

                        <div class="d-flex flex-column align-center ga-1 flex-shrink-0">
                            <SaveBillButton :congress="b.congress" :bill-type="b.billType" :bill-number="b.billNumber" />
                            <v-tooltip :text="b.notes ? 'Edit note' : 'Add a note'" location="top">
                                <template v-slot:activator="{ props: tooltipProps }">
                                    <v-btn
                                        v-bind="tooltipProps"
                                        :icon="b.notes ? 'mdi-note-edit-outline' : 'mdi-note-plus-outline'"
                                        variant="text"
                                        size="small"
                                        density="comfortable"
                                        color="slate"
                                        :aria-label="`${b.notes ? 'Edit' : 'Add'} note for ${b.billType} ${b.billNumber}`"
                                        @click.stop="editNotes(b)"
                                        @keydown.enter.stop
                                    ></v-btn>
                                </template>
                            </v-tooltip>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="empty d-flex flex-column align-center py-12 text-center">
                <v-icon size="32" class="mb-3 text-lightest-navy">mdi-filter-off-outline</v-icon>
                <p class="text-body-2 text-slate mb-4">No saved bills match these filters.</p>
                <v-btn variant="text" color="primary" class="text-none" @click="clearFilters">Clear filters</v-btn>
            </div>
        </template>
    </v-container>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import moment from 'moment'
import { useAuthStore } from '@/store/auth'
import { useCongressStore, TrackedBill } from '@/store/congress'
import { chamberColor, partyColor, billStatus, ordinal, BillStatus } from '@/components/Congress/congress'

const auth = useAuthStore()
const congressStore = useCongressStore()
const route = useRoute()
const router = useRouter()

const signInUrl = computed(() => `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(route.fullPath)}`)

// The stored law number is exact; otherwise read the status from the latest action, like the feed does.
function status(b: TrackedBill): BillStatus {
    return b.lawNumber ? { label: 'Law', color: 'green' } : billStatus(b.latestActionText ?? undefined)
}

// Bills being removed drop off the list straight away instead of waiting for the server.
const bills = computed(() => congressStore.trackedBills.filter(b => congressStore.isTracked(b.congress, b.billType, b.billNumber)))

const heroStats = computed(() => [
    { label: 'Saved', value: bills.value.length, color: '' },
    { label: 'New activity', value: bills.value.filter(b => b.hasUnseenActivity).length, color: 'amber' },
    { label: 'Passed a chamber', value: bills.value.filter(b => status(b).label === 'Passed').length, color: 'violet' },
    { label: 'Became law', value: bills.value.filter(b => status(b).label === 'Law').length, color: 'green' },
])

// Filters: new activity, then one chip per status the saved bills actually have.
const filter = ref('all')
const statusOrder = ['Law', 'Passed', 'Reported', 'In committee', 'Introduced', 'Action']
const filters = computed(() => {
    const statusFilters = statusOrder
        .map(label => {
            const matching = bills.value.filter(b => status(b).label === label)
            return { value: label, label, count: matching.length, color: matching[0] ? status(matching[0]).color : 'slate' }
        })
        .filter(f => f.count > 0)
    const unseen = bills.value.filter(b => b.hasUnseenActivity).length
    return [
        { value: 'all', label: 'All', count: bills.value.length, color: 'lightest-slate' },
        ...(unseen ? [{ value: 'unseen', label: 'New activity', count: unseen, color: 'amber' }] : []),
        ...statusFilters
    ]
})

const congresses = computed(() => [...new Set(bills.value.map(b => b.congress))].sort((a, b) => b - a))
const congressFilter = ref<number | null>(null)
const congressOptions = computed(() => [
    { title: 'All Congresses', value: null },
    ...congresses.value.map(c => ({ title: `${ordinal(c)} Congress`, value: c }))
])

const sort = ref<'activity' | 'saved'>('activity')

const visibleBills = computed(() => {
    const time = (date: string | null) => date ? new Date(date).getTime() : 0
    return bills.value
        .filter(b => filter.value === 'all'
            || (filter.value === 'unseen' ? b.hasUnseenActivity : status(b).label === filter.value))
        .filter(b => congressFilter.value === null || b.congress === congressFilter.value)
        .sort((a, b) => sort.value === 'saved'
            ? time(b.savedAt) - time(a.savedAt)
            : time(b.latestActionDate) - time(a.latestActionDate))
})

function clearFilters() {
    filter.value = 'all'
    congressFilter.value = null
}

function openBill(b: TrackedBill) {
    router.push(`/bill/${b.congress}/${b.billType}/${b.billNumber}`)
}

// Notes: one open editor at a time.
const editingId = ref<number | null>(null)

function editNotes(b: TrackedBill) {
    editingId.value = b.billTrackingId
}
</script>

<style scoped>
.saved {
    max-width: 1100px;
}

.hero-title {
    font-size: clamp(1.8rem, 2vw + 1rem, 2.6rem);
    line-height: 1.1;
}

.hero-text {
    max-width: 48ch;
    opacity: 0.82;
}

.hero-label {
    opacity: 0.7;
}

.toolbar-select {
    min-width: 180px;
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

.bill-badge {
    min-width: 76px;
    text-align: center;
    padding: 3px 10px;
    border-radius: 6px;
    font-weight: 700;
    color: rgb(var(--chamber));
    background: rgba(var(--chamber), 0.14);
}

.new-activity {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: rgb(var(--v-theme-amber));
    letter-spacing: 0.04em;
    text-transform: uppercase;
}

.new-activity-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgb(var(--v-theme-amber));
    box-shadow: 0 0 0 3px rgba(var(--v-theme-amber), 0.25);
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
    flex-shrink: 0;
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
</style>
