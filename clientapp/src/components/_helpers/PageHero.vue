<template>
    <!-- Colored header panel for feature pages, matching the gradient panels on
         the landing page so the same look carries across the site. -->
    <v-container class="page-hero-container pt-2 pb-0">
        <section class="page-hero" :class="`page-hero--${tone}`">
            <div class="page-hero-copy">
                <p v-if="eyebrow" class="font-mono text-caption text-uppercase page-hero-eyebrow mb-3">{{ eyebrow }}</p>
                <slot />
            </div>
            <div class="page-hero-art" aria-hidden="true">
                <GradientArt :variant="art" />
            </div>
        </section>
    </v-container>
</template>

<script setup lang="ts">
defineProps({
    eyebrow: { type: String, default: '' },
    tone: { type: String as () => 'teal' | 'plum' | 'navy', default: 'navy' },
    art: { type: String as () => 'ribbon' | 'arcs' | 'capitol', default: 'arcs' }
})
</script>

<style scoped>
/* Same content width as the landing page sections, so the hero lines up with the page below it. */
.page-hero-container {
    max-width: 1100px;
}

.page-hero {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    align-items: center;
    border-radius: 16px;
    overflow: hidden;
    color: #fff;
}

.page-hero--navy {
    background: linear-gradient(120deg, #07101f 0%, #0b1a33 55%, #1a1433 100%);
    border: 1px solid rgba(86, 168, 245, 0.25);
}

.page-hero--teal {
    background: linear-gradient(135deg, #04262a 0%, #03161b 55%, #07090c 100%);
    border: 1px solid rgba(42, 172, 184, 0.25);
}

.page-hero--plum {
    background: linear-gradient(115deg, #1f0719 0%, #3d0c33 50%, #5c1240 100%);
    border: 1px solid rgba(254, 40, 87, 0.25);
}

.page-hero-copy {
    position: relative;
    z-index: 1;
    padding: 2.75rem 3rem;
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
    padding: 1.5rem 2rem 0 0;
    min-height: 260px;
}

@media (max-width: 960px) {
    .page-hero {
        grid-template-columns: 1fr;
    }

    .page-hero-copy {
        padding: 2rem 1.5rem 1.5rem;
    }

    /* The copy carries the page on small screens; the art would just push it down. */
    .page-hero-art {
        display: none;
    }
}
</style>
