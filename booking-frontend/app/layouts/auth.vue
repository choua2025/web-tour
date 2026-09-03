<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 relative overflow-hidden">
    <!-- Decorative Background -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-float" style="animation-delay: 3s;"></div>
      <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary-400/10 rounded-full blur-3xl animate-pulse-slow"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md mx-auto px-4 py-8">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center justify-center gap-2 mb-8 group">
        <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all duration-300">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="font-heading text-2xl font-bold text-white">Travel<span class="text-accent-200">Plus</span></span>
      </NuxtLink>

      <!-- Auth Card -->
      <div class="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
        <slot />
      </div>
    </div>
  </div>
</template>
