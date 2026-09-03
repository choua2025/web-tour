<template>
  <aside
    class="bg-bg-sidebar border-r border-line flex flex-col sticky top-0 z-50 h-screen"
    :class="[isCollapsed ? 'w-16' : 'w-64']"
  >
    <div class="h-14 px-4 flex items-center border-b border-line" :class="[isCollapsed ? 'justify-center px-0' : '']">
      <div class="w-8 h-8 rounded bg-primary flex items-center justify-center flex-shrink-0">
        <Map class="text-white" :size="18" />
      </div>
      <span v-if="!isCollapsed" class="ml-2.5 font-semibold text-base">
        Travel<span class="text-primary">{{ $t('misc.admin') }}</span>
      </span>
    </div>

    <nav class="flex-1 py-4 overflow-y-auto">
      <div v-for="group in menuGroups" :key="group.title" class="mb-5">
        <h4 v-if="!isCollapsed" class="text-text-dim text-xs font-semibold mb-1 px-4 uppercase tracking-wide">
          {{ group.title }}
        </h4>
        <ul>
          <li v-for="item in group.items" :key="item.name">
            <NuxtLink
              v-if="item.path !== '/login'"
              :to="item.path"
              class="flex items-center px-4 py-2 text-sm border-l-2"
              :class="[
                $route.path === item.path
                  ? 'border-primary bg-primary-light text-primary font-medium'
                  : 'border-transparent text-text-muted hover:bg-slate-50 hover:text-text-main'
              ]"
              :title="item.name"
            >
              <component :is="item.icon" :size="18" class="flex-shrink-0" />
              <span v-if="!isCollapsed" class="ml-3">{{ item.name }}</span>
              <span
                v-if="!isCollapsed && item.badge"
                class="ml-auto bg-secondary text-white text-xs font-medium px-1.5 rounded"
              >
                {{ item.badge }}
              </span>
            </NuxtLink>
            <button
              v-else
              @click="handleLogoutClick"
              class="w-full flex items-center px-4 py-2 text-sm border-l-2 border-transparent text-text-muted hover:bg-slate-50 hover:text-text-main"
              :title="item.name"
            >
              <component :is="item.icon" :size="18" class="flex-shrink-0" />
              <span v-if="!isCollapsed" class="ml-3">{{ item.name }}</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>

    <div class="p-2 border-t border-line flex justify-center">
      <button
        @click="toggleSidebar"
        class="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-main"
        :title="isCollapsed ? 'Expand' : 'Collapse'"
      >
        <ChevronLeft v-if="!isCollapsed" :size="18" />
        <ChevronRight v-else :size="18" />
      </button>
    </div>

    <!-- Confirm Logout -->
    <Teleport to="body">
      <div v-if="showLogoutModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/40" @click="showLogoutModal = false"></div>

        <div class="relative w-full max-w-sm bg-white border border-line rounded-lg shadow-lg">
          <div class="px-6 py-4 border-b border-line">
            <h3 class="text-base font-semibold">{{ $t('auth.signOut') }}</h3>
          </div>
          <div class="px-6 py-5">
            <p class="text-sm text-text-muted">{{ $t('auth.confirmSignOut') }}</p>
          </div>
          <div class="px-6 py-4 border-t border-line flex justify-end gap-2">
            <button @click="showLogoutModal = false" class="btn-outline-custom">{{ $t('common.cancel') }}</button>
            <button @click="confirmLogout" class="btn-danger">{{ $t('auth.signOut') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  LayoutDashboard,
  Users,
  MapPin,
  Palmtree,
  Hotel,
  BusFront,
  CalendarCheck,
  CreditCard,
  Star,
  BarChart3,
  Settings,
  Map,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck
} from 'lucide-vue-next'

const { t } = useI18n()
const props = defineProps(['isCollapsed'])
const emit = defineEmits(['toggle'])

const showLogoutModal = ref(false)

const toggleSidebar = () => {
  emit('toggle')
}

const handleLogoutClick = () => {
  showLogoutModal.value = true
}

const confirmLogout = () => {
  const token = useCookie('auth_token')
  token.value = null
  showLogoutModal.value = false
  navigateTo('/login')
}

const menuGroups = computed(() => [
  {
    title: t('nav.overview'),
    items: [{ name: t('nav.dashboard'), path: '/', icon: LayoutDashboard }],
  },
  {
    title: t('nav.management'),
    items: [
      { name: t('nav.users'), path: '/users', icon: Users },
      { name: t('nav.admins'), path: '/admins', icon: ShieldCheck },
      { name: t('nav.destinations'), path: '/destinations', icon: MapPin },
      { name: t('nav.tours'), path: '/tours', icon: Palmtree },
      { name: t('nav.hotels'), path: '/hotels', icon: Hotel },
      { name: t('nav.transport'), path: '/transport', icon: BusFront },
    ],
  },
  {
    title: t('nav.operations'),
    items: [
      { name: t('nav.bookings'), path: '/bookings', icon: CalendarCheck },
      { name: t('nav.payments'), path: '/payments', icon: CreditCard },
      { name: t('nav.reviews'), path: '/reviews', icon: Star },
    ],
  },
  {
    title: t('nav.other'),
    items: [
      { name: t('nav.reports'), path: '/reports', icon: BarChart3 },
      { name: t('nav.settings'), path: '/settings', icon: Settings },
      { name: t('nav.logout'), path: '/login', icon: LogOut },
    ],
  },
])
</script>
