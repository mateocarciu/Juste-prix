import daisyui from 'daisyui'

export default {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {}
	},
	daisyui: {
		themes: ['light', 'dark']
	},
	plugins: [daisyui]
}
