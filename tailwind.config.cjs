/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			gridTemplateRows: {
				'layout': 'auto 1fr auto',
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
