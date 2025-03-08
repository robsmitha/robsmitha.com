<template>
    <v-sheet class="py-16">
        <template v-for="f in features" :key="f.title">
            <section v-if="f.enabled" id="filter">
                <v-container>
                    <v-row justify="space-between">
                        <v-col md="8" cols="12">
                            <v-responsive width="350">
                                <h2 class="text-h4">
                                {{ f.title }}
                                </h2>

                                <p class="text-grey-darken-2 mt-3">
                                {{ f.subtitle }}
                                </p>

                                <p class="mt-8">
                                {{ f.text }}
                                </p>

                                <v-btn
                                    class="mt-8 mb-3"
                                    variant="outlined"
                                    rounded
                                    :to="f.to"
                                >
                                 Explore
                                 <v-icon>mdi-arrow-right-thin</v-icon>
                                </v-btn>
                            </v-responsive>
                        </v-col>

                        <v-col v-if="!isMobile" md="4" cols="12"  class="d-flex justify-center align-center">
                            <v-img 
                                :width="300"
                                aspect-ratio="4/3"
                                cover
                                :src="f.image">
                            </v-img>
                        </v-col>
                    </v-row>
                </v-container>
            </section>
            <v-container v-if="f.enabled">
                <v-divider class="my-12" />
            </v-container>
        </template>
    </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const features = [
    {
        title: 'Search Code',
        subtitle: 'GitHub Rest API',
        text: 'Explore and search code hosted at github.com/robsmitha effortlessly using specific keywords and a flexible, customizable query syntax to refine your results.',
        to: '/code',
        icon: 'mdi-magnify',
        image: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/unDraw/undraw_read-notes_7itt.svg',
        enabled: false
    },
    {
        title: 'Generate Code',
        subtitle: 'NJsonSchema.CodeGeneration',
        text: 'Easily generate fully-structured C# and TypeScript Data Transfer Objects (DTOs) directly from JSON, streamlining your development process.',
        to: '/generate-code',
        icon: 'mdi-rocket-launch-outline',
        image: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/unDraw/undraw_data-processing_z2q6.svg',
        enabled: true
    },
    {
        title: 'Congress Activity',
        subtitle: 'CapitolSharp.Congress',
        text: 'Stay informed with a dynamic feed showcasing the latest updates, actions, and activities from Congress in real-time.',
        to: '/congress',
        icon: 'mdi-rss',
        image: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/unDraw/undraw_text-files_tqjw.svg',
        enabled: true
    },
    {
        title: 'US Bill Tracker',
        subtitle: 'CapitolSharp.Congress',
        text: 'Access a comprehensive, pageable dataset containing detailed records of all US bills, enabling easy navigation and in-depth research.',
        to: '/bills',
        icon: 'mdi-radar',
        image: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/unDraw/undraw_text-files_tqjw.svg',
        enabled: false
    }
]
</script>