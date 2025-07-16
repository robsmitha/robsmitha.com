<template>
    <v-alert
        v-if="rateLimited"
        border="start"
        border-color="red-darken-3"
        color="grey-darken-4"
        class="mb-2"
        variant="outlined"
    >
        <span class="d-block font-weight-bold">Too many requests. Please try again shortly.</span>
        <template v-if="!auth.signedIn">
            Sign in with 
            <!-- <a class="text-white" href="/.auth/login/github">GitHub</a> or  -->
            <a class="text-white" href="/.auth/login/aad">Microsoft</a> and authorize robsmitha.com to access a higher rate limit.
        </template>
        <template v-else-if="!auth.hasValidAccessToken">
            Authorize robsmitha.com on GitHub to access a higher rate limit.
            <v-btn size="small" variant="text" color="outlined" small @click="emit('authorize', search)">
                <v-icon size="small">mdi-github</v-icon> Authorize
            </v-btn>
        </template>
    </v-alert>

    <v-text-field
        v-if="!props.rateLimited"
        v-model="search"
        append-inner-icon="mdi-magnify"
        clearable
        required
        persistent-hint
        variant="outlined"
        rounded
        :readonly="loading"
        @click:append-inner="emit('search', search)"
        @keypress.enter="emit('search', search)"
    >
        <template v-slot:label>
            <span>
                <v-icon icon="mdi-github"></v-icon>&nbsp;{{ label }}
            </span>
        </template>
        <template v-slot:details>
            <span v-if="showDetails" class="ml-n4">
                To learn more about the format of the query, see <a :class="{ 'text-white': dark }" target="_blank" href="https://docs.github.com/rest/search/search#constructing-a-search-query">Constructing a search query</a>. 
                See <a :class="{ 'text-white': dark }" target="_blank" href="https://docs.github.com/search-github/searching-on-github/searching-code">Searching code</a> for a detailed list of qualifiers.
            </span>
        </template>
    </v-text-field>
</template>

<script setup lang="ts">

import { watch, computed } from 'vue'
import { useAuthStore } from "@/store/auth"


const props = defineProps(['rateLimited', 'loading', 'term', 'dark', 'label', 'showDetails'])
const emit = defineEmits(['input', 'search', 'authorize', 'clear'])

const auth = useAuthStore()

const search = computed({
  get() {
    return props.term
  },
  set(newValue) {
    emit('input', newValue)
  }
})

watch(search, async (newSearch: string) => {
    if(!newSearch || newSearch.length === 0){
        emit('clear')
    }
})
</script>