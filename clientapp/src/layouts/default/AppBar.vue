<template>
    <v-app-bar
      id="navTop"
      :color="!drawer && transparency ? 'transparent' : 'background'"
      :class="[
        'text-lightest-slate',
        { 'nav-solid': drawer || !transparency }
      ]"
      flat
      fixed
    >
      <template #prepend>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>
        <span class="font-mono text-subtitle-1 cursor-pointer" @click="onBrandClick">
          <span :class="{ 'text-white': transparency, 'text-primary': !transparency }">rob</span><span class="text-lightest-slate">smitha.com</span>
        </span>
      </v-app-bar-title>

      <!-- <ul v-if="!isMobile" class="d-flex align-center ga-6 nav-links pl-0 mr-6">
        <li v-for="(link, i) in navLinks" :key="link.text">
          <router-link :to="link.to" class="font-mono text-body-2 text-lightest-slate nav-link">
            <span class="text-primary">{{ String(i + 1).padStart(2, '0') }}.</span> {{ link.text }}
          </router-link>
        </li>
      </ul> -->

      <template #append>
        <template v-if="!isMobile">
          <v-btn
            icon="mdi-github"
            variant="text"
            href="https://github.com/robsmitha"
            target="_blank"
            aria-label="GitHub"
          ></v-btn>
          <v-btn
            icon="mdi-linkedin"
            variant="text"
            href="https://www.linkedin.com/in/robsmitha/"
            target="_blank"
            aria-label="LinkedIn"
          ></v-btn>
        </template>
        <v-btn
          v-if="!auth.signedIn"
          variant="outlined"
          color="white"
          rounded="pill"
          class="text-none ml-2"
          prepend-icon="mdi-login"
          href="/.auth/login/aad"
        >
          Sign in
        </v-btn>

        <!-- Account menu: who's signed in, admin tools, and sign out. -->
        <v-menu
          v-else
          v-model="menu"
          location="bottom end"
          offset="10"
        >
          <template v-slot:activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="account-trigger d-flex align-center ga-2 ml-2"
              :class="{ 'account-trigger--open': menu, 'account-trigger--wide': !isMobile }"
              :aria-label="`Account menu for ${auth.userDetails}`"
            >
              <span class="account-avatar account-avatar--small font-weight-bold">{{ initials }}</span>
              <v-icon v-if="!isMobile" size="16" class="account-chevron">mdi-chevron-down</v-icon>
            </button>
          </template>

          <v-card class="account-menu" color="surface" rounded="lg" width="320">
            <div class="account-header d-flex align-center ga-3 pa-4">
              <span class="account-avatar font-weight-bold flex-shrink-0">{{ initials }}</span>
              <div class="min-width-0">
                <span class="text-lightest-slate font-weight-bold d-block text-truncate">{{ auth.userDetails }}</span>
                <span class="font-mono text-caption text-slate d-flex align-center ga-1">
                  <v-icon size="12">{{ providerIcon }}</v-icon>
                  Signed in with {{ providerName }}
                </span>
              </div>
            </div>

            <v-divider color="lightest-navy" />

            <p class="menu-label font-mono text-caption text-uppercase px-4 pt-3 pb-1 mb-0">Admin</p>
            <nav class="px-2 pb-2" aria-label="Admin">
              <router-link
                v-for="link in adminLinks"
                :key="link.to"
                :to="link.to"
                class="menu-link d-flex align-center ga-3 px-2 py-2"
                active-class="menu-link--active"
                :style="{ '--accent': `var(--v-theme-${link.color})` }"
                @click="menu = false"
              >
                <span class="menu-icon flex-shrink-0"><v-icon size="18">{{ link.icon }}</v-icon></span>
                <span class="min-width-0">
                  <span class="text-lightest-slate text-body-2 d-block">{{ link.title }}</span>
                  <span class="text-slate text-caption d-block">{{ link.description }}</span>
                </span>
              </router-link>
            </nav>

            <v-divider color="lightest-navy" />

            <!-- A GitHub token raises the code search rate limit. -->
            <div class="d-flex align-center ga-3 px-4 py-3">
              <v-icon size="18" class="text-slate">mdi-github</v-icon>
              <span class="flex-grow-1 min-width-0">
                <span class="text-light-slate text-body-2 d-block">GitHub</span>
                <span class="font-mono text-caption" :class="auth.hasValidAccessToken ? 'text-green' : 'text-slate'">
                  {{ auth.hasValidAccessToken ? 'Connected for code search' : 'Not connected' }}
                </span>
              </span>
              <v-btn
                v-if="!auth.hasValidAccessToken"
                size="small"
                variant="outlined"
                color="primary"
                rounded="pill"
                class="text-none"
                :loading="connecting"
                @click="connectGitHub"
              >
                Connect
              </v-btn>
            </div>

            <v-divider color="lightest-navy" />

            <a href="/.auth/logout" class="menu-link menu-link--signout d-flex align-center ga-3 px-4 py-3">
              <v-icon size="18">mdi-logout</v-icon>
              <span class="text-body-2">Sign out</span>
            </a>
          </v-card>
        </v-menu>
      </template>
    </v-app-bar>

    <v-navigation-drawer
        v-model="drawer"
        temporary
        location="left"
        color="surface"
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


        <!-- <template v-if="!auth.signedIn">
          <v-list-item subtitle="Sign in"></v-list-item>
          <v-list-item prepend-icon="mdi-github" title="Github" href="/.auth/login/github"></v-list-item>
          <v-list-item prepend-icon="mdi-microsoft" title="Microsoft" href="/.auth/login/aad"></v-list-item>
        </template> -->
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
import elysianClient from '@/api/elysianClient'

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

