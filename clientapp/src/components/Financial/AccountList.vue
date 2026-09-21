<template>
    <v-row v-if="props.accessItems">
        <v-col v-for="(a, i) in props.accessItems" :key="a.institutionAccessItemId" cols="12" sm="3">
            <v-card color="surface" class="account-card">
                <template v-slot:prepend>
                    <v-avatar :color="getRandomColor(i)">
                        <span>{{ a.institution.name.charAt(0).toUpperCase() }}</span>
                    </v-avatar>
                </template>
                <template v-slot:subtitle>
                    <div class="text-lightest-slate">
                        {{a.institution.name}}
                    </div>
                    <div class="font-mono text-caption text-slate">
                        <v-icon size="small">mdi-update</v-icon> {{ moment(a.item.lastSuccessfulUpdate).startOf('day').fromNow() }}
                    </div>
                </template>
                <v-card-text>
                    <v-chip size="small" density="compact" variant="tonal" color="primary" class="font-mono">
                        {{ a.accounts.length }} Account{{ a.accounts.length === 1 ? '' : 's' }}
                    </v-chip>
                </v-card-text>
                <v-card-actions v-if="showIncome">
                    <v-btn size="x-small" variant="outlined" color="primary" icon :to="`/account/${a.institutionAccessItemId}/income`">
                        <v-icon>mdi-link</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import moment from 'moment'

const props = defineProps(['accessItems', 'showIncome'])

function getRandomColor(i: number) {
    const colors = [
        'primary',
        'info',
        'violet',
        'amber',
        'orange',
        'error'
    ]
    const index = i % colors.length;
    return colors[index]
}
</script>

<style scoped>
.account-card {
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}
</style>