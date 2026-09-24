<template>
    <!-- Mirrors the bill page body: progress tracker and timeline on the left,
         sponsor and cosponsor panels on the right. -->
    <v-container class="bill-body py-12" aria-busy="true" aria-label="Loading bill details">
        <v-row>
            <v-col cols="12" md="8" class="pr-md-8">
                <section class="mb-14">
                    <v-skeleton-loader type="heading" class="bone heading-bone mb-8" />
                    <div class="progress-bones">
                        <div v-for="i in 6" :key="i" class="d-flex flex-column ga-2">
                            <v-skeleton-loader type="avatar" class="bone node-bone" />
                            <v-skeleton-loader type="text" class="bone line-bone" style="width: 80%" />
                            <v-skeleton-loader type="text" class="bone line-bone line-bone--small" style="width: 55%" />
                        </div>
                    </div>
                </section>

                <section>
                    <v-skeleton-loader type="heading" class="bone heading-bone mb-8" />
                    <div v-for="g in 2" :key="g" class="day-group">
                        <v-skeleton-loader type="text" class="bone day-label-bone mb-3" />
                        <div class="d-flex flex-column ga-3">
                            <div v-for="r in 2" :key="r" class="card-bone pa-4">
                                <v-skeleton-loader type="chip" class="bone pill-bone mb-3" />
                                <v-skeleton-loader type="text" class="bone line-bone mb-2" :style="{ width: r === 1 ? '85%' : '70%' }" />
                                <v-skeleton-loader type="text" class="bone line-bone" style="width: 40%" />
                            </div>
                        </div>
                    </div>
                </section>
            </v-col>

            <v-col cols="12" md="4">
                <div class="d-flex flex-column ga-4">
                    <div class="card-bone pa-5">
                        <v-skeleton-loader type="text" class="bone line-bone line-bone--small mb-4" style="width: 30%" />
                        <div class="d-flex align-center ga-4">
                            <v-skeleton-loader type="avatar" class="bone initials-bone" />
                            <div class="flex-grow-1">
                                <v-skeleton-loader type="text" class="bone line-bone mb-2" style="width: 70%" />
                                <v-skeleton-loader type="text" class="bone line-bone line-bone--small" style="width: 50%" />
                            </div>
                        </div>
                    </div>

                    <div class="card-bone pa-5">
                        <v-skeleton-loader type="text" class="bone line-bone line-bone--small mb-4" style="width: 40%" />
                        <v-skeleton-loader type="text" class="bone split-bone mb-5" />
                        <div class="d-flex ga-6 mb-5">
                            <v-skeleton-loader v-for="i in 3" :key="i" type="heading" class="bone stat-bone" />
                        </div>
                        <v-skeleton-loader v-for="i in 5" :key="i" type="text" class="bone line-bone person-bone" />
                    </div>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.bill-body {
    max-width: 1100px;
}

.bone {
    background: transparent;
}

/* Strip Vuetify's built-in bone margins and tone the color down (the theme's
   border-opacity of 1 would otherwise make every bone solid white). */
.bone :deep(.v-skeleton-loader__heading),
.bone :deep(.v-skeleton-loader__text),
.bone :deep(.v-skeleton-loader__chip),
.bone :deep(.v-skeleton-loader__avatar) {
    margin: 0;
    max-width: none;
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.bone :deep(.v-skeleton-loader__heading),
.bone :deep(.v-skeleton-loader__text),
.bone :deep(.v-skeleton-loader__chip) {
    width: 100%;
}

.heading-bone {
    width: 40%;
}

.heading-bone :deep(.v-skeleton-loader__heading) {
    height: 32px;
    border-radius: 8px;
}

.progress-bones {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 0.75rem;
}

.node-bone :deep(.v-skeleton-loader__avatar) {
    width: 26px;
    min-width: 26px;
    height: 26px;
    min-height: 26px;
}

.line-bone {
    height: 20px;
}

.line-bone :deep(.v-skeleton-loader__text) {
    height: 12px;
}

.line-bone--small :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.day-group {
    position: relative;
    margin-left: 6px;
    padding-left: 1.75rem;
    padding-bottom: 2rem;
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

.day-label-bone {
    width: 160px;
    height: 20px;
}

.day-label-bone :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.card-bone {
    border-radius: 12px;
    background: rgb(var(--v-theme-surface));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}

.pill-bone {
    width: 84px;
}

.pill-bone :deep(.v-skeleton-loader__chip) {
    height: 20px;
}

.initials-bone :deep(.v-skeleton-loader__avatar) {
    width: 52px;
    min-width: 52px;
    height: 52px;
    min-height: 52px;
}

.split-bone :deep(.v-skeleton-loader__text) {
    height: 8px;
    border-radius: 999px;
}

.stat-bone {
    width: 56px;
}

.stat-bone :deep(.v-skeleton-loader__heading) {
    height: 40px;
    border-radius: 8px;
}

.person-bone {
    height: 37px;
    border-top: 1px solid rgb(var(--v-theme-lightest-navy));
}

@media (max-width: 700px) {
    .progress-bones {
        grid-template-columns: 1fr;
    }
}
</style>
