import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: ["./pages/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			fontFamily: {
				sans: [
					'Inter',
					'sans-serif'
				],
				heading: [
					'Space Grotesk',
					'sans-serif'
				]
			},
			colors: {
				rolex: {
					'50': '#edf7ef',
					'100': '#d6efe0',
					'200': '#aee1bf',
					'300': '#85d299',
					'400': '#54b76a',
					'500': '#0A6E3A',
					'600': '#095f33',
					'700': '#074c28',
					'800': '#05381d',
					'900': '#032713'
				},
				graysoft: {
					'100': '#f4f4f5',
					'200': '#e4e4e5',
					'300': '#d4d4d5',
					'400': '#c5c6c7',
					'500': '#9a9b9c',
					'600': '#6f7071',
					'700': '#4a4b4c',
					'800': '#2f3031',
					'900': '#1b1c1d',
					DEFAULT: '#c5c6c7'
				},
				brand: {
					bg: '#ffffff',
					text: '#0f172a'
				},
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
					border: 'hsl(var(--card-border) / <alpha-value>)'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
					border: 'hsl(var(--popover-border) / <alpha-value>)'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					border: 'var(--primary-border)'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					border: 'var(--secondary-border)'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
					border: 'var(--muted-border)'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					border: 'var(--accent-border)'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
					border: 'var(--destructive-border)'
				},
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1) / <alpha-value>)',
					'2': 'hsl(var(--chart-2) / <alpha-value>)',
					'3': 'hsl(var(--chart-3) / <alpha-value>)',
					'4': 'hsl(var(--chart-4) / <alpha-value>)',
					'5': 'hsl(var(--chart-5) / <alpha-value>)'
				},
				sidebar: {
					ring: 'hsl(var(--sidebar-ring) / <alpha-value>)',
					DEFAULT: 'hsl(var(--sidebar) / <alpha-value>)',
					foreground: 'hsl(var(--sidebar-foreground) / <alpha-value>)',
					border: 'hsl(var(--sidebar-border) / <alpha-value>)'
				},
				'sidebar-primary': {
					DEFAULT: 'hsl(var(--sidebar-primary) / <alpha-value>)',
					foreground: 'hsl(var(--sidebar-primary-foreground) / <alpha-value>)',
					border: 'var(--sidebar-primary-border)'
				},
				'sidebar-accent': {
					DEFAULT: 'hsl(var(--sidebar-accent) / <alpha-value>)',
					foreground: 'hsl(var(--sidebar-accent-foreground) / <alpha-value>)',
					border: 'var(--sidebar-accent-border)'
				},
				status: {
					online: 'rgb(34 197 94)',
					away: 'rgb(245 158 11)',
					busy: 'rgb(239 68 68)',
					offline: 'rgb(156 163 175)'
				}
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
