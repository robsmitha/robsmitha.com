<template>
    <div>
        <div v-if="series.length > 1 || showTable" class="d-flex flex-wrap ga-4 text-caption text-muted mb-2" aria-hidden="true">
            <span v-for="s in series" :key="s.key" class="d-flex align-center ga-2">
                <span class="swatch" :class="[`bg-${s.color}`, { 'swatch--dashed': s.other }]" />{{ s.label }}
            </span>
        </div>

        <div v-if="!showTable" ref="box" class="chart" @mouseleave="hover = null">
            <svg v-if="width > 0 && points > 1" :width="width" :height="H" role="img" :aria-label="summary">
                <g v-for="g in grid" :key="g.value">
                    <line :x1="PAD_L" :x2="width - PAD_R" :y1="g.y" :y2="g.y" class="grid" />
                    <text :x="PAD_L - 6" :y="g.y + 3" text-anchor="end" class="axis">{{ g.label }}</text>
                </g>
                <text v-for="t in ticks" :key="t.i" :x="x(t.i)" :y="H - 6" text-anchor="middle" class="axis">{{ t.label }}</text>
                <path v-for="s in series" :key="s.key" :d="path(s.values)" fill="none" :class="['line', `stroke-${s.color}`, { 'line--other': s.other }]" />
                <template v-if="hover !== null">
                    <line :x1="x(hover)" :x2="x(hover)" :y1="PAD_T" :y2="H - PAD_B" class="crosshair" />
                    <circle v-for="s in series" :key="s.key" :cx="x(hover)" :cy="y(s.values[hover])" r="4" :class="['dot', `fill-${s.color}`]" />
                </template>
                <!-- Hit area for the crosshair -->
                <rect :x="PAD_L" :y="PAD_T" :width="Math.max(0, width - PAD_L - PAD_R)" :height="H - PAD_T - PAD_B" fill="transparent" @mousemove="move" />
            </svg>
            <div v-if="hover !== null" class="tip" :style="{ left: `${tipLeft}px` }">
                <span class="d-block font-mono text-caption text-muted mb-1">{{ hover === 0 ? 'Today' : `After the ${monthLabels[hover - 1]} payment` }}</span>
                <span v-for="s in series" :key="s.key" class="d-flex justify-space-between ga-3 text-caption">
                    <span class="text-high-emphasis"><span class="swatch swatch--inline" :class="`bg-${s.color}`" />{{ s.label }}</span>
                    <span class="font-mono text-high-emphasis">{{ money(s.values[hover]) }}</span>
                </span>
                <span class="d-flex justify-space-between ga-3 text-caption total">
                    <span class="text-high-emphasis">Total</span><span class="font-mono text-high-emphasis">{{ money(totals[hover]) }}</span>
                </span>
            </div>
        </div>

        <div v-else class="scroll">
            <table class="table font-mono text-caption">
                <thead>
                    <tr><th scope="col">After payment</th><th v-for="d in debts" :key="d.debtId" scope="col" class="text-right">{{ d.name }}</th><th scope="col" class="text-right">Total</th></tr>
                </thead>
                <tbody>
                    <tr v-for="m in schedule" :key="m.month">
                        <td>{{ monthLabel(m.month.slice(0, 7)) }}</td>
                        <td v-for="d in debts" :key="d.debtId" class="text-right">{{ money(m.debts.find(l => l.debtId === d.debtId)?.end ?? 0) }}</td>
                        <td class="text-right">{{ money(m.end) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <v-btn variant="text" size="small" class="text-none px-0 mt-1" @click="showTable = !showTable">{{ showTable ? 'Show as chart' : 'Month-by-month schedule' }}</v-btn>
    </div>
</template>

<script setup lang="ts">
// One line per debt (biggest three, the rest folded into "Other"), a legend, a crosshair tooltip and a table view.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Debt, DebtMonth } from '@/services/debt.service'
import { money, monthLabel, monthName } from '@/composables/budgetFormat'

const props = defineProps<{ debts: Debt[], schedule: DebtMonth[] }>()

const H = 240
const PAD_L = 44
const PAD_R = 12
const PAD_T = 10
const PAD_B = 24
const COLORS = ['chart-1', 'chart-2', 'chart-3']

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

/** Balance today, then after each month's payment */
function valuesFor (ids: number[]) {
    const start = props.debts.filter(d => ids.includes(d.debtId)).reduce((n, d) => n + d.balance, 0)
    return [start, ...props.schedule.map(m => m.debts.filter(l => ids.includes(l.debtId)).reduce((n, l) => n + l.end, 0))]
}

// Colour follows the debt (its position by balance today), never cycled
const series = computed(() => {
    const sorted = [...props.debts].sort((a, b) => b.balance - a.balance)
    const named = sorted.slice(0, sorted.length > 3 ? 2 : 3)
    const rest = sorted.slice(named.length)
    const list = named.map((d, i) => ({ key: String(d.debtId), label: d.name, color: COLORS[i], other: false, values: valuesFor([d.debtId]) }))
    if (rest.length) list.push({ key: 'other', label: `Other (${rest.length})`, color: 'subtle', other: true, values: valuesFor(rest.map(d => d.debtId)) })
    return list
})

const points = computed(() => props.schedule.length + 1)
const totals = computed(() => [props.debts.reduce((n, d) => n + d.balance, 0), ...props.schedule.map(m => m.end)])
const monthLabels = computed(() => props.schedule.map(m => monthLabel(m.month.slice(0, 7))))

const max = computed(() => {
    const top = Math.max(1, ...series.value.flatMap(s => s.values))
    const p = 10 ** Math.floor(Math.log10(top))
    return [1, 2, 2.5, 5, 10].map(n => n * p).find(n => n >= top)!
})

const x = (i: number) => PAD_L + (width.value - PAD_L - PAD_R) * i / Math.max(1, points.value - 1)
const y = (v: number) => PAD_T + (H - PAD_T - PAD_B) * (1 - Math.max(0, v) / max.value)
const path = (values: number[]) => values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('')

const grid = computed(() => [0, max.value / 2, max.value].map(value => ({
    value,
    y: y(value),
    label: value === 0 ? '0' : value >= 1000 ? `$${+(value / 1000).toFixed(1)}k` : `$${value}`,
})))

const ticks = computed(() => {
    const step = Math.max(1, Math.ceil(points.value / 6))
    const list = []
    for (let i = 0; i < points.value; i += step) {
        const month = i === 0 ? null : props.schedule[i - 1].month
        list.push({ i, label: month ? monthName(Number(month.slice(5, 7))).slice(0, 3) : 'Now' })
    }
    return list
})

function move (e: MouseEvent) {
    const rect = (e.currentTarget as SVGRectElement).ownerSVGElement!.getBoundingClientRect()
    const i = Math.round((e.clientX - rect.left - PAD_L) / Math.max(1, width.value - PAD_L - PAD_R) * (points.value - 1))
    hover.value = Math.max(0, Math.min(points.value - 1, i))
}

const tipLeft = computed(() => hover.value === null ? 0 : Math.max(0, Math.min(x(hover.value) + 10, width.value - 210)))

const summary = computed(() => {
    const last = props.schedule.at(-1)
    return `Balance by debt from ${money(totals.value[0])} today${last ? ` to ${money(last.end)} after ${monthLabel(last.month.slice(0, 7))}` : ''}`
})
</script>

<style scoped>
.chart {
    position: relative;
    min-height: 240px;
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

.line {
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
}

.line--other {
    stroke-dasharray: 5 4;
}

.stroke-chart-1 { stroke: rgb(var(--v-theme-chart-1)); }
.stroke-chart-2 { stroke: rgb(var(--v-theme-chart-2)); }
.stroke-chart-3 { stroke: rgb(var(--v-theme-chart-3)); }
.stroke-subtle { stroke: rgb(var(--v-theme-subtle)); }
.fill-chart-1 { fill: rgb(var(--v-theme-chart-1)); }
.fill-chart-2 { fill: rgb(var(--v-theme-chart-2)); }
.fill-chart-3 { fill: rgb(var(--v-theme-chart-3)); }
.fill-subtle { fill: rgb(var(--v-theme-subtle)); }

.dot {
    stroke: rgb(var(--v-theme-surface));
    stroke-width: 2;
}

.crosshair {
    stroke: rgb(var(--v-theme-subtle));
    stroke-width: 1;
    opacity: 0.6;
}

.swatch {
    display: inline-block;
    width: 16px;
    height: 2px;
    border-radius: 1px;
}

.swatch--dashed {
    background: repeating-linear-gradient(90deg, rgb(var(--v-theme-subtle)) 0 4px, transparent 4px 7px) !important;
}

.swatch--inline {
    width: 8px;
    margin-right: 6px;
    vertical-align: middle;
}

.tip {
    position: absolute;
    top: 4px;
    width: 200px;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface-raised));
    pointer-events: none;
}

.tip .total {
    border-top: 1px solid rgb(var(--v-theme-border));
    margin-top: 4px;
    padding-top: 4px;
}

.scroll {
    overflow-x: auto;
    max-height: 360px;
}

.table {
    width: 100%;
    min-width: 480px;
    border-collapse: collapse;
}

.table th,
.table td {
    padding: 4px 8px 4px 0;
    border-bottom: 1px solid rgb(var(--v-theme-border));
    text-align: left;
    white-space: nowrap;
}

.table th {
    position: sticky;
    top: 0;
    background: rgb(var(--v-theme-surface));
    color: rgb(var(--v-theme-subtle));
    font-weight: 500;
}

.table .text-right {
    text-align: right;
}
</style>
