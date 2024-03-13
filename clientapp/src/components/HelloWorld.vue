<template>
  <v-parallax 
      :src="props.src" 
      :height="props.height"
      class="mt-n16"
  >
      <v-overlay v-model="display" contained class="align-center justify-center text-white">
          <div>
              <span class="text-h3 d-flex">{{ props.text }}</span>
              <br />
              <div class="text-center">
                <v-btn v-for="b in actions" :key="b.text" variant="text" :to="b.to" :href="b.href" :target="b.href ? '_blank': ''">{{ b.text }}</v-btn>
              </div>
          </div>
      </v-overlay>
  </v-parallax>
</template>

<script setup lang="ts">
type HeroAction = {
  text: string,
  to: string | undefined,
  href: string | undefined
}

let display = true
const props = defineProps({
  src: { type: String, default: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/images/palm-trees-min.jpg' },
  height: { type: Number, default: 400 },
  text: { type: String, required: true },
  actions: { type: Array<HeroAction>, default: [] }
})
</script>
