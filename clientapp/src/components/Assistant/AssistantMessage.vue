<template>
    <div class="d-flex flex-column ga-3">
        <!-- Text only: **bold** is the one formatting allowed, and nothing is rendered as HTML -->
        <p class="text-body-2 answer mb-0">
            <template v-for="(part, i) in parts" :key="i"><strong v-if="part.bold">{{ part.text }}</strong><template v-else>{{ part.text }}</template></template>
        </p>

        <div v-if="reply.highlights.length" class="highlights" :style="{ '--n': reply.highlights.length }">
            <div v-for="h in reply.highlights" :key="h.label" class="highlight px-3 py-2">
                <div class="font-mono text-caption text-subtle text-truncate">{{ h.label }}</div>
                <div class="font-mono text-subtitle-2 font-weight-bold text-high-emphasis text-truncate">{{ h.value }}</div>
            </div>
        </div>

        <AssistantChart v-if="reply.chart" :chart="reply.chart" />

        <details v-if="reply.steps.length" class="text-caption text-subtle how">
            <summary>How I got this</summary>
            <ul class="mt-1 mb-0">
                <li v-for="s in reply.steps" :key="s">{{ s }}</li>
            </ul>
        </details>

        <div v-if="reply.links.length" class="d-flex flex-column align-start">
            <router-link v-for="l in reply.links" :key="l.to" :to="l.to" class="link text-body-2 font-weight-bold d-inline-flex align-center ga-1" @click="$emit('navigate')">
                {{ l.label }}<v-icon size="14">mdi-arrow-right</v-icon>
            </router-link>
        </div>

        <div v-if="last && reply.followUps.length" class="d-flex flex-wrap ga-2">
            <v-btn
                v-for="f in reply.followUps" :key="f" size="small" variant="outlined" rounded="pill" class="text-none follow"
                :disabled="disabled" @click="$emit('ask', f)"
            >{{ f }}</v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AssistantReply } from '@/services/assistant.service'

const props = defineProps<{ reply: AssistantReply, last: boolean, disabled: boolean }>()
defineEmits<{ ask: [question: string], navigate: [] }>()

const parts = computed(() => props.reply.answer.split(/\*\*(.+?)\*\*/g).map((text, i) => ({ text, bold: i % 2 === 1 })).filter(p => p.text))
</script>

<style scoped>
.answer {
    line-height: 1.55;
    color: rgb(var(--v-theme-on-surface));
}

.highlights {
    display: grid;
    grid-template-columns: repeat(var(--n), minmax(0, 1fr));
    gap: 8px;
}

.highlight {
    border-radius: 10px;
    background: rgb(var(--v-theme-surface-raised));
    min-width: 0;
}

.how summary {
    cursor: pointer;
    min-height: 28px;
    display: flex;
    align-items: center;
}

.how ul {
    padding-left: 18px;
    line-height: 1.6;
}

.link {
    min-height: 32px;
    text-decoration: none;
    color: rgb(var(--v-theme-primary));
}

.link:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
}

.follow {
    border-color: rgb(var(--v-theme-border));
    color: rgb(var(--v-theme-on-surface));
    letter-spacing: normal;
}
</style>
