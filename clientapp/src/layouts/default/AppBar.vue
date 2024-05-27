<template>
    <v-app-bar 
      :color="!drawer && transparency ? 'transparent' : 'white'" 
      :class="{
        'text-white': !drawer && transparency
      }" 
      flat
      fixed
    >
      <template #prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title class="text-h6 text-uppercase font-weight-medium">
        Rob Smitha
      </v-app-bar-title>
        
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        temporary
    >
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-home-roof" title="Home" value="home" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-certificate-outline" title="Resume" value="about" to="/about"></v-list-item>
        <v-list-item prepend-icon="mdi-bug-outline" title="Code" value="code" to="/code"></v-list-item>
        <v-list-item prepend-icon="mdi-town-hall" title="Bills" value="bills" to="/bills"></v-list-item>

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
import { useRoute } from 'vue-router'
const route = useRoute()

const store = useAppStore()
store.fetchContent()

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
</script>
