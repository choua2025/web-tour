<template>
  <header class="h-14 px-6 flex items-center justify-between bg-white border-b border-line sticky top-0 z-40">
    <div class="relative w-full max-w-xs" ref="searchRef">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" :size="16" />
      <input
        v-model="query"
        type="text"
        :placeholder="$t('nav.jumpTo')"
        class="w-full bg-white border border-line rounded-md pl-9 pr-3 py-1.5 text-sm placeholder:text-text-dim focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        @focus="searchOpen = true"
        @keydown.enter.prevent="goToFirstMatch"
        @keydown.esc="searchOpen = false"
      />

      <div
        v-if="searchOpen && query"
        class="absolute left-0 right-0 mt-2 bg-white border border-line rounded-lg shadow-lg overflow-hidden z-50"
      >
        <NuxtLink
          v-for="match in matches"
          :key="match.path"
          :to="match.path"
          class="block px-4 py-2.5 text-sm text-text-muted hover:bg-slate-50 hover:text-text-main"
          @click="closeSearch"
        >
          {{ match.name }}
          <span class="text-text-dim text-xs ml-1">{{ match.path }}</span>
        </NuxtLink>
        <p v-if="!matches.length" class="px-4 py-3 text-sm text-text-muted">No section matches "{{ query }}"</p>
      </div>
    </div>

    <div class="flex items-center gap-1">
      <!-- New bookings -->
      <div class="relative" ref="bellRef">
        <button
          class="w-9 h-9 rounded flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-main relative"
          :title="unreadCount ? `${unreadCount} new booking(s)` : 'Bookings'"
          @click="toggleBell"
        >
          <Bell :size="18" />
          <span
            v-if="events.connected.value"
            class="absolute bottom-1 right-1 w-1.5 h-1.5 bg-success rounded-full"
            :title="$t('notif.live')"
          ></span>
          <span
            v-if="unreadCount"
            class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-danger text-white text-[10px] font-semibold rounded-full flex items-center justify-center"
          >
            {{ unreadCount > 9 ? '9+' : unreadCount }}
          </span>
        </button>

        <div
          v-if="bellOpen"
          class="absolute right-0 mt-2 w-[380px] max-w-[calc(100vw-2rem)] bg-white border border-line rounded-lg shadow-lg overflow-hidden"
        >
          <div class="px-4 py-3 border-b border-line flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-text-main">{{ $t('notif.newBookings') }}</p>
              <p class="text-xs text-text-muted">
                {{ unreadCount ? `${unreadCount} since you last looked` : 'Nothing new' }}
              </p>
            </div>
            <button
              v-if="unreadCount"
              class="text-xs text-primary hover:underline"
              @click="notifications.markAllRead()"
            >
              {{ $t('notif.markAllRead') }}
            </button>
          </div>

          <div class="max-h-[380px] overflow-y-auto">
            <p v-if="notifications.error" class="px-4 py-6 text-sm text-danger text-center">
              {{ notifications.error }}
            </p>
            <p v-else-if="!feed.length" class="px-4 py-10 text-sm text-text-muted text-center">
              {{ $t('notif.allCaughtUp') }}
            </p>

            <NuxtLink
              v-for="booking in feed"
              :key="booking.id"
              :to="`/bookings/${booking.id}`"
              class="block px-4 py-3 border-b border-line last:border-b-0 hover:bg-slate-50 bg-primary-light/60"
              @click="openBooking(booking)"
            >
              <div class="flex items-start justify-between gap-3">
                <p class="text-sm font-medium text-text-main truncate">
                  {{ contactName(booking) }}
                </p>
                <span class="text-xs text-text-dim shrink-0">{{ timeAgo(booking.createdAt) }}</span>
              </div>

              <p class="text-sm text-text-muted truncate mt-0.5">
                {{ booking.tour?.title || booking.hotel?.name || $t('notif.tourRemoved') }}
                <span v-if="(booking.tour || booking.hotel)?.destination?.name" class="text-text-dim">
                  &middot; {{ (booking.tour || booking.hotel).destination.name }}
                </span>
              </p>

              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-text-muted">
                <span v-if="contactEmail(booking)" class="inline-flex items-center gap-1">
                  <Mail :size="12" /> {{ contactEmail(booking) }}
                </span>
                <span v-if="contactPhone(booking)" class="inline-flex items-center gap-1">
                  <Phone :size="12" /> {{ contactPhone(booking) }}
                </span>
              </div>

              <div class="flex items-center gap-2 mt-2">
                <span class="status-pill-custom pill-neutral">{{ booking.number_of_people }} pax</span>
                <span class="status-pill-custom pill-info">{{ booking.total_price }}</span>
                <span class="status-pill-custom" :class="statusPill(booking.status)">{{ booking.status }}</span>
                <span class="status-pill-custom" :class="paymentPill(booking.payment_status)">
                  {{ booking.payment_status }}
                </span>
              </div>
            </NuxtLink>
          </div>

          <NuxtLink
            to="/bookings"
            class="block px-4 py-2.5 text-center text-sm text-primary hover:bg-slate-50 border-t border-line"
            @click="bellOpen = false"
          >
            {{ $t('notif.viewAllBookings') }}
          </NuxtLink>
        </div>
      </div>

      <LanguageSwitcher />

      <NuxtLink to="/settings" class="w-9 h-9 rounded flex items-center justify-center text-text-muted hover:bg-slate-100 hover:text-text-main" :title="$t('nav.settings')">
        <Settings :size="18" />
      </NuxtLink>

      <div class="h-6 w-px bg-line mx-2"></div>

      <div class="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded hover:bg-slate-100 cursor-pointer">
        <div class="w-8 h-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
          {{ initials }}
        </div>
        <div class="hidden sm:flex flex-col leading-tight">
          <span class="text-sm font-medium">{{ user?.name || '—' }}</span>
          <span class="text-xs text-text-muted capitalize">{{ user?.role || '' }}</span>
        </div>
        <ChevronDown class="text-text-dim" :size="14" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { Search, Bell, Settings, ChevronDown, Mail, Phone } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useNotificationsStore } from '~/stores/notifications'

