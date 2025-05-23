<template>
    <v-sheet color="grey-darken-4">
        <v-container>
            <v-row  v-if="congress">
                <v-col cols="12">
                    <span class="text-h4 font-weight-thin d-block">{{ congress.name }}</span>
                    <span class="text-subtitle d-block">{{ congress.startYear }} - {{ congress.endYear }}</span>
                </v-col>
            </v-row>
            <v-skeleton-loader v-else color="grey-darken-4" type="subtitle"></v-skeleton-loader>
        </v-container>
    </v-sheet>
    <v-sheet class="py-5">
        <v-container>
            <v-card flat>
                <v-list lines="three">
                    <v-infinite-scroll
                        v-if="items"
                        :mode="items.length > 20 ? 'manual' : 'intersect'"
                        @load="load"
                    >
                        <template v-for="i in items" :key="i.number">
                            <v-list-item :title="`${i.type}${i.number}`" :subtitle="i.title" :to="`bill/${congress.number}/${i.type}/${i.number}`">
                                <template v-slot:append>
                                    <span class="text-grey-darken-1 text-caption">
                                        {{ moment(i.updateDate).startOf('day').fromNow() }}
                                    </span>
                                </template>
                                <template v-slot:subtitle="{ subtitle }">
                                    <div v-html="subtitle"></div>
                                </template>
                                <template v-slot:default>
                                    <div class="text-caption font-italic mt-2" v-html="isMobile && i.latestAction.text.length > 125 ? i.latestAction.text.slice(0, 125) + '...' : i.latestAction.text"></div>
                                    <v-chip size="small" :color="i.originChamber === 'Senate' ? 'primary': 'black'" class="mt-2">{{ i.originChamber }}</v-chip>
                                </template>
                            </v-list-item>
                            <v-divider />
                        </template>
                        <template v-slot:loading>
                            <v-skeleton-loader :type="`list-item-three-line@${(items.length === 0 ? isMobile ? '7' : '10' : '3')}`" class="w-100"></v-skeleton-loader>
                        </template>
                    </v-infinite-scroll>
                </v-list>
            </v-card>
        </v-container>
    </v-sheet>  
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import moment from 'moment'
import { useDisplay } from 'vuetify'
import apiClient from '@/api/elysianClient'

const items = ref<any[]>([])
const congress = ref<any>()

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const page = ref(1)
const itemsPerPage = ref(10)

async function load({ done } : any) {
    const offset = (page.value - 1) * itemsPerPage.value
    
    const response = await apiClient?.getData(`/api/CongressFeed?offset=${offset}`)
    if (!response?.success){
        console.error("Failed to get feed.")
        done('error')
        return
    }
    const data = response.data
    if (data.billList.bills.length === 0){
        done('empty')
    }
    else {
        congress.value = data.congressDetails
        items.value.push(...data.billList.bills)
        done('ok')
    }
    page.value++
}
</script>