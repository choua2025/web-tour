<template>
  <div class="flex flex-col gap-6 mb-6">
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('nav.admins') }}</h1>
        <p class="text-text-muted mt-1 text-sm">{{ $t('page.adminsSub') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink to="/users" class="btn-outline-custom">
          <Users :size="16" />
          {{ $t('admins.allUsers') }}
        </NuxtLink>
        <button class="btn-primary-custom" @click="openAdd">
          <UserPlus :size="16" />
          {{ $t('admins.addAdmin') }}
        </button>
      </div>
    </header>

    <!-- Real counts, not decoration -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="card-premium flex items-center gap-4">
        <div class="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center text-primary">
          <component :is="stat.icon" :size="20" />
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-medium text-text-muted uppercase">{{ stat.label }}</span>
          <span class="text-2xl font-semibold text-text-main">{{ stat.value }}</span>
        </div>
      </div>
    </div>

    <p v-if="error" class="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
      {{ error }}
    </p>

    <div v-if="!loading">
      <DataTable
        :columns="columns"
        :data="admins"
        :searchPlaceholder="$t('admins.filterPlaceholder')"
        exportName="admins"
        @refresh="load"
      >
        <template #cell-name="{ item }">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {{ initials(item.name) }}
            </div>
            <span class="font-medium text-text-main">{{ item.name }}</span>
          </div>
        </template>

        <template #cell-role="{ value }">
          <span class="status-pill-custom pill-info">{{ value }}</span>
        </template>

        <template #cell-createdAt="{ value }">
          <span class="text-text-muted">{{ formatDate(value) }}</span>
        </template>

        <template #actions="{ item }">
          <NuxtLink
            :to="`/users/${item.id}`"
            class="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:bg-primary-light hover:text-primary"
            :title="$t('admins.editAccount')"
          >
            <Settings2 :size="15" />
          </NuxtLink>
          <button
            class="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:bg-amber-50 hover:text-warning disabled:opacity-30"
            :title="$t('admins.revokeAccess')"
            :disabled="item.id === currentUserId"
            @click="revoke(item)"
          >
            <ShieldX :size="15" />
          </button>
          <button
            class="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-danger disabled:opacity-30"
            :title="$t('admins.deleteAccount')"
            :disabled="item.id === currentUserId"
            @click="remove(item)"
          >
            <Trash2 :size="15" />
          </button>
        </template>
      </DataTable>
    </div>
    <div v-else class="flex justify-center items-center py-24">
      <Loader2 class="animate-spin text-primary" :size="32" />
    </div>

    <!-- Add Admin -->
    <Teleport to="body">
      <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40" @click="showAddModal = false"></div>
        <div class="relative w-full max-w-lg bg-white border border-line rounded-lg shadow-lg">
          <div class="px-6 py-4 border-b border-line flex justify-between items-start">
            <div>
              <h2 class="text-base font-semibold text-text-main">{{ $t('admins.addAdmin') }}</h2>
              <p class="text-sm text-text-muted mt-0.5">{{ $t('admins.createSub') }}</p>
            </div>
            <button @click="showAddModal = false" class="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:bg-slate-100">
              <X :size="18" />
            </button>
          </div>

          <form @submit.prevent="submitAdd">
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="label" for="admin-name">{{ $t('field.name') }}</label>
                <input id="admin-name" v-model="form.name" type="text" class="input-custom" :placeholder="$t('field.fullName')" required />
              </div>
              <div>
                <label class="label" for="admin-email">{{ $t('auth.email') }}</label>
                <input id="admin-email" v-model="form.email" type="email" class="input-custom" placeholder="admin@travelplan.com" required />
              </div>
              <div>
                <label class="label" for="admin-phone">{{ $t('field.phone') }}</label>
                <input id="admin-phone" v-model="form.phone" type="tel" class="input-custom" placeholder="+856 20 xxxx xxxx" />
              </div>
              <div>
                <label class="label" for="admin-password">{{ $t('admins.tempPassword') }}</label>
                <input id="admin-password" v-model="form.password" type="text" class="input-custom" :placeholder="$t('auth.atLeast6')" required minlength="6" />
                <p class="hint">{{ $t('admins.tempPasswordHint') }}</p>
              </div>

              <p v-if="formError" class="text-sm text-danger bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {{ formError }}
              </p>
            </div>

            <div class="px-6 py-4 border-t border-line flex justify-end gap-2">
              <button type="button" @click="showAddModal = false" class="btn-outline-custom">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn-primary-custom" :disabled="saving">
                <Loader2 v-if="saving" class="animate-spin" :size="15" />
                {{ saving ? 'Creating...' : 'Create admin' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
const { t } = useI18n()
import { ref, computed, onMounted } from 'vue'
import { UserPlus, Users, X, Settings2, ShieldX, Trash2, Loader2, ShieldCheck, UserCheck } from 'lucide-vue-next'
import { useUsersStore } from '~/stores/users'
import { useAuthStore } from '~/stores/auth'

const usersStore = useUsersStore()
const authStore = useAuthStore()

const loading = computed(() => usersStore.loading)
const error = ref(null)
const currentUserId = computed(() => authStore.user?.id)

// There is no separate admins endpoint — admins are users carrying the role.
const admins = computed(() => usersStore.items.filter((u) => u.role === 'admin'))

const stats = computed(() => [
  { label: t('nav.admins'), value: admins.value.length, icon: ShieldCheck },
  { label: t('misc.customers'), value: usersStore.items.filter((u) => u.role === 'user').length, icon: UserCheck },
  { label: t('misc.totalAccounts'), value: usersStore.items.length, icon: Users },
])

const columns = computed(() => [
  { key: 'id', label: t('common.id') },
  { key: 'name', label: t('field.name') },
  { key: 'email', label: t('field.email') },
  { key: 'phone', label: t('field.phone') },
  { key: 'role', label: t('field.role') },
  { key: 'createdAt', label: t('field.created') },
])

const load = async () => {
  error.value = null
  await usersStore.getAll()
  if (usersStore.error) error.value = usersStore.error
}

onMounted(load)

const showAddModal = ref(false)
const saving = ref(false)
const formError = ref('')
const form = ref({ name: '', email: '', phone: '', password: '' })

const openAdd = () => {
  form.value = { name: '', email: '', phone: '', password: '' }
  formError.value = ''
  showAddModal.value = true
}

const submitAdd = async () => {
  if (saving.value) return
  saving.value = true
  formError.value = ''
  try {
    // POST /users is the admin-only route; /auth/register deliberately refuses
    // to mint admins, so provisioning has to happen here.
    await usersStore.create({ ...form.value, role: 'admin' })
    showAddModal.value = false
    await load()
  } catch (err) {
    formError.value = err?.response?.data?.message || err?.message || 'Could not create the admin account'
  } finally {
    saving.value = false
  }
}

const revoke = async (item) => {
  if (!confirm(`Remove admin access from ${item.name}? They will keep a normal customer account.`)) return
  try {
    await usersStore.update(item.id, { role: 'user' })
    await load()
  } catch (err) {
    error.value = err?.response?.data?.message || 'Could not update this account'
  }
}

const remove = async (item) => {
  if (!confirm(`Delete ${item.name}? This cannot be undone.`)) return
  try {
    await usersStore.remove(item.id)
    await load()
  } catch (err) {
    error.value = err?.response?.data?.message || 'Could not delete this account'
  }
}

const initials = (name) =>
  (name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
</script>
