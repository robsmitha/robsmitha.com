<template>
    <v-footer color="grey-darken-4">
        <v-container>
            <v-row>
                <v-col md="3" cols="12" class="d-flex flex-column justify-end">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="d-block mb-2" role="img" viewBox="0 0 24 24"><title>Footer Logo</title><circle cx="12" cy="12" r="10"></circle><path d="M14.31 8l5.74 9.94M9.69 8h11.48M7.38 12l5.74-9.94M9.69 16L3.95 6.06M14.31 16H2.83m13.79-4l-5.74 9.94"></path></svg>
                    <!-- <p class="mt-2 text-grey-lighten-1">Building on the web since 2016.</p> -->
                    <div v-if="!$vuetify.display.mobile" class="d-flex align-center mt-auto">
                        <v-icon size="small" class="mr-1">mdi-copyright</v-icon>
                        {{ new Date().getFullYear() }}
                    </div>
                </v-col>
                <v-col md="3" cols="12">
                    <v-list bg-color="transparent" density="compact">
                        <v-list-subheader color="grey-lighten-1">Pages</v-list-subheader>
                        <v-list-item :active="false" title="Home" value="home" to="/"></v-list-item>
                        <v-list-item :active="false" title="Search Code" value="code" to="/code"></v-list-item>
                        <v-list-item :active="false" title="Generate Code" value="generate-code" to="/generate-code"></v-list-item>
                        <v-list-item :active="false" title="Congress Feed" value="congress" to="/congress"></v-list-item>
                    </v-list>
                </v-col>
                <v-col md="3" cols="12">
                    <v-list bg-color="transparent" density="compact">
                        <v-list-subheader color="grey-lighten-1">External Links</v-list-subheader>
                        <v-list-item title="GitHub" href="https://github.com/robsmitha" target="_blank"></v-list-item>
                        <v-list-item title="LinkedIn" href="https://www.linkedin.com/in/robsmitha/" target="_blank"></v-list-item>
                        <v-list-item title="Resume" href="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/files/Rob+Smitha+Resume.pdf" target="_blank"></v-list-item>
                    </v-list>
                </v-col>
                <v-col md="3" cols="12">
                    <v-list bg-color="transparent" density="compact">
                        <template v-if="!auth.signedIn">
                            <v-list-item subtitle="Sign in"></v-list-item>
                            <v-list-item v-if="!auth.signedIn" prepend-icon="mdi-github" title="Github" href="/.auth/login/github"></v-list-item>
                            <v-list-item v-if="!auth.signedIn" prepend-icon="mdi-microsoft" title="Microsoft" href="/.auth/login/aad"></v-list-item>
                        </template>
                        <template v-else>
                            <v-list-item :subtitle="auth.userDetails"></v-list-item>
                            <v-list-item title="Users" to="/users"></v-list-item>
                            <v-list-item title="Products" to="/products"></v-list-item>
                            <v-list-item title="Spending" to="/spending"></v-list-item>
                            <v-list-item title="Accounts" to="/accounts"></v-list-item>
                            <!-- <v-list-item title="Logout" href="/.auth/logout"></v-list-item> -->
                        </template>
                    </v-list>
                </v-col>
            </v-row>
        </v-container>
    </v-footer>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/store/auth"
const auth = useAuthStore()
</script>