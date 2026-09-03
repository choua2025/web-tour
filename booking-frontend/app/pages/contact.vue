<template>
  <div class="min-h-screen w-full py-8">
    <div class="page-container">
      <!-- Header -->
      <div class="text-center mb-12">
        <span class="badge-primary mb-3">📬 {{ $t('badge.getInTouch') }}</span>
        <h1 class="section-title mb-3">{{ $t('nav.contactUs') }}</h1>
        <p class="section-subtitle mx-auto">{{ $t('contact.sub') }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Contact Form -->
        <div class="lg:col-span-2">
          <div class="card p-8">
            <h2 class="font-heading text-xl font-semibold text-dark-900 mb-6">{{ $t('contact.sendMessage') }}</h2>
            <form @submit.prevent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.firstName') }}</label>
                  <input type="text" placeholder="John" class="input-field" />
                </div>
                <div>
                  <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.lastName') }}</label>
                  <input type="text" placeholder="Doe" class="input-field" />
                </div>
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('booking.emailAddress') }}</label>
                <input type="email" placeholder="john@example.com" class="input-field" />
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('contact.subject') }}</label>
                <select class="input-field">
                  <option>{{ $t('contact.generalInquiry') }}</option>
                  <option>{{ $t('contact.bookingSupport') }}</option>
                  <option>{{ $t('contact.paymentIssue') }}</option>
                  <option>{{ $t('nav.partnership') }}</option>
                  <option>{{ $t('nav.feedback') }}</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium text-dark-700 block mb-1.5">{{ $t('contact.message') }}</label>
                <textarea rows="5" :placeholder="$t('contact.messagePh')" class="input-field"></textarea>
              </div>
              <button type="submit" class="btn-primary">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Send Message
              </button>
            </form>
          </div>
        </div>

        <!-- Contact Info Cards -->
        <div class="lg:col-span-1 space-y-4">
          <div v-for="info in contactInfo" :key="info.title" class="card p-6 hover:shadow-card-hover transition-all duration-300">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-50 rounded-xl flex items-center justify-center text-2xl mb-4">
              {{ info.icon }}
            </div>
            <h3 class="font-heading font-semibold text-dark-900 mb-1">{{ info.title }}</h3>
            <p class="text-sm text-dark-500 mb-2">{{ info.description }}</p>
            <a :href="info.link" class="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">{{ info.value }}</a>
          </div>

          <!-- Map Placeholder -->
          <div class="card overflow-hidden">
            <div class="h-48 bg-gradient-to-br from-primary-100 to-accent-50 flex items-center justify-center">
              <div class="text-center">
                <div class="text-4xl mb-2">🗺️</div>
                <p class="text-sm text-dark-500 font-medium">123 Travel Street</p>
                <p class="text-xs text-dark-400">San Francisco, CA 94102</p>
              </div>
            </div>
          </div>

          <!-- Operating Hours -->
          <div class="card p-6">
            <h3 class="font-heading font-semibold text-dark-900 mb-3 flex items-center gap-2">
              <span class="text-lg">🕐</span> {{ $t('contact.operatingHours') }}
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-dark-600">
                <span>{{ $t('contact.mondayFriday') }}</span>
                <span class="font-medium">{{ $t('contact.hoursWeekday') }}</span>
              </div>
              <div class="flex justify-between text-dark-600">
                <span>{{ $t('contact.saturday') }}</span>
                <span class="font-medium">{{ $t('contact.hoursSaturday') }}</span>
              </div>
              <div class="flex justify-between text-dark-600">
                <span>{{ $t('contact.sunday') }}</span>
                <span class="font-medium text-red-500">{{ $t('contact.closed') }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-16">
        <h2 class="section-title text-center mb-8">{{ $t('contact.faq') }}</h2>
        <div class="max-w-3xl mx-auto space-y-3">
          <div v-for="(faq, index) in faqs" :key="index" class="card overflow-hidden">
            <button @click="openFaq = openFaq === index ? -1 : index"
              class="w-full flex items-center justify-between p-5 text-left">
              <span class="font-medium text-dark-900 pr-4">{{ faq.question }}</span>
              <svg :class="['w-5 h-5 text-dark-400 flex-shrink-0 transition-transform duration-300', openFaq === index ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition
              enter-active-class="transition-all duration-300 ease-out"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-40"
              leave-active-class="transition-all duration-200 ease-in"
              leave-from-class="opacity-100 max-h-40"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="openFaq === index" class="px-5 pb-5">
                <p class="text-sm text-dark-500 leading-relaxed">{{ faq.answer }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
useHead({ title: 'Contact Us - TravelPlus' })

const openFaq = ref(-1)

const contactInfo = [
  { icon: '📧', title: 'Email Us', description: 'We respond within 24 hours', value: 'hello@travelplus.com', link: 'mailto:hello@travelplus.com' },
  { icon: '📞', title: 'Call Us', description: 'Available Mon-Sat', value: '+1 (555) 123-4567', link: 'tel:+15551234567' },
  { icon: '💬', title: 'Live Chat', description: '24/7 instant support', value: 'Start Chat', link: '#' },
]

const faqs = [
  { question: 'How do I book a tour?', answer: 'Simply browse our tours, select the one you like, choose your dates and number of guests, and proceed to checkout. You can pay securely with credit card, PayPal, or bank transfer.' },
  { question: 'What is your cancellation policy?', answer: 'You can cancel your booking up to 48 hours before the trip start date for a full refund. Cancellations made within 48 hours may incur a 50% fee.' },
  { question: 'Do you offer group discounts?', answer: 'Yes! Groups of 5 or more receive a 10% discount, and groups of 10+ receive 15% off. Contact us for custom group pricing.' },
  { question: 'Is travel insurance included?', answer: 'Basic travel insurance is available as an add-on during booking. We recommend purchasing premium coverage for international trips.' },
  { question: 'How do I modify my booking?', answer: 'You can modify your booking from the "My Bookings" page or contact our support team. Modifications are free if made at least 72 hours before the trip.' },
]
</script>
