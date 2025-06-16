<template>
  <v-app>
    <DefaultLayout v-if="$route.path !== '/login'">
      <router-view />
    </DefaultLayout>
    <router-view v-else />
  </v-app>
</template>

<script setup>
import DefaultLayout from '@/components/layout/DefaultLayout.vue'
</script>
