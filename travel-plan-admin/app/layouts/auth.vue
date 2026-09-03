<template>
  <div class="min-h-screen bg-bg-main flex flex-col">
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="flex items-center justify-center gap-2.5 mb-6">
          <div class="w-9 h-9 rounded bg-primary flex items-center justify-center">
            <Map class="text-white" :size="20" />
          </div>
          <span class="text-lg font-semibold text-text-main">
            Travel<span class="text-primary">{{ $t('misc.admin') }}</span>
          </span>
        </div>

        <div class="bg-white border border-line rounded-lg shadow-sm p-8">
          <slot />
        </div>
      </div>
    </div>

    <footer class="py-6 text-center text-xs text-text-muted">
      &copy; 2026 TravelAdmin
    </footer>
  </div>
</template>

<script setup>
import { Map } from 'lucide-vue-next'
</script>
