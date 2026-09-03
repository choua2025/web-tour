<template>
  <div>
    <div class="mb-6">
      <div class="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
        <ShieldAlert class="text-warning" :size="20" />
      </div>
      <h1 class="text-lg font-semibold text-text-main">{{ $t('auth.restrictedTitle') }}</h1>
      <p class="text-sm text-text-muted mt-1">
        Admin accounts can't be created by signing up &mdash; that would let anyone grant
        themselves access. An existing admin has to create yours.
      </p>
    </div>

    <ol class="space-y-3 mb-6">
      <li v-for="(stepText, i) in steps" :key="i" class="flex gap-3 text-sm">
        <span class="w-5 h-5 rounded-full bg-slate-100 border border-line text-xs font-medium text-text-muted flex items-center justify-center shrink-0">
          {{ i + 1 }}
        </span>
        <span class="text-text-muted" v-html="stepText"></span>
      </li>
    </ol>

    <NuxtLink to="/login" class="btn-primary-custom w-full justify-center py-2.5">{{ $t('auth.backToSignIn') }}</NuxtLink>

    <p class="text-sm text-text-muted text-center mt-6 pt-6 border-t border-line">
      {{ $t('auth.forgotYourPassword') }}
      <NuxtLink to="/forgot-password" class="text-primary hover:underline">{{ $t('auth.resetItHere') }}</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { ShieldAlert } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth'
})

const steps = [
  'Ask an existing admin to open <span class="font-medium text-text-main">Users &rarr; Create</span> in the console.',
  'They create your account with the <span class="font-medium text-text-main">admin</span> role.',
  'Sign in here with the credentials they give you.',
]
</script>
