<template>
    <!-- Full-width colored header band for feature pages, using the same
         gradients as the landing page panels so the look carries across the site. -->
    <section class="page-hero" :class="[`page-hero--${tone}`, { 'page-hero--compact': compact }]">
        <v-container class="page-hero-inner">
            <div class="page-hero-copy">
                <p v-if="eyebrow" class="font-mono text-caption text-uppercase page-hero-eyebrow mb-3">{{ eyebrow }}</p>
                <slot />
            </div>
            <div class="page-hero-art" aria-hidden="true">
                <GradientArt :variant="art" />
            </div>
        </v-container>
    </section>
</template>

<script setup lang="ts">
defineProps({
    eyebrow: { type: String, default: '' },
    tone: { type: String as () => 'teal' | 'plum' | 'navy', default: 'navy' },
    art: { type: String as () => 'ribbon' | 'arcs' | 'capitol' | 'editor', default: 'arcs' },
    // A shorter band for admin and utility pages.
    compact: { type: Boolean, default: false }
})
</script>

<style scoped>
.page-hero {
    color: #fff;
}

.page-hero--navy {
    background: linear-gradient(120deg, #07101f 0%, #0b1a33 55%, #1a1433 100%);
}

.page-hero--teal {
    background: linear-gradient(135deg, #04262a 0%, #03161b 55%, #07090c 100%);
}

.page-hero--plum {
    background: linear-gradient(115deg, #1f0719 0%, #3d0c33 50%, #5c1240 100%);
}

/* The band runs edge to edge, but its content keeps the same 1100px column as
   the page below so the text lines up with everything under it. */
.page-hero-inner {
    max-width: 1100px;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    align-items: center;
}

.page-hero-copy {
    position: relative;
    z-index: 1;
    padding: 3.5rem 2rem 3.5rem 0;
}

.page-hero-eyebrow {
    letter-spacing: 0.08em;
    opacity: 0.75;
}

.page-hero-art {
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem 0;
    min-height: 280px;
}

.page-hero--compact .page-hero-inner {
    grid-template-columns: minmax(0, 1fr) 300px;
    padding-top: 0;
    padding-bottom: 0;
}

.page-hero--compact .page-hero-copy {
    padding: 2rem 2rem 2rem 0;
}

/* In the short band the art fills the row height and sits flush with the bottom edge. */
.page-hero--compact .page-hero-art {
    min-height: 0;
    padding: 0;
    overflow: hidden;
}

@media (max-width: 960px) {
    .page-hero-inner,
    .page-hero--compact .page-hero-inner {
        grid-template-columns: 1fr;
    }

    .page-hero-copy,
    .page-hero--compact .page-hero-copy {
        padding: 2rem 0;
    }

    /* The copy carries the page on small screens; the art would just push it down. */
    .page-hero-art {
        display: none;
    }
}
</style>
