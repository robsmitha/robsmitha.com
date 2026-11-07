<template>
    <figure class="chart">
        <figcaption class="d-flex align-center justify-space-between ga-2 mb-1">
            <span class="text-caption font-weight-bold text-high-emphasis">{{ chart.title }}</span>
            <span v-if="chart.average != null" class="font-mono text-caption text-muted">avg {{ money(chart.average) }}</span>
        </figcaption>
        <svg :viewBox="`0 0 ${W} ${H}`" width="100%" role="img" :aria-label="summary">
            <line :x1="Pad" :x2="W - Pad" :y1="Base" :y2="Base" class="axis" />
            <line v-if="avgY != null" :x1="Pad" :x2="W - Pad" :y1="avgY" :y2="avgY" class="avg" />
            <g v-for="b in bars" :key="b.i">
                <path :d="b.d" class="bar" :class="{ 'bar--partial': b.partial }">
                    <title>{{ b.title }}</title>
                </path>
                <!-- A target bigger than the bar, so hovering anywhere in the column shows the value -->
                <rect :x="b.x - Gap / 2" :y="Top" :width="b.w + Gap" :height="Base - Top" class="hit">
                    <title>{{ b.title }}</title>
                </rect>
                <text :x="b.x + b.w / 2" :y="H - 4" text-anchor="middle" class="label">{{ chart.labels[b.i] }}</text>
                <text v-if="b.i === peak" :x="b.x + b.w / 2" :y="b.y - 5" text-anchor="middle" class="value">{{ money(chart.values[b.i]) }}</text>
            </g>
        </svg>
        <p v-if="chart.lastIsPartial" class="font-mono text-caption text-subtle mb-0">{{ chart.labels[chart.labels.length - 1] }} so far</p>
    </figure>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AssistantChart } from '@/services/assistant.service'
import { money } from '@/composables/budgetFormat'

const props = defineProps<{ chart: AssistantChart }>()

const W = 340
const H = 132
const Pad = 4
const Top = 18
const Base = 110
const Gap = 6

const max = computed(() => Math.max(1, ...props.chart.values.map(v => Math.max(0, v)), props.chart.average ?? 0))
const scale = (v: number) => Math.max(0, v) / max.value * (Base - Top)

/** Bars with rounded tops that sit on the baseline */
const bars = computed(() => {
    const n = props.chart.values.length
    const slot = (W - Pad * 2) / Math.max(1, n)
    const w = Math.max(4, Math.min(28, slot - Gap))
    return props.chart.values.map((v, i) => {
        const x = Pad + slot * i + (slot - w) / 2
        const h = scale(v)
        const y = Base - h
        const r = Math.min(4, h, w / 2)
        const d = h <= 0
            ? `M${x} ${Base}H${x + w}`
            : `M${x} ${Base}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${Base}Z`
        const partial = props.chart.lastIsPartial && i === n - 1
        return { i, x, y, w, d, partial, title: `${props.chart.labels[i]}: ${money(v)}${partial ? ' so far' : ''}` }
    })
})

const avgY = computed(() => props.chart.average != null && props.chart.average > 0 ? Base - scale(props.chart.average) : null)

/** The tallest full month gets the one direct label */
const peak = computed(() => {
    const full = props.chart.values.map((v, i) => ({ v, i })).filter(x => !(props.chart.lastIsPartial && x.i === props.chart.values.length - 1))
    return full.length ? full.reduce((a, b) => b.v > a.v ? b : a).i : -1
})

const summary = computed(() => `${props.chart.title}: ` +
    props.chart.labels.map((l, i) => `${l} ${money(props.chart.values[i])}`).join(', ') +
    (props.chart.average != null ? `. Average ${money(props.chart.average)}.` : '.'))
</script>

<style scoped>
.chart {
    margin: 0;
    padding: 12px 12px 8px;
    border-radius: 12px;
    background: rgb(var(--v-theme-surface-raised));
}

.bar {
    fill: rgb(var(--v-theme-primary));
}

.bar--partial {
    fill: rgba(var(--v-theme-primary), 0.35);
    stroke: rgb(var(--v-theme-primary));
    stroke-width: 1.5;
    stroke-dasharray: 3 2;
}

.hit {
    fill: transparent;
}

.axis {
    stroke: rgb(var(--v-theme-border));
    stroke-width: 1;
}

.avg {
    stroke: rgb(var(--v-theme-muted));
    stroke-width: 1;
    stroke-dasharray: 4 3;
}

.label {
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    fill: rgb(var(--v-theme-subtle));
}

.value {
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    fill: rgb(var(--v-theme-on-surface));
}
</style>
