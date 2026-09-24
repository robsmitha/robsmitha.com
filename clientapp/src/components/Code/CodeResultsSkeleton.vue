<template>
    <!-- Mirrors CodeResultItem: language badge, repo name and file count,
         description, then the editor-tab snippet frame. -->
    <div class="d-flex flex-column ga-3" aria-busy="true" aria-label="Searching code">
        <div v-for="i in count" :key="i" class="card-bone pa-5">
            <div class="d-flex align-start ga-4">
                <v-skeleton-loader type="avatar" class="bone icon-bone flex-shrink-0" />
                <div class="flex-grow-1 min-width-0">
                    <div class="d-flex align-center ga-2 mb-1 row-24">
                        <v-skeleton-loader type="text" class="bone name-bone" :style="{ width: widths[i % widths.length] }" />
                        <v-skeleton-loader type="chip" class="bone count-bone" />
                    </div>
                    <v-skeleton-loader type="text" class="bone desc-bone mb-3" style="width: 70%" />
                    <div class="frame-bone">
                        <div class="tab-bone px-3 py-2">
                            <v-skeleton-loader type="text" class="bone path-bone" style="width: 45%" />
                        </div>
                        <div class="px-3 py-2">
                            <v-skeleton-loader type="text" class="bone code-bone" style="width: 90%" />
                            <v-skeleton-loader type="text" class="bone code-bone" style="width: 64%" />
                            <v-skeleton-loader type="text" class="bone code-bone" style="width: 78%" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    count: { type: Number, default: 4 }
})

const widths = ['140px', '180px', '120px', '160px']
</script>

<style scoped>
.card-bone {
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgb(var(--v-theme-lightest-navy));
}

.min-width-0 {
    min-width: 0;
}

.bone {
    background: transparent;
}

/* Strip Vuetify's built-in bone margins and tone the color down (the theme's
   border-opacity of 1 would otherwise make every bone solid white). */
.bone :deep(.v-skeleton-loader__text),
.bone :deep(.v-skeleton-loader__chip),
.bone :deep(.v-skeleton-loader__avatar) {
    margin: 0;
    max-width: none;
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.bone :deep(.v-skeleton-loader__text),
.bone :deep(.v-skeleton-loader__chip) {
    width: 100%;
}

.icon-bone :deep(.v-skeleton-loader__avatar) {
    width: 30px;
    min-width: 30px;
    height: 30px;
    min-height: 30px;
}

.row-24 {
    height: 24px;
}

.name-bone :deep(.v-skeleton-loader__text) {
    height: 14px;
}

.count-bone {
    width: 56px;
}

.count-bone :deep(.v-skeleton-loader__chip) {
    height: 20px;
}

.desc-bone {
    height: 20px;
}

.desc-bone :deep(.v-skeleton-loader__text) {
    height: 11px;
}

.frame-bone {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    background: rgb(var(--v-theme-background));
}

.tab-bone {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.path-bone {
    height: 20px;
}

.path-bone :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.code-bone {
    height: 21px;
}

.code-bone :deep(.v-skeleton-loader__text) {
    height: 10px;
}
</style>
