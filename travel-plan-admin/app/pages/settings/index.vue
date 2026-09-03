<template>
  <div class="flex flex-col gap-6 mb-6">
    <header>
      <h1 class="page-title">{{ $t('nav.settings') }}</h1>
      <p class="text-text-muted mt-1 text-sm">{{ $t('page.settingsSub') }}</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Tabs -->
      <div class="lg:col-span-1">
        <div class="flex flex-col gap-1">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            @click="activeTab = tab.name"
            class="flex items-center gap-3 px-3 py-2.5 rounded-md text-left text-sm"
            :class="activeTab === tab.name
              ? 'bg-primary-light text-primary font-medium'
              : 'text-text-muted hover:bg-slate-50 hover:text-text-main'"
          >
            <component :is="tab.icon" :size="18" />
            {{ tab.name }}
          </button>
        </div>
      </div>

      <div class="lg:col-span-3">
        <!-- Profile -->
        <div v-if="activeTab === 'Profile'" class="card-premium">
          <div class="flex items-center gap-4 mb-6 pb-6 border-b border-line">
            <div class="w-16 h-16 rounded-full bg-primary text-white text-xl font-semibold flex items-center justify-center">
              {{ initials }}
            </div>
            <div>
              <h3 class="text-base font-semibold text-text-main">{{ authStore.user?.name || '—' }}</h3>
              <p class="text-sm text-text-muted">{{ authStore.user?.email }}</p>
              <span class="status-pill-custom pill-info mt-1.5 inline-block">{{ authStore.user?.role }}</span>
            </div>
          </div>

          <form @submit.prevent="saveProfile" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="label" for="p-name">{{ $t('field.name') }}</label>
                <input id="p-name" v-model="profile.name" type="text" class="input-custom" required />
              </div>
              <div>
                <label class="label" for="p-email">{{ $t('auth.email') }}</label>
                <input id="p-email" v-model="profile.email" type="email" class="input-custom" required />
              </div>
              <div>
                <label class="label" for="p-phone">{{ $t('field.phone') }}</label>
                <input id="p-phone" v-model="profile.phone" type="tel" class="input-custom" />
              </div>
            </div>

            <p v-if="profileMessage" class="text-sm rounded-md px-3 py-2 border"
              :class="profileOk ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'">
              {{ profileMessage }}
            </p>

            <div class="pt-4 border-t border-line flex justify-end gap-2">
              <button type="button" class="btn-outline-custom" @click="resetProfile">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn-primary-custom" :disabled="savingProfile">
                <Loader2 v-if="savingProfile" class="animate-spin" :size="15" />
                {{ savingProfile ? 'Saving...' : 'Save changes' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Password -->
        <div v-else-if="activeTab === 'Password'" class="card-premium">
          <h3 class="text-base font-semibold text-text-main mb-1">{{ $t('settings.changePassword') }}</h3>
          <p class="text-sm text-text-muted mb-5">{{ $t('settings.stayySignedIn') }}</p>

          <form @submit.prevent="savePassword" class="space-y-4 max-w-md">
            <div>
              <label class="label" for="pw-new">{{ $t('auth.newPassword') }}</label>
              <input id="pw-new" v-model="password.next" type="password" class="input-custom" autocomplete="new-password" required minlength="6" />
              <p class="hint">{{ $t('misc.atLeast6Dot') }}</p>
            </div>
            <div>
              <label class="label" for="pw-confirm">{{ $t('auth.confirmPassword') }}</label>
              <input id="pw-confirm" v-model="password.confirm" type="password" class="input-custom" autocomplete="new-password" required />
            </div>

            <p v-if="passwordMessage" class="text-sm rounded-md px-3 py-2 border"
              :class="passwordOk ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'">
              {{ passwordMessage }}
            </p>

            <div class="pt-4 border-t border-line flex justify-end">
              <button type="submit" class="btn-primary-custom" :disabled="savingPassword">
                <Loader2 v-if="savingPassword" class="animate-spin" :size="15" />
                {{ savingPassword ? 'Updating...' : 'Update password' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Session -->
        <div v-else class="card-premium">
          <h3 class="text-base font-semibold text-text-main mb-1">{{ $t('settings.session') }}</h3>
          <p class="text-sm text-text-muted mb-5">{{ $t('settings.sessionSub') }}</p>

          <dl class="text-sm divide-y divide-line border border-line rounded-md">
            <div class="flex justify-between px-4 py-3">
              <dt class="text-text-muted">{{ $t('settings.signedInAs') }}</dt>
              <dd class="text-text-main font-medium">{{ authStore.user?.email || '—' }}</dd>
            </div>
            <div class="flex justify-between px-4 py-3">
              <dt class="text-text-muted">{{ $t('field.role') }}</dt>
              <dd class="text-text-main font-medium capitalize">{{ authStore.user?.role || '—' }}</dd>
            </div>
            <div class="flex justify-between px-4 py-3 gap-4">
              <dt class="text-text-muted shrink-0">{{ $t('settings.apiEndpoint') }}</dt>
              <dd class="text-text-main font-mono text-xs truncate">{{ apiUrl }}</dd>
            </div>
          </dl>

          <div class="pt-5 mt-5 border-t border-line flex justify-end">
            <button class="btn-danger" @click="authStore.logout()">
              <LogOut :size="15" />
              {{ $t('auth.signOut') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { User, Lock, Monitor, Loader2, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useUsersStore } from '~/stores/users'

const authStore = useAuthStore()
const usersStore = useUsersStore()
const apiUrl = useRuntimeConfig().public.apiUrl

const tabs = [
  { name: 'Profile', icon: User },
  { name: 'Password', icon: Lock },
  { name: 'Session', icon: Monitor },
]
const activeTab = ref('Profile')

const profile = ref({ name: '', email: '', phone: '' })

// Declared before the immediate watch below touches them, or the watcher runs
// into the temporal dead zone on first render.
const savingProfile = ref(false)
const profileMessage = ref('')
const profileOk = ref(false)

const resetProfile = () => {
  profile.value = {
    name: authStore.user?.name || '',
    email: authStore.user?.email || '',
    phone: authStore.user?.phone || '',
  }
  profileMessage.value = ''
}

// The store may still be hydrating when this mounts.
watch(() => authStore.user, resetProfile, { immediate: true })
onMounted(() => { if (!authStore.user) authStore.fetchProfile() })

const initials = computed(() =>
  (authStore.user?.name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')
)

// ── save profile ──────────────────────────────────────────────
const saveProfile = async () => {
  if (savingProfile.value) return
  savingProfile.value = true
  profileMessage.value = ''
  try {
    await usersStore.update(authStore.user.id, { ...profile.value })
    await authStore.fetchProfile()
    profileOk.value = true
    profileMessage.value = 'Profile updated.'
  } catch (err) {
    profileOk.value = false
    profileMessage.value = err?.response?.data?.message || 'Could not save your profile.'
  } finally {
    savingProfile.value = false
  }
}

// ── change password ───────────────────────────────────────────
const savingPassword = ref(false)
const passwordMessage = ref('')
const passwordOk = ref(false)
const password = ref({ next: '', confirm: '' })

const savePassword = async () => {
  passwordMessage.value = ''

  if (password.value.next !== password.value.confirm) {
    passwordOk.value = false
    passwordMessage.value = 'Passwords do not match.'
    return
  }

  if (savingPassword.value) return
  savingPassword.value = true
  try {
    // PUT /users/:id re-hashes through the model's beforeUpdate hook.
    await usersStore.update(authStore.user.id, { password: password.value.next })
    password.value = { next: '', confirm: '' }
    passwordOk.value = true
    passwordMessage.value = 'Password updated.'
  } catch (err) {
    passwordOk.value = false
    passwordMessage.value = err?.response?.data?.message || 'Could not update your password.'
  } finally {
    savingPassword.value = false
  }
}
</script>
