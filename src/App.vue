<script setup>
import { useCounterStore } from '@/stores/counter'
const countStore = useCounterStore()
</script>

<template>
  <TheNavbar class="c bg-gray-200" />
  <h2 class="text-3xl">
    Counter Store
  </h2>
  <p> count :{{ countStore.count }} </p>
  <p> doubleCount :{{ countStore.doubleCount }} </p>

  <n-button @click="countStore.increment">
    increment
  </n-button>

  <div class="flex text-blue-700 underline gap-2">
    <RouterLink to="/">
      Home
    </RouterLink>

    <RouterLink to="/about">
      About
    </RouterLink>
  </div>

  <RouterView />
</template>
