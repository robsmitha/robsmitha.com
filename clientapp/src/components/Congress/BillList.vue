<template>
    <section class="bg-light-navy bills-hero">
        <v-container class="py-10">
            <p class="font-mono text-primary text-body-2 mb-2">
                <span aria-hidden="true">&gt;</span> congress.gov
            </p>
            <h1 class="text-lightest-slate text-h4 font-weight-bold mb-3">
                US Bill Tracker
            </h1>
            <p class="text-slate mb-8" style="max-width: 560px;">
                Browse, sort, and search the full catalog of tracked bills from the Congress.gov API.
            </p>

            <v-text-field
                v-model="search"
                density="comfortable"
                placeholder="Filter bills"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                color="primary"
                base-color="slate"
                class="font-mono bills-search"
                rounded="lg"
                clearable
                hide-details
            ></v-text-field>
        </v-container>
    </section>

    <v-container class="py-10">
        <v-sheet color="surface" rounded="lg" class="bills-table-wrap">
            <v-data-table-server
                v-model:items-per-page="selectedItemsPerPage"
                :headers="headers"
                :items="serverItems"
                :items-length="totalItems"
                :loading="loading"
                :search="search"
                item-value="title"
                :items-per-page-options="itemsPerPageOptions"
                class="bills-table"
                @update:options="loadItems"
            >
                <template v-slot:loading>
                    <v-skeleton-loader type="table-row@12" color="surface"></v-skeleton-loader>
                </template>
                <template v-slot:item="{ item }">
                    <tr class="bills-row">
                        <td v-for="header in headers" :key="header.key">
                            <template v-if="header.key === 'billName'">
                                <v-chip
                                    size="small"
                                    variant="tonal"
                                    :color="item.originChamber === 'Senate' ? 'info' : 'primary'"
                                    class="font-mono"
                                    :to="`bill/${item.congress}/${item.type}/${item.number}`"
                                >
                                    {{ `${item.type}${item.number}` }}
                                </v-chip>
                            </template>
                            <template v-else-if="header.key === 'originChamber'">
                                <span class="d-flex align-center ga-2 font-mono text-caption text-slate">
                                    <v-icon size="14">mdi-bank-outline</v-icon>{{ item.originChamber }}
                                </span>
                            </template>
                            <template v-else-if="header.key === 'updateDate'">
                                <span class="font-mono text-caption text-slate">
                                    {{ moment(item.updateDate).startOf('day').fromNow() }}
                                </span>
                            </template>
                            <template v-else-if="header.key === 'title'">
                                <span class="text-lightest-slate text-body-2 bill-title-cell" v-html="item.title"></span>
                            </template>
                            <template v-else-if="header.key === 'congress'">
                                <span class="font-mono text-caption text-slate">{{ item.congress }}</span>
                            </template>
                            <template v-else>
                                {{ getNestedValue(item, header.key) }}
                            </template>
                        </td>
                    </tr>
                </template>
            </v-data-table-server>
        </v-sheet>
    </v-container>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import moment from 'moment'
import { Bill } from '@/components/Congress/types/BillListAllResponse.types'
import { VDataTable } from 'vuetify/components'
import apiClient from '@/api/elysianClient'

interface UpdateOptions {
  page: number,
  itemsPerPage: number,
  sortBy: VDataTable['sortBy']
}

const headers = [
    {
        title: 'Bill',
        key: 'billName',
        sortable: false
    },
    { title: 'Title', key: 'title', sortable: false },
    //{ title: 'Latest Action', key: 'latestAction.text', sortable: false },
    //{ title: 'Latest Action Date', key: 'latestAction.actionDate', sortable: false },
    { title: 'Updated', key: 'updateDate' },
    { title: 'Congress', key: 'congress', sortable: false },
    { title: 'Origin', key: 'originChamber', sortable: false },
    { title: '', key: 'actions', sortable: false }
]
const itemsPerPageOptions = [
    {value: 10, title: '10'},
    {value: 25, title: '25'},
    {value: 50, title: '50'},
    {value: 100, title: '100'}
]

const serverItems = ref<Bill[]>([])
const loading = ref(false)
const selectedItemsPerPage = ref(10)
const totalItems = ref(0)
const search = ref('')

async function loadItems (options: UpdateOptions) {
    const { page, itemsPerPage, sortBy } = options
    loading.value = true
    try {
        const sort =  sortBy.length > 0 ? sortBy[0].key : 'updateDate'
        const sortDirection = sortBy.length > 0 ? sortBy[0].order : 'desc'
        const offset = itemsPerPage !== selectedItemsPerPage.value ? 0 : (page - 1) * itemsPerPage

        const response = await apiClient?.getData(`/api/CongressGetBills?offset=${offset}&limit=${itemsPerPage}&sort=${sort}&direction=${sortDirection}`)
        if (!response?.success){
            console.error("Failed to get bills.")
            return
        }

        serverItems.value = response.data.bills
        totalItems.value = response.data.pagination.count
    } catch (e) {
        console.error(e);
    }


    loading.value = false
}
function getNestedValue(obj: any, key: string) {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}
</script>

<style scoped>
.bills-search {
    max-width: 420px;
}

.bills-table-wrap {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    overflow: hidden;
}

.bill-title-cell {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 480px;
}

.bills-table :deep(table) {
    background-color: transparent;
}

.bills-table :deep(.v-data-table__th) {
    background-color: rgb(var(--v-theme-light-navy));
    color: rgb(var(--v-theme-slate)) !important;
    font-family: var(--font-mono);
    text-transform: uppercase;
    font-size: 0.75rem;
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy)) !important;
}

.bills-table :deep(.bills-row td) {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy)) !important;
    transition: background-color 0.15s ease;
}

.bills-table :deep(.bills-row:hover td) {
    background-color: rgba(var(--v-theme-primary), 0.04);
}

.bills-table :deep(.v-data-table-footer) {
    border-top: 1px solid rgb(var(--v-theme-lightest-navy));
    color: rgb(var(--v-theme-slate));
}
</style>
