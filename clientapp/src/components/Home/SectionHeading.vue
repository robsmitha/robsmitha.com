<template>
    <!-- Swiss section heading: a strong rule, the section number in mono, then a tight display title. -->
    <div class="section-heading mb-10">
        <span class="section-index font-mono text-primary">{{ index }}</span>
        <h2 class="section-title font-display">{{ title }}</h2>
    </div>
</template>

<script setup lang="ts">
defineProps({
    index: { type: String, required: true },
    title: { type: String, required: true }
})
</script>

<style scoped>
.section-heading {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding-top: 1.25rem;
    border-top: 2px solid rgb(var(--v-theme-rule));
}

.section-index {
    font-size: 0.8125rem;
}

.section-title {
    margin: 0;
    font-size: clamp(2rem, 2vw + 1.25rem, 2.75rem);
    line-height: 1.05;
    font-weight: 700;
    color: rgb(var(--v-theme-on-background));
}
</style>
