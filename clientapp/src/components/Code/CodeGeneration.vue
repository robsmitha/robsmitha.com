<template>
    <PageHero eyebrow="> NJsonSchema.CodeGeneration" tone="plum" art="editor">
        <div class="d-flex align-center flex-wrap ga-3 mb-3">
            <h1 class="hero-title font-weight-bold">Generate Code</h1>
            <span class="hero-pill font-mono text-caption">Beta</span>
        </div>
        <p class="hero-text mb-6">
            Paste a JSON payload and get strongly typed C# classes or TypeScript interfaces back,
            generated server-side with NJsonSchema.
        </p>
        <div class="d-flex flex-wrap ga-2">
            <span v-for="s in steps" :key="s" class="hero-step font-mono text-caption">{{ s }}</span>
        </div>
    </PageHero>

    <v-container class="generate-body py-10">
        <div class="workspace">
            <!-- Input -->
            <section class="pane" aria-labelledby="input-label">
                <div class="pane-tab d-flex align-center ga-2 px-4 py-3">
                    <v-icon size="16" color="amber">mdi-code-json</v-icon>
                    <span id="input-label" class="font-mono text-caption text-light-slate flex-grow-1">sample.json</span>
                    <v-menu location="bottom end">
                        <template #activator="{ props: menuProps }">
                            <v-btn v-bind="menuProps" size="small" variant="text" color="slate" class="text-none" append-icon="mdi-chevron-down">
                                Samples
                            </v-btn>
                        </template>
                        <v-list bg-color="surface" density="compact">
                            <v-list-item v-for="s in samples" :key="s.name" @click="loadSample(s)">
                                <v-list-item-title class="text-body-2">{{ s.name }}</v-list-item-title>
                                <v-list-item-subtitle class="font-mono text-caption">{{ s.description }}</v-list-item-subtitle>
                            </v-list-item>
                        </v-list>
                    </v-menu>
                    <v-btn size="small" variant="text" color="slate" class="text-none" prepend-icon="mdi-format-align-left" :disabled="!!jsonError" @click="formatJson">
                        Format
                    </v-btn>
                </div>

                <div class="pane-body pa-4">
                    <div class="d-flex ga-3 mb-4 flex-wrap">
                        <v-text-field
                            v-model="responseName"
                            label="Class name"
                            variant="outlined"
                            density="comfortable"
                            color="primary"
                            base-color="slate"
                            class="font-mono field"
                            hide-details="auto"
                            :rules="[rules.required, rules.identifier]"
                        ></v-text-field>
                        <v-text-field
                            v-model="namespace"
                            label="Namespace"
                            variant="outlined"
                            density="comfortable"
                            color="primary"
                            base-color="slate"
                            class="font-mono field"
                            :disabled="language !== 'C#'"
                            :hint="language !== 'C#' ? 'Only used for C#' : ''"
                            persistent-hint
                            hide-details="auto"
                        ></v-text-field>
                    </div>

                    <div class="d-flex align-center ga-3 mb-4">
                        <span class="font-mono text-caption text-slate">Language</span>
                        <div class="lang-toggle d-flex" role="radiogroup" aria-label="Output language">
                            <button
                                v-for="l in languages"
                                :key="l.name"
                                type="button"
                                role="radio"
                                :aria-checked="language === l.name"
                                class="lang-option font-mono text-body-2 d-flex align-center ga-2"
                                :class="{ 'lang-option--active': language === l.name }"
                                @click="language = l.name"
                            >
                                <v-avatar size="18" class="lang-icon"><Devicon :icon="l.icon" /></v-avatar>
                                {{ l.name }}
                            </button>
                        </div>
                    </div>

                    <textarea
                        v-model="sampleJson"
                        class="json-input font-mono"
                        :class="{ 'json-input--error': jsonError }"
                        spellcheck="false"
                        aria-label="Sample JSON"
                        rows="16"
                        @keydown.ctrl.enter.prevent="generateCode"
                        @keydown.meta.enter.prevent="generateCode"
                    ></textarea>

                    <div class="d-flex align-center ga-2 mt-2 font-mono text-caption">
                        <template v-if="jsonError">
                            <v-icon size="14" color="error">mdi-alert-circle-outline</v-icon>
                            <span class="text-error">{{ jsonError }}</span>
                        </template>
                        <template v-else>
                            <v-icon size="14" color="green">mdi-check-circle-outline</v-icon>
                            <span class="text-slate">Valid JSON &middot; {{ propertyCount }} propert{{ propertyCount === 1 ? 'y' : 'ies' }}</span>
                        </template>
                    </div>
                </div>

                <div class="pane-footer d-flex align-center ga-3 px-4 py-3">
                    <span class="font-mono text-caption text-slate flex-grow-1 d-none d-sm-inline">Ctrl + Enter to generate</span>
                    <v-btn
                        color="primary"
                        variant="flat"
                        rounded="pill"
                        class="text-none"
                        prepend-icon="mdi-cog-play-outline"
                        :disabled="!canGenerate"
                        :loading="loading"
                        @click="generateCode"
                    >
                        Generate {{ language }}
                    </v-btn>
                </div>
            </section>

            <!-- Output -->
            <section class="pane" aria-labelledby="output-label" aria-live="polite">
                <div class="pane-tab d-flex align-center ga-2 px-4 py-3">
                    <v-avatar size="16" class="lang-icon"><Devicon :icon="currentLanguage.icon" /></v-avatar>
                    <span id="output-label" class="font-mono text-caption text-light-slate flex-grow-1 text-truncate">{{ outputFileName }}</span>
                    <span v-if="!generatedCode && !loading" class="example-pill font-mono">Example</span>
                    <v-btn size="small" variant="text" color="slate" class="text-none" prepend-icon="mdi-download-outline" :disabled="!generatedCode" @click="downloadCode">
                        Download
                    </v-btn>
                    <v-btn size="small" variant="text" :color="copied ? 'green' : 'slate'" class="text-none" :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'" :disabled="!generatedCode" @click="copyCode">
                        {{ copied ? 'Copied' : 'Copy' }}
                    </v-btn>
                </div>

                <div class="pane-code">
                    <!-- Placeholder lines shaped like generated code. -->
                    <div v-if="loading" class="pa-6" aria-busy="true" aria-label="Generating code">
                        <v-skeleton-loader
                            v-for="(w, i) in skeletonLines"
                            :key="i"
                            type="text"
                            class="bone code-bone"
                            :style="{ width: `${w}%`, marginLeft: `${(i % 4) * 16}px` }"
                        />
                    </div>

                    <div v-else-if="generateError" class="d-flex flex-column align-center justify-center text-center pa-10 error-state">
                        <v-icon size="36" color="error" class="mb-3">mdi-alert-octagon-outline</v-icon>
                        <p class="text-lightest-slate font-weight-bold mb-1">Couldn't generate code</p>
                        <p class="text-body-2 text-slate mb-0">{{ generateError }}</p>
                    </div>

                    <highlightjs v-else :language="currentLanguage.hljs" :code="generatedCode || defaultResponse"></highlightjs>
                </div>

                <div class="pane-footer d-flex align-center px-4 py-3 font-mono text-caption text-slate">
                    <span class="flex-grow-1">{{ outputLines }} lines</span>
                    <span v-if="generatedAt">Generated {{ generatedAt }}</span>
                </div>
            </section>
        </div>

        <CtaPanel
            class="mt-16"
            tone="teal"
            art="editor"
            eyebrow="Related project"
            title="Generating clients from Swagger, too."
            text="ApiContractor reads swagger.json files and generates a C# API client and TypeScript response DTOs for different API providers."
        >
            <v-btn color="white" variant="flat" rounded="pill" size="large" class="text-none" to="/repo/ApiContractor">
                Explore ApiContractor
            </v-btn>
            <v-btn color="white" variant="outlined" rounded="pill" size="large" class="text-none" to="/code">
                Search my code
            </v-btn>
        </CtaPanel>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import moment from 'moment'
