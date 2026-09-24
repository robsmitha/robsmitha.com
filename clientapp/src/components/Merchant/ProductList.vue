<template>
    <PageHero eyebrow="> admin / merchant" tone="plum" art="arcs" compact>
        <h1 class="hero-title font-weight-bold mb-2">Products</h1>
        <p class="hero-text mb-5">The product catalog, searchable by name, serial number or description.</p>
        <div class="d-flex flex-wrap align-center ga-8">
            <div v-for="s in stats" :key="s.label">
                <span class="font-mono text-h6 font-weight-bold d-block">{{ s.value }}</span>
                <span class="font-mono text-caption hero-label">{{ s.label }}</span>
            </div>
            <v-btn color="white" variant="flat" rounded="pill" class="text-none" prepend-icon="mdi-plus" @click="$emit('create')">
                New product
            </v-btn>
        </div>
    </PageHero>

    <v-container class="admin-body py-10">
        <div class="d-flex align-center flex-wrap ga-3 mb-6">
            <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                placeholder="Filter by name, serial or description"
                clearable
                hide-details
                density="comfortable"
                variant="outlined"
                color="primary"
                base-color="slate"
                class="font-mono filter-field"
                rounded="lg"
            ></v-text-field>
            <div v-if="grades.length" class="d-flex flex-wrap ga-2">
                <v-chip
                    :variant="grade === null ? 'flat' : 'outlined'"
                    :color="grade === null ? 'lightest-slate' : 'slate'"
                    size="small"
                    class="font-mono"
                    @click="grade = null"
                >
                    All grades
                </v-chip>
                <v-chip
                    v-for="g in grades"
                    :key="g.name"
                    :variant="grade === g.name ? 'flat' : 'outlined'"
                    :color="grade === g.name ? 'violet' : 'slate'"
                    size="small"
                    class="font-mono"
                    @click="grade = grade === g.name ? null : g.name"
                >
                    {{ g.name }} ({{ g.count }})
                </v-chip>
            </div>
        </div>

        <div class="table-card">
            <v-data-table
                :custom-filter="filter"
                :headers="headers"
                :items="filteredItems"
                :search="search"
                :loading="loading"
                item-value="productId"
                class="product-table"
            >
                <template v-slot:loading>
                    <!-- Placeholder rows shaped like the product rows below. -->
                    <div v-for="i in 6" :key="i" class="d-flex align-center ga-4 px-4 py-3 bone-row">
                        <v-skeleton-loader type="avatar" class="bone bone--thumb" />
                        <div class="flex-grow-1">
                            <v-skeleton-loader type="text" class="bone bone--line mb-2" :style="{ width: `${30 + (i % 3) * 12}%` }" />
                            <v-skeleton-loader type="text" class="bone bone--small" :style="{ width: `${45 + (i % 2) * 15}%` }" />
                        </div>
                        <v-skeleton-loader type="chip" class="bone bone--pill" />
                    </div>
                </template>
                <template v-slot:no-data>
                    <div class="d-flex flex-column align-center py-10">
                        <v-icon size="40" class="mb-3 text-slate">mdi-package-variant</v-icon>
                        <p class="text-body-2 text-slate mb-4">{{ items?.length ? 'No products match this filter.' : 'No products yet.' }}</p>
                        <v-btn v-if="!items?.length" variant="outlined" color="primary" rounded="pill" class="text-none" prepend-icon="mdi-plus" @click="$emit('create')">
                            Add the first product
                        </v-btn>
                    </div>
                </template>
                <template v-slot:item="{ item }">
                    <tr class="product-row">
                        <td>
                            <div class="d-flex align-center ga-3 py-3">
                                <span class="thumb flex-shrink-0" :style="{ '--hue': hue(item.name) }">{{ item.name?.[0]?.toUpperCase() ?? '?' }}</span>
                                <div class="min-width-0">
                                    <span class="text-lightest-slate font-weight-bold d-block">{{ item.name }}</span>
                                    <span v-if="item.description" class="text-slate text-body-2 description">{{ item.description }}</span>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="serial font-mono text-caption">{{ item.serialNumber }}</span>
                        </td>
                        <td v-if="!isMobile">
                            <span v-if="item.grade" class="grade font-mono text-caption">{{ item.grade }}</span>
                            <span v-else class="text-slate">—</span>
                        </td>
                        <td v-if="!isMobile">
                            <span class="font-mono text-caption text-slate" :title="dateFilter(item.createdAt)">{{ moment(item.createdAt).fromNow() }}</span>
                        </td>
                        <td class="text-right text-no-wrap">
                            <v-btn variant="text" size="small" color="slate" icon="mdi-eye-outline" :aria-label="`View ${item.name}`" @click="$emit('view', item?.serialNumber)"></v-btn>
                            <v-btn variant="text" size="small" color="primary" icon="mdi-pencil-outline" :aria-label="`Edit ${item.name}`" @click="$emit('edit', item?.productId)"></v-btn>
                            <v-btn variant="text" size="small" color="error" icon="mdi-delete-outline" :aria-label="`Delete ${item.name}`" @click="pendingDelete = item"></v-btn>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </div>
    </v-container>

    <!-- Deleting used to happen on a single click; confirm first. -->
    <v-dialog :model-value="!!pendingDelete" max-width="440" @update:model-value="v => { if (!v) pendingDelete = null }">
        <v-card color="surface" class="dialog-card" rounded="lg">
            <div class="pa-5">
                <p class="font-mono text-caption text-error text-uppercase mb-2">Delete product</p>
                <p class="text-lightest-slate text-body-1 mb-1">Delete <strong>{{ pendingDelete?.name }}</strong>?</p>
                <p class="text-slate text-body-2 mb-0">Serial {{ pendingDelete?.serialNumber }}. This can't be undone.</p>
            </div>
            <v-divider color="lightest-navy" />
            <div class="d-flex justify-end ga-2 pa-4">
                <v-btn class="text-none" variant="text" color="slate" rounded="pill" @click="pendingDelete = null">Cancel</v-btn>
                <v-btn class="text-none" variant="flat" color="error" rounded="pill" @click="confirmDelete">Delete</v-btn>
            </div>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VDataTable } from 'vuetify/components'
