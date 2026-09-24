<template>
    <div class="activity d-flex flex-wrap ga-8">
        <div class="stats d-flex flex-wrap ga-6">
            <div v-for="s in stats" :key="s.label">
                <span class="font-mono text-h5 text-lightest-slate font-weight-bold d-block">{{ s.value }}</span>
                <span class="font-mono text-caption text-slate">{{ s.label }}</span>
            </div>
        </div>

        <div class="heatmap-wrap">
            <!-- One column per week, one row per weekday, like GitHub's contribution graph. -->
            <div class="heatmap" role="img" :aria-label="`${commits.length} commits over the last ${weeks} weeks`">
                <template v-for="(week, w) in grid" :key="w">
                    <span
                        v-for="day in week"
                        :key="day.key"
                        class="cell"
                        :class="{ 'cell--future': day.future }"
                        :style="{ '--level': level(day.count) }"
                        :title="day.future ? '' : `${day.count} commit${day.count === 1 ? '' : 's'} on ${day.label}`"
                    ></span>
                </template>
            </div>
            <div class="d-flex align-center justify-space-between mt-2 font-mono text-caption text-slate">
                <span>{{ weeks }} weeks ago</span>
                <span class="d-flex align-center ga-1">
                    Less
                    <span v-for="l in 5" :key="l" class="cell cell--legend" :style="{ '--level': l - 1 }"></span>
                    More
                </span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment'

const props = defineProps({
    commits: { type: Array as () => any[], default: () => [] }
})

const weeks = 12

const countsByDay = computed(() => {
    const counts = new Map<string, number>()
    for (const c of props.commits) {
        const key = moment(c.commit.author.date).format('YYYY-MM-DD')
        counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return counts
})

const grid = computed(() => {
    const today = moment().startOf('day')
    const start = today.clone().startOf('week').subtract(weeks - 1, 'weeks')
    return Array.from({ length: weeks }, (_, w) =>
        Array.from({ length: 7 }, (_, d) => {
            const day = start.clone().add(w, 'weeks').add(d, 'days')
            const key = day.format('YYYY-MM-DD')
            return { key, label: day.format('MMM D'), count: countsByDay.value.get(key) ?? 0, future: day.isAfter(today) }
        })
    )
})

const maxCount = computed(() => Math.max(1, ...countsByDay.value.values()))

// 0 = no commits, 1-4 = quartiles of the busiest day.
function level(count: number) {
    if (count === 0) return 0
    return Math.min(4, Math.ceil((count / maxCount.value) * 4))
}

const stats = computed(() => {
    const since = moment().subtract(30, 'days')
    const recent = props.commits.filter(c => moment(c.commit.author.date).isAfter(since))
    const contributors = new Set(props.commits.map(c => c.author?.login ?? c.commit.author.name))
    const last = props.commits[0]
    return [
        { label: 'Commits, last 30 days', value: recent.length },
        { label: 'Active days', value: countsByDay.value.size },
        { label: 'Contributors', value: contributors.size },
        { label: 'Last commit', value: last ? moment(last.commit.author.date).fromNow(true) : '—' },
    ]
})
</script>

<style scoped>
.stats {
    flex: 1 1 280px;
    align-content: flex-start;
}

.stats > div {
    min-width: 110px;
}

.heatmap-wrap {
    flex: 0 1 auto;
    overflow-x: auto;
}

.heatmap {
    display: grid;
    grid-template-rows: repeat(7, 14px);
    grid-auto-flow: column;
    grid-auto-columns: 14px;
    gap: 4px;
}

.cell {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 3px;
    background: rgba(var(--v-theme-on-surface), 0.06);
}

.cell:not(.cell--future) {
    background: color-mix(in srgb, rgb(var(--v-theme-primary)) calc(var(--level) * 25%), rgba(var(--v-theme-on-surface), 0.06));
}

.cell--future {
    background: transparent;
}

.cell--legend {
    width: 10px;
    height: 10px;
    background: color-mix(in srgb, rgb(var(--v-theme-primary)) calc(var(--level) * 25%), rgba(var(--v-theme-on-surface), 0.06));
}
</style>
