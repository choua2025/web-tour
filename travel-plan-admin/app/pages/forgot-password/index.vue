<template>
  <div>
    <!-- Step 1: request a code -->
    <template v-if="step === 'email'">
      <div class="mb-6">
        <h1 class="text-lg font-semibold text-text-main">{{ $t('auth.resetTitle') }}</h1>
        <p class="text-sm text-text-muted mt-1">
          {{ $t('auth.resetSubtitle') }}
        </p>
      </div>

      <form @submit.prevent="handleRequestCode" class="space-y-4">
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

        <div v-if="authStore.error" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <AlertCircle class="text-danger shrink-0 mt-0.5" :size="16" />
          <p class="text-sm text-red-700">{{ authStore.error }}</p>
        </div>

        <button type="submit" class="btn-primary-custom w-full justify-center py-2.5" :disabled="loading">
          <Loader2 v-if="loading" class="animate-spin" :size="16" />
          <span>{{ loading ? 'Sending...' : 'Send reset code' }}</span>
        </button>
      </form>
    </template>

    <!-- Step 2: code + new password -->
    <template v-else-if="step === 'reset'">
      <div class="mb-6">
        <h1 class="text-lg font-semibold text-text-main">{{ $t('auth.enterResetCode') }}</h1>
        <p class="text-sm text-text-muted mt-1">
          {{ $t('auth.codeSentTo') }} <span class="font-medium text-text-main">{{ email }}</span>. {{ $t('auth.codeExpires') }}
        </p>
      </div>

      <form @submit.prevent="handleResetPassword" class="space-y-4">
        <div>
          <label class="label" for="code">{{ $t('auth.resetCode') }}</label>
          <input
            id="code"
            v-model="code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            class="input-custom text-center text-lg tracking-[0.5em] font-mono"
            required
          />
        </div>

        <div>
          <label class="label" for="new-password">{{ $t('auth.newPassword') }}</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" :size="16" />
            <input
              id="new-password"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.atLeast6')"
              class="input-custom pl-9 pr-9"
              autocomplete="new-password"
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

        <div>
          <label class="label" for="confirm-password">{{ $t('auth.confirmPassword') }}</label>
          <div class="relative">
            <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" :size="16" />
            <input
              id="confirm-password"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('auth.repeatNewPassword')"
              class="input-custom pl-9"
              autocomplete="new-password"
              required
            />
          </div>
        </div>

        <div v-if="localError || authStore.error" class="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          <AlertCircle class="text-danger shrink-0 mt-0.5" :size="16" />
          <p class="text-sm text-red-700">{{ localError || authStore.error }}</p>
        </div>

        <button type="submit" class="btn-primary-custom w-full justify-center py-2.5" :disabled="loading">
          <Loader2 v-if="loading" class="animate-spin" :size="16" />
          <span>{{ loading ? 'Resetting...' : 'Reset password' }}</span>
        </button>

        <button
          type="button"
          @click="backToEmail"
          class="w-full text-sm text-text-muted hover:text-primary"
        >
          {{ $t('auth.useDifferentEmail') }}
        </button>
      </form>
    </template>

    <!-- Step 3: done -->
    <template v-else>
      <div class="text-center">
        <div class="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck class="text-success" :size="24" />
        </div>
        <h1 class="text-lg font-semibold text-text-main">{{ $t('auth.passwordUpdated') }}</h1>
        <p class="text-sm text-text-muted mt-1 mb-6">
          {{ $t('auth.canSignInNow') }}
        </p>
        <NuxtLink to="/login" class="btn-primary-custom w-full justify-center py-2.5">{{ $t('auth.signIn') }}</NuxtLink>
      </div>
    </template>

    <p class="text-sm text-text-muted text-center mt-6 pt-6 border-t border-line">
      {{ $t('auth.rememberedIt') }}
      <NuxtLink to="/login" class="text-primary hover:underline">{{ $t('auth.backToSignIn') }}</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()

const step = ref('email')
const loading = ref(false)
const localError = ref('')

const email = ref('')
const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const handleRequestCode = async () => {
  if (loading.value) return
  loading.value = true

  try {
    await authStore.forgotPassword(email.value)
    step.value = 'reset'
  } catch (error) {
    // Error is surfaced through authStore.error
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  localError.value = ''

  if (newPassword.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match'
    return
  }
  if (newPassword.value.length < 6) {
    localError.value = 'Password must be at least 6 characters'
    return
  }

  if (loading.value) return
  loading.value = true

  try {
    await authStore.resetPassword({
      email: email.value,
      code: code.value,
      newPassword: newPassword.value,
    })
    step.value = 'success'
  } catch (error) {
    // Error is surfaced through authStore.error
  } finally {
    loading.value = false
  }
}

const backToEmail = () => {
  authStore.error = null
  localError.value = ''
  code.value = ''
  step.value = 'email'
}
</script>
