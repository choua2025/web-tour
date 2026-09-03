<template>
  <div>
    <NuxtLayout name="auth">
      <!-- Step 1: Enter Email -->
      <div v-if="step === 'email'">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 class="font-heading text-2xl font-bold text-dark-900 mb-2">{{ $t('auth.forgotPassword') }}</h1>
          <p class="text-dark-500 text-sm">{{ $t('auth.resetSub') }}</p>
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {{ error }}
        </div>
        <div v-if="message" class="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-xl text-sm text-accent-700">
          {{ message }}
        </div>

        <form @submit.prevent="handleForgotPassword" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.emailAddress') }}</label>
            <input v-model="form.email" type="email" placeholder="john@example.com" class="input-field" required />
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full">
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Sending...
            </span>
            <span v-else>{{ $t('auth.sendResetCode') }}</span>
          </button>
        </form>

        <p class="text-center text-sm text-dark-500 mt-6">
          Remember your password? <NuxtLink to="/login" class="text-primary-500 font-semibold hover:underline">{{ $t('auth.signIn') }}</NuxtLink>
        </p>
      </div>

      <!-- Step 2: Enter Code + New Password -->
      <div v-if="step === 'reset'">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 class="font-heading text-2xl font-bold text-dark-900 mb-2">{{ $t('auth.resetPassword') }}</h1>
          <p class="text-dark-500 text-sm">{{ $t('auth.codeSentTo') }} <strong class="text-dark-700">{{ form.email }}</strong></p>
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {{ error }}
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-4">
          <div>
            <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('auth.resetCode') }}</label>
            <input v-model="form.code" type="text" :placeholder="$t('auth.enter6Digit')" class="input-field text-center tracking-widest text-lg font-mono" maxlength="6" required />
          </div>
          <div>
            <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('auth.newPassword') }}</label>
            <input v-model="form.newPassword" type="password" :placeholder="$t('auth.enterNewPassword')" class="input-field" required />
          </div>
          <div>
            <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('auth.confirmPassword') }}</label>
            <input v-model="form.confirmPassword" type="password" :placeholder="$t('auth.confirmNewPassword')" class="input-field" required />
          </div>

          <button type="submit" :disabled="loading" class="btn-primary w-full">
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Resetting...
            </span>
            <span v-else>{{ $t('auth.resetPassword') }}</span>
          </button>
        </form>

        <button @click="step = 'email'" class="w-full text-center text-sm text-dark-500 mt-4 hover:text-primary-500 transition-colors">
          ← Back to email
        </button>
      </div>

      <!-- Step 3: Success -->
      <div v-if="step === 'success'">
        <div class="text-center">
          <div class="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 class="font-heading text-2xl font-bold text-dark-900 mb-2">{{ $t('auth.passwordResetDone') }}</h1>
          <p class="text-dark-500 text-sm mb-6">{{ $t('auth.passwordResetDoneSub') }}</p>
          <NuxtLink to="/login" class="btn-primary w-full inline-block text-center">{{ $t('auth.signIn') }}</NuxtLink>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Forgot Password - TravelPlus' })

const api = useApi()

const step = ref<'email' | 'reset' | 'success'>('email')
const loading = ref(false)
const error = ref('')
const message = ref('')

const form = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})

const handleForgotPassword = async () => {
  loading.value = true
  error.value = ''
  message.value = ''
  try {
    const res: any = await api.auth.forgotPassword(form.email)
    message.value = res?.message || 'Reset code sent to your email'
    step.value = 'reset'
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to send reset code. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  if (form.newPassword !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }
  if (form.newPassword.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await api.auth.resetPassword(form.email, form.code, form.newPassword)
    step.value = 'success'
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Failed to reset password. Please check your code.'
  } finally {
    loading.value = false
  }
}
</script>
