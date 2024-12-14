/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['index.html', 'src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        fontFamily: {
            sans: ['Krub', 'sans-serif']
        },
        extend: {
            colors: {
                primary: '#A8DADC', // Soft turquoise
                secondary: '#E63946', // Bold red
                background: '#F4F3F3', // Light off-white
                accent: {
                    light: '#457B9D', // Deeper blue
                    DEFAULT: '#1D3557' // Dark navy blue
                }
            }
        }
    },
    plugins: []
}
