<template>
    <!-- A ruled grid of the site's live features: letter and package name on top, big title at the bottom. -->
    <div class="features">
        <router-link v-for="(f, i) in enabledFeatures" :key="f.title" :to="f.to" class="feature">
            <span class="d-flex justify-space-between ga-3 font-mono text-caption text-subtle">
                <span>{{ String.fromCharCode(65 + i) }}</span>
                <span>{{ f.subtitle }}</span>
            </span>
            <span class="feature-title font-display">{{ f.title }} <span class="feature-arrow" aria-hidden="true">&rarr;</span></span>
            <span class="text-muted">{{ f.text }}</span>
        </router-link>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const features = [
    {
        title: 'Congress Activity',
        subtitle: 'CapitolSharp.Congress',
        text: 'A live feed of the latest bills, actions, and activity from the US Congress.',
        to: '/congress',
        icon: 'mdi-rss',
        accent: 'primary',
        enabled: true
    },
    {
        title: 'Generate Code',
        subtitle: 'NJsonSchema.CodeGeneration',
        text: 'Paste JSON and get fully structured C# and TypeScript DTOs back.',
        to: '/generate-code',
        icon: 'mdi-rocket-launch-outline',
        accent: 'info',
        enabled: true
    },
    {
        title: 'US Bill Tracker',
        subtitle: 'CapitolSharp.Congress',
        text: 'A pageable dataset of US bills for navigation and research.',
        to: '/bills',
        icon: 'mdi-radar',
        accent: 'amber',
        enabled: false
    },
    {
        title: 'Search Code',
        subtitle: 'GitHub REST API',
        text: 'Search the code in my GitHub repos with keywords and a flexible query syntax.',
        to: '/code',
        icon: 'mdi-magnify',
        accent: 'violet',
        enabled: true
    }
    // TODO: Budget Features
]

const enabledFeatures = computed(() => features.filter(f => f.enabled))
</script>

<style scoped>
.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    border-top: 1px solid rgb(var(--v-theme-rule));
    border-left: 1px solid rgb(var(--v-theme-rule));
}

.feature {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    min-height: 280px;
    padding: 1.75rem;
    border-right: 1px solid rgb(var(--v-theme-rule));
    border-bottom: 1px solid rgb(var(--v-theme-rule));
    color: rgb(var(--v-theme-on-background));
    text-decoration: none;
    transition: background-color 0.15s ease;
}

.feature:hover,
.feature:focus-visible {
    background: rgb(var(--v-theme-surface-raised));
    outline: none;
}

.feature-title {
    margin-top: auto;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
}

.feature-arrow {
    display: inline-block;
    color: rgb(var(--v-theme-primary));
    transition: transform 0.15s ease;
}

.feature:hover .feature-arrow {
    transform: translateX(4px);
}

@media (prefers-reduced-motion: reduce) {
    .feature-arrow {
        transition: none;
    }
}
</style>
