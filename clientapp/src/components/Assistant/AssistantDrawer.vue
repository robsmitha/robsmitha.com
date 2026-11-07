<template>
    <v-navigation-drawer
        v-if="store.available || store.messages.length"
        :model-value="store.open"
        location="right"
        temporary
        :width="smAndDown ? width : 420"
        color="surface"
        class="assistant"
        aria-label="Budget assistant"
        @update:model-value="v => store.toggle(v)"
    >
        <div class="d-flex flex-column fill">
            <header class="d-flex align-center ga-3 pl-5 pr-2 py-3 head">
                <span class="badge" aria-hidden="true"><v-icon size="18">mdi-star-four-points-outline</v-icon></span>
                <div class="flex-grow-1 min-width-0">
                    <h2 class="text-subtitle-2 font-weight-bold text-high-emphasis mb-0">Assistant</h2>
                    <p v-if="store.usage" class="font-mono text-caption mb-0" :class="store.outOfQuestions ? 'text-warning' : 'text-subtle'">
                        {{ store.usage.remainingToday }} of {{ store.usage.dailyLimit }} questions left today
                    </p>
                </div>
                <v-btn v-if="store.messages.length" icon="mdi-square-edit-outline" variant="text" aria-label="New conversation" :disabled="store.sending || !!store.busyActionId" @click="store.newConversation()" />
                <v-btn icon="mdi-close" variant="text" aria-label="Close assistant" @click="store.toggle(false)" />
            </header>

            <div ref="scroller" class="flex-grow-1 body px-5 py-5">
                <template v-if="!store.messages.length">
                    <h3 class="text-h6 font-weight-bold text-high-emphasis mb-1">Ask about your money</h3>
                    <p class="text-body-2 text-muted mb-6">
                        Plain questions about your spending, budget, bills, goals and debt. Answers come from your linked accounts, with links to the transactions behind them.
                    </p>
                    <section v-for="g in suggestions" :key="g.title" class="mb-5">
                        <h4 class="group-label mb-2">{{ g.title }}</h4>
                        <div class="d-flex flex-column ga-2">
                            <button v-for="q in g.questions" :key="q" type="button" class="suggestion text-body-2" :disabled="store.outOfQuestions" @click="send(q)">{{ q }}</button>
                        </div>
                    </section>
                </template>

                <div v-else class="d-flex flex-column ga-5" aria-live="polite">
                    <template v-for="(m, i) in store.messages" :key="m.id">
                        <div v-if="m.role === 'user'" class="question text-body-2">{{ m.text }}</div>
                        <AssistantMessage
                            v-else-if="m.role === 'assistant'"
                            :reply="m.reply"
                            :last="i === store.messages.length - 1"
                            :disabled="store.sending || store.outOfQuestions"
                            @ask="send"
                            @navigate="onNavigate"
                        />
                        <div v-else class="notice d-flex ga-3 pa-4" :class="`notice--${m.kind}`" role="alert">
                            <v-icon size="20" :color="m.kind === 'limit' ? 'warning' : undefined" class="flex-shrink-0">
                                {{ m.kind === 'limit' ? 'mdi-clock-outline' : 'mdi-alert-circle-outline' }}
                            </v-icon>
                            <span class="text-body-2">{{ m.text }}</span>
                        </div>
                    </template>

                    <div v-if="store.sending" role="status" class="working pa-4">
                        <div class="d-flex align-center ga-3 text-body-2 text-high-emphasis">
                            <span class="dots" aria-hidden="true"><span /><span /><span /></span>
                            Looking through your accounts
                        </div>
                        <p class="text-caption text-subtle mt-1 mb-0">Usually 5 to 15 seconds</p>
                    </div>
                </div>
            </div>

            <form class="composer px-4 pt-3 pb-4" @submit.prevent="send(draft)">
                <div class="field d-flex align-end ga-2 pl-4 pr-1 py-1">
                    <label for="assistant-question" class="sr-only">Ask about your money</label>
                    <textarea
                        id="assistant-question"
                        ref="input"
                        v-model="draft"
                        rows="1"
                        maxlength="500"
                        class="flex-grow-1 text-body-2"
                        :placeholder="store.outOfQuestions ? 'Back after midnight' : store.messages.length ? 'Ask a follow-up' : 'Ask about your spending, budget or goals'"
                        :disabled="store.outOfQuestions"
                        @keydown.enter.exact.prevent="send(draft)"
                        @input="grow"
                    />
                    <v-btn
                        type="submit" icon="mdi-arrow-up" color="primary" variant="flat" rounded="lg" size="small" class="send"
                        aria-label="Send" :disabled="!draft.trim() || store.sending || store.outOfQuestions"
                    />
                </div>
                <p class="text-caption text-subtle text-center mt-2 mb-0">Reads only your linked accounts. Changes happen only when you confirm them. Not financial advice.</p>
            </form>
        </div>

        <!-- What a confirm or undo did, like the pages' own snackbars -->
        <v-snackbar :model-value="!!store.snack" location="top" :timeout="3500" rounded="lg" role="status" @update:model-value="v => { if (!v) store.snack = null }">
            <span class="d-flex align-center ga-2"><v-icon color="success" size="18">mdi-check-circle</v-icon>{{ store.snack }}</span>
        </v-snackbar>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAssistantStore } from '@/store/assistant'
