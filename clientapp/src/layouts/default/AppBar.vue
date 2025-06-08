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
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <!-- <v-avatar
          size="50"
          @click="onBrandClick"
          >
          <v-btn icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="text-white" role="img" viewBox="0 0 24 24"><title>Go Home</title><circle cx="12" cy="12" r="10"></circle><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83m13.79-4l-5.74 9.94"></path></svg>
          </v-btn>
        </v-avatar> -->
      </template>

      <v-app-bar-title class="text-h6 ">
        robsmitha.com
      </v-app-bar-title>
        
      <template #append>
        <v-menu
          v-model="menu"
          location="bottom"
        >
          <template v-slot:activator="{ props }">
            <v-avatar
              v-if="auth.signedIn"
              size="35"
              color="white"
              class="mr-2"
              v-bind="props"
              >
              <v-btn icon>
                <span class="text-h5 font-weight-bold">
                  {{ auth.userDetails?.charAt(0)?.toUpperCase() }}
                </span>
              </v-btn>
            </v-avatar>
          </template>

          <v-card min-width="300">
            <v-list>
              <v-list-item>
                <!-- <template v-slot:append>
                  <v-btn
                    icon="mdi-cog"
                    variant="text"
                  ></v-btn>
                </template> -->
                <v-list-item-subtitle>
                  {{ auth.userDetails }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list density="compact">
              <v-list-item prepend-icon="mdi-account-group" title="Users" to="/users"></v-list-item>
              <v-list-item prepend-icon="mdi-tag-multiple" title="Products" to="/products"></v-list-item>
              <v-list-item prepend-icon="mdi-currency-usd" title="Spending" to="/spending"></v-list-item>
              <v-list-item prepend-icon="mdi-bank" title="Accounts" to="/accounts"></v-list-item>
            </v-list>
            
            <v-divider></v-divider>

            <v-card-actions>
              <v-btn block color="blue-grey" href="/.auth/logout">
                Logout
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        temporary
        location="left"
    >
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-home-roof" title="Home" value="home" to="/"></v-list-item>

        <v-list-item subtitle="Features"></v-list-item>
        <!-- <v-list-item prepend-icon="mdi-certificate-outline" title="Resume" value="about" href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf"></v-list-item> -->
        <v-list-item prepend-icon="mdi-magnify" title="Search Code" value="code" to="/code"></v-list-item>
        <v-list-item prepend-icon="mdi-rocket-launch-outline" title="Generate Code" value="generate-code" to="/generate-code"></v-list-item>
        <v-list-item prepend-icon="mdi-rss" title="Congress Feed" value="congress" to="/congress"></v-list-item>

        <v-list-item subtitle="External Links"></v-list-item>
        <v-list-item prepend-icon="mdi-github" title="GitHub" href="https://github.com/robsmitha" target="_blank"></v-list-item>
        <v-list-item prepend-icon="mdi-linkedin" title="LinkedIn" href="https://www.linkedin.com/in/robsmitha/" target="_blank"></v-list-item>
        <v-list-item prepend-icon="mdi-file-pdf-box" title="Resume" href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf" target="_blank"></v-list-item>
        <!-- <v-list-item prepend-icon="mdi-desktop-classic" title="robsmitha.github.io" href="https://robsmitha.github.io/" target="_blank"></v-list-item> -->


        <template v-if="!auth.signedIn">
          <v-list-item subtitle="Sign in"></v-list-item>
          <v-list-item prepend-icon="mdi-github" title="Github" href="/.auth/login/github"></v-list-item>
          <v-list-item prepend-icon="mdi-microsoft" title="Microsoft" href="/.auth/login/aad"></v-list-item>
        </template>
        <!-- <template v-else>
          <v-list-item :subtitle="auth.userDetails"></v-list-item>
          <v-list-item prepend-icon="mdi-account-group" title="Users" to="/users"></v-list-item>
          <v-list-item prepend-icon="mdi-tag-multiple" title="Products" to="/products"></v-list-item>
          <v-list-item prepend-icon="mdi-currency-usd" title="Spending" to="/spending"></v-list-item>
          <v-list-item prepend-icon="mdi-bank" title="Accounts" to="/accounts"></v-list-item>
        </template> -->
      </v-list>
      <!-- <template v-slot:append>
        <div v-if="auth.signedIn" class="pa-2">
          <v-btn block color="blue-grey" href="/.auth/logout">
            Logout
          </v-btn>
        </div>
      </template> -->
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useAppStore } from "@/store/app"
import { useAuthStore } from "@/store/auth"
import { useRoute, useRouter } from 'vue-router'
import { useGoTo } from 'vuetify'
import { useGithubStore } from "@/store/github"
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()
const route = useRoute()
const router = useRouter()
const goTo = useGoTo()

const store = useAppStore()
//store.fetchContent()

const gitHubStore = useGithubStore()
gitHubStore.fetchRepos()

const auth = useAuthStore()
auth.fetchAuth()

const drawer = ref(false)
const transparency = ref(false)
const menu = ref(false)

const isMobile = computed(() => mobile.value)

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
