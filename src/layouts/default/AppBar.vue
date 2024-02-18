<template>
  <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
  >
    <v-list-item
      prepend-icon="mdi-food"
      title="Menu"
    ></v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-home-outline" title="Home" value="home"></v-list-item>
      <v-list-item prepend-icon="mdi-information-outline" title="About" value="about"></v-list-item>
    </v-list>
  </v-navigation-drawer>
  <v-app-bar
    clipped-right
    app
    flat
  >
  <v-app-bar-title>
    <v-icon>mdi-hand-wave-outline</v-icon>
  </v-app-bar-title>
    <v-spacer></v-spacer>
    <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      drawer: null,
    }
  }
});
</script>
