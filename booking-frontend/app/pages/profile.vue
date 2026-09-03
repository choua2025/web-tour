<template>
  <div class="min-h-screen w-full py-8">
    <div class="page-container">
      <!-- Header -->
      <div class="flex items-center gap-6 mb-10">
        <div class="w-24 h-24 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
          {{ user.avatar }}
        </div>
        <div>
          <h1 class="font-heading text-2xl font-bold text-dark-900">{{ user.name }}</h1>
          <p class="text-dark-500">Member since {{ user.joinDate }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <div class="card p-2 sticky top-24">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
              :class="['w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left',
                activeTab === tab.id ? 'bg-primary-50 text-primary-600' : 'text-dark-600 hover:bg-dark-50']">
              <span class="text-lg">{{ tab.icon }}</span>
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="lg:col-span-2">
          <!-- Personal Info -->
          <div v-if="activeTab === 'info'" class="card p-6 animate-fade-in">
            <h2 class="font-heading text-xl font-semibold text-dark-900 mb-6">{{ $t('profile.personalInfo') }}</h2>
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('auth.fullName') }}</label>
                  <input :value="user.name" type="text" class="input-field" />
                </div>
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('common.email') }}</label>
                  <input :value="user.email" type="email" class="input-field" />
                </div>
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('common.phone') }}</label>
                  <input :value="user.phone" type="tel" class="input-field" />
                </div>
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('common.location') }}</label>
                  <input :value="user.location" type="text" class="input-field" />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('profile.bio') }}</label>
                <textarea :value="user.bio" rows="3" class="input-field"></textarea>
              </div>
              <button class="btn-primary text-sm">{{ $t('common.save') }}</button>
            </div>
          </div>

          <!-- Security -->
          <div v-if="activeTab === 'security'" class="card p-6 animate-fade-in">
            <h2 class="font-heading text-xl font-semibold text-dark-900 mb-6">{{ $t('profile.changePassword') }}</h2>
            <div class="space-y-4 max-w-md">
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('profile.currentPassword') }}</label>
                <input type="password" :placeholder="$t('profile.enterCurrentPassword')" class="input-field" />
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('auth.newPassword') }}</label>
                <input type="password" :placeholder="$t('auth.enterNewPassword')" class="input-field" />
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('field.confirmNewPassword') }}</label>
                <input type="password" :placeholder="$t('auth.confirmNewPassword')" class="input-field" />
              </div>
              <button class="btn-primary text-sm">{{ $t('profile.updatePassword') }}</button>
            </div>
          </div>

          <!-- Preferences -->
          <div v-if="activeTab === 'preferences'" class="card p-6 animate-fade-in">
            <h2 class="font-heading text-xl font-semibold text-dark-900 mb-6">{{ $t('profile.preferences') }}</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                <div>
                  <p class="font-medium text-dark-900 text-sm">{{ $t('profile.emailNotifications') }}</p>
                  <p class="text-xs text-dark-500">{{ $t('profile.emailNotificationsSub') }}</p>
                </div>
                <div class="w-12 h-6 bg-primary-500 rounded-full relative cursor-pointer">
                  <div class="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-md"></div>
                </div>
              </div>
              <div class="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                <div>
                  <p class="font-medium text-dark-900 text-sm">{{ $t('profile.smsNotifications') }}</p>
                  <p class="text-xs text-dark-500">{{ $t('profile.smsNotificationsSub') }}</p>
                </div>
                <div class="w-12 h-6 bg-dark-300 rounded-full relative cursor-pointer">
                  <div class="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-md"></div>
                </div>
              </div>
              <div class="flex items-center justify-between p-4 bg-dark-50 rounded-xl">
                <div>
                  <p class="font-medium text-dark-900 text-sm">{{ $t('nav.newsletter') }}</p>
                  <p class="text-xs text-dark-500">{{ $t('profile.newsletterSub') }}</p>
                </div>
                <div class="w-12 h-6 bg-primary-500 rounded-full relative cursor-pointer">
                  <div class="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-md"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Profile - TravelPlus' })

const { user } = useAuth()

const activeTab = ref('info')
const tabs = computed(() => [
  { id: 'info', icon: '👤', label: t('profile.personalInfoShort') },
  { id: 'security', icon: '🔒', label: t('profile.security') },
  { id: 'preferences', icon: '⚙️', label: t('profile.preferences') },
])
</script>
