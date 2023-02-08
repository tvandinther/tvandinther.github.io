/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			gridTemplateRows: {
				'layout': 'auto 1fr auto',
			},
			colors: {
				'primary': '#1a202c',
				'secondary': '#2d3748',
				'tertiary': '#4a5568',
				'accent': '#ed8936',
				'accent-light': '#f6ad55',
				'accent-dark': '#dd6b20',
				'page': '#f7fafc',
			}
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		function({ addVariant }) {
			addVariant('child', '& > *');
		}
	],
}
