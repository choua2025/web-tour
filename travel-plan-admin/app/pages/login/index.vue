<template>
  <div>
    <div class="mb-6">
      <h1 class="text-lg font-semibold text-text-main">{{ $t('auth.signIn') }}</h1>
      <p class="text-sm text-text-muted mt-1">{{ $t('auth.signInSubtitle') }}</p>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="label" for="email">{{ $t('auth.email') }}</label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" :size="16" />
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="admin@example.com"
            class="input-custom pl-9"
            autocomplete="username"
            required
          />
        </div>
      </div>

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label class="label mb-0" for="password">{{ $t('auth.password') }}</label>
          <NuxtLink to="/forgot-password" class="text-sm text-primary hover:underline">{{ $t('auth.forgotPassword') }}</NuxtLink>
        </div>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" :size="16" />
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="$t('auth.passwordPlaceholder')"
            class="input-custom pl-9 pr-9"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-dim hover:text-text-main"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
          >
            <Eye v-if="!showPassword" :size="16" />
            <EyeOff v-else :size="16" />
          </button>
        </div>
      </div>

      <label class="flex items-center gap-2 text-sm text-text-muted cursor-pointer">
        <input v-model="remember" type="checkbox" class="rounded border-line text-primary focus:ring-primary/30" />
        {{ $t('auth.rememberMe') }}
      </label>

      <div v-if="authStore.error" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2">
        <AlertCircle class="text-danger shrink-0 mt-0.5" :size="16" />
        <p class="text-sm text-red-700">{{ authStore.error }}</p>
      </div>

      <button type="submit" class="btn-primary-custom w-full justify-center py-2.5" :disabled="loading">
        <Loader2 v-if="loading" class="animate-spin" :size="16" />
        <span>{{ loading ? 'Signing in...' : 'Sign in' }}</span>
      </button>
    </form>

    <p class="text-sm text-text-muted text-center mt-6 pt-6 border-t border-line">
      {{ $t('auth.needAccount') }}
      <NuxtLink to="/register" class="text-primary hover:underline">{{ $t('auth.howToGetAccess') }}</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth'
})

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const authStore = useAuthStore()

const handleLogin = async () => {
  if (loading.value) return
  loading.value = true

  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    navigateTo('/')
  } catch (error) {
    // Error is handled inside the store
  } finally {
    loading.value = false
  }
}
</script>
