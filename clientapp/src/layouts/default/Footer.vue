<template>
    <v-sheet>
        <v-container>
            <v-footer>
                <v-row class="mb-3">
                    <v-col md="3" cols="12">
                        <v-img
                            alt="Logo with Code Lines"
                            src="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/unDraw/undraw_code.svg"
                            :height="30"
                            :width="30"
                        ></v-img>
                        <div class="mt-2">
                            {{ new Date().getFullYear() }}
                        </div>
                    </v-col>
                    <v-col md="3" cols="12">
                        <v-list density="compact">
                            <v-list-subheader>{{ store.signedIn ? 'Account' : 'Sign in' }}</v-list-subheader>
                            <v-list-item v-if="!store.signedIn" title="GitHub" href=".auth/login/github"></v-list-item>
                            <v-list-item v-if="!store.signedIn" title="Microsoft" href=".auth/login/aad"></v-list-item>
                            <v-list-item v-if="store.signedIn" title="Sign out" href=".auth/logout"></v-list-item>
                        </v-list>
                    </v-col>
                    <v-col md="3" cols="12">
                        <v-list density="compact">
                            <v-list-subheader>Pages</v-list-subheader>
                            <v-list-item :active="false" title="Home" value="home" to="/"></v-list-item>
                            <v-list-item :active="false" title="Career" value="about" to="/about"></v-list-item>
                            <v-list-item :active="false" title="Code" value="code" to="/code"></v-list-item>
                        </v-list>
                    </v-col>
                    <v-col md="3" cols="12">
                        <v-list density="compact">
                            <v-list-subheader>External Links</v-list-subheader>
                            <v-list-item title="GitHub" href="https://github.com/robsmitha" target="_blank"></v-list-item>
                            <v-list-item title="LinkedIn" href="https://www.linkedin.com/in/robsmitha/" target="_blank"></v-list-item>
                            <v-list-item title="Résumé" href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf" target="_blank"></v-list-item>
                            <v-list-item title="Projects" href="https://robsmitha.github.io/" target="_blank"></v-list-item>
                        </v-list>
                    </v-col>
                </v-row>
            </v-footer>
        </v-container>
    </v-sheet>
</template>

<script setup lang="ts">
import { useAppStore } from "@/store/app"
const store = useAppStore()
</script>