import apiClient from '@/api/elysianClient'

const responseName = ref('MyResponse')
const namespace = ref('MyNamespace')
const language = ref('C#')
const sampleJson = ref(JSON.stringify({ name: 'John Smith', age: 99, birthday: new Date(), email: 'name@email.com', phone: '(999)-999-9999' }, null, 2))
const generatedCode = ref('')
const generatedLanguage = ref('C#')
const generatedAt = ref('')
const generateError = ref('')
const loading = ref(false)
const copied = ref(false)

const steps = ['1 · Paste JSON', '2 · Pick a language', '3 · Copy the types']

const languages = [
    { name: 'C#', icon: 'c#', hljs: 'csharp', extension: 'cs' },
    { name: 'TypeScript', icon: 'typescript', hljs: 'typescript', extension: 'ts' },
]

// The output pane describes what's actually shown, which may be from before the language was switched.
const currentLanguage = computed(() => languages.find(l => l.name === (generatedCode.value ? generatedLanguage.value : language.value)) ?? languages[0])

const outputFileName = computed(() => `${responseName.value || 'MyResponse'}.${currentLanguage.value.extension}`)

const rules = {
    required: (value: string) => !!value || 'Required',
    identifier: (value: string) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) || 'Letters, numbers and _ only',
}

const samples = [
    {
        name: 'Person',
        description: 'Flat object',
        json: { name: 'John Smith', age: 99, birthday: '2024-02-17T00:00:00Z', email: 'name@email.com', phone: '(999)-999-9999' },
    },
    {
        name: 'Order',
        description: 'Nested object and array',
        json: {
            orderId: 1042,
            placedAt: '2026-09-24T14:05:00Z',
            customer: { id: 7, name: 'Ada Lovelace', email: 'ada@example.com' },
            items: [{ sku: 'KB-01', description: 'Mechanical keyboard', quantity: 1, unitPrice: 149.99 }],
            total: 149.99,
            isPaid: true,
        },
    },
    {
        name: 'GitHub repo',
        description: 'Real API response shape',
        json: {
            id: 764132,
            name: 'robsmitha.com',
            full_name: 'robsmitha/robsmitha.com',
            private: false,
            owner: { login: 'robsmitha', id: 1, type: 'User' },
            html_url: 'https://github.com/robsmitha/robsmitha.com',
            description: 'This website is built with VueJS and hosted as an Azure Static Web app.',
            topics: ['vue', 'azure-functions'],
            stargazers_count: 0,
            pushed_at: '2026-09-24T05:56:34Z',
        },
    },
]

