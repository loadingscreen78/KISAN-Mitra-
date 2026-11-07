import type { Config } from "tailwindcss";

/**
 * Brand palette.
 *
 * leaf  : the single brand green, a natural crop green instead of neon emerald.
 * field : warm neutrals with a faint green cast, used for text, lines and surfaces.
 *
 * `emerald`/`green` and `slate`/`gray` are mapped onto these scales on purpose, so
 * every screen, including ones that still use the stock Tailwind names, shares
 * one calm palette. Prefer `leaf-*` and `field-*` in new code.
 */
const leaf = {
	50: "#F2F8F3",
	100: "#DEEDE0",
	200: "#BEDAC3",
	300: "#92BF9C",
	400: "#5CA36F",
	500: "#3C8051",
	600: "#28673D",
	700: "#205633",
	800: "#19432A",
	900: "#143322",
	950: "#0B1E14",
};

const field = {
	50: "#F8F8F6",
	100: "#F1F1EE",
	200: "#E0E1DB",
	300: "#C4C5BE",
	400: "#8D9084",
	500: "#6B6E63",
	600: "#56594F",
	700: "#41443B",
	800: "#2B2F28",
	900: "#1B1F19",
	950: "#0E110D",
};

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				// Poppins ships Latin and Devanagari, so English and Hindi share one typeface.
				sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Noto Sans Devanagari', 'sans-serif'],
			},
			colors: {
				leaf,
				field,
				emerald: leaf,
				green: leaf,
				slate: field,
				gray: field,
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Agricultural color system (kept for older screens)
				'agri-primary': 'hsl(var(--primary-green))',
				'agri-secondary': 'hsl(var(--secondary-green))',
				'agri-accent': 'hsl(var(--accent-green))',
				'agri-light': 'hsl(var(--light-green))',
				'agri-success': 'hsl(var(--success-green))',
				'agri-warning': 'hsl(var(--warning-orange))',
				'agri-danger': 'hsl(var(--danger-red))',
				'agri-info': 'hsl(var(--info-blue))',
				'agri-light-blue': 'hsl(var(--light-blue))',
				'agri-purple': 'hsl(var(--purple))',
				'agri-light-purple': 'hsl(var(--light-purple))',
				'agri-cream': 'hsl(var(--cream))',
				'agri-light-cream': 'hsl(var(--light-cream))',
				'agri-gray': 'hsl(var(--gray))',
				'agri-light-gray': 'hsl(var(--light-gray))',
				'text-primary': 'hsl(var(--text-primary))',
				'text-secondary': 'hsl(var(--text-secondary))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			// Every transition decelerates into place on one curve.
			transitionTimingFunction: {
				DEFAULT: 'cubic-bezier(0.22, 1, 0.36, 1)',
				out: 'cubic-bezier(0.22, 1, 0.36, 1)',
				spring: 'var(--ease-spring)',
			},
			transitionDuration: {
				DEFAULT: '300ms',
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
				},
				'rise-in': {
					from: { opacity: '0', transform: 'translateY(12px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				// Moves `translate`, not `transform`, so it stacks with rotate utilities.
				float: {
					'0%, 100%': { translate: '0 0' },
					'50%': { translate: '0 -8px' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
				'accordion-up': 'accordion-up 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
				'rise-in': 'rise-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
				'fade-in': 'fade-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both',
				float: 'float 6s cubic-bezier(0.45, 0, 0.55, 1) infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
