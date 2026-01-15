
import type { Config } from "tailwindcss";

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
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
        // Custom betting dashboard colors
        betting: {
          positive: '#4ADE80',
          negative: '#F87171',
          neutral: '#CBD5E1',
          highlight: '#3B82F6',
          dark: '#1A1F2C',
          darkerCard: '#151823',
          darkCard: '#1D2133',
					// Gunmetal colors
					gunmetal: '#2A3439',
					darkGunmetal: '#1E282D',
					lightGunmetal: '#3A444A',
					gunmetalBorder: '#3E4A52',
          // Purple colors 
          darkPurple: '#1A1F2C',
          vividPurple: '#8B5CF6',
          secondaryPurple: '#7E69AB',
          tertiaryPurple: '#5C3F8F', // Deeper purple
          // New naval blues
          navyBlue: '#0D2B45',
          mediumBlue: '#1E5F8C',
          lightBlue: '#33C3F0',
          skyBlue: '#7BD4F0'
        }
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
        'pulse-update': {
          '0%, 100%': { 
            opacity: '1' 
          },
          '50%': { 
            opacity: '0.5' 
          }
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          }
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 15px rgba(34, 211, 238, 0.4), 0 0 30px rgba(34, 211, 238, 0.2)',
            color: 'rgb(34, 211, 238)'
          },
          '50%': {
            boxShadow: '0 0 15px rgba(249, 115, 22, 0.4), 0 0 30px rgba(249, 115, 22, 0.2)',
            color: 'rgb(251, 146, 60)'
          }
        }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-update': 'pulse-update 1s ease-in-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite'
			},
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'card-gradient': 'linear-gradient(to bottom right, #1E293B, #0F172A)',
        'active-gradient': 'linear-gradient(to right, #3B82F6, #1E40AF)',
        'header-gradient': 'linear-gradient(to right, #1E293B, #0F172A)',
				// Gunmetal gradients
				'gunmetal-gradient': 'linear-gradient(to right, #2A3439, #1E282D)',
				'gunmetal-header': 'linear-gradient(to right, #2A3439, #3A444A)',
        // Purple gradients
        'purple-gradient': 'linear-gradient(to right, #1A1F2C, #2D1A45)',
        'purple-header': 'linear-gradient(to right, #1A1F2C, #3C1A7B)',
        // New naval blue gradients
        'naval-gradient': 'linear-gradient(to right, #0D2B45, #1E5F8C)',
        'naval-header': 'linear-gradient(to right, #0D2B45, #33C3F0)'
      }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
