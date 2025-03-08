<template>
    <v-row v-if="loading">
        <v-col v-for="i in 6" :key="i"
            cols="12"
            xl="3"
            md="4"
            sm="6"
        >
            <v-skeleton-loader
                ref="skeleton"
                :type="type"
                class="mx-auto"
            ></v-skeleton-loader>
        </v-col>
    </v-row>
    <v-row v-else>
        <v-col
            v-for="repo in store.starred"
            :key="repo.name"
            cols="12"
            xl="3"
            md="4"
            sm="6"
        >
            <RepoItem :repo="repo" variant="flat" :isExternalLink="true" />
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGithubStore } from "@/store/github"

const store = useGithubStore()
store.fetchStarred()

const type = 'list-item-two-line'

const loading = computed(() => store.starred?.length === 0)

</script>