const { t } = useI18n()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const notifications = useNotificationsStore()
// Only what has not been opened yet — clicking one clears it from the bell.
const feed = computed(() => notifications.unread)
const unreadCount = computed(() => notifications.unreadCount)

const bellOpen = ref(false)
const bellRef = ref(null)

// A real quick-jump over the console's own sections. The API has no
// cross-resource search endpoint, so promising one here would be a lie.
const SECTIONS = computed(() => [
  { name: t('nav.dashboard'), path: '/' },
  { name: t('nav.users'), path: '/users' },
  { name: t('nav.admins'), path: '/admins' },
  { name: t('nav.destinations'), path: '/destinations' },
  { name: t('nav.tours'), path: '/tours' },
  { name: t('nav.hotels'), path: '/hotels' },
  { name: t('nav.transport'), path: '/transport' },
  { name: t('nav.bookings'), path: '/bookings' },
  { name: t('nav.payments'), path: '/payments' },
  { name: t('nav.reviews'), path: '/reviews' },
  { name: t('nav.reports'), path: '/reports' },
  { name: t('nav.settings'), path: '/settings' },
])

const query = ref('')
const searchOpen = ref(false)
const searchRef = ref(null)

const matches = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  return SECTIONS.value.filter((s) => s.name.toLowerCase().includes(q)).slice(0, 6)
})

const closeSearch = () => {
  searchOpen.value = false
  query.value = ''
}

const goToFirstMatch = () => {
  const first = matches.value[0]
  if (!first) return
  navigateTo(first.path)
  closeSearch()
}

const toggleBell = () => {
  bellOpen.value = !bellOpen.value
  // Opening is the acknowledgement — refresh so the list is current.
  if (bellOpen.value) notifications.fetch()
}

const closeOnOutside = (event) => {
  if (bellOpen.value && bellRef.value && !bellRef.value.contains(event.target)) {
    bellOpen.value = false
  }
  if (searchOpen.value && searchRef.value && !searchRef.value.contains(event.target)) {
    searchOpen.value = false
  }
}

// Live updates: a new booking reaches the bell in about a second instead of
// waiting out a 30-second poll. The store keeps polling as a fallback, just
// far less often while the stream is up.
const events = useServerEvents({
  'booking.created': () => notifications.fetch(),
  'booking.confirmed': () => notifications.fetch(),
  'payment.paid': () => notifications.fetch(),
})

watch(events.connected, (up) => notifications.setStreaming(up))

onMounted(() => {
  notifications.start()
  events.open()
  document.addEventListener('click', closeOnOutside)
})

onBeforeUnmount(() => {
  notifications.stop()
  events.close()
  document.removeEventListener('click', closeOnOutside)
})

const openBooking = (booking) => {
  notifications.markRead(booking.id)
  bellOpen.value = false
}

// The traveller's own contact details, falling back to the account that booked
const contactName = (b) => b.contact_name || b.user?.name || 'Unknown customer'
const contactEmail = (b) => b.contact_email || b.user?.email || ''
const contactPhone = (b) => b.contact_phone || b.user?.phone || ''

const statusPill = (status) => ({
  confirmed: 'pill-success',
  pending: 'pill-warning',
  cancelled: 'pill-danger',
}[status] || 'pill-neutral')

const paymentPill = (status) => ({
  paid: 'pill-success',
  unpaid: 'pill-warning',
  refunded: 'pill-neutral',
}[status] || 'pill-neutral')

const timeAgo = (value) => {
  if (!value) return ''
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(value).toLocaleDateString()
}

const initials = computed(() => {
  const name = user.value?.name
  if (!name) return '—'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
})
</script>
