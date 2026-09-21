<template>
    <v-row>
        <v-col>
            <span class="font-mono text-primary text-caption text-uppercase d-block">
                {{ props.overline }}
            </span>
            <span class="text-lightest-slate text-h4 font-weight-bold d-block">
                {{ props.title }}
            </span>
            <span class="text-slate text-subtitle-1 font-weight-light d-block">
                {{ props.subtitle }}
            </span>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
const props = defineProps({
  overline: { type: String },
  title: { type: String },
  subtitle: { type: String }
})
</script>