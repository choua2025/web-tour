<template>
  <div class="flex min-h-screen bg-bg-main text-text-main">
    <Sidebar :isCollapsed="isCollapsed" @toggle="toggleSidebar" />

    <main class="flex-1 flex flex-col min-w-0">
      <Navbar />

      <div class="p-6 flex-1">
        <slot />
      </div>

      <footer class="px-6 py-4 border-t border-line bg-white flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-text-muted">
        <p>&copy; 2026 TravelAdmin</p>
        <div class="flex items-center gap-6">
          <span class="text-text-dim">v1.2.4</span>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>
