<template>
  <div class="h-screen bg-bg-light overflow-hidden flex flex-col">
    <Navbar />
    <div class="flex flex-1 mt-[60px]">
      <Sidebar />
      <main class="flex-1 ml-[220px] overflow-y-auto p-8 relative">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
import Sidebar from '../components/Sidebar.vue'
</script>
