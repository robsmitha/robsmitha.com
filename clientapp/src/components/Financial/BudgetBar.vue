<template>
    <div class="track" role="img" :aria-label="label">
        <span v-if="projectedWidth > fillWidth" class="projected" :style="{ left: `${fillWidth}%`, width: `${projectedWidth - fillWidth}%` }" />
        <span v-if="fillWidth > 0" class="fill" :class="`bg-${color}`" :style="{ width: `${fillWidth}%` }" />
        <span v-if="tickAt !== null" class="tick" :style="{ left: `${tickAt}%` }" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { money } from '@/composables/budgetFormat'

const props = defineProps<{
    spent: number
    available: number
    color: string
    /** Where an even pace would be by today (flexible categories) */
    expected?: number | null
    /** Spent plus charges still to come this month */
    projected?: number | null
    /** For the screen-reader label: 'spent' (default) or 'saved' */
    verb?: string
}>()

const pct = (amount: number) => props.available > 0 ? Math.min(100, Math.max(0, (amount / props.available) * 100)) : (amount > 0 ? 100 : 0)

const fillWidth = computed(() => pct(props.spent))
const projectedWidth = computed(() => props.projected ? pct(props.projected) : 0)
const tickAt = computed(() => props.expected != null && props.available > 0 ? pct(props.expected) : null)

const label = computed(() => {
    const parts = [`${money(props.spent)} of ${money(props.available)} ${props.verb ?? 'spent'}`]
    if (props.expected != null) parts.push(`even pace would be ${money(props.expected)} by today`)
    return parts.join('; ')
})
</script>

<style scoped>
.track {
    position: relative;
    height: 8px;
    border-radius: 999px;
    background: rgb(var(--v-theme-border));
}

.fill {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 999px;
}

/* Charges still to come, drawn as stripes so the bar doesn't rely on color alone */
.projected {
    position: absolute;
    top: 0;
    bottom: 0;
    background: repeating-linear-gradient(135deg, rgba(var(--v-theme-warning), 0.55) 0 3px, transparent 3px 6px);
}

.tick {
    position: absolute;
    top: -2px;
    bottom: -2px;
    width: 2px;
    margin-left: -1px;
    border-radius: 1px;
    background: rgb(var(--v-theme-subtle));
    box-shadow: 0 0 0 1px rgb(var(--v-theme-surface));
}
</style>
