<template>
    <div class="d-flex align-center mb-8 section-heading">
        <span class="font-mono text-primary text-h6 mr-3">{{ index }}.</span>
        <h2 class="text-lightest-slate text-h4 font-weight-bold text-nowrap">
            {{ title }}
        </h2>
        <span class="heading-rule ml-6 flex-grow-1" aria-hidden="true"></span>
    </div>
</template>

<script setup lang="ts">
defineProps({
    index: { type: String, required: true },
    title: { type: String, required: true }
})
</script>

<style scoped>
.heading-rule {
    height: 1px;
    background: linear-gradient(90deg,
        rgba(var(--v-theme-primary), 0.7),
        rgba(var(--v-theme-violet), 0.35) 40%,
        rgba(var(--v-theme-lightest-navy), 1) 75%);
}
</style>
