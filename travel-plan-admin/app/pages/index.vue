<template>
  <div class="flex flex-col gap-6 mb-6">
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="page-title">{{ $t('nav.dashboard') }}</h1>
        <p class="text-text-muted mt-1 text-sm">
          {{ $t('dash.welcome') }}<span v-if="authStore.user?.name">, {{ authStore.user.name }}</span>. {{ $t('dash.today') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-outline-custom" @click="refreshAll" :disabled="loading">
          <RefreshCw :size="16" :class="loading ? 'animate-spin' : ''" />
          {{ $t('common.refresh') }}
        </button>
        <button class="btn-outline-custom" @click="exportSummary">
          <Download :size="16" />
          {{ $t('common.export') }}
        </button>
        <NuxtLink to="/tours/create" class="btn-primary-custom">
          <Plus :size="16" />
          {{ $t('page.newTour') }}
        </NuxtLink>
      </div>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.label" class="card-premium flex flex-col">
        <div class="flex justify-between items-start mb-3">
          <div class="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center text-primary">
            <component :is="stat.icon" :size="20" />
          </div>
          <NuxtLink :to="stat.to" class="text-xs text-primary hover:underline">{{ $t('common.view') }}</NuxtLink>
        </div>
        <span class="text-text-muted text-xs font-medium uppercase">{{ stat.label }}</span>
        <h2 class="text-2xl font-semibold mt-1 text-text-main">{{ stat.value }}</h2>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div class="card-premium xl:col-span-2 flex flex-col">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
          <div>
            <h3 class="text-base font-semibold text-text-main">{{ $t('dash.bookingTrends') }}</h3>
            <p class="text-xs text-text-muted mt-0.5">{{ $t('dash.bookingsPerDay') }}</p>
          </div>
          <div class="flex border border-line rounded-md overflow-hidden">
            <button
              v-for="option in rangeOptions"
              :key="option.days"
              class="px-3 py-1.5 text-xs font-medium"
              :class="range === option.days ? 'bg-primary text-white' : 'text-text-muted hover:bg-slate-50'"
              @click="range = option.days"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div class="h-72 w-full">
          <BaseChart type="line" :data="bookingChartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Top destinations, ranked by real bookings -->
      <div class="card-premium flex flex-col">
        <div class="mb-5">
          <h3 class="text-base font-semibold text-text-main">{{ $t('dash.topDestinations') }}</h3>
          <p class="text-xs text-text-muted mt-0.5">{{ $t('dash.byVolume') }}</p>
        </div>
        <div class="flex flex-col gap-4 flex-1">
          <p v-if="!topDestinations.length" class="text-sm text-text-muted py-6 text-center">
            {{ $t('dash.noBookings') }}
          </p>
          <NuxtLink
            v-for="(dest, i) in topDestinations"
            :key="dest.name"
            to="/destinations"
            class="flex items-center gap-3 group"
          >
            <span class="w-7 h-7 rounded-full bg-slate-100 border border-line text-xs font-semibold text-text-muted flex items-center justify-center shrink-0">
              {{ i + 1 }}
            </span>
            <div class="flex-1 min-w-0">
              <h4 class="font-medium text-sm text-text-main truncate group-hover:text-primary">{{ dest.name }}</h4>
              <p class="text-xs text-text-muted mt-0.5">{{ dest.bookings }} booking(s)</p>
            </div>
            <span class="text-sm font-medium text-text-main">{{ money(dest.revenue) }}</span>
          </NuxtLink>
        </div>
        <NuxtLink to="/destinations" class="btn-outline-custom mt-5 w-full justify-center">
          {{ $t('dash.viewAllDest') }}
        </NuxtLink>
      </div>
    </div>

    <!-- Recent bookings -->
    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-base font-semibold text-text-main">{{ $t('dash.recentBookings') }}</h3>
          <p class="text-xs text-text-muted mt-0.5">{{ $t('dash.latestActivity') }}</p>
        </div>
        <NuxtLink to="/bookings" class="flex items-center gap-1.5 text-primary text-sm hover:underline">
          {{ $t('common.viewAll') }} <ArrowRight :size="15" />
        </NuxtLink>
      </div>

      <DataTable
        :columns="bookingColumns"
        :data="recentBookings"
        :hasActions="false"
        :pageSize="5"
        :searchPlaceholder="$t('dash.searchBookings')"
        exportName="recent-bookings"
        @refresh="refreshAll"
      >
        <template #cell-customer="{ item }">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {{ initials(customerName(item)) }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-medium text-text-main truncate">{{ customerName(item) }}</span>
              <span class="text-xs text-text-muted truncate">{{ customerEmail(item) }}</span>
            </div>
          </div>
        </template>

        <template #cell-tour="{ item }">
          <span class="text-text-main">{{ item.tour?.title || '—' }}</span>
        </template>

        <template #cell-total_price="{ value }">
          <span class="font-medium text-text-main">{{ money(value) }}</span>
        </template>

        <template #cell-status="{ value }">
          <span class="status-pill-custom" :class="statusPill(value)">{{ value }}</span>
        </template>

        <template #cell-payment_status="{ value }">
          <span class="status-pill-custom" :class="paymentPill(value)">{{ value }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
import { ref, computed, onMounted } from 'vue'
import { Users, Palmtree, CalendarCheck, CreditCard, Download, Plus, ArrowRight, RefreshCw } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useBookingsStore } from '~/stores/bookings'
import { useToursStore } from '~/stores/tours'
import { useUsersStore } from '~/stores/users'

const authStore = useAuthStore()
const bookings = useBookingsStore()
const tours = useToursStore()
const users = useUsersStore()

const loading = computed(() => bookings.loading || tours.loading || users.loading)

const refreshAll = () => Promise.all([bookings.getAll(), tours.getAll(), users.getAll()])
onMounted(refreshAll)

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const paidRevenue = computed(() =>
  bookings.items
    .filter((b) => b.payment_status === 'paid')
    .reduce((sum, b) => sum + Number(b.total_price || 0), 0)
)

const stats = computed(() => [
  { label: t('dash.totalUsers'), value: users.items.length, icon: Users, to: '/users' },
  { label: t('dash.liveTours'), value: tours.items.length, icon: Palmtree, to: '/tours' },
  { label: t('nav.bookings'), value: bookings.items.length, icon: CalendarCheck, to: '/bookings' },
  { label: t('dash.paidRevenue'), value: money(paidRevenue.value), icon: CreditCard, to: '/payments' },
])

// ── chart ─────────────────────────────────────────────────────
const rangeOptions = [
  { days: 7, label: t('misc.days7') },
  { days: 30, label: t('misc.days30') },
]
const range = ref(7)

const bookingChartData = computed(() => {
  const days = []
  const today = new Date()
  for (let i = range.value - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }

  const counts = days.map(
    (day) => bookings.items.filter((b) => String(b.createdAt || '').slice(0, 10) === day).length
  )

  return {
    labels: days.map((d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
    datasets: [{
      label: t('nav.bookings'),
      data: counts,
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.12)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    }],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: '#e2e8f0' } },
    x: { grid: { display: false } },
  },
}

// ── top destinations ──────────────────────────────────────────
const topDestinations = computed(() => {
  const totals = new Map()
  for (const b of bookings.items) {
    const name = b.tour?.destination?.name
    if (!name) continue
    const entry = totals.get(name) || { name, bookings: 0, revenue: 0 }
    entry.bookings += 1
    entry.revenue += Number(b.total_price || 0)
    totals.set(name, entry)
  }
  return [...totals.values()].sort((a, b) => b.bookings - a.bookings).slice(0, 5)
})

// ── recent bookings ───────────────────────────────────────────
const recentBookings = computed(() => bookings.items.slice(0, 10))

const bookingColumns = computed(() => [
  { key: 'id', label: t('common.id') },
  { key: 'customer', label: t('field.customer') },
  { key: 'tour', label: t('field.tour') },
  { key: 'total_price', label: t('field.total') },
  { key: 'status', label: t('common.status') },
  { key: 'payment_status', label: t('field.payment') },
])

const customerName = (b) => b.contact_name || b.user?.name || 'Unknown customer'
const customerEmail = (b) => b.contact_email || b.user?.email || ''

const initials = (name) =>
  (name || '?').split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('')

const statusPill = (status) => ({
  confirmed: 'pill-success', pending: 'pill-warning', cancelled: 'pill-danger',
}[status] || 'pill-neutral')

const paymentPill = (status) => ({
  paid: 'pill-success', unpaid: 'pill-warning', refunded: 'pill-neutral',
}[status] || 'pill-neutral')

// ── export ────────────────────────────────────────────────────
const exportSummary = () => {
  const rows = [
    ['Metric', 'Value'],
    ...stats.value.map((s) => [s.label, s.value]),
    [],
    ['Destination', 'Bookings', 'Revenue'],
    ...topDestinations.value.map((d) => [d.name, d.bookings, d.revenue.toFixed(2)]),
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `dashboard-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>
