<template>
  <div class="relative" ref="rootRef">
    <button
      class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-dark-600 hover:text-primary-500 hover:bg-primary-50 transition-colors"
      :title="$t('lang.label')"
      @click="open = !open"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18 15 15 0 010-18z" />
      </svg>
      <span class="text-sm font-medium uppercase">{{ locale }}</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 mt-2 w-40 bg-white border border-dark-100 rounded-xl shadow-lg overflow-hidden z-50"
    >
      <button
        v-for="option in locales"
        :key="option.code"
        class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-primary-50"
        :class="option.code === locale ? 'text-primary-500 font-semibold' : 'text-dark-600'"
        @click="choose(option.code)"
      >
        {{ option.name }}
        <span v-if="option.code === locale">&check;</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const { locale, locales, setLocale } = useI18n()

const open = ref(false)
const rootRef = ref(null)

const choose = async (code) => {
  await setLocale(code)
  open.value = false
}

const closeOutside = (event) => {
  if (open.value && rootRef.value && !rootRef.value.contains(event.target)) open.value = false
}

onMounted(() => document.addEventListener('click', closeOutside))
onBeforeUnmount(() => document.removeEventListener('click', closeOutside))
</script>
