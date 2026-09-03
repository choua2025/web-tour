<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('nav.payments') }}</h1>
        <p class="text-text-muted mt-2 font-medium">{{ $t('page.paymentsSub') }}</p>
      </div>
      <NuxtLink to="/payments/create" class="btn-primary-custom">
        <CreditCard :size="16" />
        {{ $t('page.newPayment') }}
      </NuxtLink>
    </header>

    <!-- Totals come from the API over every row, so they stay correct while a
         tab is filtering the table below. -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div v-for="tile in summary" :key="tile.key" class="card-premium flex items-center gap-4">
        <div class="w-11 h-11 rounded-lg bg-primary-light flex items-center justify-center text-primary">
          <component :is="tile.icon" :size="20" />
        </div>
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-medium text-text-muted uppercase">{{ tile.label }}</span>
          <span class="text-2xl font-semibold text-text-main">{{ money(tile.amount) }}</span>
          <span class="text-xs text-text-muted">{{ $t('reports.paidBookings', { count: tile.count }) }}</span>
        </div>
      </div>
    </div>

    <div class="flex border border-line rounded-md overflow-hidden w-fit">
      <button
        v-for="tab in tabs"
        :key="tab.key ?? 'all'"
        class="px-4 py-2 text-sm font-medium"
        :class="activeType === tab.key ? 'bg-primary text-white' : 'text-text-muted hover:bg-slate-50'"
        @click="selectType(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div v-if="!loading" class="card-premium overflow-hidden border border-line !p-0">
      <DataTable
        exportName="payments"
        @refresh="store.getAll(activeType)" 
        :columns="columns" 
        :data="items" 
        :searchPlaceholder="$t('admins.filterPlaceholder')"
        :footerText="`${$t('reports.paid')}: ${money(totalProcessed)}`"
      >
        <template #cell-status="{ value }">
           <div 
 class="px-4 py-2 rounded-lg text-xs font-semibold uppercase border"
             :class="[ value === 'success' ? 'bg-success/5 border-success/30 text-success' : 'bg-danger/5 border-danger/30 text-danger' ]"
           >
              {{ value }}
           </div>
        </template>

        <!-- The old Booking ID column read `booking_id`, which the API strips;
             it rendered blank on every row. -->
        <template #cell-booking="{ item }">
          <div class="min-w-[180px]">
            <span class="status-pill-custom" :class="item.type === 'hotel' ? 'pill-info' : 'pill-neutral'">
              {{ item.type === 'hotel' ? $t('nav.hotels') : $t('common.tour') }}
            </span>
            <p class="text-text-main mt-1">{{ paidFor(item) }}</p>
            <p class="text-xs text-text-muted">
              #{{ item.booking?.id ?? '—' }} · {{ item.booking?.user?.name || '—' }}
            </p>
          </div>
        </template>

        <template #cell-value="{ value }">
           <span class="text-xl font-semibold text-text-main">{{ value }} <span class="text-xs font-bold text-text-muted">$</span></span>
        </template>

        <template #cell-method="{ value }">
           <span class="text-xs font-semibold uppercase text-primary">{{ value }}</span>
        </template>

        <template #cell-actions="{ item }">
           <div class="flex items-center gap-2">
              <NuxtLink :to="`/payments/${item.id}`" class="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-dim hover:text-text-main transition-colors border border-line">
                 <Edit :size="18" />
              </NuxtLink>
              <button @click="handleDelete(item.id)" class="w-10 h-10 rounded-xl glass flex items-center justify-center text-text-dim hover:text-danger hover:bg-danger/10 transition-colors border border-line">
                 <Trash2 :size="18" />
              </button>
           </div>
        </template>
      </DataTable>
    </div>
    <div v-else class="flex justify-center items-center py-40">
       <Loader2 class="animate-spin text-primary" :size="48" />
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
import { ref, onMounted, computed } from 'vue'
import { CreditCard, Trash2, Edit, Loader2, Palmtree, Hotel } from 'lucide-vue-next'
import { usePaymentsStore } from '~/stores/payments'

const store = usePaymentsStore()
const items = computed(() => store.items)
const loading = computed(() => store.loading)

// undefined = every payment; 'tour' / 'hotel' ask the API to filter.
const activeType = ref(undefined)
const selectType = (type) => {
  activeType.value = type
  store.getAll(type)
}

onMounted(() => store.getAll())

const money = (v) => `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const tourMeta = computed(() => store.meta?.tour ?? { count: 0, amount: 0 })
const hotelMeta = computed(() => store.meta?.hotel ?? { count: 0, amount: 0 })

const summary = computed(() => [
  {
    key: 'all', label: t('payments.allRevenue'), icon: CreditCard,
    count: tourMeta.value.count + hotelMeta.value.count,
    amount: tourMeta.value.amount + hotelMeta.value.amount,
  },
  { key: 'tour', label: t('payments.fromTours'), icon: Palmtree, ...tourMeta.value },
  { key: 'hotel', label: t('payments.fromHotels'), icon: Hotel, ...hotelMeta.value },
])

const tabs = computed(() => [
  { key: undefined, label: t('payments.all') },
  { key: 'tour', label: t('nav.tours') },
  { key: 'hotel', label: t('nav.hotels') },
])

const paidFor = (item) =>
  item.booking?.tour?.title || item.booking?.hotel?.name || t('notif.tourRemoved')

const totalProcessed = computed(() =>
  items.value.reduce((acc, item) => acc + Number(item.amount || 0), 0)
)

const columns = computed(() => [
  { key: 'id', label: t('common.id') },
  { key: 'booking', label: t('field.booked') },
  { key: 'amount', label: t('field.amount'), slot: 'value' },
  { key: 'payment_method', label: t('field.paymentMethod'), slot: 'method' },
  { key: 'payment_date', label: t('field.paymentDate') },
  { key: 'status', label: t('common.status'), slot: 'status' },
])

const handleDelete = async (id) => {
  if (!confirm(t('confirm.deleteGeneric'))) return
  try {
    await store.remove(id)
  } catch (err) {
    // A 409 here means the record still has history attached.
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
