<template>
    <div v-if="rateLimited" class="rate-limit pa-4 mb-4" role="alert">
        <span class="d-block font-weight-bold mb-1">Too many requests. Please try again shortly.</span>
        <template v-if="!auth.signedIn">
            <span class="text-body-2 text-muted">
                Sign in with
                <a href="/.auth/login/aad">Microsoft</a> and authorize robsmitha.com to access a higher rate limit.
            </span>
        </template>
        <template v-else-if="!auth.hasValidAccessToken">
            <span class="text-body-2 text-muted">Authorize robsmitha.com on GitHub to access a higher rate limit.</span>
            <v-btn size="small" color="rule" variant="flat" class="ml-2" prepend-icon="mdi-github" @click="emit('authorize', search)">
                Authorize
            </v-btn>
        </template>
    </div>

    <!-- Swiss search bar: one heavy outline holding the icon, the query and the accent Search button. -->
    <form
        v-if="!props.rateLimited"
        class="search-bar"
        :class="{ 'search-bar--compact': compact }"
        role="search"
        @submit.prevent="emit('search', search)"
    >
        <label :for="inputId" class="sr-only">{{ label }}</label>
        <v-icon icon="mdi-magnify" :size="compact ? 18 : 22" class="search-icon" aria-hidden="true"></v-icon>
        <input
            :id="inputId"
            ref="input"
            v-model="search"
            type="search"
            class="search-input font-mono"
            :placeholder="label"
            :readonly="loading"
            autocomplete="off"
            spellcheck="false"
        />
        <button
            v-if="search"
            type="button"
            class="search-clear"
            aria-label="Clear search"
            @click="search = ''"
        >
            <v-icon size="18">mdi-close</v-icon>
        </button>
        <v-btn
            type="submit"
            color="primary"
            variant="flat"
            :size="compact ? 'default' : 'x-large'"
            class="search-button"
            :loading="loading"
        >
            Search
        </v-btn>
    </form>

    <p v-if="showDetails && !props.rateLimited" class="search-help text-body-2 text-subtle mt-3 mb-0">
        Supports GitHub's
        <a target="_blank" href="https://docs.github.com/rest/search/search#constructing-a-search-query">query syntax</a>
        and
        <a target="_blank" href="https://docs.github.com/search-github/searching-on-github/searching-code">code qualifiers</a>
        like <code>language:</code> and <code>extension:</code>.
    </p>
</template>

<script setup lang="ts">
import { watch, computed, ref } from 'vue'
import { useAuthStore } from "@/store/auth"

// Typed so flags like `compact` written without a value count as true
const props = defineProps<{
    rateLimited?: boolean
    loading?: boolean
    term?: string
    // Kept for older callers; the Swiss bar looks the same everywhere.
    dark?: boolean
    label?: string
    showDetails?: boolean
    compact?: boolean
}>()
const emit = defineEmits(['input', 'search', 'authorize', 'clear'])

const auth = useAuthStore()

const inputId = `search-${Math.random().toString(36).slice(2, 8)}`
const input = ref<HTMLInputElement | null>(null)

const search = computed({
  get() {
    return props.term ?? ''
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

// Lets the page put the cursor back in the box, e.g. after adding a qualifier to the query.
defineExpose({ focus: () => input.value?.focus() })
</script>

<style scoped>
.search-bar {
    display: flex;
    align-items: stretch;
    border: 2px solid rgb(var(--v-theme-rule));
    background: rgb(var(--v-theme-surface));
}

.search-bar:focus-within {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
}

.search-icon {
    align-self: center;
    margin-left: 1.25rem;
    color: rgb(var(--v-theme-subtle));
}

.search-input {
    flex: 1 1 auto;
    min-width: 0;
    height: 64px;
    padding: 0 1rem;
    border: 0;
    outline: none;
    background: transparent;
    font-size: 1.0625rem;
    color: rgb(var(--v-theme-on-surface));
}

.search-input::placeholder {
    color: rgb(var(--v-theme-subtle));
}

/* The browser's own clear button would duplicate ours */
.search-input::-webkit-search-cancel-button {
    display: none;
}

.search-clear {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    color: rgb(var(--v-theme-subtle));
}

.search-clear:hover,
.search-clear:focus-visible {
    color: rgb(var(--v-theme-on-surface));
}

.search-button {
    height: auto !important;
    min-height: 100%;
    padding: 0 2rem !important;
    font-weight: 600;
    letter-spacing: 0;
}

.search-bar--compact {
    border-width: 1px;
}

.search-bar--compact .search-icon {
    margin-left: 0.875rem;
}

.search-bar--compact .search-input {
    height: 44px;
    font-size: 0.9375rem;
}

.search-bar--compact .search-button {
    padding: 0 1.25rem !important;
}

.search-help a {
    color: inherit;
    text-decoration: underline;
}

.search-help code {
    font-family: var(--font-mono);
    padding: 0 4px;
    background: rgb(var(--v-theme-surface-raised));
}

.rate-limit {
    border: 1px solid rgb(var(--v-theme-rule));
    border-left: 4px solid rgb(var(--v-theme-error));
    background: rgb(var(--v-theme-surface));
}

.rate-limit a {
    color: inherit;
    text-decoration: underline;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
}

@media (max-width: 600px) {
    .search-input {
        height: 52px;
        font-size: 1rem;
    }

    .search-button {
        padding: 0 1.25rem !important;
    }
}
</style>
