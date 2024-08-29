<template>
    <v-sheet color="grey-lighten-4">
        <v-container>
            <v-row>
                <v-col>
                    <v-data-table-server
                        v-model:items-per-page="selectedItemsPerPage"
                        :headers="headers"
                        :items="serverItems"
                        :items-length="totalItems"
                        :loading="loading"
                        :search="search"
                        item-value="title"
                        :items-per-page-options="itemsPerPageOptions"
                        @update:options="loadItems"
                    >
                        <template v-slot:loading>
                            <v-skeleton-loader type="table-row@12"></v-skeleton-loader>
                        </template>
                        <template v-slot:item="{ item }">
                            <tr>
                                <td v-for="header in headers" :key="header.key">
                                    <template v-if="header.key === 'billName'">
                                        <v-btn variant="text" :to="`bill/${item.congress}/${item.type}/${item.number}`">{{ `${item.type}${item.number}` }}</v-btn>
                                    </template>
                                    <template v-else>
                                        {{ getNestedValue(item, header.key) }}
                                    </template>
                                </td>
                            </tr>
                        </template>
                    </v-data-table-server>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>  
</template>

<script lang="ts" setup>
import { ref } from 'vue'
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
</script>@/components/Congress/BillListAllResponse.types@/components/Congress/types/BillListAllResponse.types