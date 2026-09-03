<template>
  <div class="relative w-full h-full min-h-[inherit]">
    <Line v-if="type === 'line'" :data="data" :options="mergedOptions" />
    <Bar v-else-if="type === 'bar'" :data="data" :options="mergedOptions" />
    <Doughnut v-else-if="type === 'doughnut'" :data="data" :options="mergedOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Filler
)

const props = defineProps({
  type: {
    type: String,
    default: 'bar'
  },
  data: {
    type: Object,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  }
})

// Light-theme defaults: the previous values were tuned for the dark console and
// drew near-white gridlines onto a white page.
const INK = '#475569'
const GRID = '#e2e8f0'
const FONT = "'Noto Sans', 'Noto Sans Lao', 'Noto Sans Thai', system-ui, sans-serif"

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      labels: { color: INK, font: { family: FONT, size: 12 } }
    },
    tooltip: {
      backgroundColor: '#0f172a',
      titleColor: '#f8fafc',
      bodyColor: '#e2e8f0',
      borderColor: GRID,
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      cornerRadius: 6
    }
  },
  scales: {
    x: {
      grid: { display: false, drawBorder: false },
      ticks: { color: INK, font: { family: FONT, size: 11 } }
    },
    y: {
      grid: { color: GRID, drawBorder: false },
      ticks: { color: INK, font: { family: FONT, size: 11 } }
    }
  }
}

const mergedOptions = computed(() => {
  return { ...defaultOptions, ...props.options }
})
</script>
