<template>
    <v-row>
        <v-col>
            <span class="text-caption text-grey-darken-2 d-block">
                {{ props.overline }}
            </span>
            <span class="text-h4 d-block">
                {{ props.title }}
            </span>
            <span class="text-subtitle-1 text-grey-darken-1 font-weight-thin d-block">
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