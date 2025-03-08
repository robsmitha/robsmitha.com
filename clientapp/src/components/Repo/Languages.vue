<template>
    <v-row v-if="languages.success">
        <v-col v-for="l in languages.data" :key="l.language" xl="2" lg="3" md="6" cols="12">
            <v-card
                class="mx-auto pb-3 border-sm h-100 rounded-0"
                variant="flat"
                v-bind="props"
                >
                <v-list-item lines="three">
                    <template v-slot:default>
                        <div>
                            <v-list-item-title class="text-overline mb-4">{{l.lines}} lines</v-list-item-title>
                            <v-list-item-subtitle style="opacity: 1;">
                                <v-avatar
                                    size="50"
                                    rounded="0"
                                >
                                    <Devicon :icon="l.language" />
                                </v-avatar>
                                {{l.language}}
                            </v-list-item-subtitle>
                        </div>
                    </template>
                    <template v-slot:append>
                        <v-progress-circular size="80" :model-value="l.percent" :color="l.color">
                            <span class="text-h6 font-weight-thin text-grey-darken-2">
                                {{l.percent}}%
                            </span>
                        </v-progress-circular>
                    </template>
                </v-list-item>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import githubClient from '@/api/githubClient'
import { ref, onMounted } from 'vue'

const props = defineProps({
  name: { type: String }
})

const languages = ref<any>({
    loading: true,
    success: false,
    data: null
})

onMounted(() => getLanguages())

async function getLanguages(){
    const data = await githubClient?.getLanguages(props.name as string)
    const colors = new Map<string, string>([
        ["C#", "deep-purple"],
        ["TypeScript", "blue-darken-3"],
        ["Vue", "teal-darken-2"],
        ["HTML", "orange-darken-3"],
        ["JavaScript", "yellow-darken-1"]
    ]);
    const cards: Array<any> = []
    if (data) {
        const keys = Object.keys(data)
        const sum = keys.reduce((s, l) => s + data[l], 0)
        keys.map(l => {
            cards.push({
                language: l,
                lines: data[l],
                percent: Math.round((data[l] / sum) * 100),
                color: colors.get(l)
            })
        })
    }

    languages.value = {
        loading: false,
        success: data !== null,
        data: cards
    }
}
</script>