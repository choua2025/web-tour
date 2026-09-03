<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('page.newUser') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.newUserSub') }}</p>
      </div>
      <NuxtLink to="/users" class="btn-outline-custom   text-sm rounded-lg">
        <ArrowLeft :size="18" />
        {{ $t('common.back') }}
      </NuxtLink>
    </header>

    <div class="card-premium p-6 max-w-4xl border border-line">
      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.name') }}</label>
             <input v-model="form.name" type="text" class="input-custom" :placeholder="$t('field.fullNameLabel')" required />
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('auth.email') }}</label>
             <input v-model="form.email" type="email" class="input-custom" placeholder="admin@travelplan.com" required />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.role') }}</label>
             <div class="flex gap-4">
                <button 
 v-for="role in ['user', 'admin']" 
                  :key="role"
 type="button"
 class="flex-1 py-4 rounded-lg border-2 transition-colors font-semibold uppercase text-[11px]"
                  :class="form.role === role ? 'border-primary bg-primary/10 text-primary' : 'border-line bg-slate-50 text-text-muted hover:border-line'"
                  @click="form.role = role"
                >
                   {{ role }}
                </button>
             </div>
          </div>
          <div class="space-y-1.5">
             <label class="label">{{ $t('field.phone') }}</label>
             <input v-model="form.phone" type="text" class="input-custom" placeholder="+1 (555) 000-0000" />
          </div>
        </div>

        <div class="pt-6 flex gap-6 border-t border-line mt-6">
           <NuxtLink to="/users" class="btn-outline-custom flex-1 justify-center rounded-lg  font-semibold">{{ $t('common.cancel') }}</NuxtLink>
           <button 
 type="submit" 
 class="btn-primary-custom flex-1 justify-center rounded-lg  font-semibold shadow-indigo-500/20"
             :disabled="loading"
           >
              <Loader2 v-if="loading" class="animate-spin" :size="20" />
              <span v-else>{{ $t('btn.createUser') }}</span>
           </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowLeft, Loader2 } from 'lucide-vue-next'
import { useUsersStore } from '~/stores/users'

const usersStore = useUsersStore()
const loading = computed(() => usersStore.loading)

const form = ref({
  name: '',
  email: '',
  role: 'user',
  phone: ''
})

const handleSubmit = async () => {
  try {
    await usersStore.create(form.value)
    navigateTo('/users')
  } catch (err) {
    console.error(err)
  }
}
</script>
