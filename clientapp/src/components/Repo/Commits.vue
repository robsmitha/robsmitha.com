<template>
    <v-timeline v-if="commits.success" density="compact">
        <v-timeline-item
            v-for="c in commits.data"
            :key="c.date"
            dot-color="white"
            icon-color="grey-lighten-2"
            icon="mdi-source-commit"
            width="100%"
        >
            <v-card variant="flat" class="mx-auto border-sm h-100 rounded-0 pb-0">
                <v-list density="compact" class="pb-0">
                    <v-list-subheader>
                        <span class="d-sr-only">Commits on </span>{{new Date(c.date).toDateString()}}
                    </v-list-subheader>
                    <v-list-item 
                        v-for="gc in c.commits" 
                        :key="gc.sha" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        :href="gc.html_url"
                        :title="gc.commit.message"
                        :subtitle="`${gc.author?.login} at ${new Date(gc.commit.author.date).toLocaleTimeString()}`"
                    >
                        <template v-slot:prepend>
                            <v-avatar size="50">
                                <v-img :src="gc.author !== null ? gc.author.avatar_url : ''"></v-img>
                            </v-avatar>
                        </template>
                        <template v-slot:append>
                            <v-icon icon="mdi-open-in-new" size="small"></v-icon>
                        </template>
                    </v-list-item>
                </v-list>
            </v-card>
        </v-timeline-item>
    </v-timeline>
</template>

<script setup lang="ts">

defineProps({
    commits: { 
        type: Object, 
        default: () => ({
            loading: true,
            success: false,
            data: null
        }) 
    }
})

</script>