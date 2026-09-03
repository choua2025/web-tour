<template>
  <div class="min-h-screen flex flex-col bg-dark-50">
    <!-- Navigation -->
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-dark-100 transition-all duration-300">
      <div class="page-container">
        <div class="flex items-center justify-between h-16 md:h-20">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span class="font-heading text-xl font-bold text-dark-900">Travel<span class="text-primary-500">Plus</span></span>
          </NuxtLink>

          <!-- Desktop Nav -->
          <div class="hidden md:flex items-center gap-1">
            <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
              class="px-4 py-2 text-dark-600 font-medium rounded-lg hover:text-primary-500 hover:bg-primary-50 transition-all duration-200">
              {{ link.label }}
            </NuxtLink>
          </div>

          <!-- Auth Buttons -->
          <div class="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <template v-if="isLoggedIn">
              <div class="relative" ref="accountRef">
                <button @click="accountOpen = !accountOpen"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors">
                  <span class="w-8 h-8 rounded-full bg-primary-500 text-white text-xs font-semibold flex items-center justify-center">
                    {{ initials }}
                  </span>
                  <span class="text-sm font-medium text-dark-700 max-w-[120px] truncate">{{ user.name || 'Account' }}</span>
                  <svg class="w-4 h-4 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <div v-if="accountOpen"
                  class="absolute right-0 mt-2 w-52 bg-white border border-dark-100 rounded-xl shadow-lg overflow-hidden">
                  <div class="px-4 py-3 border-b border-dark-100">
                    <p class="text-sm font-semibold text-dark-900 truncate">{{ user.name }}</p>
                    <p class="text-xs text-dark-500 truncate">{{ user.email }}</p>
                  </div>
                  <NuxtLink to="/my-bookings" class="block px-4 py-2.5 text-sm text-dark-600 hover:bg-primary-50 hover:text-primary-500"
                    @click="accountOpen = false">{{ $t('nav.myBookings') }}</NuxtLink>
                  <NuxtLink to="/profile" class="block px-4 py-2.5 text-sm text-dark-600 hover:bg-primary-50 hover:text-primary-500"
                    @click="accountOpen = false">{{ $t('nav.profile') }}</NuxtLink>
                  <button @click="handleLogout"
                    class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-dark-100">{{ $t('nav.logout') }}</button>
                </div>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="btn-ghost text-sm">{{ $t('nav.login') }}</NuxtLink>
              <NuxtLink to="/register" class="btn-primary text-sm !px-5 !py-2.5">{{ $t('nav.signup') }}</NuxtLink>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 rounded-lg hover:bg-dark-100 transition-colors">
            <svg v-if="!mobileMenuOpen" class="w-6 h-6 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-dark-100 bg-white/95 backdrop-blur-xl">
          <div class="px-4 py-4 space-y-1">
            <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
              class="block px-4 py-3 text-dark-600 font-medium rounded-lg hover:text-primary-500 hover:bg-primary-50 transition-all"
              @click="mobileMenuOpen = false">
              {{ link.label }}
            </NuxtLink>
            <div class="pt-3 border-t border-dark-100 space-y-2">
              <div class="px-2 pb-2"><LanguageSwitcher /></div>
              <template v-if="isLoggedIn">
                <p class="px-4 pb-1 text-sm font-semibold text-dark-900 truncate">{{ user.name }}</p>
                <NuxtLink to="/my-bookings" class="block px-4 py-3 text-dark-600 font-medium rounded-lg hover:bg-primary-50"
                  @click="mobileMenuOpen = false">{{ $t('nav.myBookings') }}</NuxtLink>
                <NuxtLink to="/profile" class="block px-4 py-3 text-dark-600 font-medium rounded-lg hover:bg-primary-50"
                  @click="mobileMenuOpen = false">{{ $t('nav.profile') }}</NuxtLink>
                <button @click="handleLogout" class="w-full text-left px-4 py-3 text-red-600 font-medium rounded-lg hover:bg-red-50">
                  {{ $t('nav.logout') }}
                </button>
              </template>
              <template v-else>
                <NuxtLink to="/login" class="block text-center btn-ghost text-sm" @click="mobileMenuOpen = false">{{ $t('nav.login') }}</NuxtLink>
                <NuxtLink to="/register" class="block text-center btn-primary text-sm" @click="mobileMenuOpen = false">{{ $t('nav.signup') }}</NuxtLink>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-dark-900 text-dark-300 pt-16 pb-8">
      <div class="page-container">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <!-- Brand -->
          <div class="lg:col-span-1">
            <NuxtLink to="/" class="flex items-center gap-2 mb-4">
              <div class="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span class="font-heading text-xl font-bold text-white">Travel<span class="text-primary-400">Plus</span></span>
            </NuxtLink>
            <p class="text-dark-400 text-sm leading-relaxed mb-6">
              Discover amazing destinations around the world. We make travel planning easy and unforgettable.
            </p>
            <div class="flex gap-3">
              <a v-for="social in socials" :key="social.name" href="#"
                class="w-10 h-10 rounded-lg bg-dark-800 hover:bg-primary-500 flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5">
                <span class="text-sm">{{ social.icon }}</span>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="font-heading text-white font-semibold mb-4">{{ $t('nav.quickLinks') }}</h4>
            <ul class="space-y-2.5">
              <li v-for="link in footerLinks.quickLinks" :key="link.to">
                <NuxtLink :to="link.to" class="text-sm text-dark-400 hover:text-primary-400 transition-colors">{{ link.label }}</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h4 class="font-heading text-white font-semibold mb-4">{{ $t('nav.support') }}</h4>
            <ul class="space-y-2.5">
              <li v-for="link in footerLinks.support" :key="link.label">
                <NuxtLink :to="link.to" class="text-sm text-dark-400 hover:text-primary-400 transition-colors">{{ link.label }}</NuxtLink>
              </li>
            </ul>
          </div>

          <!-- Newsletter -->
          <div>
            <h4 class="font-heading text-white font-semibold mb-4">{{ $t('nav.newsletter') }}</h4>
            <p class="text-sm text-dark-400 mb-4">{{ $t('home.newsletterSub') }}</p>
            <form @submit.prevent="handleNewsletterSubmit" class="flex gap-2">
              <input v-model="newsletterEmail" type="email" :placeholder="$t('auth.yourEmail')" required :disabled="isSubmitting" class="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-lg text-white text-sm placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all disabled:opacity-50" />
              <button type="submit" :disabled="isSubmitting" class="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center min-w-[3rem]">
                <svg v-if="!isSubmitting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </button>
            </form>
            <p v-if="submitMessage" :class="['text-xs mt-2', submitStatus === 'success' ? 'text-green-400' : 'text-red-400']">{{ submitMessage }}</p>
          </div>
        </div>

        <div class="border-t border-dark-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-sm text-dark-500">&copy; {{ new Date().getFullYear() }} TravelPlus. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="#" class="text-sm text-dark-500 hover:text-dark-300 transition-colors">{{ $t('nav.privacy') }}</a>
            <a href="#" class="text-sm text-dark-500 hover:text-dark-300 transition-colors">{{ $t('nav.terms') }}</a>
            <a href="#" class="text-sm text-dark-500 hover:text-dark-300 transition-colors">{{ $t('nav.cookies') }}</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
