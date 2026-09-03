<template>
  <div class="relative" ref="rootRef">
    <button
      class="h-9 px-2.5 rounded flex items-center gap-1.5 text-text-muted hover:bg-slate-100 hover:text-text-main"
      :title="$t('lang.label')"
      @click="open = !open"
    >
      <Languages :size="18" />
      <span class="text-xs font-medium uppercase">{{ locale }}</span>
    </button>

    <div v-if="open" class="absolute right-0 mt-2 w-40 bg-white border border-line rounded-lg shadow-lg overflow-hidden z-50">
      <button
        v-for="option in locales"
        :key="option.code"
        class="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-slate-50"
        :class="option.code === locale ? 'text-primary font-medium' : 'text-text-muted'"
        @click="choose(option.code)"
      >
        {{ option.name }}
        <Check v-if="option.code === locale" :size="15" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Languages, Check } from 'lucide-vue-next'

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
