<template>
    <!-- Pill tabs for pages with sub-views, sitting just under the colored header band. -->
    <div class="page-tabs-bar">
        <v-container class="page-tabs-inner py-0">
            <nav class="page-tabs d-flex ga-2 py-3" aria-label="Sections">
                <router-link
                    v-for="t in tabs"
                    :key="t.to"
                    :to="t.to"
                    class="page-tab font-mono text-body-2"
                    active-class="page-tab--active"
                >
                    <v-icon v-if="t.icon" size="16">{{ t.icon }}</v-icon>
                    {{ t.title }}
                    <span v-if="t.count !== undefined" class="page-tab-count">{{ t.count }}</span>
                </router-link>
            </nav>
        </v-container>
    </div>
</template>

<script setup lang="ts">
export type PageTab = { title: string, to: string, icon?: string, count?: number }

defineProps({
    tabs: { type: Array as () => PageTab[], required: true }
})
</script>

<style scoped>
.page-tabs-bar {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
    background: rgb(var(--v-theme-background));
}

.page-tabs-inner {
    max-width: 1100px;
}

.page-tabs {
    overflow-x: auto;
    scrollbar-width: none;
}

.page-tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
    padding: 6px 14px;
    border-radius: 999px;
    text-decoration: none;
    color: rgb(var(--v-theme-slate));
    border: 1px solid transparent;
    transition: color 0.15s ease, background-color 0.15s ease, border-color 0.15s ease;
}

.page-tab:hover,
.page-tab:focus-visible {
    color: rgb(var(--v-theme-lightest-slate));
    border-color: rgb(var(--v-theme-lightest-navy));
    outline: none;
}

.page-tab--active {
    color: rgb(var(--v-theme-on-primary));
    background: rgb(var(--v-theme-primary));
}

.page-tab--active:hover {
    color: rgb(var(--v-theme-on-primary));
}

.page-tab-count {
    min-width: 20px;
    padding: 0 6px;
    border-radius: 999px;
    font-size: 0.75rem;
    text-align: center;
    background: rgba(var(--v-theme-on-surface), 0.1);
}

.page-tab--active .page-tab-count {
    background: rgba(0, 0, 0, 0.2);
}
</style>
