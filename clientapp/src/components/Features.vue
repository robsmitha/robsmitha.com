<template>
    <v-sheet color="grey-lighten-4" class="py-3">
        <v-container>
            <v-card color="transparent"  title="Features" subtitle="Try them out!" flat>
                <v-card-text>
                    <v-row>
                        <template v-for="f in features">
                            <v-col v-if="f.enabled" :key="f.title" md="4" sm="6" cols="12">
                                <v-card
                                
                                    class="fill-height"
                                    :title="f.title" 
                                    :subtitle="f.subtitle" 
                                    :text="f.text" 
                                    :to="f.to"
                                    :prepend-icon="f.icon"
                                    hover>
                                </v-card>
                            </v-col>
                        </template>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-container>
    </v-sheet>
</template>

<script setup lang="ts">

const features = [
    {
        title: 'Search Code',
        subtitle: 'GitHub Rest API',
        text: 'Search code at github.com/robsmitha',
        to: '/code',
        icon: 'mdi-magnify',
        enabled: true
    },
    {
        title: 'Generate Code',
        subtitle: 'NJsonSchema.CodeGeneration',
        text: 'Generate C# and TypeScript DTOs from JSON',
        to: '/generate-code',
        icon: 'mdi-rocket-launch-outline',
        enabled: true
    },
    {
        title: 'Congress Activity',
        subtitle: 'CapitolSharp.Congress',
        text: 'A feed of the latest Congressional activity',
        to: '/congress',
        icon: 'mdi-rss',
        enabled: false
    },
    {
        title: 'US Bill Tracker',
        subtitle: 'CapitolSharp.Congress',
        text: 'A pageable dataset of all recorded US Bills',
        to: '/bills',
        icon: 'mdi-radar',
        enabled: true
    }
]
</script>