import { useAuthStore } from '@/store/auth'

const store = useAssistantStore()
const auth = useAuthStore()
const route = useRoute()
const { smAndDown, width } = useDisplay()

const draft = ref('')
const scroller = ref<HTMLElement | null>(null)
const input = ref<HTMLTextAreaElement | null>(null)

const suggestions = [
    { title: 'Spending', questions: ['How much have I spent at Starbucks total?', 'Is my grocery spending pretty steady?', 'Where did my money go last month?'] },
    { title: 'Budget', questions: ['Am I on track this month?', 'How much can I still spend on restaurants?'] },
    { title: 'Bills, goals and debt', questions: ['Did any of my subscriptions go up?', 'Am I on track for my goals?', 'When will my debt be paid off?'] },
]

// Whether the person can use it (signed in, with budget access, and switched on)
watch(() => auth.signedIn, signedIn => { if (signedIn) store.fetchUsage() }, { immediate: true })

/** Pages that tell the assistant what you were looking at */
const Pages = ['dashboard', 'budget', 'transactions', 'goals', 'debt']

function pageContext () {
    const page = route.path.split('/')[1] ?? ''
    const month = typeof route.query.month === 'string' && /^\d{4}-\d{2}$/.test(route.query.month) ? route.query.month : null
    return Pages.includes(page) ? { page, month } : { page: null, month: null }
}

async function send (question: string) {
    const text = question.trim()
    if (!text || store.sending || store.outOfQuestions) return
    draft.value = ''
    grow()
    const { page, month } = pageContext()
    await store.ask(text, page, month)
}

/** Links close the drawer on a phone, where it covers the page */
function onNavigate () {
    if (smAndDown.value) store.toggle(false)
}

function grow () {
    nextTick(() => {
        const el = input.value
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 120)}px`
    })
}

// Keep the newest message in view, and put the cursor in the box when the drawer opens
watch(() => [store.messages.length, store.sending], () => nextTick(() => {
    scroller.value?.scrollTo({ top: scroller.value.scrollHeight, behavior: 'smooth' })
}))
watch(() => store.open, open => { if (open) nextTick(() => input.value?.focus()) })
</script>

<style scoped>
.assistant :deep(.v-navigation-drawer__content) {
    overflow: hidden;
}

.fill {
    height: 100%;
}

.head {
    border-bottom: 1px solid rgb(var(--v-theme-border));
}

.badge {
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    flex: none;
    border-radius: 10px;
    color: rgb(var(--v-theme-primary));
    background: rgba(var(--v-theme-primary), 0.14);
}

.min-width-0 {
    min-width: 0;
}

.body {
    overflow-y: auto;
    min-height: 0;
}

.group-label {
    font-family: var(--font-mono, monospace);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgb(var(--v-theme-subtle));
}

.suggestion {
    text-align: left;
    min-height: 44px;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface-raised));
    color: rgb(var(--v-theme-on-surface));
    cursor: pointer;
}

.suggestion:hover:not(:disabled),
.suggestion:focus-visible {
    border-color: rgb(var(--v-theme-primary));
    outline: none;
}

.suggestion:disabled {
    opacity: 0.5;
    cursor: default;
}

.question {
    align-self: flex-end;
    max-width: 85%;
    padding: 10px 14px;
    border-radius: 14px 14px 4px 14px;
    line-height: 1.45;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    color: rgb(var(--v-theme-on-surface-variant));
    background: rgb(var(--v-theme-surface-variant));
}

.notice {
    border-radius: 12px;
    background: rgb(var(--v-theme-surface-raised));
}

.notice--limit {
    background: rgba(var(--v-theme-warning), 0.1);
    border: 1px solid rgba(var(--v-theme-warning), 0.35);
}

.working {
    border-radius: 12px;
    background: rgb(var(--v-theme-surface-raised));
}

.dots {
    display: inline-flex;
    gap: 4px;
}

.dots span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgb(var(--v-theme-primary));
    animation: pulse 1.2s ease-in-out infinite;
}

.dots span:nth-child(2) {
    animation-delay: 0.2s;
}

.dots span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes pulse {
    0%, 100% { opacity: 0.25; }
    50% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
    .dots span {
        animation: none;
        opacity: 0.7;
    }
}

.composer {
    border-top: 1px solid rgb(var(--v-theme-border));
}

.field {
    border-radius: 14px;
    border: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface-raised));
}

.field:focus-within {
    border-color: rgb(var(--v-theme-primary));
}

.field textarea {
    resize: none;
    border: 0;
    outline: none;
    background: transparent;
    color: rgb(var(--v-theme-on-surface));
    padding: 9px 0;
    line-height: 1.4;
    max-height: 120px;
}

.field textarea::placeholder {
    color: rgb(var(--v-theme-subtle));
}

.send {
    margin-bottom: 2px;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}
</style>
