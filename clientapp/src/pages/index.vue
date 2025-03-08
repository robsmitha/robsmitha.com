<template>
  <HelloWorld title="Hey, I'm Rob" :subtitle="store.user?.bio ?? 'Building things on the web since 2016.'" :actions="actions" />

  <v-sheet color="grey-lighten-4" class="py-5">
      <v-container>
          <v-row>
              <v-col cols="12">
                  <span :class="titleClass">
                      <span v-if="isMobile">
                        Projects I've cooked on.
                      </span>
                      <span v-else>
                        See some GitHub projects I've cooked up.
                      </span>
                      <v-icon>mdi-silverware-spoon</v-icon>
                  </span>
              </v-col>
          </v-row>
      </v-container>
  </v-sheet>
  
  <v-container id="projects" class="py-7">
    <Repos />
  </v-container>

  <v-sheet color="grey-lighten-4" class="py-5">
      <v-container>
          <v-row>
              <v-col cols="12">
                  <span :class="titleClass">
                      Don't write code? Explore the demo features below.
                  </span>
              </v-col>
          </v-row>
      </v-container>
  </v-sheet>

  <Features />

</template>

<script lang="ts" setup>
import { useGithubStore } from "@/store/github"
import { computed } from 'vue'
import { useDisplay } from 'vuetify'


const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const titleClass = computed(() => {
    return {
        'text-h4': !isMobile.value,
        'text-h5': isMobile.value,
        'font-weight-thin': true
    }
})

const store = useGithubStore()
store.fetchUser()

const actions = [
  { text: 'Resume', href: 'https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf'}
]
</script>
