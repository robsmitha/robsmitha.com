<template>
    <v-row v-if="loading">
        <v-col v-for="i in 3" :key="i" cols="12" sm="6" md="4">
            <v-skeleton-loader type="article" color="surface" class="mx-auto"></v-skeleton-loader>
        </v-col>
    </v-row>
    <template v-else>
        <v-row>
            <v-col v-for="repo in recentRepos" :key="repo.name" cols="12" sm="6" md="4">
                <RepoItem :repo="repo" @repo-selected="repoSelected" />
            </v-col>
        </v-row>
        <div class="d-flex justify-center mt-8">
            <v-btn
                variant="outlined"
                color="primary"
                class="font-mono text-none"
                prepend-icon="mdi-github"
                href="https://github.com/robsmitha?tab=repositories"
                target="_blank"
            >
                View all repos on GitHub
            </v-btn>
        </div>
    </template>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGithubStore } from "@/store/github"
import { useRouter } from 'vue-router'

const props = defineProps({
    limit: { type: Number, default: 6 }
})

const router = useRouter()

const store = useGithubStore()
store.fetchRepos()

const loading = computed(() => store.repos?.length === 0)

// Most recently pushed repos that have a description, so the cards have something to say.
const recentRepos = computed(() => {
    return [...(store.repos || [])]
        .filter(r => r.description?.length > 0)
        .sort((a, b) => Number(new Date(b.pushed_at)) - Number(new Date(a.pushed_at)))
        .slice(0, props.limit)
})

function repoSelected(name: string){
    router.push(`repo/${name}`)
}
</script>
