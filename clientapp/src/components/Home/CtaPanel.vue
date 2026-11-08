<template>
    <!-- A solid inverse block (black in light mode) with a big headline, like the Swiss mockups' contact section.
         Buttons go in the default slot; white flat/outlined buttons read well on it. -->
    <section class="cta-panel">
        <p v-if="eyebrow" class="cta-eyebrow font-mono mb-4">{{ eyebrow }}</p>
        <h2 class="cta-title font-display mb-6">{{ titleParts.text }}<span class="cta-dot">{{ titleParts.end }}</span></h2>
        <div class="cta-row">
            <p class="cta-text">{{ text }}</p>
            <div class="cta-actions">
                <slot />
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
    eyebrow: { type: String, default: '' },
    // Kept so existing pages don't need changing; the Swiss panel has a single look.
    tone: { type: String as () => 'teal' | 'plum', default: 'plum' },
    art: { type: String as () => 'ribbon' | 'arcs' | 'capitol' | 'editor', default: 'arcs' }
})

// The title's closing punctuation is drawn in the accent color, Swiss style.
const titleParts = computed(() => {
    const match = props.title.match(/^(.*?)([.!?])$/s)
    return match ? { text: match[1], end: match[2] } : { text: props.title, end: '' }
})
</script>

<style scoped>
.cta-panel {
    padding: 4.5rem 3rem 3.5rem;
    background: rgb(var(--v-theme-inverse));
    color: rgb(var(--v-theme-inverse-ink));
}

.cta-eyebrow {
    font-size: 0.8125rem;
    color: rgb(var(--v-theme-inverse-accent));
}

.cta-title {
    margin: 0;
    font-size: clamp(2.5rem, 5vw + 1rem, 5.5rem);
    line-height: 0.95;
    letter-spacing: -0.05em;
    font-weight: 800;
    text-wrap: balance;
}

.cta-dot {
    color: rgb(var(--v-theme-inverse-accent));
}

.cta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
}

.cta-text {
    margin: 0;
    max-width: 36rem;
    font-size: 1.125rem;
    line-height: 1.6;
    color: rgb(var(--v-theme-inverse-muted));
}

.cta-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

@media (max-width: 600px) {
    .cta-panel {
        padding: 3rem 1.25rem 2.5rem;
    }
}
</style>
