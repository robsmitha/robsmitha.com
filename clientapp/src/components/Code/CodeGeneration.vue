<template>
    <v-navigation-drawer
        location="left"
        permanent
        color="light-navy"
        :rail="collapsed"
        class="generate-drawer"
      >
        <template v-slot:prepend>
          <v-list-item
                lines="two"
                :class="{ 'pl-2': collapsed }"
            >
                <template v-slot:prepend>
                    <v-avatar color="surface" class="ml-2">
                        <v-icon color="primary" :size="collapsed ? 'xsmall': 'large'">mdi-rocket-launch-outline</v-icon>
                    </v-avatar>
                </template>
                <template v-if="!collapsed" v-slot:title>
                    <span class="text-lightest-slate font-weight-bold">Generate Code</span>
                </template>
                <template v-if="!collapsed" v-slot:subtitle>
                    <span class="font-mono text-primary text-caption text-uppercase">Beta</span>
                </template>
            </v-list-item>
        </template>

        <v-divider color="lightest-navy"></v-divider>
        <v-form
            v-if="!collapsed"
            v-model="form"
            @submit.prevent="generateCode"
        >
            <v-list density="compact" nav>
                <v-list-item>
                    <v-text-field
                        v-model="responseName"
                        label="Response Name"
                        hint="Enter name of response"
                        :rules="[rules.required]"
                        persistent-hint
                        variant="outlined"
                        color="primary"
                        base-color="slate"
                        class="font-mono mt-3"
                    ></v-text-field>
                </v-list-item>
                <v-list-item>
                    <v-select
                        v-model="language"
                        :items="['C#', 'TypeScript']"
                        hint="Select language"
                        persistent-hint
                        variant="outlined"
                        color="primary"
                        base-color="slate"
                        class="font-mono mt-3"
                    ></v-select>
                </v-list-item>
                <v-list-item>
                    <v-text-field
                        v-model="namespace"
                        label="Namespace"
                        hint="Enter the namespace"
                        persistent-hint
                        variant="outlined"
                        color="primary"
                        base-color="slate"
                        class="font-mono mt-3"
                    ></v-text-field>
                </v-list-item>
                <v-list-item>
                    <v-textarea
                        v-model="sampleJson"
                        label="Sample JSON"
                        variant="outlined"
                        color="primary"
                        base-color="slate"
                        rows="8"
                        hint="Enter sample json"
                        :rules="[rules.required]"
                        persistent-hint
                        class="font-mono mt-3"
                    ></v-textarea>
                </v-list-item>
            </v-list>

            <v-btn
                :disabled="!form"
                :loading="loading"
                class="font-mono text-none mx-4"
                style="width: calc(100% - 32px);"
                type="submit"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-cog-play-outline"
                >
                Generate
            </v-btn>
        </v-form>
        <v-btn
            :disabled="!generatedCode"
            class="font-mono text-none mx-4 mt-2"
            style="width: calc(100% - 32px);"
            type="submit"
            variant="text"
            color="primary"
            @click="copyCode"
            >
            <span v-if="!collapsed">
                <v-icon start size="16">mdi-content-copy</v-icon>Copy
            </span>
            <v-icon v-else>mdi-content-copy</v-icon>
        </v-btn>


        <template v-slot:append>
          <v-divider color="lightest-navy"></v-divider>
          <v-list-item
                :class="{ 'pl-2': collapsed }"
            >
                <template v-slot:append>
                    <v-btn
                        :icon="collapsed ? 'mdi-arrow-collapse-right' : 'mdi-arrow-collapse-left'"
                        variant="text"
                        color="slate"
                        size="small"
                        class="ml-0"
                        @click="collapsed = !collapsed"
                    ></v-btn>
                </template>
            </v-list-item>
        </template>
    </v-navigation-drawer>

    <v-sheet color="background">
        <div class="code-scroll" style="overflow: auto;">
            <template v-if="loading">
                <v-skeleton-loader color="surface" class="pa-4" v-for="i in 7" :key="i" type="paragraph">
                </v-skeleton-loader>
            </template>
            <highlightjs
            v-else-if="generatedCode"
            autodetect
            :code="generatedCode"></highlightjs>
            <highlightjs
            v-else
            autodetect
            :code="defaultResponse"></highlightjs>
        </div>
    </v-sheet>
    <v-snackbar
      v-model="snackbar"
      color="surface"
    >
      <span class="font-mono text-body-2 text-lightest-slate">{{ snackbarText }}</span>

      <template v-slot:actions>
        <v-btn
          color="primary"
          variant="text"
          class="font-mono text-none"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import apiClient from '@/api/elysianClient'

const { mobile } = useDisplay();
const isMobile = computed(() => mobile.value);

const responseName = ref('MyResponse')
const namespace = ref('MyNamespace')
const language = ref('C#')
const sampleJson = ref(JSON.stringify({ name: 'John Smith', age: 99, birthday: new Date(), email: 'name@email.com', phone: '(999)-999-9999' }))
const generatedCode = ref('')
const loading = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const collapsed = ref(false)
const form = ref(false)
const rules = {
    required: (value: string) => !!value || 'Field is required',
};
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

onMounted(() => {
    collapsed.value = isMobile.value
    generateCode()
})

async function generateCode(){
    if(!form.value){
        return;
    }

    const codeGenerationRequest = {
        responseName: responseName.value,
        language: language.value,
        namespace: namespace.value,
        sampleJson: sampleJson.value
    }

    loading.value = true
    const response = await apiClient?.postData('/api/CodeGeneration', codeGenerationRequest)

    if(!response?.success){
        loading.value = false
        snackbar.value = true
        snackbarText.value = `An error occurred generating code. Please review sample json for correctness.`
        return
    }
    loading.value = false
    generatedCode.value = response?.data.code
}

function copyCode(){
    navigator.clipboard.writeText(generatedCode.value)
    snackbar.value = true
    snackbarText.value = `Copied to clipboard`
}

</script>

<style scoped>
.generate-drawer :deep(.v-navigation-drawer__border) {
    background-color: rgb(var(--v-theme-lightest-navy));
    opacity: 1;
}

.code-scroll {
    min-height: 100vh;
}
</style>
