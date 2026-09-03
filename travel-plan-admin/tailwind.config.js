/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./app/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4f46e5',
                    hover: '#4338ca',
                    light: '#eef2ff',
                },
                secondary: {
                    DEFAULT: '#db2777',
                    hover: '#be185d',
                },
                success: '#16a34a',
                warning: '#d97706',
                danger: '#dc2626',
                info: '#2563eb',
                // Surfaces: a light grey canvas with white panels sitting on it,
                // which is what keeps a dense admin readable for hours.
                bg: {
                    main: '#f1f5f9',
                    sidebar: '#ffffff',
                    card: '#ffffff',
                    'card-hover': '#f8fafc',
                },
                text: {
                    main: '#0f172a',
                    muted: '#475569',
                    dim: '#94a3b8',
                },
                line: {
                    DEFAULT: '#e2e8f0',
                    strong: '#cbd5e1',
                },
            },
            fontFamily: {
                sans: ['Noto Sans', 'Noto Sans Lao', 'Noto Sans Thai', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
