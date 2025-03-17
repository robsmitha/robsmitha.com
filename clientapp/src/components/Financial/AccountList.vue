<template>
    <v-row v-if="props.accessItems">
        <v-col v-for="(a, i) in props.accessItems" :key="a.institutionAccessItemId" cols="12" sm="3">
            <v-card>
                <template v-slot:prepend>
                    <v-avatar :color="getRandomColor(i)">
                        <span>{{ a.institution.name.charAt(0).toUpperCase() }}</span>
                    </v-avatar>
                </template>
                <template v-slot:subtitle>
                    <div class="text-title">
                        {{a.institution.name}}
                    </div>
                    <div class="text-caption">
                        <v-icon size="small">mdi-update</v-icon> {{ moment(a.item.lastSuccessfulUpdate).startOf('day').fromNow() }}
                    </div>
                </template>
                <v-card-text>
                    <v-chip size="xsmall" density="compact" variant="tonal" color="primary">
                        <span class="text-caption px-2">{{ a.accounts.length }} Accounts</span>
                    </v-chip>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import moment from 'moment'

const props = defineProps(['accessItems'])

function getRandomColor(i: number) {
    const colors = [
        'blue',
        'red',
        'pink',
        'deep-purple',
        'indigo',
        'teal',
        'deep-orange',
        'blue-grey'
    ]
    const index = i % colors.length;
    return colors[index]
}
</script>