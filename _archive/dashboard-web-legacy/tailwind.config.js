/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui CSS变量映射
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
        // 主色调：调整为slate色系以统一主题
        'deep-blue': {
          50: 'oklch(0.984 0.003 264.695)',  // 非常浅的slate
          100: 'oklch(0.968 0.007 264.695)', // slate-50
          200: 'oklch(0.92 0.01 264.695)',   // 浅slate
          300: 'oklch(0.83 0.012 264.695)',  // 中等浅slate
          400: 'oklch(0.554 0.019 264.695)', // slate-400
          500: 'oklch(0.44 0.02 264.695)',   // 中等slate
          600: 'oklch(0.37 0.018 264.695)',  // 中等深slate
          700: 'oklch(0.3 0.016 264.695)',   // 深slate
          800: 'oklch(0.227 0.014 264.695)', // slate-800
          900: 'oklch(0.179 0.016 264.695)', // slate-900
          950: 'oklch(0.129 0.014 264.695)', // slate-950
        },
        // 点缀色：调整为amber色系以统一主题
        'gold': {
          50: 'oklch(0.987 0.04 84.1)',   // 非常浅的amber
          100: 'oklch(0.95 0.08 84.1)',   // 浅amber
          200: 'oklch(0.9 0.12 84.1)',    // 中等浅amber
          300: 'oklch(0.85 0.14 84.1)',   // amber-300
          400: 'oklch(0.8 0.15 84.1)',    // amber-400
          500: 'oklch(0.795 0.16 84.1)',  // amber-500 (主强调色)
          600: 'oklch(0.7 0.17 84.1)',    // amber-600
          700: 'oklch(0.6 0.18 84.1)',    // amber-700
          800: 'oklch(0.5 0.18 84.1)',    // amber-800
          900: 'oklch(0.4 0.17 84.1)',    // amber-900
          950: 'oklch(0.3 0.16 84.1)',    // amber-950
        },
        // 背景色：调整为使用CSS变量
        'background-custom': {
          DEFAULT: 'var(--background)',
          card: 'var(--card)',
          sidebar: 'var(--sidebar)',
          hover: 'var(--secondary)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      // 字体大小扩展 - 提高基础字体大小
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px → 提升为默认
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px (之前14px)
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px
        '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px
        '8xl': ['6rem', { lineHeight: '1' }],           // 96px
        '9xl': ['8rem', { lineHeight: '1' }],           // 128px
      },
      // 间距扩展 - 增加间距值
      spacing: {
        '18': '4.5rem',     // 72px
        '22': '5.5rem',     // 88px
        '30': '7.5rem',     // 120px
        '34': '8.5rem',     // 136px
        '38': '9.5rem',     // 152px
        '42': '10.5rem',    // 168px
        '46': '11.5rem',    // 184px
        '50': '12.5rem',    // 200px
        '54': '13.5rem',    // 216px
        '58': '14.5rem',    // 232px
        '62': '15.5rem',    // 248px
        '66': '16.5rem',    // 264px
        '70': '17.5rem',    // 280px
        '74': '18.5rem',    // 296px
        '78': '19.5rem',    // 312px
        '82': '20.5rem',    // 328px
        '86': '21.5rem',    // 344px
        '90': '22.5rem',    // 360px
        '94': '23.5rem',    // 376px
        '98': '24.5rem',    // 392px
      },
      // 圆角扩展
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        // shadcn/ui CSS变量映射
        'sm': 'calc(var(--radius) - 4px)',
        'md': 'calc(var(--radius) - 2px)',
        'lg': 'var(--radius)',
        DEFAULT: 'calc(var(--radius) - 2px)',
      },
      animation: {
        'stream-print': 'streamPrint 1s steps(40, end)',
        'pulse-gold': 'pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        streamPrint: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        pulseGold: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
      // 投屏模式专用扩展 - 使用自定义媒体查询
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        'projector': '1920px', // 投屏模式
        '4k': '3840px',        // 4K屏幕
        'projector-only': { 'raw': '(min-width: 1920px)' }, // 精确的投屏模式断点
      },
    },
  },
  plugins: [],
}