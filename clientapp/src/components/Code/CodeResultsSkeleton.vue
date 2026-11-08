<template>
    <!-- Mirrors CodeResultItem: a ruled repo header, then a file block with a path tab and a few code lines. -->
    <div class="d-flex flex-column ga-10" aria-busy="true" aria-label="Searching code">
        <div v-for="i in count" :key="i" class="result-bone">
            <div class="d-flex align-center justify-space-between ga-4 py-4">
                <v-skeleton-loader type="heading" class="bone" :style="{ width: widths[i % widths.length] }" />
                <v-skeleton-loader type="text" class="bone" style="width: 110px" />
            </div>
            <div class="file-bone">
                <div class="tab-bone px-4 py-3">
                    <v-skeleton-loader type="text" class="bone" style="width: 45%" />
                </div>
                <div class="pa-4">
                    <v-skeleton-loader type="text" class="bone" style="width: 90%" />
                    <v-skeleton-loader type="text" class="bone" style="width: 64%" />
                    <v-skeleton-loader type="text" class="bone" style="width: 78%" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    count: { type: Number, default: 3 }
})

const widths = ['220px', '280px', '180px', '240px']
</script>

<style scoped>
.result-bone {
    border-top: 2px solid rgb(var(--v-theme-rule));
}

.file-bone {
    border: 1px solid rgb(var(--v-theme-border));
}

.tab-bone {
    border-bottom: 1px solid rgb(var(--v-theme-border));
    background: rgb(var(--v-theme-surface-raised));
}

/* Bare bones: no card padding or background of their own */
.bone {
    background: transparent;
}

.bone :deep(.v-skeleton-loader__heading),
.bone :deep(.v-skeleton-loader__text) {
    margin: 4px 0;
    max-width: none;
    width: 100%;
}
</style>
