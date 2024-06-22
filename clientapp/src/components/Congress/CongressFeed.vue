<template>
    <v-sheet color="grey-lighten-4">
        <v-container>
            <v-row>
                <v-col>
                    <v-list
                        lines="three"
                    >
                        <v-list-subheader>Latest</v-list-subheader>
                        <template v-for="i in items" :key="i.key">
                            <v-list-item
                            :subtitle="i.subtitle"
                            :title="i.title">
                                
                                <template v-slot:prepend>
                                    <v-icon :color="i.color">{{ i.icon }}</v-icon>
                                </template>

                                <template v-slot:append>
                                    <span class="text-caption text-grey">
                                        {{ moment(i.updated).startOf('day').fromNow() }}
                                    </span>
                                </template>
                            </v-list-item>
                            <v-divider></v-divider>
                        </template>
                    </v-list>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>  
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import moment from 'moment'

const items = ref<any[]>([])

onMounted(() =>{
  getMixer()
})
async function getMixer(){
    const response = await fetch(`/api/CongressMixer`)
    if (!response.ok){
        console.error("Failed to get feed.")
        return
    }
    const data = await response.json()
    console.log(data)
    items.value = data.results
}
</script>