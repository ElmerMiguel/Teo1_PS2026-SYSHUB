<template>
  <div class="h-screen bg-bg-light overflow-hidden flex flex-col">
    <Navbar />
    <div class="flex h-[calc(100vh-60px)] mt-[60px]">
      <Sidebar />
      <main class="flex-1 ml-[220px] overflow-y-auto p-8 relative h-full w-full">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
</script>
