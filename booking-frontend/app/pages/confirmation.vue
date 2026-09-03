<template>
  <div class="min-h-screen w-full py-16">
    <div class="page-container max-w-3xl">

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <svg class="w-12 h-12 mx-auto text-primary-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-dark-500">{{ $t('confirm.loading') }}</p>
      </div>

      <!-- Nothing to show: no id, or a booking that is not the visitor's -->
      <div v-else-if="!booking" class="text-center py-16">
        <div class="w-16 h-16 mx-auto bg-dark-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
          </svg>
        </div>
        <h1 class="font-heading text-2xl font-bold text-dark-900 mb-2">{{ $t('confirm.notFound') }}</h1>
        <p class="text-dark-500 mb-6">{{ $t('confirm.notFoundSub') }}</p>
        <NuxtLink to="/my-bookings" class="btn-primary">{{ $t('payres.viewMyBookings') }}</NuxtLink>
      </div>

      <template v-else>
        <div class="text-center mb-8 no-print">
          <div class="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
            :class="isPaid ? 'bg-accent-100' : 'bg-amber-100'">
            <svg v-if="isPaid" class="w-12 h-12 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
            </svg>
          </div>
          <h1 class="font-heading text-3xl md:text-4xl font-bold text-dark-900 mb-3">
            {{ isPaid ? $t('confirm.title') : $t('confirm.pendingTitle') }}
          </h1>
          <p class="text-dark-500 text-lg">
            {{ isPaid ? $t('confirm.sub') : $t('confirm.pendingSub') }}
          </p>
        </div>

        <!-- Receipt -->
        <div id="receipt" class="card p-8 text-left mb-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="font-heading text-xl font-semibold text-dark-900">{{ $t('confirm.details') }}</h2>
            <span :class="isPaid ? 'badge-success' : 'badge-warning'">{{ booking.payment_status }}</span>
          </div>

          <div class="flex items-center gap-4 p-4 bg-dark-50 rounded-xl mb-6">
            <img
              v-if="tourImage"
              :src="tourImage"
              :alt="booking.tour?.title || $t('common.tour')"
              class="w-24 h-20 rounded-lg object-cover"
            />
            <div>
              <h3 class="font-heading font-semibold text-dark-900">{{ bookedName }}</h3>
              <p v-if="destinationName" class="text-sm text-dark-500">{{ destinationName }}</p>
              <p v-if="booking.hotel" class="text-sm text-dark-500">
                {{ formatDate(booking.check_in) }} → {{ formatDate(booking.check_out) }}
              </p>
              <p v-else-if="booking.tour?.duration" class="text-sm text-dark-500">
                {{ booking.tour.duration }} {{ $t('confirm.days') }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm mb-6">
            <div class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">{{ $t('confirm.reference') }}</span>
              <span class="font-mono font-bold text-primary-600">{{ reference }}</span>
            </div>
            <div class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">{{ $t('booking.travelDate') }}</span>
              <span class="font-medium text-dark-900">{{ formatDate(booking.booking_date) }}</span>
            </div>
            <div class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">{{ $t('common.guests') }}</span>
              <span class="font-medium text-dark-900">{{ booking.number_of_people }}</span>
            </div>
            <div class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">
                {{ isPaid ? $t('pay.totalPaid') : $t('pay.totalDue') }}
              </span>
              <span class="font-bold text-primary-600">${{ booking.total_price }}</span>
            </div>
          </div>

          <!-- Who this booking is for -->
          <div v-if="contactName" class="grid grid-cols-2 gap-4 text-sm mb-6">
            <div class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">{{ $t('confirm.bookedBy') }}</span>
              <span class="font-medium text-dark-900">{{ contactName }}</span>
            </div>
            <div v-if="contactEmail" class="p-3 bg-dark-50 rounded-lg">
              <span class="text-dark-400 block text-xs mb-0.5">{{ $t('common.email') }}</span>
              <span class="font-medium text-dark-900 break-all">{{ contactEmail }}</span>
            </div>
          </div>

          <div v-if="isPaid" class="p-4 bg-primary-50 rounded-xl text-sm text-primary-800">
            <p class="font-medium mb-1">📧 {{ $t('badge.emailSent') }}</p>
            <p class="text-primary-600">{{ $t('confirm.itinerarySent') }}</p>
          </div>
          <div v-else class="p-4 bg-amber-50 rounded-xl text-sm text-amber-800">
            <p>{{ $t('confirm.stillUnpaid') }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 no-print">
          <NuxtLink
            v-if="!isPaid"
            :to="`/payment?booking_id=${booking.id}`"
            class="btn-primary"
          >
            {{ $t('confirm.payNow') }}
          </NuxtLink>

          <button class="btn-outline" @click="downloadReceipt">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            {{ $t('confirm.downloadReceipt') }}
          </button>

          <button class="btn-outline" @click="printBooking">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {{ $t('confirm.printBooking') }}
          </button>

          <NuxtLink to="/my-bookings" class="btn-ghost border border-dark-200">
            {{ $t('payres.viewMyBookings') }}
          </NuxtLink>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Booking Confirmed - TravelPlus' })

const route = useRoute()
const api = useApi()

// Accept either ?booking_id= (our own links) or ?id= for convenience.
const bookingId = computed(() => (route.query.booking_id || route.query.id) as string | undefined)

// Fetched during SSR so the receipt is in the first paint — a printable page
// that flashes a spinner first is a poor thing to hit Ctrl+P on.
const { data: booking, pending: loading } = await useAsyncData(
  () => `booking-${bookingId.value ?? 'none'}`,
  async () => {
    // `false` rather than null: useAsyncData treats a nullish result as "no
    // value" and re-runs the request on the client.
    if (!bookingId.value) return false
    try {
      const res: any = await api.bookings.getById(bookingId.value)
      return res?.data ?? false
    } catch (error) {
      // A 403 here means the id belongs to someone else — same empty state.
      return false
    }
  },
  { watch: [bookingId] }
)

const isPaid = computed(() => booking.value?.payment_status === 'paid')
// A booking is a tour or a stay; show whichever it is.
const booked = computed(() => booking.value?.tour || booking.value?.hotel || null)
const bookedName = computed(() => booking.value?.tour?.title || booking.value?.hotel?.name || t('common.tour'))
const destinationName = computed(() => booked.value?.destination?.name || '')
const tourImage = computed(() => booked.value?.image || booked.value?.destination?.image || '')
const contactName = computed(() => booking.value?.contact_name || booking.value?.user?.name || '')
const contactEmail = computed(() => booking.value?.contact_email || booking.value?.user?.email || '')

// A readable reference built from the real record rather than a fake code.
const reference = computed(() => {
  if (!booking.value) return ''
  const created = new Date(booking.value.createdAt || booking.value.booking_date)
  const year = Number.isNaN(created.getFullYear()) ? new Date().getFullYear() : created.getFullYear()
  return `BK-${year}-${String(booking.value.id).padStart(4, '0')}`
})

const formatDate = (value: string) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const printBooking = () => window.print()

const downloadReceipt = () => {
  const b = booking.value
  const rows = [
    [t('confirm.reference'), reference.value],
    [b.hotel ? t('confirm.hotel') : t('common.tour'), b.tour?.title || b.hotel?.name || ''],
    [t('common.destination'), destinationName.value],
    b.hotel
      ? [t('booking.stay'), `${formatDate(b.check_in)} - ${formatDate(b.check_out)}`]
      : [t('booking.travelDate'), formatDate(b.booking_date)],
    [t('common.guests'), b.number_of_people],
    [t('confirm.bookedBy'), contactName.value],
    [t('common.email'), contactEmail.value],
    [t('mine.bookingStatus'), b.status],
    [t('pay.title'), b.payment_status],
    [isPaid.value ? t('pay.totalPaid') : t('pay.totalDue'), `$${b.total_price}`],
  ]

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${reference.value}</title>
<style>
 body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:0 24px;color:#0f172a}
 h1{font-size:20px;margin:0 0 4px} .sub{color:#64748b;margin:0 0 24px;font-size:14px}
 table{width:100%;border-collapse:collapse;font-size:14px}
 td{padding:10px 0;border-bottom:1px solid #e2e8f0}
 td:first-child{color:#64748b;width:45%} td:last-child{text-align:right;font-weight:500}
</style></head><body>
<h1>TravelPlus — ${t('confirm.details')}</h1>
<p class="sub">${reference.value}</p>
<table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v ?? ''}</td></tr>`).join('')}</table>
</body></html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${reference.value}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style>
/* Print just the receipt card, not the site chrome around it. */
@media print {
  .no-print,
  nav,
  footer {
    display: none !important;
  }

  #receipt {
    border: none;
    box-shadow: none;
    padding: 0;
  }
}
</style>
