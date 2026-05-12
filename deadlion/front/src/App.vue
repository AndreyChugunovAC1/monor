<template>
  <div class="base">
    <div class="frame">
      <Suspense>
        <RouterView />
        <template #fallback>
          <div>Loading...</div>
        </template>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style>
@import 'styles/styles.css';
</style>