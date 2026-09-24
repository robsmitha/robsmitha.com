<template>
    <section class="cta-panel" :class="`cta-panel--${tone}`">
        <div class="cta-copy">
            <p v-if="eyebrow" class="font-mono text-caption text-uppercase cta-eyebrow mb-3">{{ eyebrow }}</p>
            <h2 class="cta-title font-weight-bold mb-4">{{ title }}</h2>
            <p class="cta-text mb-8">{{ text }}</p>
            <div class="d-flex flex-wrap ga-3">
                <slot />
            </div>
        </div>
        <div class="cta-art" :class="`cta-art--${art}`">
            <GradientArt :variant="art" />
        </div>
    </section>
</template>

<script setup lang="ts">
defineProps({
    title: { type: String, required: true },
    text: { type: String, required: true },
    eyebrow: { type: String, default: '' },
    tone: { type: String as () => 'teal' | 'plum', default: 'plum' },
    art: { type: String as () => 'ribbon' | 'arcs' | 'capitol' | 'editor', default: 'arcs' }
})
</script>

<style scoped>
.cta-panel {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
    align-items: center;
    min-height: 320px;
    border-radius: 16px;
    overflow: hidden;
    color: #fff;
}

.cta-panel--teal {
    background: linear-gradient(135deg, #04262a 0%, #03161b 55%, #07090c 100%);
    border: 1px solid rgba(42, 172, 184, 0.25);
}

.cta-panel--plum {
    background: linear-gradient(115deg, #1f0719 0%, #3d0c33 50%, #5c1240 100%);
    border: 1px solid rgba(254, 40, 87, 0.25);
}

.cta-copy {
    position: relative;
    z-index: 1;
    padding: 3rem;
}

.cta-eyebrow {
    letter-spacing: 0.08em;
    opacity: 0.75;
}

.cta-title {
    font-size: clamp(1.6rem, 1.5vw + 1.1rem, 2.4rem);
    line-height: 1.15;
    text-wrap: balance;
}

.cta-text {
    max-width: 46ch;
    line-height: 1.6;
    opacity: 0.82;
}

.cta-art {
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 240px;
}

.cta-art--ribbon {
    padding: 1.5rem 2rem 1.5rem 0;
}

.cta-art--arcs {
    align-items: flex-end;
    justify-content: flex-end;
}

@media (max-width: 960px) {
    .cta-panel {
        grid-template-columns: 1fr;
    }

    .cta-copy {
        padding: 2rem 1.5rem 0.5rem;
    }

    .cta-art {
        min-height: 180px;
        max-height: 220px;
    }
}
</style>
