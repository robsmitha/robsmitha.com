<template>
    <section class="bg-light-navy congress-hero">
        <v-container class="py-10">
            <p class="font-mono text-primary text-body-2 mb-2">
                <span aria-hidden="true">&gt;</span> congress.gov
            </p>
            <div class="d-flex align-center flex-wrap ga-3 mb-3">
                <h1 class="text-lightest-slate text-h4 font-weight-bold">
                    {{ congress?.name ?? 'Congress' }}
                </h1>
                <v-chip v-if="congress" variant="outlined" color="primary" class="font-mono">
                    {{ congress.startYear }}&ndash;{{ congress.endYear }}
                </v-chip>
                <v-skeleton-loader v-else type="chip" width="90" color="surface"></v-skeleton-loader>
            </div>
            <p class="text-slate" style="max-width: 560px;">
                A live feed of bill activity pulled directly from the Congress.gov API, sorted by most recently updated.
            </p>

            <div class="d-flex flex-wrap ga-2 mt-8">
                <v-chip
                    :variant="chamber === null ? 'flat' : 'outlined'"
                    :color="chamber === null ? 'primary' : 'slate'"
                    class="font-mono"
                    size="small"
                    @click="chamber = null"
                >
                    All ({{ items.length }})
                </v-chip>
                <v-chip
                    v-for="c in chambers"
                    :key="c"
                    :variant="chamber === c ? 'flat' : 'outlined'"
                    :color="chamber === c ? 'primary' : 'slate'"
                    class="font-mono"
                    size="small"
                    @click="chamber = chamber === c ? null : c"
                >
                    {{ c }} ({{ countByChamber(c) }})
                </v-chip>
            </div>
        </v-container>
    </section>

    <v-container class="py-10">
        <div class="d-flex align-center mb-8 section-heading">
            <span class="font-mono text-primary text-body-2 mr-3">01.</span>
            <h3 class="text-lightest-slate text-h5 font-weight-bold text-nowrap">
                Latest Activity
            </h3>
            <v-divider class="ml-4 flex-grow-1" color="lightest-navy" thickness="1" />
        </div>

        <v-infinite-scroll
            :mode="items.length > 20 ? 'manual' : 'intersect'"
            color="primary"
            @load="load"
        >
            <v-sheet v-if="filteredItems.length > 0" color="surface" rounded="lg" class="bill-list">
                <div
                    v-for="i in filteredItems"
                    :key="`${i.type}${i.number}`"
                    class="bill-row pa-4"
                    @click="$router.push(`bill/${congress.number}/${i.type}/${i.number}`)"
                >
                    <div class="d-flex align-start ga-4">
                        <v-chip
                            size="small"
                            variant="tonal"
                            :color="i.originChamber === 'Senate' ? 'info' : 'primary'"
                            class="font-mono flex-shrink-0"
                        >
                            {{ i.type }}{{ i.number }}
                        </v-chip>

                        <div class="flex-grow-1 min-width-0">
                            <p class="text-lightest-slate font-weight-bold text-body-1 bill-title mb-1" v-html="i.title"></p>
                            <p class="text-slate text-body-2 bill-action mb-2" v-html="i.latestAction.text"></p>
                            <div class="d-flex align-center flex-wrap ga-2 font-mono text-caption text-slate">
                                <v-icon size="14">mdi-bank-outline</v-icon>
                                <span>{{ i.originChamber }}</span>
                                <span class="text-lightest-navy">&middot;</span>
                                <span>Updated {{ moment(i.updateDate).startOf('day').fromNow() }}</span>
                            </div>
                        </div>

                        <v-icon color="slate" size="18" class="flex-shrink-0">mdi-chevron-right</v-icon>
                    </div>
                </div>
            </v-sheet>

            <template v-slot:loading>
                <v-skeleton-loader :type="`list-item-three-line@${(items.length === 0 ? isMobile ? '7' : '10' : '3')}`" color="surface" class="w-100"></v-skeleton-loader>
            </template>

            <template v-slot:empty>
                <div class="d-flex flex-column align-center py-12 text-center">
                    <v-icon size="40" class="mb-3 text-lightest-navy">mdi-gavel</v-icon>
                    <p class="text-body-2 text-slate">That's every bill we've got &mdash; check back soon.</p>
                </div>
            </template>
        </v-infinite-scroll>
    </v-container>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import moment from 'moment'
import { useDisplay } from 'vuetify'
import apiClient from '@/api/elysianClient'

const items = ref<any[]>([])
const congress = ref<any>()
const chamber = ref<string | null>(null)

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const page = ref(1)
const itemsPerPage = ref(10)

const chambers = computed(() => {
    return Array.from(new Set(items.value.map(i => i.originChamber).filter(Boolean))).sort()
})

const filteredItems = computed(() => {
    if (!chamber.value) return items.value
    return items.value.filter(i => i.originChamber === chamber.value)
})

function countByChamber(c: string) {
    return items.value.filter(i => i.originChamber === c).length
}

async function load({ done } : any) {
    const offset = (page.value - 1) * itemsPerPage.value

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
}
</script>

<style scoped>
.bill-list {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    overflow: hidden;
}

.bill-row {
    cursor: pointer;
    border-left: 2px solid transparent;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
    transition: background-color 0.15s ease, border-color 0.15s ease;
}

.bill-row:hover {
    background-color: rgba(var(--v-theme-primary), 0.04);
    border-left-color: rgb(var(--v-theme-primary));
}

.bill-row:last-child {
    border-bottom: none;
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
