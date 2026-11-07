<template>
    <div v-if="rateLimited" class="rate-limit pa-4 mb-4" role="alert">
        <span class="d-block font-weight-bold mb-1">Too many requests. Please try again shortly.</span>
        <template v-if="!auth.signedIn">
            <span class="rate-limit-text text-body-2">
                Sign in with
                <a class="text-info" href="/.auth/login/aad">Microsoft</a> and authorize robsmitha.com to access a higher rate limit.
            </span>
        </template>
        <template v-else-if="!auth.hasValidAccessToken">
            <span class="rate-limit-text text-body-2">Authorize robsmitha.com on GitHub to access a higher rate limit.</span>
            <v-btn size="small" color="white" variant="flat" rounded="pill" class="text-none ml-2" prepend-icon="mdi-github" @click="emit('authorize', search)">
                Authorize
            </v-btn>
        </template>
    </div>

    <v-text-field
        v-if="!props.rateLimited"
        v-model="search"
        clearable
        required
        persistent-hint
        variant="outlined"
        color="primary"
        base-color="slate"
        class="font-mono search-field"
        :class="{ 'search-field--compact': compact, 'search-field--light': compact && !theme.global.current.value.dark }"
        rounded="lg"
        :readonly="loading"
        @keypress.enter="emit('search', search)"
    >
        <template v-slot:prepend-inner>
            <v-icon icon="mdi-github" size="20" class="mr-1"></v-icon>
        </template>
        <template v-slot:label>
            <span>{{ label }}</span>
        </template>
        <template v-slot:append-inner>
            <v-btn
                :color="compact ? 'lightest-slate' : 'white'"
                variant="flat"
                rounded="pill"
                size="small"
                class="text-none search-button"
                :loading="loading"
                @click="emit('search', search)"
            >
                Search
            </v-btn>
        </template>
        <template v-slot:details>
            <span v-if="showDetails" class="ml-n4 search-help">
                Supports GitHub's
                <a class="text-info" target="_blank" href="https://docs.github.com/rest/search/search#constructing-a-search-query">query syntax</a>
                and
                <a class="text-info" target="_blank" href="https://docs.github.com/search-github/searching-on-github/searching-code">code qualifiers</a>
                like <code>language:</code> and <code>extension:</code>.
            </span>
        </template>
    </v-text-field>
</template>

<script setup lang="ts">

import { watch, computed } from 'vue'
import { useTheme } from 'vuetify'
import { useAuthStore } from "@/store/auth"


// Typed so flags like `compact` written without a value count as true
const props = defineProps<{
    rateLimited?: boolean
    loading?: boolean
    term?: string
    dark?: boolean
    label?: string
    showDetails?: boolean
    compact?: boolean
}>()
const emit = defineEmits(['input', 'search', 'authorize', 'clear'])

const auth = useAuthStore()
const theme = useTheme()

const search = computed({
  get() {
    return props.term
  },
  set(newValue) {
    emit('input', newValue)
  }
})

watch(search, async (newSearch: string | undefined) => {
    if(!newSearch || newSearch.length === 0){
        emit('clear')
    }
})
</script>

<style scoped>
/* Sits on the colored hero panels, so it uses a translucent dark fill rather than a theme surface. */
.search-field :deep(.v-field) {
    background: rgba(0, 0, 0, 0.35);
}

.search-field :deep(.v-field__append-inner) {
    align-items: center;
    padding-top: 0;
}

/* Compact fields sit on the page background (e.g. a toolbar), not a colored hero.
   In light mode the dark tint above reads as grey, so they get the white surface instead; dark mode keeps the tint. */
.search-field--light :deep(.v-field) {
    background: rgb(var(--v-theme-surface));
}

.search-button {
    letter-spacing: 0;
}

.search-help {
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.6;
}

.search-help code {
    font-family: var(--font-mono);
    padding: 0 4px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.08);
}

.rate-limit {
    border-radius: 10px;
    border-left: 3px solid rgb(var(--v-theme-error));
    background: rgba(0, 0, 0, 0.35);
    color: #fff;
}

.rate-limit-text {
    opacity: 0.8;
}
</style>
