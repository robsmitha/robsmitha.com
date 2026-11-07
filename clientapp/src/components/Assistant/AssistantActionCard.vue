<template>
    <!-- Waiting for Confirm -->
    <section
        v-if="action.status === 'proposed'"
        class="card d-flex flex-column"
        :class="action.destructive ? 'card--danger' : 'card--proposed'"
        aria-label="Proposed change"
    >
        <div class="d-flex align-start ga-3 px-4 pt-4 pb-3">
            <span class="icon icon--proposed" aria-hidden="true"><v-icon size="16">{{ icon }}</v-icon></span>
            <div class="min-width-0">
                <h3 class="text-body-2 font-weight-bold text-high-emphasis title mb-0">{{ action.title }}</h3>
                <p v-if="action.subtitle" class="font-mono text-caption text-subtle mt-1 mb-0">{{ action.subtitle }}</p>
            </div>
        </div>

        <ul v-if="action.rows.length" class="rows px-4 mb-0">
            <li v-for="(r, i) in action.rows" :key="i" class="row text-caption">
                <span class="font-mono text-subtle">{{ shortDate(r.date) }}</span>
                <span class="text-truncate">
                    <span class="text-high-emphasis">{{ r.merchant }}</span>
                    <span class="text-subtle"> · {{ r.from }} → </span>
                    <span class="to">{{ r.to }}</span>
                </span>
                <span class="font-mono text-high-emphasis">{{ money(r.amount) }}</span>
            </li>
            <li v-if="action.moreRows > 0" class="row row--more text-caption text-subtle">and {{ action.moreRows }} more</li>
        </ul>

        <div v-if="action.changes.length" class="d-flex flex-column ga-2 px-4">
            <div v-for="c in action.changes" :key="c.label" class="change">
                <div class="box">
                    <div class="font-mono text-caption text-subtle">{{ c.label }} now</div>
                    <div class="font-mono text-body-2 font-weight-bold text-high-emphasis">{{ c.before }}</div>
                </div>
                <v-icon size="18" class="text-subtle" aria-label="becomes">mdi-arrow-right</v-icon>
                <div class="box box--after">
                    <div class="font-mono text-caption text-subtle">After</div>
                    <div class="font-mono text-body-2 font-weight-bold to">{{ c.after }}</div>
                </div>
            </div>
        </div>

        <ul v-if="action.facts.length" class="facts px-4 mb-0 text-body-2">
            <li v-for="f in action.facts" :key="f.label" class="d-flex justify-space-between ga-3">
                <span class="text-muted">{{ f.label }}</span>
                <span class="font-mono text-high-emphasis">{{ f.value }}</span>
            </li>
        </ul>

        <div
            v-for="w in action.warnings" :key="w"
            class="warning d-flex align-start ga-2 mx-4 mt-3 px-3 py-2 text-caption"
            :class="{ 'warning--danger': action.destructive }"
        >
            <v-icon size="14" class="mt-px flex-shrink-0" :color="action.destructive ? 'error' : 'warning'">mdi-alert-outline</v-icon>
            <span>{{ w }}</span>
        </div>

        <label v-if="action.ruleOffer && action.canConfirm" class="rule d-flex align-center ga-3 px-4 pt-3 text-body-2">
            <input v-model="withRule" type="checkbox" :disabled="busy">
            <span>{{ action.ruleOffer.label }}</span>
        </label>

        <div v-if="action.canConfirm" class="d-flex ga-2 px-4 pt-3 pb-4">
            <v-btn
                class="flex-grow-1 text-none confirm"
                :color="action.destructive ? 'error' : 'primary'"
                :variant="action.destructive ? 'outlined' : 'flat'"
                :loading="busy && verb === 'confirm'"
                :disabled="busy"
                height="44"
                @click="run('confirm')"
            >{{ action.confirmLabel }}</v-btn>
            <v-btn class="text-none cancel" variant="outlined" height="44" :disabled="busy" :loading="busy && verb === 'cancel'" @click="run('cancel')">Cancel</v-btn>
        </div>
        <div v-else class="d-flex flex-column ga-2 px-4 pt-3 pb-4">
            <v-btn class="text-none" variant="tonal" height="44" disabled>View only</v-btn>
            <p class="text-caption text-subtle mb-0">You can view this but not change it. Ask the account owner.</p>
        </div>
    </section>

    <!-- Done, with Undo -->
    <section v-else-if="action.status === 'confirmed'" class="card card--done d-flex flex-column ga-3 pa-4" aria-label="Change made">
        <div class="d-flex align-start ga-3">
            <span class="icon icon--done" aria-hidden="true"><v-icon size="16">mdi-check</v-icon></span>
            <div class="min-width-0">
                <h3 class="text-body-2 font-weight-bold text-high-emphasis title mb-0">Done: {{ action.result }}</h3>
                <p v-if="!action.canUndo && action.destructive" class="text-caption text-subtle mt-1 mb-0">This one can’t be undone.</p>
            </div>
        </div>
        <div class="d-flex align-center justify-space-between flex-wrap ga-2">
            <router-link v-if="action.link" :to="action.link.to" class="link text-body-2 font-weight-bold d-inline-flex align-center ga-1" @click="$emit('navigate')">
                {{ action.link.label }}<v-icon size="14">mdi-arrow-right</v-icon>
            </router-link>
            <v-btn
                v-if="action.canUndo" size="small" variant="outlined" rounded="pill" class="text-none undo" prepend-icon="mdi-undo"
                :loading="busy" :disabled="busy" @click="run('undo')"
            >Undo</v-btn>
        </div>
        <p v-if="action.canUndo && action.undoUntil" class="font-mono text-caption text-subtle mb-0">Undo available until {{ until(action.undoUntil) }}</p>
    </section>

    <!-- Undone, cancelled, expired, failed -->
    <section v-else class="card card--quiet d-flex align-start ga-3 pa-4" aria-label="Change not made">
        <v-icon size="18" class="text-subtle flex-shrink-0">{{ action.status === 'undone' ? 'mdi-undo' : 'mdi-close-circle-outline' }}</v-icon>
        <div class="min-width-0 text-body-2">
            <p class="text-high-emphasis mb-0">{{ action.title }}</p>
            <p class="text-caption text-subtle mt-1 mb-0">{{ quiet }}</p>
        </div>
    </section>

    <p v-if="note" class="text-caption mb-0 note" :class="note.kind === 'error' ? 'text-error' : 'text-warning'" role="status">{{ note.text }}</p>
    <p v-else-if="action.status === 'proposed' && action.canConfirm" class="font-mono text-caption text-subtle mb-0">
        Nothing changes until you confirm. This offer expires in 15 minutes.
    </p>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AssistantAction } from '@/services/assistant.service'
