/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    400: '#60a5fa',
                    500: '#3b82f6', // Main blue
                    600: '#2563eb',
                    900: '#1e3a8a',
                },
                accent: {
                    purple: '#a855f7',
                    indigo: '#6366f1',
                },
                slate: {
                    950: '#080B12', // Very dark background from UI
                    900: '#0D1117', // Section background
                    800: '#161B22', // Input background
                },
                marble: {
                    50: '#FDFBFB', // Warm, ultra-light marble
                    100: '#F5F1F1', // Soft marble wash
                    200: '#E8E2E2', // Professional border gray-pink
                    300: '#D6CFCF', // Hover states
                    400: '#6B6262', // High-contrast subtext (Professional)
                    500: '#4A4242', // Muted text
                    900: '#1A1414', // 'Ink' black for primary text
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
