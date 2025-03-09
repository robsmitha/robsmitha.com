<template>
    <v-app-bar 
      id="navTop"
      :color="!drawer && transparency ? 'transparent' : 'black'" 
      :class="{
        'text-white': !drawer && transparency
      }" 
      flat
      fixed
    >
      <template #prepend>
        <v-avatar
          size="50"
          @click="onBrandClick"
          >
          <v-img
              src="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/images/robsmitha-avatar-2.png"
              alt="Rob Smitha"
              aspect-ratio="1"
          ></v-img>
          <!-- <v-icon color="white">mdi-hand-wave-outline</v-icon> -->
        </v-avatar>
      </template>

      <v-app-bar-title class="text-h6 text-uppercase font-weight-medium">
        Rob Smitha
      </v-app-bar-title>
        
      <template #append>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        temporary
        location="right"
    >
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-home-roof" title="Home" value="home" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-certificate-outline" title="Resume" value="about" href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf"></v-list-item>
        <v-list-item prepend-icon="mdi-magnify" title="Search Code" value="code" to="/code"></v-list-item>
        <v-list-item prepend-icon="mdi-rocket-launch-outline" title="Generate Code" value="generate-code" to="/generate-code"></v-list-item>
        <v-list-item prepend-icon="mdi-rss" title="Congress Feed" value="congress" to="/congress"></v-list-item>

        <v-list-item subtitle="External Links"></v-list-item>
        <v-list-item prepend-icon="mdi-github" title="GitHub" href="https://github.com/robsmitha" target="_blank"></v-list-item>
        <v-list-item prepend-icon="mdi-linkedin" title="LinkedIn" href="https://www.linkedin.com/in/robsmitha/" target="_blank"></v-list-item>
        <v-list-item prepend-icon="mdi-file-pdf-box" title="Résumé" href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf" target="_blank"></v-list-item>
        <v-list-item prepend-icon="mdi-desktop-classic" title="robsmitha.github.io" href="https://robsmitha.github.io/" target="_blank"></v-list-item>

        <v-list-item :subtitle="auth.signedIn ? auth.userDetails : 'Sign in'"></v-list-item>
        <v-list-item v-if="!auth.signedIn" prepend-icon="mdi-github" title="Github" href="/.auth/login/github"></v-list-item>
        <v-list-item v-if="!auth.signedIn" prepend-icon="mdi-microsoft" title="Microsoft" href="/.auth/login/aad"></v-list-item>
        <v-list-item v-if="auth.signedIn" prepend-icon="mdi-logout" title="Sign out" href="/.auth/logout"></v-list-item>
      </v-list>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useAppStore } from "@/store/app"
import { useAuthStore } from "@/store/auth"
import { useRoute, useRouter } from 'vue-router'
import { useGoTo } from 'vuetify'

const route = useRoute()
const router = useRouter()
const goTo = useGoTo()

const store = useAppStore()
//store.fetchContent()

const auth = useAuthStore()
auth.fetchAuth()

const drawer = ref(false)
const transparency = ref(false)

watch(route, (newVal) => {
    transparency.value = newVal.path === '/'
}, { immediate: true })

onMounted(() =>{
  window.addEventListener('scroll', () => {
    transparency.value = route.path === '/' && window.scrollY <= 75
  })
})

function onBrandClick(){
  if(route.path === '/'){
      goTo('#navTop', { duration: 300, easing: 'easeInCubic' })
  }
  else{
      router.push({ path: '/' })
  }
}
</script>
