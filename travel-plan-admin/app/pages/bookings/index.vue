<template>
  <div class="flex flex-col gap-6 mb-6">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 class="page-title">{{ $t('nav.bookings') }}</h1>
        <p class="text-text-muted mt-1 text-sm">{{ $t('page.bookingsSub') }}</p>
      </div>
      <NuxtLink to="/bookings/create" class="btn-primary-custom">
        <CalendarCheck :size="16" />
        {{ $t('page.newBooking') }}
      </NuxtLink>
    </header>

    <div v-if="!loading">
      <DataTable
        :columns="columns"
        :data="items"
        :searchPlaceholder="$t('dash.searchBookings')"
        :footerText="`${items.length} booking(s)`"
        @refresh="store.getAll()"
      >
        <!-- Who booked: what they typed on the form, falling back to the account -->
        <template #cell-customer="{ item }">
          <div class="min-w-[180px]">
            <p class="font-medium text-text-main">{{ contactName(item) }}</p>
            <p v-if="contactEmail(item)" class="text-xs text-text-muted">{{ contactEmail(item) }}</p>
            <p v-if="contactPhone(item)" class="text-xs text-text-muted">{{ contactPhone(item) }}</p>
          </div>
        </template>

        <!-- A booking is a tour or a hotel stay -->
        <template #cell-tour="{ item }">
          <div class="min-w-[180px]">
            <p class="text-text-main">{{ bookedName(item) }}</p>
            <p v-if="bookedPlace(item)?.destination?.name" class="text-xs text-text-muted">
              {{ bookedPlace(item).destination.name }}
            </p>
            <p v-if="item.hotel" class="text-xs text-text-muted">
              {{ item.check_in }} → {{ item.check_out }}
            </p>
          </div>
        </template>

        <template #cell-number_of_people="{ value }">
          <span class="text-text-muted">{{ value }}</span>
        </template>

        <template #cell-total_price="{ value }">
          <span class="font-medium text-text-main">{{ value }}</span>
        </template>

        <template #cell-status="{ value }">
          <span class="status-pill-custom" :class="statusPill(value)">{{ value }}</span>
        </template>

        <template #cell-payment_status="{ value }">
          <span class="status-pill-custom" :class="paymentPill(value)">{{ value }}</span>
        </template>

        <template #actions="{ item }">
          <NuxtLink
            :to="`/bookings/${item.id}`"
            class="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:bg-primary-light hover:text-primary"
            :title="$t('common.edit')"
          >
            <Edit :size="15" />
          </NuxtLink>
          <button
            @click="handleDelete(item.id)"
            class="w-8 h-8 rounded flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-danger"
            :title="$t('common.delete')"
          >
            <Trash2 :size="15" />
          </button>
        </template>
      </DataTable>
    </div>
    <div v-else class="flex justify-center items-center py-24">
      <Loader2 class="animate-spin text-primary" :size="32" />
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n()
import { onMounted, computed } from 'vue'
import { CalendarCheck, Trash2, Edit, Loader2 } from 'lucide-vue-next'
import { useBookingsStore } from '~/stores/bookings'

const store = useBookingsStore()
const items = computed(() => store.items)
const loading = computed(() => store.loading)

onMounted(() => store.getAll())

// The API strips user_id / tour_id and sends the `user` and `tour` records
// instead, so the table reads from those rather than the raw foreign keys.
const columns = computed(() => [
  { key: 'id', label: t('common.id') },
  { key: 'customer', label: t('field.customer') },
  { key: 'tour', label: t('field.booked') },
  { key: 'number_of_people', label: t('field.people') },
  { key: 'total_price', label: t('field.total') },
  { key: 'status', label: t('common.status') },
  { key: 'payment_status', label: t('field.payment') },
])

const bookedPlace = (b) => b.tour || b.hotel || null
const bookedName = (b) => b.tour?.title || b.hotel?.name || '—'

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

const handleDelete = async (id) => {
  if (!confirm(t('confirm.deleteBooking'))) return
  try {
    await store.remove(id)
  } catch (err) {
    // A 409 here means the record still has history attached.
    alert(err?.response?.data?.message || t('common.deleteFailed'))
  }
}
</script>
