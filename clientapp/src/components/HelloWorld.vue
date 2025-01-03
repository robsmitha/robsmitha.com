<template>
  <v-parallax 
      :src="props.src" 
      :height="props.height"
      class="mt-n16 align-center"
  >
      <v-container class="text-white text-centerr">
        <v-row>
          <v-col cols="12">
            <span :class="titleClass">{{ props.title }}</span>
            <span class="text-subtitle d-block mb-6" v-html="props.subtitle"></span>
            <v-btn v-for="b in actions" :key="b.text" variant="outlined" rounded="0" :to="b.to" :href="b.href" :target="b.href ? '_blank': ''" :prepend-icon="b.icon">{{ b.text }}</v-btn>
          </v-col>
        </v-row>
      </v-container>
  </v-parallax>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)
const titleClass = computed(() => {
  return {
    'text-h1': !isMobile.value,
    'text-h2': isMobile.value,
    'd-block': true,
    'mb-4': true,
    'font-weight-thin': true
  }
})

type HeroAction = {
  text: string,
  to: string | undefined,
  href: string | undefined,
  icon: string | undefined
}

const props = defineProps({
  src: { type: String, default: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/images/md/bg-030.jpg' },
  height: { type: Number, default: 400 },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  actions: { type: Array<HeroAction>, default: [] }
})
</script>
