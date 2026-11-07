<template>
    <div>
        <div v-if="!showTable" ref="box" class="chart" @mouseleave="hover = null">
            <svg v-if="width > 0 && bars.length" :width="width" :height="H" role="img" :aria-label="summary">
                <g v-for="g in grid" :key="g.value">
                    <line :x1="PAD_L" :x2="width" :y1="g.y" :y2="g.y" class="grid" />
                    <text :x="PAD_L - 6" :y="g.y + 3" text-anchor="end" class="axis">{{ g.label }}</text>
                </g>
                <g v-for="(b, i) in bars" :key="b.key">
                    <!-- A bigger invisible target than the bar, for hover -->
                    <rect :x="b.slotX" :y="PAD_T" :width="b.slotW" :height="H - PAD_T - PAD_B" fill="transparent" @mouseenter="hover = i" @focus="hover = i" />
                    <path :d="b.path" :class="['bar', { 'bar--partial': b.partial, 'bar--hover': hover === i }]" />
                    <text :x="b.cx" :y="H - 4" text-anchor="middle" class="axis">{{ b.short }}</text>
                </g>
            </svg>
            <div v-if="hover !== null && bars[hover]" class="tip" :style="{ left: `${tipLeft}px` }">
                <span class="d-block font-mono text-caption text-muted">{{ bars[hover].long }}{{ bars[hover].partial ? ' · so far' : '' }}</span>
                <span class="d-block font-mono font-weight-bold text-high-emphasis">{{ money(bars[hover].total) }}</span>
            </div>
        </div>

        <table v-else class="table font-mono text-caption">
            <thead><tr><th scope="col">Month</th><th scope="col" class="text-right">Counted spending</th></tr></thead>
            <tbody>
                <tr v-for="b in bars" :key="b.key"><td>{{ b.long }}{{ b.partial ? ' (so far)' : '' }}</td><td class="text-right">{{ money(b.total) }}</td></tr>
            </tbody>
        </table>

        <v-btn variant="text" size="small" class="text-none px-0 mt-1" @click="showTable = !showTable">{{ showTable ? 'Show as chart' : 'Show as table' }}</v-btn>
    </div>
</template>

<script setup lang="ts">
// One series (counted spending per month): one hue, no legend, hover tooltip, and a table view.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { SpendingTrend } from '@/services/budget.service'
import { money, monthName } from '@/composables/budgetFormat'

const props = defineProps<{ trends: SpendingTrend[] }>()

const H = 170
const PAD_L = 40
const PAD_B = 20
const PAD_T = 8

const box = ref<HTMLElement | null>(null)
const width = ref(0)
const hover = ref<number | null>(null)
const showTable = ref(false)

let observer: ResizeObserver | undefined
function observe () {
    observer?.disconnect()
    if (!box.value) return
    observer = new ResizeObserver(entries => { width.value = Math.floor(entries[0].contentRect.width) })
    observer.observe(box.value)
}
onMounted(observe)
watch(showTable, () => requestAnimationFrame(observe))
onBeforeUnmount(() => observer?.disconnect())

/** A round top for the scale: 1, 2, 2.5 or 5 × a power of ten */
const max = computed(() => {
    const top = Math.max(...props.trends.map(t => t.total), 1)
    const p = 10 ** Math.floor(Math.log10(top))
    return [1, 2, 2.5, 5, 10].map(n => n * p).find(n => n >= top)!
})

const y = (v: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - Math.max(0, v) / max.value)

const grid = computed(() => [0, max.value / 2, max.value].map(value => ({
    value,
    y: y(value),
    label: value === 0 ? '0' : value >= 1000 ? `$${+(value / 1000).toFixed(1)}k` : `$${value}`,
})))

const bars = computed(() => {
    const slot = (width.value - PAD_L) / Math.max(1, props.trends.length)
    return props.trends.map((t, i) => {
        const w = Math.min(36, slot * 0.56)
        const x = PAD_L + i * slot + (slot - w) / 2
        const top = y(t.total)
        const base = y(0)
        const r = Math.min(4, w / 2, base - top)
        // Rounded at the top, square on the baseline
        const path = base - top < 0.5
            ? `M${x},${base}h${w}`
            : `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${base}Z`
        return {
            key: `${t.year}-${t.month}`,
            total: t.total,
            partial: t.isPartial,
            short: monthName(t.month).slice(0, 3),
            long: `${monthName(t.month)} ${t.year}`,
            slotX: PAD_L + i * slot,
            slotW: slot,
            cx: x + w / 2,
            path,
        }
    })
})

const tipLeft = computed(() => hover.value === null ? 0 : Math.max(0, Math.min(bars.value[hover.value].cx - 60, width.value - 130)))

const summary = computed(() => `Counted spending by month: ${bars.value.map(b => `${b.long} ${money(b.total)}${b.partial ? ' so far' : ''}`).join(', ')}`)
</script>

<style scoped>
.chart {
    position: relative;
    min-height: 170px;
}

.grid {
    stroke: rgb(var(--v-theme-border));
    stroke-width: 1;
}

.axis {
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    fill: rgb(var(--v-theme-subtle));
}

.bar {
    fill: rgb(var(--v-theme-chart-1));
}

/* This month is still filling up: lighter, with an outline so it doesn't rely on shade alone */
.bar--partial {
    fill: rgba(var(--v-theme-chart-1), 0.45);
    stroke: rgb(var(--v-theme-chart-1));
    stroke-width: 1;
    stroke-dasharray: 3 2;
}

.bar--hover {
    filter: brightness(1.15);
}

.tip {
    position: absolute;
    top: 0;
    width: 130px;
    padding: 6px 8px;
    border-radius: 8px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface-raised));
    pointer-events: none;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 4px 0;
    border-bottom: 1px solid rgb(var(--v-theme-border));
    text-align: left;
}

.table th {
    color: rgb(var(--v-theme-subtle));
    font-weight: 500;
}
</style>
