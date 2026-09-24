<template>
    <!-- Mirrors the feed's timeline layout (day label on the rail, then bill
         cards) so the page doesn't jump when the real bills arrive. -->
    <div aria-busy="true" aria-label="Loading bills">
        <div v-for="(count, g) in groups" :key="g" class="day-group">
            <v-skeleton-loader v-if="showLabels" type="text" class="bone day-label-bone mb-3" />

            <div class="d-flex flex-column ga-3">
                <div v-for="r in count" :key="r" class="bill-row-skeleton pa-5">
                    <div class="d-flex align-start ga-4">
                        <v-skeleton-loader type="chip" class="bone badge-bone flex-shrink-0" />

                        <div class="flex-grow-1 min-width-0">
                            <v-skeleton-loader type="heading" class="bone title-bone mb-1" :style="{ width: widths[(g + r) % widths.length].title }" />
                            <v-skeleton-loader type="text" class="bone action-bone mb-3" :style="{ width: widths[(g + r) % widths.length].action }" />
                            <div class="d-flex align-center ga-3">
                                <v-skeleton-loader type="chip" class="bone pill-bone" style="width: 104px" />
                                <v-skeleton-loader type="text" class="bone meta-bone" style="width: 64px" />
                                <v-skeleton-loader type="text" class="bone meta-bone" style="width: 88px" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps({
    // Number of cards in each day group, e.g. [3, 2] draws two days.
    groups: { type: Array as () => number[], default: () => [3, 2] },
    showLabels: { type: Boolean, default: true }
})

// Vary line lengths a little so the placeholder reads like real titles, not a grid.
const widths = [
    { title: '62%', action: '78%' },
    { title: '48%', action: '64%' },
    { title: '70%', action: '52%' },
]
</script>

<style scoped>
/* Same rail and spacing as the real feed's .day-group. */
.day-group {
    position: relative;
    margin-left: 6px;
    padding-left: 1.75rem;
    padding-bottom: 2.5rem;
    border-left: 1px solid rgb(var(--v-theme-lightest-navy));
}

.day-group::before {
    content: '';
    position: absolute;
    left: -5px;
    top: 0.35rem;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgb(var(--v-theme-lightest-navy));
    box-shadow: 0 0 0 4px rgb(var(--v-theme-background));
}

/* Same box as the real .bill-row, with a neutral edge until the chamber is known. */
.bill-row-skeleton {
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    border-left: 3px solid rgb(var(--v-theme-lightest-navy));
}

.min-width-0 {
    min-width: 0;
}

/* Vuetify's bones come with 16px margins and fixed sizes meant for its own
   layouts; strip those so each bone takes exactly the size of the text it stands in for. */
.bone {
    background: transparent;
}

.bone :deep(.v-skeleton-loader__chip),
.bone :deep(.v-skeleton-loader__heading),
.bone :deep(.v-skeleton-loader__text) {
    margin: 0;
    max-width: none;
    width: 100%;
    /* The theme sets border-opacity to 1, which Vuetify also uses for bone
       color; tone it down so bones read as placeholders, not solid bars. */
    background: rgba(var(--v-theme-on-surface), 0.08);
}

/* Each bone sits in a row as tall as the real line of text, so the card is
   the same height before and after the bills load. */
.title-bone {
    height: 24px;
}

.action-bone {
    height: 20px;
}

.meta-bone {
    height: 24px;
}

.day-label-bone {
    width: 96px;
    height: 20px;
}

.day-label-bone :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.badge-bone {
    width: 76px;
}

.badge-bone :deep(.v-skeleton-loader__chip) {
    height: 24px;
    border-radius: 6px;
}

.title-bone :deep(.v-skeleton-loader__heading) {
    height: 16px;
    border-radius: 6px;
}

.action-bone :deep(.v-skeleton-loader__text) {
    height: 12px;
}

.pill-bone :deep(.v-skeleton-loader__chip) {
    height: 24px;
    border-radius: 999px;
}

.meta-bone :deep(.v-skeleton-loader__text) {
    height: 10px;
}
</style>
