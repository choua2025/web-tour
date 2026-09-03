<template>
  <div>
    <NuxtLayout name="auth">
      <div class="text-center mb-6">
        <h1 class="font-heading text-2xl font-bold text-dark-900 mb-2">{{ $t('auth.welcomeBack') }}</h1>
        <p class="text-dark-500 text-sm">{{ $t('auth.signInSub') }}</p>
      </div>

      <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
        <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.emailAddress') }}</label>
          <input v-model="form.email" type="email" :placeholder="$t('ph.email')" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('auth.password') }}</label>
          <input v-model="form.password" type="password" :placeholder="$t('ph.password')" class="input-field" />
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" v-model="form.remember" class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500" />
            <span class="text-sm text-dark-600">{{ $t('auth.rememberMe') }}</span>
          </label>
          <NuxtLink to="/forgot-password" class="text-sm text-primary-500 font-medium hover:underline">{{ $t('auth.forgotPassword') }}</NuxtLink>
        </div>

        <button type="submit" class="btn-primary w-full">{{ $t('auth.signIn') }}</button>
      </form>

      <!-- Divider -->
      <div class="flex items-center gap-4 my-6">
        <div class="flex-1 h-px bg-dark-200"></div>
        <span class="text-xs text-dark-400 font-medium">{{ $t('common.or') }}</span>
        <div class="flex-1 h-px bg-dark-200"></div>
      </div>

      <!-- Social Login -->
      <div class="space-y-3">
        <button class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-dark-200 rounded-xl text-sm font-medium text-dark-700 hover:bg-dark-50 transition-all">
          <span class="text-lg">🔵</span> {{ $t('auth.continueGoogle') }}
        </button>
        <button class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-dark-900 rounded-xl text-sm font-medium text-white hover:bg-dark-800 transition-all">
          <span class="text-lg">⚫</span> {{ $t('auth.continueGithub') }}
        </button>
      </div>

      <p class="text-center text-sm text-dark-500 mt-6">
        Don't have an account? <NuxtLink to="/register" class="text-primary-500 font-semibold hover:underline">{{ $t('nav.signup') }}</NuxtLink>
      </p>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Login - TravelPlus' })

const { login } = useAuth()
const route = useRoute()

// Where the guard bounced them from, so the booking they started resumes.
const redirectTo = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') ? target : '/'
})

const form = reactive({
  email: '',
  password: '',
  remember: false,
})
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  try {
    await login(form.email, form.password)
    await navigateTo(redirectTo.value)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>
