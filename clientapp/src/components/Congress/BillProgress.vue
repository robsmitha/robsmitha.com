<template>
    <ol class="bill-progress" :aria-label="`Progress: ${steps[currentIndex]?.label}`">
        <li
            v-for="(s, i) in steps"
            :key="s.label"
            class="step"
            :class="{
                'step--done': i < currentIndex || (i === currentIndex && isComplete),
                'step--current': i === currentIndex && !isComplete,
                'step--failed': s.failed
            }"
        >
            <span class="step-node">
                <v-icon v-if="s.failed" size="14">mdi-close</v-icon>
                <v-icon v-else-if="i <= currentIndex" size="14">mdi-check</v-icon>
            </span>
            <span class="step-label font-weight-bold">{{ s.label }}</span>
            <span class="step-date font-mono text-caption">{{ s.date ? moment(s.date).format('MMM D, YYYY') : '' }}</span>
        </li>
    </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import moment from 'moment'

const props = defineProps({
    billType: { type: String, required: true },
    originChamber: { type: String, required: true },
    actions: { type: Array as () => any[], default: () => [] },
    introducedDate: { type: [String, Date], default: undefined },
    becameLaw: { type: Boolean, default: false }
})

type Step = { label: string, date?: Date | string, reached: boolean, failed?: boolean }

// Earliest action that matches, since actions arrive newest first.
function firstMatch(test: (a: any) => boolean) {
    const matches = props.actions.filter(test)
    return matches.length ? matches[matches.length - 1] : undefined
}

const text = (a: any) => a.text ?? ''
const passedIn = (chamber: string) => (a: any) =>
    new RegExp(`passed(/agreed to)? in ${chamber}|passed ${chamber}`, 'i').test(text(a))

const steps = computed<Step[]>(() => {
    const type = props.billType.toUpperCase()
    const origin = props.originChamber === 'Senate' ? 'Senate' : 'House'
    const other = origin === 'House' ? 'Senate' : 'House'

    const committee = firstMatch(a => a.type === 'Committee' || /referred to (the )?(house |senate )?committee|committee on/i.test(text(a)))
    const result: Step[] = [
        { label: 'Introduced', date: props.introducedDate, reached: true },
        { label: 'In committee', date: committee?.actionDate, reached: !!committee },
    ]

    // Simple resolutions only need one chamber and never go to the President.
    if (type === 'HRES' || type === 'SRES') {
        const agreed = firstMatch(a => /agreed to|passed/i.test(text(a)) && a.type !== 'Committee')
        result.push({ label: `Agreed to in ${origin}`, date: agreed?.actionDate, reached: !!agreed })
        return result
    }

    const passedOrigin = firstMatch(passedIn(origin))
    const passedOther = firstMatch(passedIn(other))
    result.push({ label: `Passed ${origin}`, date: passedOrigin?.actionDate, reached: !!passedOrigin })
    result.push({ label: `Passed ${other}`, date: passedOther?.actionDate, reached: !!passedOther })

    // Concurrent resolutions stop once both chambers agree.
    if (type === 'HCONRES' || type === 'SCONRES') return result

    const president = firstMatch(a => a.type === 'President' || /presented to (the )?president/i.test(text(a)))
    const vetoed = firstMatch(a => /vetoed/i.test(text(a)))
    const law = firstMatch(a => a.type === 'BecameLaw' || /became public law|signed by (the )?president/i.test(text(a)))
    result.push({ label: 'To President', date: president?.actionDate, reached: !!president })
    result.push(vetoed && !law
        ? { label: 'Vetoed', date: vetoed.actionDate, reached: true, failed: true }
        : { label: 'Became law', date: law?.actionDate, reached: !!law || props.becameLaw })
    return result
})

// The final step being reached (e.g. became law) means there's nothing in progress.
const isComplete = computed(() => {
    const last = steps.value[steps.value.length - 1]
    return !!last?.reached && !last.failed
})

// The furthest step reached; every step before it must have happened too.
const currentIndex = computed(() => {
    let index = 0
    steps.value.forEach((s, i) => { if (s.reached) index = i })
    return index
})
</script>

<style scoped>
.bill-progress {
    --node: 26px;
    list-style: none;
    padding: 0;
    display: grid;
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
}

.step {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding-right: 0.75rem;
    color: rgb(var(--v-theme-slate));
}

/* Connector from this node to the next. */
.step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: calc(var(--node) / 2);
    left: calc(var(--node) + 6px);
    right: 6px;
    height: 2px;
    border-radius: 2px;
    background: rgb(var(--v-theme-lightest-navy));
}

.step--done:not(:last-child)::after {
    background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.5));
}

.step-node {
    width: var(--node);
    height: var(--node);
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgb(var(--v-theme-lightest-navy));
    background: rgb(var(--v-theme-background));
    margin-bottom: 0.4rem;
}

.step--done .step-node {
    border-color: rgb(var(--v-theme-primary));
    background: rgb(var(--v-theme-primary));
    color: rgb(var(--v-theme-on-primary));
}

.step--current .step-node {
    border-color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.2);
    color: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 5px rgba(var(--v-theme-primary), 0.15);
}

.step--failed .step-node {
    border-color: rgb(var(--v-theme-error));
    background: rgba(var(--v-theme-error), 0.2);
    color: rgb(var(--v-theme-error));
    box-shadow: 0 0 0 5px rgba(var(--v-theme-error), 0.15);
}

.step--done .step-label,
.step--current .step-label {
    color: rgb(var(--v-theme-lightest-slate));
}

.step-label {
    font-size: 0.875rem;
    line-height: 1.3;
}

.step-date {
    min-height: 1.25rem;
}

/* On narrow screens the steps stack into a vertical list. */
@media (max-width: 700px) {
    .bill-progress {
        grid-auto-flow: row;
        gap: 1.1rem;
    }

    .step {
        display: grid;
        grid-template-columns: var(--node) 1fr;
        column-gap: 0.9rem;
        row-gap: 0;
        padding-right: 0;
    }

    .step-node {
        grid-row: span 2;
        margin-bottom: 0;
    }

    .step:not(:last-child)::after {
        top: calc(var(--node) + 4px);
        bottom: calc(-1.1rem + 4px);
        left: calc(var(--node) / 2 - 1px);
        right: auto;
        width: 2px;
        height: auto;
    }

    .step--done:not(:last-child)::after {
        background: rgb(var(--v-theme-primary));
    }
}
</style>