// Validate as the user types so problems show before a round trip to the server.
const parsedJson = computed<{ value?: any, error?: string }>(() => {
    try {
        return { value: JSON.parse(sampleJson.value) }
    } catch (e: any) {
        return { error: sampleJson.value.trim() ? (e?.message ?? 'Invalid JSON') : 'Paste some JSON to get started' }
    }
})

const jsonError = computed(() => parsedJson.value.error ?? '')

const propertyCount = computed(() => {
    const count = (v: any): number => {
        if (Array.isArray(v)) return v.length ? count(v[0]) : 0
        if (v && typeof v === 'object') return Object.values(v).reduce((n: number, child) => n + 1 + count(child), 0)
        return 0
    }
    return count(parsedJson.value.value)
})

const canGenerate = computed(() => !jsonError.value && rules.identifier(responseName.value) === true)

const outputLines = computed(() => (generatedCode.value || defaultResponse).split('\n').length)

const skeletonLines = [38, 22, 0, 30, 52, 0, 64, 70, 44, 0, 72, 50, 0, 68, 46, 24]

function loadSample(s: { name: string, json: any }) {
    sampleJson.value = JSON.stringify(s.json, null, 2)
    responseName.value = s.name.replace(/[^A-Za-z0-9]/g, '') + 'Response'
}

function formatJson() {
    if (parsedJson.value.value !== undefined) {
        sampleJson.value = JSON.stringify(parsedJson.value.value, null, 2)
    }
}

onMounted(() => {
    generateCode()
})

async function generateCode(){
    if(!canGenerate.value || loading.value){
        return;
    }

    const codeGenerationRequest = {
        responseName: responseName.value,
        language: language.value,
        namespace: namespace.value,
        sampleJson: sampleJson.value
    }

    loading.value = true
    generateError.value = ''
    const response = await apiClient?.postData('/api/CodeGeneration', codeGenerationRequest)
    loading.value = false

    if(!response?.success){
        generateError.value = 'The server couldn\'t turn this JSON into code. Check the sample for mistakes and try again.'
        return
    }
    generatedCode.value = response?.data.code
    generatedLanguage.value = codeGenerationRequest.language
    generatedAt.value = moment().format('h:mm A')
}

async function copyCode(){
    try {
        await navigator.clipboard.writeText(generatedCode.value)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
    } catch {
        copied.value = false
    }
}

