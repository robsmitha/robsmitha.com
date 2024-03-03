<template>
  <v-container>
    <v-row>
      <v-col md="4">
        <v-img 
          :width="300"
          aspect-ratio="4/3"
          cover
          src="https://smitha-cdn.s3.us-east-2.amazonaws.com/Content/unDraw/undraw_barbecue_3x93.svg">
        </v-img>
      </v-col>
      <v-col md="8">
        <h1 class="pb-4">Welcome</h1>
        <div class="mb-2">👋 Hello World, thanks for stopping by! I don’t have much content yet but here is some information about the site.</div>
        <div class="mb-2">💻 This website is built with VueJS and hosted as an Azure Static Web app. The page content is served from a headless CMS (WordPress) and the site deployment is handled with Github Actions.</div>
      </v-col>
    </v-row>
 </v-container>
</template>

<script setup lang="ts">
</script>
