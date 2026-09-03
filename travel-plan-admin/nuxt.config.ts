// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxtjs/i18n'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Travel Plan Admin',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Travel Plan Admin Dashboard' }
      ]
    }
  },
  devServer: {
    host: '0.0.0.0',
    port: 3000,
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
    public: {
      // localhost so a changing Wi-Fi address never breaks local dev.
      // Testing from another device? Set NUXT_PUBLIC_API_URL to this machine's
      // LAN address (the API prints it on startup).
      apiUrl: 'http://localhost:9001/api'
    }
  }
})