import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          warm: '#FAF7F2',
          pearl: '#FCFAF7',
          cool: '#F3F5F7',
        },
        surface: {
          card: '#FFFFFF',
          bisque: '#F2ECE4',
          slate: '#EAEFF4',
          hover: '#F5EFE6',
        },
        ink: {
          primary: '#161514',
          slate: '#50545C',
          muted: '#84878E',
        },
        accent: {
          terracotta: {
            DEFAULT: '#D24B2C',
            hover: '#B83D20',
            tint: '#FDF4F1',
          },
          indigo: {
            DEFAULT: '#182B49',
            tint: '#EEF3FA',
          },
          sage: {
            DEFAULT: '#2B543D',
            tint: '#EDF6F1',
          },
          amber: '#DE8E26',
          plum: '#58354A',
        },
        border: {
          subtle: '#E8E3DA',
          strong: '#D5CEBF',
          focus: '#D24B2C',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', '-apple-system', 'sans-serif'],
        editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
        body: ['var(--font-body)', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        subtle: '0 2px 8px -2px rgba(22, 21, 20, 0.04), 0 1px 3px rgba(22, 21, 20, 0.02)',
        card: '0 8px 24px -4px rgba(22, 21, 20, 0.06), 0 2px 6px -1px rgba(22, 21, 20, 0.03)',
        float: '0 16px 40px -8px rgba(22, 21, 20, 0.08), 0 4px 12px -2px rgba(22, 21, 20, 0.04)',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '22px',
        full: '9999px',
      },
    },
  },
  plugins: [],
};

export default config;
