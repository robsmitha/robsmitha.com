<template>
    <v-dialog
      v-model="dialog"
      scrollable
      transition="dialog-bottom-transition"
      fullscreen
    >
      <v-card>
        <v-toolbar color="grey-darken-4">
            <v-btn
                icon="mdi-close"
                @click="dialog = false"
            ></v-btn>
            <v-toolbar-title>
                <span class="font-weight-medium">{{ item?.name }}</span>
            </v-toolbar-title>
            <template v-if="!$vuetify.display.mobile">
                <v-spacer />
                <v-toolbar-items>
                    <v-chip label class="mt-3 mr-3 font-weight-medium" :href="`https://github.com/robsmitha/${item?.repo_name}`" target="_blank">
                        <v-icon small>mdi-github</v-icon>&nbsp;{{ item?.repo_name }}
                    </v-chip>
                </v-toolbar-items>
            </template>
        </v-toolbar>
        <v-card-text class="bg-grey-lighten-4 pa-0">
            <template v-if="loading">
                <v-skeleton-loader color="grey-lighten-4 pa-0" v-for="i in 7" :key="i" type="paragraph">
                </v-skeleton-loader>
            </template>
            <highlightjs
                v-else
                autodetect
                :code="dialogContents"
            />
        </v-card-text>
        <v-card-title class="pa-0">
            <v-list density="compact" class="py-0">
                <v-list-item :href="item?.html_url" target="_blank">
                    <v-list-item-subtitle>
                        See {{ item?.name }} on GitHub
                    </v-list-item-subtitle>
                    <template v-slot:append>
                        <v-icon size="small">mdi-github</v-icon>
                    </template>
                </v-list-item>
            </v-list>
        </v-card-title>
      </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps(['open', 'loading', 'item', 'dialogContents'])
const emit = defineEmits(['close'])

const dialog = computed({
  get() {
    return props.open
  },
  set(newValue) {
    if(!newValue){
        emit('close')
    }
  }
})
</script>