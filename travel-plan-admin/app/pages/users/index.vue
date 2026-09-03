<template>
  <div class="flex flex-col gap-5">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="page-title">{{ $t('nav.users') }}</h1>
        <p class="text-text-muted mt-1 font-medium">{{ $t('page.usersSub') }}</p>
      </div>
      <div class="flex items-center gap-3 w-full md:w-auto">
        <NuxtLink to="/users/create" class="btn-primary-custom !py-2.5  text-sm flex-1 md:flex-none justify-center">
          <UserPlus :size="18" />
          Add New User
        </NuxtLink>
      </div>
    </header>

    <!-- User Table -->
    <DataTable
        exportName="users"
        @refresh="usersStore.getAll()" 
 v-if="!loading"
      :columns="columns" 
      :data="users" 
      :searchPlaceholder="$t('admins.filterPlaceholder')"
      :footerText="`Showing ${users.length} users`"
    >
      <template #cell-user="{ item }">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {{ initials(item.name) }}
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-sm font-bold text-text-main truncate">{{ item.name }}</span>
            <span class="text-xs text-text-muted uppercase font-semibold">{{ item.role }}</span>
          </div>
        </div>
      </template>

      <template #cell-status="{ value }">
         <span 
 class="status-pill-custom"
           :class="value === 'Active' ? 'bg-success/10 text-success' : 'bg-slate-100 text-text-muted'"
         >
           {{ value || 'Active' }}
         </span>
      </template>

      <template #cell-actions="{ item }">
         <div class="flex items-center gap-2">
            <NuxtLink :to="`/users/${item.id}`" class="w-9 h-9 rounded-xl glass flex items-center justify-center text-text-dim hover:text-text-main transition-colors">
               <Edit :size="16" />
            </NuxtLink>
            <button @click="handleDelete(item.id)" class="w-9 h-9 rounded-xl glass flex items-center justify-center text-text-dim hover:text-danger transition-colors">
               <Trash2 :size="16" />
            </button>
         </div>
      </template>
    </DataTable>

    <div v-else class="flex justify-center items-center py-20">
       <Loader2 class="animate-spin text-primary" :size="40" />
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
import { onMounted, computed } from 'vue'
import { UserPlus, Edit, Trash2, Loader2 } from 'lucide-vue-next'
import { useUsersStore } from '~/stores/users'

const usersStore = useUsersStore()
const { getAll, remove } = usersStore
const users = computed(() => usersStore.items)
const loading = computed(() => usersStore.loading)

// Rendered locally: the old ui-avatars call hit an external service per row
// and used dark-console colours.
const initials = (name) =>
  (name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

const columns = [
  { key: 'user', label: t('field.customer') },
  { key: 'email', label: t('field.email') },
  { key: 'role', label: t('field.role') },
  { key: 'status', label: t('common.status') },
  { key: 'actions', label: t('common.actions') },
]

onMounted(async () => {
  await getAll()
})

const handleDelete = async (id) => {
  if (!confirm(t('confirm.deleteGeneric'))) return
  try {
    await remove(id)
  } catch (err) {
    // A 409 here means the account still has bookings attached.
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
