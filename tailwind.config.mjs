/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				background: '#F9FAFB', // Using a light gray background
				primary: '#1F2937', // Primary text color
				accent: '#00FF6A', // Main accent color (형광 연두)
				highlight: '#FACC15', // Point highlight color
				blueGray: '#485E8E', // 블루그레이
				brightBlue: '#E5F0FF', // 밝은블루
				mutedPurple: '#8590B3', // 뮤트퍼플
			},
			fontFamily: {
				sans: ['Pretendard', 'sans-serif'],
			},
		},
	},
	plugins: [],
}