function downloadCode() {
    const blob = new Blob([generatedCode.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = outputFileName.value
    link.click()
    URL.revokeObjectURL(url)
}

const defaultResponse =
`//----------------------
// <auto-generated>
//     Generated using the NJsonSchema v11.0.0.0 (Newtonsoft.Json v13.0.0.0) (http://NJsonSchema.org)
// </auto-generated>
//----------------------


namespace MyNamespace.MyResponse
{
    #pragma warning disable // Disable all warnings

    [System.CodeDom.Compiler.GeneratedCode("NJsonSchema", "11.0.0.0 (Newtonsoft.Json v13.0.0.0)")]
    public partial class MyResponse
    {
        [Newtonsoft.Json.JsonProperty("name", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public string Name { get; set; }

        [Newtonsoft.Json.JsonProperty("age", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public int? Age { get; set; }

        [Newtonsoft.Json.JsonProperty("birthday", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public DateTime Birthday { get; set; }

        [Newtonsoft.Json.JsonProperty("email", Required = Newtonsoft.Json.Required.Default, NullValueHandling = Newtonsoft.Json.NullValueHandling.Ignore)]
        public string Email { get; set; }
    }
}`
</script>

<style scoped>
.generate-body {
    max-width: 1280px;
}

.hero-title {
    font-size: clamp(1.8rem, 2vw + 1rem, 2.6rem);
    line-height: 1.1;
}

.hero-text {
    max-width: 52ch;
    opacity: 0.82;
}

.hero-pill {
    padding: 2px 10px;
    border-radius: 999px;
    color: rgb(var(--v-theme-amber));
    border: 1px solid rgba(var(--v-theme-amber), 0.5);
}

.hero-step {
    padding: 3px 10px;
    border-radius: 999px;
    color: rgba(255, 255, 255, 0.85);
    background: rgba(0, 0, 0, 0.25);
}

.workspace {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    gap: 1.25rem;
    align-items: start;
}

.pane {
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    background: rgb(var(--v-theme-surface));
}

.pane-tab,
.pane-footer {
    background: rgba(var(--v-theme-on-surface), 0.03);
}

.pane-tab {
    border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
}

.pane-footer {
    border-top: 1px solid rgb(var(--v-theme-lightest-navy));
}

.field {
    flex: 1 1 180px;
}

.lang-toggle {
    padding: 3px;
    border-radius: 999px;
    border: 1px solid rgb(var(--v-theme-lightest-navy));
}

.lang-option {
    padding: 4px 14px;
    border-radius: 999px;
    color: rgb(var(--v-theme-slate));
    transition: color 0.15s ease, background-color 0.15s ease;
}

.lang-option:hover,
.lang-option:focus-visible {
    color: rgb(var(--v-theme-lightest-slate));
    outline: none;
}

.lang-option--active {
    color: rgb(var(--v-theme-lightest-slate));
    background: rgba(var(--v-theme-primary), 0.2);
}

/* Devicon renders its own 40px avatar; shrink it to fit. */
.lang-icon :deep(.v-avatar) {
    width: 14px !important;
    height: 14px !important;
}

.json-input {
    display: block;
    width: 100%;
    resize: vertical;
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 0.8125rem;
    line-height: 1.6;
    tab-size: 2;
    color: rgb(var(--v-theme-lightest-slate));
    background: rgb(var(--v-theme-background));
    border: 1px solid rgb(var(--v-theme-lightest-navy));
    outline: none;
    transition: border-color 0.15s ease;
}

.json-input:focus {
    border-color: rgb(var(--v-theme-primary));
}

.json-input--error,
.json-input--error:focus {
    border-color: rgb(var(--v-theme-error));
}

.pane-code {
    min-height: 520px;
    max-height: 70vh;
    overflow: auto;
    background: rgb(var(--v-theme-background));
}

.example-pill {
    font-size: 0.6875rem;
    padding: 1px 8px;
    border-radius: 999px;
    color: rgb(var(--v-theme-slate));
    background: rgba(var(--v-theme-on-surface), 0.08);
}

.error-state {
    min-height: 520px;
}

/* Placeholder bones: strip Vuetify's built-in margins and tone the color down
   (the theme's border-opacity of 1 would otherwise make every bone solid white). */
.bone {
    background: transparent;
}

.code-bone {
    height: 22px;
    display: flex;
    align-items: center;
}

.code-bone :deep(.v-skeleton-loader__text) {
    margin: 0;
    max-width: none;
    width: 100%;
    height: 10px;
    background: rgba(var(--v-theme-on-surface), 0.08);
}

@media (max-width: 960px) {
    .workspace {
        grid-template-columns: 1fr;
    }

    .pane-code,
    .error-state {
        min-height: 320px;
    }
}
</style>