import type { ActionNote } from '@/store/assistant'

const props = defineProps<{ action: AssistantAction, busy: boolean, note: ActionNote | null }>()
const emit = defineEmits<{ confirm: [includeRule: boolean | null], cancel: [], undo: [], navigate: [] }>()

const withRule = ref(props.action.ruleOffer?.ticked ?? false)
watch(() => props.action.ruleOffer?.ticked, t => { withRule.value = t ?? false })

const verb = ref<'confirm' | 'cancel' | 'undo' | null>(null)

function run (v: 'confirm' | 'cancel' | 'undo') {
    verb.value = v
    if (v === 'confirm') emit('confirm', props.action.ruleOffer ? withRule.value : null)
    else if (v === 'cancel') emit('cancel')
    else emit('undo')
}

const icon = computed(() => ({
    Recategorize: 'mdi-tag-outline',
    SetTreatment: 'mdi-swap-horizontal',
    Rule: 'mdi-auto-fix',
    Target: 'mdi-target',
    Category: 'mdi-shape-outline',
}[props.action.kind] ?? 'mdi-pencil-outline'))

const quiet = computed(() => {
    switch (props.action.status) {
        case 'undone': return props.action.result ?? 'Undone.'
        case 'cancelled': return 'Cancelled. Nothing was changed.'
        case 'failed': return 'That couldn’t be made, so nothing was changed.'
        default: return 'This change has expired. Ask again to see it fresh.'
    }
})

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const money = (n: number) => currency.format(n)

function shortDate (iso: string) {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** "today, 3:42 PM" or "tomorrow, 3:42 PM" */
function until (iso: string) {
    const at = new Date(iso)
    const time = at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const today = new Date()
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    if (at.toDateString() === today.toDateString()) return `today, ${time}`
    if (at.toDateString() === tomorrow.toDateString()) return `tomorrow, ${time}`
    return `${at.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${time}`
}
</script>

<style scoped>
.card {
    border-radius: 14px;
    background: rgb(var(--v-theme-surface-raised));
    border: 1px solid rgb(var(--v-theme-border));
    overflow: hidden;
}

.card--proposed {
    border-color: rgba(var(--v-theme-primary), 0.45);
}

.card--danger {
    border-color: rgba(var(--v-theme-error), 0.45);
}

.card--done {
    border-color: rgba(var(--v-theme-success), 0.4);
}

.min-width-0 {
    min-width: 0;
}

.title {
    line-height: 1.35;
}

.icon {
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    flex: none;
    border-radius: 8px;
}

.icon--proposed {
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.14);
}

.icon--done {
    border-radius: 50%;
    color: rgb(var(--v-theme-success));
    background: rgba(var(--v-theme-success), 0.14);
}

.rows {
    list-style: none;
    padding: 0;
}

.row {
    display: grid;
    grid-template-columns: 46px minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
    padding: 7px 0;
    border-top: 1px solid rgb(var(--v-theme-border));
}

.row--more {
    display: block;
}

.to {
    color: rgb(var(--v-theme-primary));
}

.change {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 8px;
    align-items: center;
}

.box {
    border-radius: 10px;
    padding: 8px 12px;
    background: rgb(var(--v-theme-surface));
    min-width: 0;
}

.box--after {
    background: rgba(var(--v-theme-primary), 0.1);
}

.facts {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.warning {
    border-radius: 8px;
    line-height: 1.45;
    background: rgba(var(--v-theme-warning), 0.1);
}

.warning--danger {
    background: rgba(var(--v-theme-error), 0.1);
}

.mt-px {
    margin-top: 2px;
}

.rule {
    min-height: 44px;
    cursor: pointer;
}

.rule input {
    width: 18px;
    height: 18px;
    margin: 0;
    flex: none;
    accent-color: rgb(var(--v-theme-primary));
}

.confirm,
.cancel,
.undo {
    letter-spacing: normal;
}

.cancel,
.undo {
    border-color: rgb(var(--v-theme-border));
    color: rgb(var(--v-theme-on-surface));
}

.link {
    min-height: 36px;
    text-decoration: none;
    color: rgb(var(--v-theme-primary));
}

.link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
}

.note {
    line-height: 1.45;
}
</style>
