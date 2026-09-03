// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxtjs/i18n',
  ],
  app: {
    head: {
      title: 'TravelPlus - Explore the World',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Discover amazing destinations, book tours, hotels, and create unforgettable travel experiences with TravelPlus.' },
        { name: 'keywords', content: 'travel, booking, tours, hotels, destinations, vacation' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
    },
  },
  googleFonts: {
    families: {
      // Lao and Thai glyphs are not in Noto Sans itself, so the script-specific
      // families have to be loaded alongside it.
      'Noto Sans': [300, 400, 500, 600, 700],
      'Noto Sans Lao': [300, 400, 500, 600, 700],
      'Noto Sans Thai': [300, 400, 500, 600, 700],
    },
    display: 'swap',
  },
  // configPath is intentionally omitted: it defaulted to this same file, and
  // naming it made the module load tailwind.config.js twice and concatenate
  // every theme array with itself (font stacks came out listed twice).

  css: ['./app/assets/css/main.css'],
  // Pinned so this never races travel-plan-admin for port 3000. Without an
  // explicit port both apps default to 3000 and win on different address
  // families (::1 vs 0.0.0.0), so neither reports a conflict and `localhost`
  // silently resolves to whichever grabbed IPv6.
  devServer: {
    port: 3001,
  },
  i18n: {
    // no_prefix keeps every URL exactly as it was — the auth middleware, the
    // Stripe return URLs and existing links all match on plain paths.
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'lo', name: 'ລາວ', file: 'lo.json' },
      { code: 'th', name: 'ไทย', file: 'th.json' },
    ],
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_locale',
      redirectOn: 'no prefix',
      alwaysRedirect: false,
    },
  },
  runtimeConfig: {
    // Server-only. Pages that fetch during SSR (the confirmation receipt) run
    // inside this process, not the visitor's browser, so in Docker they cannot
    // use the public URL below — `localhost` there is the storefront container
    // itself. Set NUXT_API_BASE_SERVER to an address this process can reach
    // (http://api:9001/api on the compose network). Left empty it falls back
    // to apiBase, which is correct for local dev where both are the same host.
    apiBaseServer: '',
    public: {
      // localhost so a changing Wi-Fi address never breaks local dev.
      // Testing from another device? Set NUXT_PUBLIC_API_BASE to this machine's
      // LAN address (the API prints it on startup).
      apiBase: 'http://localhost:9001/api',
    },
  },
})