const { t } = useI18n()
const mobileMenuOpen = ref(false)
const accountOpen = ref(false)
const accountRef = ref(null)

const api = useApi()
const { isLoggedIn, user, logout } = useAuth()

const initials = computed(() => {
  const name = user.value?.name
  if (!name) return '?'
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
})

const handleLogout = () => {
  logout()
  accountOpen.value = false
  mobileMenuOpen.value = false
  navigateTo('/')
}

const closeAccountOnOutside = (event) => {
  if (accountOpen.value && accountRef.value && !accountRef.value.contains(event.target)) {
    accountOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', closeAccountOnOutside))
onBeforeUnmount(() => document.removeEventListener('click', closeAccountOnOutside))

const newsletterEmail = ref('')
const isSubmitting = ref(false)
const submitMessage = ref('')
const submitStatus = ref('') // 'success' or 'error'

const handleNewsletterSubmit = async () => {
  if (!newsletterEmail.value) return
  
  isSubmitting.value = true
  submitMessage.value = ''
  
  try {
    await api.contact.send(newsletterEmail.value)
    submitStatus.value = 'success'
    submitMessage.value = 'Subscription successful!'
    newsletterEmail.value = '' // Clear input
  } catch (error) {
    submitStatus.value = 'error'
    submitMessage.value = 'Failed to subscribe. Please try again.'
  } finally {
    isSubmitting.value = false
    // Clear message after 3 seconds
    setTimeout(() => {
      submitMessage.value = ''
    }, 3000)
  }
}

const navLinks = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.tours'), to: '/tours' },
  { label: t('nav.destinations'), to: '/destinations' },
  { label: t('nav.hotels'), to: '/hotels' },
  { label: t('nav.contact'), to: '/contact' },
])

const socials = [
  { name: 'Facebook', icon: '📘' },
  { name: 'Twitter', icon: '🐦' },
  { name: 'Instagram', icon: '📷' },
  { name: 'YouTube', icon: '🎬' },
]

const footerLinks = computed(() => ({
  quickLinks: [
    { label: t('nav.aboutUs'), to: '#' },
    { label: t('nav.tours'), to: '/tours' },
    { label: t('nav.destinations'), to: '/destinations' },
    { label: t('nav.hotels'), to: '/hotels' },
    { label: t('nav.reviews'), to: '/reviews' },
  ],
  support: [
    { label: t('nav.contactUs'), to: '/contact' },
    { label: t('nav.faqs'), to: '#' },
    { label: t('tour.freeCancellation'), to: '#' },
    { label: t('pay.methods'), to: '#' },
    { label: t('nav.helpCenter'), to: '#' },
  ],
}))
</script>
