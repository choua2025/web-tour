<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="page-title">{{ $t('nav.reports') }}</h1>
        <p class="text-text-muted mt-1 text-sm">{{ $t('page.reportsSub') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <select v-model="year" class="input-custom w-auto">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <button class="btn-outline-custom" @click="refreshAll" :disabled="loading">
          <RefreshCw :size="16" :class="loading ? 'animate-spin' : ''" />
          {{ $t('common.refresh') }}
        </button>
        <button class="btn-primary-custom" @click="exportReport">
          <Download :size="16" />
          {{ $t('common.exportCsv') }}
        </button>
      </div>
    </header>

    <!-- Key metrics -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="metric in metrics" :key="metric.label" class="card-premium">
        <div class="flex justify-between items-start mb-3">
          <div class="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center text-primary">
            <component :is="metric.icon" :size="20" />
          </div>
        </div>
        <p class="text-xs font-medium text-text-muted uppercase">{{ metric.label }}</p>
        <h2 class="text-2xl font-semibold text-text-main mt-1">{{ metric.value }}</h2>
        <p class="text-xs text-text-muted mt-1">{{ metric.hint }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <!-- Revenue over time -->
      <div class="card-premium xl:col-span-2 flex flex-col">
        <div class="flex justify-between items-center mb-5">
          <div>
            <h3 class="text-base font-semibold text-text-main">{{ $t('reports.revenueOverTime') }}</h3>
            <p class="text-xs text-text-muted mt-0.5">{{ $t('reports.paidBookingsYear', { year }) }}</p>
          </div>
          <div class="flex border border-line rounded-md overflow-hidden">
            <button
              v-for="mode in groupings"
              :key="mode.key"
              class="px-3 py-1.5 text-xs font-medium"
              :class="grouping === mode.key ? 'bg-primary text-white' : 'text-text-muted hover:bg-slate-50'"
              @click="grouping = mode.key"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>
        <div class="h-72 w-full">
          <BaseChart type="bar" :data="revenueChartData" />
        </div>
      </div>

      <!-- Revenue by destination -->
      <div class="card-premium flex flex-col">
        <div class="mb-5">
          <h3 class="text-base font-semibold text-text-main">{{ $t('reports.revenueByDest') }}</h3>
          <p class="text-xs text-text-muted mt-0.5">{{ $t('reports.shareOfRevenue') }}</p>
        </div>
        <div v-if="destinationRows.length" class="h-52 w-full">
          <BaseChart type="doughnut" :data="destinationChartData" :options="donutOptions" />
        </div>
        <p v-else class="text-sm text-text-muted py-10 text-center">{{ $t('reports.noPaidYet') }}</p>

        <div class="mt-5 space-y-2">
          <div v-for="(row, i) in destinationRows.slice(0, 5)" :key="row.name" class="flex items-center gap-2 text-sm">
            <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: PALETTE[i % PALETTE.length] }"></span>
            <span class="flex-1 truncate text-text-muted">{{ row.name }}</span>
            <span class="font-medium text-text-main">{{ money(row.revenue) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Top tours -->
    <div class="flex flex-col gap-4">
      <h3 class="text-base font-semibold text-text-main">{{ $t('reports.topTours') }}</h3>
      <DataTable
        :columns="tourColumns"
        :data="tourRows"
        :hasActions="false"
        :searchPlaceholder="$t('reports.searchTours')"
        exportName="top-tours"
        @refresh="refreshAll"
      >
        <template #cell-revenue="{ value }">
          <span class="font-medium text-text-main">{{ money(value) }}</span>
        </template>
        <template #cell-paidRevenue="{ value }">
          <span class="text-text-muted">{{ money(value) }}</span>
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
import { ref, computed, onMounted } from 'vue'
import { Download, RefreshCw, CreditCard, CalendarCheck, TrendingUp, Percent } from 'lucide-vue-next'
import { useBookingsStore } from '~/stores/bookings'
import { useToursStore } from '~/stores/tours'

const bookings = useBookingsStore()
const tours = useToursStore()

const loading = computed(() => bookings.loading || tours.loading)
const refreshAll = () => Promise.all([bookings.getAll(), tours.getAll()])
onMounted(refreshAll)

const PALETTE = ['#4f46e5', '#0ea5e9', '#16a34a', '#d97706', '#db2777', '#7c3aed']
const money = (v) => `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const bookingYear = (b) => new Date(b.createdAt || b.booking_date).getFullYear()

const years = computed(() => {
  const found = new Set(bookings.items.map(bookingYear).filter((y) => !Number.isNaN(y)))
  found.add(new Date().getFullYear())
  return [...found].sort((a, b) => b - a)
})
const year = ref(new Date().getFullYear())

const inYear = computed(() => bookings.items.filter((b) => bookingYear(b) === year.value))
const paid = computed(() => inYear.value.filter((b) => b.payment_status === 'paid'))

const totalRevenue = computed(() => paid.value.reduce((s, b) => s + Number(b.total_price || 0), 0))

const metrics = computed(() => {
  const count = inYear.value.length
  const paidCount = paid.value.length
  return [
    { label: t('dash.paidRevenue'), value: money(totalRevenue.value), icon: CreditCard, hint: t('reports.paidBookings', { count: paidCount }) },
    { label: t('nav.bookings'), value: count, icon: CalendarCheck, hint: t('reports.inYear', { year: year.value }) },
    {
      label: t('reports.avgBooking'),
      value: money(paidCount ? totalRevenue.value / paidCount : 0),
      icon: TrendingUp,
      hint: t('reports.acrossPaid'),
    },
    {
      label: t('reports.paymentRate'),
      value: count ? `${Math.round((paidCount / count) * 100)}%` : '—',
      icon: Percent,
      hint: t('reports.bookingsPaid'),
    },
  ]
})

// ── revenue over time ─────────────────────────────────────────
const grouping = ref('Monthly')
const groupings = computed(() => [
  { key: 'Monthly', label: t('reports.monthly') },
  { key: 'Quarterly', label: t('reports.quarterly') },
])

const revenueChartData = computed(() => {
  const monthly = new Array(12).fill(0)
  for (const b of paid.value) {
    monthly[new Date(b.createdAt || b.booking_date).getMonth()] += Number(b.total_price || 0)
  }

  if (grouping.value === 'Quarterly') {
    const quarters = [0, 1, 2, 3].map((q) => monthly.slice(q * 3, q * 3 + 3).reduce((a, b) => a + b, 0))
    return {
      labels: ['Q1', 'Q2', 'Q3', 'Q4'],
      datasets: [{ label: t('reports.revenue'), data: quarters, backgroundColor: '#4f46e5', borderRadius: 4 }],
    }
  }

  return {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{ label: t('reports.revenue'), data: monthly, backgroundColor: '#4f46e5', borderRadius: 4 }],
  }
})

// ── revenue by destination ────────────────────────────────────
const destinationRows = computed(() => {
  const totals = new Map()
  for (const b of paid.value) {
    const name = b.tour?.destination?.name || 'Unknown'
    totals.set(name, (totals.get(name) || 0) + Number(b.total_price || 0))
  }
  return [...totals.entries()]
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
})

const destinationChartData = computed(() => ({
  labels: destinationRows.value.map((r) => r.name),
  datasets: [{
    data: destinationRows.value.map((r) => r.revenue),
    backgroundColor: destinationRows.value.map((_, i) => PALETTE[i % PALETTE.length]),
    borderWidth: 0,
  }],
}))

const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '65%',
  plugins: { legend: { display: false } },
  scales: {},
}

// ── top tours ─────────────────────────────────────────────────
const tourColumns = computed(() => [
  { key: 'title', label: t('field.tour') },
  { key: 'destination', label: t('field.destination') },
  { key: 'bookings', label: t('nav.bookings') },
  { key: 'people', label: t('field.people') },
  { key: 'revenue', label: t('reports.bookedValue') },
  { key: 'paidRevenue', label: t('reports.paid') },
])

const tourRows = computed(() => {
  const totals = new Map()
  for (const b of inYear.value) {
    const title = b.tour?.title
    if (!title) continue
    const row = totals.get(title) || {
      title,
      destination: b.tour?.destination?.name || '—',
      bookings: 0, people: 0, revenue: 0, paidRevenue: 0,
    }
    row.bookings += 1
    row.people += Number(b.number_of_people || 0)
    row.revenue += Number(b.total_price || 0)
    if (b.payment_status === 'paid') row.paidRevenue += Number(b.total_price || 0)
    totals.set(title, row)
  }
  return [...totals.values()].sort((a, b) => b.revenue - a.revenue)
})

// ── export ────────────────────────────────────────────────────
const exportReport = () => {
  const rows = [
    [`TravelAdmin report ${year.value}`],
    [],
    ['Metric', 'Value'],
    ...metrics.value.map((m) => [m.label, m.value]),
    [],
    ['Destination', 'Paid revenue'],
    ...destinationRows.value.map((r) => [r.name, r.revenue.toFixed(2)]),
    [],
    ['Tour', 'Destination', 'Bookings', 'People', 'Booked value', 'Paid'],
    ...tourRows.value.map((r) => [r.title, r.destination, r.bookings, r.people, r.revenue.toFixed(2), r.paidRevenue.toFixed(2)]),
  ]
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `report-${year.value}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>
