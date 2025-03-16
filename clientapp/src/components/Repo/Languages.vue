<template>
    <v-row v-if="languages.success">
        <v-col v-for="l in languages.data" :key="l.language" xl="2" lg="3" md="6" cols="12">
            <v-card
                class="mx-auto pb-3 border-sm h-100 rounded-0"
                variant="flat"
                @click="emit('language-selected', l.language)">
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

defineProps({
    languages: { 
        type: Object, 
        default: () => ({
            loading: true,
            success: false,
            data: null
        }) 
    }
})

const emit = defineEmits(['language-selected'])

</script>