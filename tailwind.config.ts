import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Open Sans', 'sans-serif'],
        heading: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '18px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '30px' }],
        '2xl': ['24px', { lineHeight: '36px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '42px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
        '6xl': ['60px', { lineHeight: '68px' }],
        '7xl': ['72px', { lineHeight: '80px' }],
        '8xl': ['96px', { lineHeight: '104px' }],
        '9xl': ['128px', { lineHeight: '136px', letterSpacing: '-1px' }],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))',
          // Values live in app/globals.css (:root).
          50: 'rgb(var(--primary-50) / <alpha-value>)',
          100: 'rgb(var(--primary-100) / <alpha-value>)',
          200: 'rgb(var(--primary-200) / <alpha-value>)',
          300: 'rgb(var(--primary-300) / <alpha-value>)',
          400: 'rgb(var(--primary-400) / <alpha-value>)',
          500: 'rgb(var(--primary-500) / <alpha-value>)',
          600: 'rgb(var(--primary-600) / <alpha-value>)',
          700: 'rgb(var(--primary-700) / <alpha-value>)',
          800: 'rgb(var(--primary-800) / <alpha-value>)',
          900: 'rgb(var(--primary-900) / <alpha-value>)',
        },
        grey: {
          50: '#fafafa',
          100: '#f4f4f4',
          200: '#e9e9e9',
          300: '#dfdfdf',
          400: '#cacaca',
          500: '#989898',
          600: '#6f6f6f',
          700: '#525252',
          800: '#393939',
          900: '#161616',
          950: '#161616',
        },
        connectivity: {
          green: '#00d661',
          yellow: '#ffc93d',
          red: '#ed1c24',
        },
        navy: '#1a2a3c',
        // DI theme tokens (app/globals.css; docs/design/dot-home.md, "Theme").
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          secondary: 'rgb(var(--ink-secondary) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
        },
        link: {
          DEFAULT: 'rgb(var(--link) / <alpha-value>)',
          hover: 'rgb(var(--link-hover) / <alpha-value>)',
        },
        line: {
          card: 'rgb(var(--line-card) / <alpha-value>)',
          divider: 'rgb(var(--line-divider) / <alpha-value>)',
          dashed: 'rgb(var(--line-dashed) / <alpha-value>)',
        },
        subtle: 'rgb(var(--subtle) / <alpha-value>)',
        selected: 'rgb(var(--selected) / <alpha-value>)',
        hover: {
          DEFAULT: 'rgb(var(--hover) / <alpha-value>)',
          soft: 'rgb(var(--hover-soft) / <alpha-value>)',
        },
        field: {
          DEFAULT: 'rgb(var(--field) / <alpha-value>)',
          border: 'rgb(var(--field-border) / <alpha-value>)',
        },
        thumb: 'rgb(var(--thumb) / <alpha-value>)',
        chosen: {
          DEFAULT: 'rgb(var(--chosen) / <alpha-value>)',
          border: 'rgb(var(--chosen-border) / <alpha-value>)',
        },
        pill: {
          DEFAULT: 'rgb(var(--pill) / <alpha-value>)',
          'muted-foreground': 'rgb(var(--pill-muted-foreground) / <alpha-value>)',
          'accent-border': 'rgb(var(--pill-accent-border) / <alpha-value>)',
        },
        // Asset preview canvases. Fixed in both themes: they show the real file.
        preview: {
          light: '#FFFFFF',
          canvas: '#F8F8F8',
          navy: '#1A2A3C',
          dark: '#161616',
          'dark-border': '#393939',
        },
        tile: {
          map: 'var(--tile-map)',
          'two-pager': 'var(--tile-two-pager)',
          master: 'var(--tile-master)',
          'master-border': 'var(--tile-master-border)',
        },
        'accent-orange': 'hsl(var(--accent-orange))',
        'accent-green': {
          50: '#d6ffe9',
          100: '#adffd2',
          200: '#85ffbc',
          300: '#5cffa5',
          400: '#33ff8f',
          500: '#0aff78',
          600: '#00d661',
          700: '#00b853',
          800: '#008f40',
          900: '#00662e',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      boxShadow: {
        box: 'var(--shadow-box)',
        menu: 'var(--shadow-menu)',
        tile: 'var(--shadow-tile)',
        thumb: 'var(--thumb-shadow)',
      },
      ringOffsetColor: {
        DEFAULT: 'hsl(var(--background))',
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius)',
        sm: 'var(--radius-sm)',
      },
      transitionDuration: {
        smooth: '280ms',
        fast: '180ms',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'in-out-smooth': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
export default config