import { useDisplay } from 'vuetify'
import moment from 'moment'
import { useDateFilter } from '@/filters/dateFilter'

const { mobile } = useDisplay()
const { dateFilter } = useDateFilter()

type ReadonlyHeaders = VDataTable['$props']['headers']

const props = defineProps({
    items: { type: Array<any> },
    loading: { type: Boolean, default: false }
})
const emit = defineEmits(['view', 'create', 'delete', 'edit'])
const search = ref('')
const grade = ref<string | null>(null)
const pendingDelete = ref<any | null>(null)

const isMobile = computed(() => mobile.value);

const headers = computed<ReadonlyHeaders>(() => isMobile.value
    ? [
        { title: 'Product', key: 'name' },
        { title: 'Serial #', key: 'serialNumber' },
        { title: '', key: 'actions', sortable: false, align: 'end' }
    ]
    : [
        { title: 'Product', key: 'name' },
        { title: 'Serial #', key: 'serialNumber' },
        { title: 'Grade', key: 'grade' },
        { title: 'Added', key: 'createdAt' },
        { title: '', key: 'actions', sortable: false, align: 'end' }
    ])

const grades = computed(() => {
    const counts = new Map<string, number>()
    for (const p of props.items ?? []) if (p.grade) counts.set(p.grade, (counts.get(p.grade) ?? 0) + 1)
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([name, count]) => ({ name, count }))
})

const filteredItems = computed(() => (props.items ?? []).filter(p => !grade.value || p.grade === grade.value))

const stats = computed(() => {
    const items = props.items ?? []
    const since = moment().subtract(30, 'days')
    return [
        { label: 'Products', value: props.loading && !items.length ? '—' : items.length },
        { label: 'Graded', value: items.filter(p => p.grade).length },
        { label: 'Added, last 30 days', value: items.filter(p => moment(p.createdAt).isAfter(since)).length },
    ]
})

// A stable color per product name for its initial badge.
function hue(name?: string) {
    let h = 0
    for (const c of name ?? '') h = (h * 31 + c.charCodeAt(0)) % 360
    return h
}

function confirmDelete() {
    emit('delete', pendingDelete.value?.productId)
    pendingDelete.value = null
}

function filter (value: string, query: string, item: any) {
    const upperCaseQuery = query.toLocaleUpperCase()
    return value != null &&
        upperCaseQuery != null &&
        typeof value === 'string' &&
        value.toString().toLocaleUpperCase().indexOf(upperCaseQuery) !== -1
}
</script>

<style scoped>
.admin-body {
    max-width: 1100px;
}

.hero-title {
    font-size: clamp(1.6rem, 1.5vw + 1rem, 2.2rem);
    line-height: 1.1;
}

.hero-text {
    max-width: 52ch;
    opacity: 0.82;
}

.hero-label {
    opacity: 0.7;
}

.filter-field {
    flex: 1 1 280px;
    max-width: 420px;
}

.table-card {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    background: rgb(var(--v-theme-surface));
}

.product-table {
    background: transparent;
}

.product-table :deep(th) {
    font-family: var(--font-mono);
    font-size: 0.75rem !important;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgb(var(--v-theme-slate)) !important;
}

.product-row {
    transition: background-color 0.15s ease;
}

.product-row:hover {
    background: rgba(var(--v-theme-violet), 0.05);
}

.min-width-0 {
    min-width: 0;
}

.thumb {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    color: hsl(var(--hue), 70%, 72%);
    background: hsla(var(--hue), 60%, 50%, 0.16);
}

.description {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 48ch;
}

.serial {
    padding: 2px 8px;
    border-radius: 6px;
    color: rgb(var(--v-theme-info));
    background: rgba(var(--v-theme-info), 0.1);
    white-space: nowrap;
}

.grade {
    padding: 2px 10px;
    border-radius: 999px;
    color: rgb(var(--v-theme-violet));
    background: rgba(var(--v-theme-violet), 0.14);
}

.dialog-card {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}

.bone-row {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

/* Placeholder bones: strip Vuetify's built-in margins and tone the color down
   (the theme's border-opacity of 1 would otherwise make every bone solid white). */
.bone {
    background: transparent;
}

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

.bone--thumb :deep(.v-skeleton-loader__avatar) {
    width: 40px;
    min-width: 40px;
    height: 40px;
    min-height: 40px;
    border-radius: 10px;
}

.bone--line :deep(.v-skeleton-loader__text) {
    height: 12px;
}

.bone--small :deep(.v-skeleton-loader__text) {
    height: 10px;
}

.bone--pill {
    width: 90px;
}

.bone--pill :deep(.v-skeleton-loader__chip) {
    height: 22px;
}
</style>
