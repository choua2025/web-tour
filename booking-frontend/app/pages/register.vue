<template>
  <div>
    <NuxtLayout name="auth">
      <div class="text-center mb-6">
        <h1 class="font-heading text-2xl font-bold text-dark-900 mb-2">{{ $t('auth.createAccount') }}</h1>
        <p class="text-dark-500 text-sm">{{ $t('auth.joinSub') }}</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('auth.fullName') }}</label>
          <input v-model="form.name" type="text" :placeholder="$t('ph.name')" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.emailAddress') }}</label>
          <input v-model="form.email" type="email" :placeholder="$t('ph.email')" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.phoneNumber') }}</label>
          <input v-model="form.phone" type="tel" :placeholder="$t('ph.phone')" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('auth.password') }}</label>
          <input v-model="form.password" type="password" :placeholder="$t('ph.password')" class="input-field" />
        </div>
        <div>
          <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('auth.confirmPassword') }}</label>
          <input v-model="form.confirmPassword" type="password" :placeholder="$t('ph.password')" class="input-field" />
        </div>

        <div class="flex items-start gap-2">
          <input type="checkbox" v-model="form.terms" id="terms" class="w-4 h-4 rounded text-primary-500 focus:ring-primary-500 mt-0.5" />
          <label for="terms" class="text-xs text-dark-500">{{ $t('auth.iAgreeTo') }} <a href="#" class="text-primary-500 hover:underline">{{ $t('nav.terms') }}</a> {{ $t('common.and') }} <a href="#" class="text-primary-500 hover:underline">{{ $t('nav.privacy') }}</a></label>
        </div>

        <button type="submit" class="btn-primary w-full">{{ $t('auth.createAccount') }}</button>
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
        Already have an account? <NuxtLink to="/login" class="text-primary-500 font-semibold hover:underline">{{ $t('nav.login') }}</NuxtLink>
      </p>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Register - TravelPlus' })

const { register } = useAuth()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  password: '',
  phone:'',
  confirmPassword: '',
  terms: false,
})
const loading = ref(false)
const error = ref('')

const route = useRoute()

// Preserve wherever the auth guard interrupted them.
const redirectTo = computed(() => {
  const target = route.query.redirect
  return typeof target === 'string' && target.startsWith('/') ? target : '/'
})

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await register(form.name, form.email, form.password, form.phone)
    // register() already stores the token, so carry on rather than bouncing
    // them through the login form again.
    await navigateTo(redirectTo.value)
  } catch (e: any) {
    error.value = e?.data?.message || e?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