const adminLinks = [
  { title: 'Users', description: 'Access control and permissions', icon: 'mdi-account-group-outline', to: '/users', color: 'info' },
  { title: 'Products', description: 'Merchant catalog', icon: 'mdi-tag-multiple-outline', to: '/products', color: 'violet' },
  { title: 'Accounts', description: 'Linked banks and income', icon: 'mdi-bank-outline', to: '/accounts', color: 'green' },
  { title: 'Spending', description: 'Budgets and estimates', icon: 'mdi-wallet-outline', to: '/spending', color: 'primary' },
]

const initials = computed(() => {
  const name = auth.userDetails ?? ''
  const parts = name.split(/[\s@._-]+/).filter(Boolean)
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?'
})

const providerName = computed(() => {
  switch (auth.identityProvider) {
    case 'aad': return 'Microsoft'
    case 'github': return 'GitHub'
    default: return auth.identityProvider ?? 'your account'
  }
})

const providerIcon = computed(() => auth.identityProvider === 'github' ? 'mdi-github' : 'mdi-microsoft')

const connecting = ref(false)

async function connectGitHub() {
  connecting.value = true
  const response = await elysianClient.getData('/api/GitHubOAuthUrl')
  if (response?.success && response.data?.oAuthUrl) {
    window.location = response.data.oAuthUrl
    return
  }
  connecting.value = false
}

// const navLinks = [
//   { text: 'Projects', to: { path: '/', hash: '#projects' } },
//   { text: 'Features', to: { path: '/', hash: '#features' } },
// ]

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

<style scoped>
:deep(.nav-solid) {
  background-color: rgb(var(--v-theme-background)) !important;
  border-bottom: 1px solid rgb(var(--v-theme-lightest-navy));
  box-shadow: 0 10px 30px -10px rgba(2, 12, 27, 0.5) !important;
}

.account-trigger {
  padding: 3px;
  border-radius: 999px;
  border: 1px solid rgb(var(--v-theme-lightest-navy));
  background: rgba(var(--v-theme-surface), 0.6);
  color: rgb(var(--v-theme-slate));
  transition: border-color 0.15s ease;
}

.account-trigger--wide {
  padding-right: 8px;
}

.account-trigger:hover,
.account-trigger:focus-visible,
.account-trigger--open {
  border-color: rgb(var(--v-theme-primary));
  outline: none;
}

.account-chevron {
  transition: transform 0.2s ease;
}

.account-trigger--open .account-chevron {
  transform: rotate(180deg);
}

/* Initials on a Darcula-colored gradient ring. */
.account-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-lightest-slate));
  background:
    linear-gradient(rgb(var(--v-theme-surface-bright)), rgb(var(--v-theme-surface-bright))) padding-box,
    linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-violet)), rgb(var(--v-theme-info))) border-box;
  border: 2px solid transparent;
}

.account-avatar--small {
  width: 30px;
  height: 30px;
  font-size: 0.75rem;
}

.account-menu {
  border: 1px solid rgb(var(--v-theme-lightest-navy));
  box-shadow: 0 24px 48px -16px rgba(0, 0, 0, 0.7) !important;
}

.account-header {
  background: radial-gradient(120% 140% at 0% 0%, rgba(var(--v-theme-violet), 0.14), transparent 60%);
}

.min-width-0 {
  min-width: 0;
}

.menu-label {
  color: rgb(var(--v-theme-slate));
  letter-spacing: 0.08em;
}

.menu-link {
  text-decoration: none;
  border-radius: 8px;
  color: rgb(var(--v-theme-light-slate));
  transition: background-color 0.15s ease;
}

.menu-link:hover,
.menu-link:focus-visible {
  background: rgba(var(--v-theme-on-surface), 0.05);
  outline: none;
}

.menu-link--active {
  background: rgba(var(--accent), 0.1);
}

.menu-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--accent));
  background: rgba(var(--accent), 0.14);
}

.menu-link--signout {
  border-radius: 0;
  color: rgb(var(--v-theme-error));
}

.menu-link--signout:hover {
  background: rgba(var(--v-theme-error), 0.08);
}

.cursor-pointer {
  cursor: pointer;
}

.nav-links {
  list-style: none;
}

.nav-link {
  text-decoration: none;
  padding-bottom: 2px;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease, opacity 0.2s ease;
  opacity: 0.85;
}

.nav-link:hover {
  opacity: 1;
  border-color: rgb(var(--v-theme-primary));
}
</style>
