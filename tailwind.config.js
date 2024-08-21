/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{js,jsx,ts,tsx}'],
	theme: {
		extend: {
            fontFamily: {
                'bebas': ['Bebas Neue']
            },
			colors: {
				kori: {
					bg: '#19162e',
					mid: '#4c4d60',
					text: '#e5e7ed',
					purple: '#46294f',
					'dark-blue': '#303a54',
					blue: '#4b80a5',
					'light-blue': '#bce1e4',
				},
			},
		},
	},
	plugins: [],
};
