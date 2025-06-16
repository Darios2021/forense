<template>
    <v-list-item>
      <v-list-item-content>
        <v-list-item-title class="font-weight-bold">{{ label }}</v-list-item-title>
        <v-list-item-subtitle>
          <template v-if="link && value">
            <a :href="value" target="_blank" class="text--secondary">{{ value }}</a>
          </template>
          <template v-else>
            {{ value }}
          </template>
        </v-list-item-subtitle>
      </v-list-item-content>
    </v-list-item>
  </template>
  
  <script>
  export default {
    name: 'ListItem',
    props: {
      label: { type: String, required: true },
      value: { type: [String, Number], default: '' },
      link:  { type: Boolean, default: false }
    }
  }
  </script>
  