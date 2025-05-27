<template>
    <v-sheet class="py-5">
        <v-container>
            <v-row class="mb-2">
                <v-col>
                    <ContentHeader
                        title="Users"
                    />
                </v-col>
                <v-col class="text-right">
                    <v-btn
                        color="primary"
                        rounded="xl"
                        variant="flat"
                        @click="$emit('create')"
                    >
                    <v-icon>mdi-plus</v-icon> <span v-if="!$vuetify.display.mobile">New</span>
                </v-btn>
                </v-col>
            </v-row>
            
            <v-row>
                <v-col>
                    <v-text-field
                        v-model="search"
                        prepend-icon="mdi-filter"
                        label="Filter"
                        hint="Search all active products."
                        persistent-hint
                        clearable
                        variant="outlined"
                    >
                    </v-text-field>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-data-table 
                        :custom-filter="filter"
                        :headers="headers"
                        :items="items"
                        :search="search"
                        item-value="name">
                        <template v-slot:top>
                            <v-container>
                            </v-container>
                        </template>
                        <template v-slot:loading>
                            <v-skeleton-loader type="table-row@12"></v-skeleton-loader>
                        </template>
                        <template v-slot:item="{ item }">
                            <tr>
                                <td v-for="header in headers" :key="header.key">
                                    <template v-if="header.key === ''">
                                        <v-btn variant="text" size="small" color="primary" icon @click="$emit('view', item?.serialNumber)">
                                            <v-icon
                                                size="small"
                                            >
                                                mdi-eye
                                            </v-icon>
                                        </v-btn>
                                        <v-btn variant="text" size="small" color="primary" icon @click="$emit('edit', item?.productId)">
                                            <v-icon
                                                size="small"
                                            >
                                                mdi-pencil
                                            </v-icon>
                                        </v-btn>
                                        <v-btn variant="text" size="small" color="primary" icon @click="$emit('delete', item?.productId)">
                                            <v-icon
                                                size="small"
                                            >
                                                mdi-delete
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    <template v-if="header.key === 'createdAt'">
                                        {{ dateFilter(getNestedValue(item, header.key)) }}
                                    </template>
                                    <template v-else>
                                        {{ getNestedValue(item, header.key!.toString()) }}
                                    </template>
                                </td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VDataTable } from 'vuetify/components'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
import { useDateFilter } from '@/filters/dateFilter'

const { dateFilter } = useDateFilter()

type ReadonlyHeaders = VDataTable['$props']['headers']

const props = defineProps({
    items: { type: Array<any> }
})
const emit = defineEmits(['view', 'create', 'delete', 'edit'])
const search = ref('')

const isMobile = computed(() => mobile.value);

const headers: ReadonlyHeaders = isMobile.value
    ? [
        {
            title: 'Name',
            key: 'name',
        },
        {
            title: 'Serial #',
            key: 'serialNumber',
        },
        {
            title: '',
            key: '',
            sortable: false,
            align: 'end'
        }
    ] 
    : [
        {
            title: 'Name',
            key: 'name',
        },
        {
            title: 'Serial #',
            key: 'serialNumber',
        },
        {
            title: 'Grade',
            key: 'grade',
        },
        {
            title: 'Description',
            key: 'description'
        },
        {
            title: 'Created',
            key: 'createdAt'
        },
        {
            title: '',
            key: '',
            sortable: false,
            align: 'end'
        }
    ]

function filter (value: string, query: string, item: any) {
    const upperCaseQuery = query.toLocaleUpperCase()
    return value != null &&
        upperCaseQuery != null &&
        typeof value === 'string' &&
        value.toString().toLocaleUpperCase().indexOf(upperCaseQuery) !== -1
}

function getNestedValue(obj: any, key: string) {
    return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}
</script>