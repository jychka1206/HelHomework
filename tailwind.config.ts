import type { Config } from 'tailwindcss'

const config: Config = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./pages/**/*.{js,ts,jsx,tsx,mdx}'
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-inter)'],
				display: ['var(--font-nunito)', 'sans-serif']
			},
			colors: {
				softBlue: '#BEE3F8',
				softPeach: '#FBD38D',
				softMint: '#C6F6D5',
				softLavender: '#E9D8FD',
				ink: '#1F2937'
			},
			boxShadow: {
				card: '0 6px 24px rgba(31, 41, 55, 0.08)'
			}
		}
	},
	plugins: []
}
export default config


