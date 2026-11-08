<template>
    <!-- Swiss page header for feature pages: sits on the page background, with the eyebrow in mono, the page's own
         content (title, text, stats, buttons) in the slot, and a strong rule underneath. Text and controls in the slot
         use the hero-ink theme color, which is the page's ink in both themes. -->
    <section class="page-hero" :class="{ 'page-hero--compact': compact }">
        <v-container class="page-hero-inner">
            <div class="page-hero-copy">
                <p v-if="eyebrow" class="font-mono page-hero-eyebrow text-primary mb-4">{{ eyebrowText }}</p>
                <slot />
            </div>
        </v-container>
    </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
    eyebrow: { type: String, default: '' },
    // Kept so existing pages don't need changing; the Swiss header has a single look and no artwork.
    tone: { type: String as () => 'teal' | 'plum' | 'navy', default: 'navy' },
    art: { type: String as () => 'ribbon' | 'arcs' | 'capitol' | 'editor', default: 'arcs' },
    // A shorter header for admin and utility pages.
    compact: { type: Boolean, default: false }
})

// Older eyebrows start with a terminal-style "> "; the Swiss header drops it.
const eyebrowText = computed(() => props.eyebrow.replace(/^>\s*/, ''))
</script>

<style scoped>
.page-hero {
    color: rgb(var(--v-theme-hero-ink));
    background: rgb(var(--v-theme-background));
    border-bottom: 1px solid rgb(var(--v-theme-rule));
}

/* Content keeps the same 1100px column as the page below so the text lines up with everything under it. */
.page-hero-inner {
    max-width: 1100px;
}

.page-hero-copy {
    padding: 2.5rem 0 3.5rem;
}

.page-hero-eyebrow {
    font-size: 0.8125rem;
}

.page-hero--compact .page-hero-copy {
    padding: 1.5rem 0 2rem;
}

/* Every page styles its own .hero-title; the header gives them all the Swiss display face. */
.page-hero .page-hero-copy :deep(.hero-title) {
    font-family: var(--font-display);
    font-weight: 800 !important;
    letter-spacing: -0.045em;
}
</style>
