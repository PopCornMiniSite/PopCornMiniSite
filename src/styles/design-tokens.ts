export const colors = {
  bg: {
    primary: '#0A0A0F',
    secondary: '#11131A',
    tertiary: '#1A1D26',
    hover: '#1E222C',
    active: '#252A35',
  },
  brand: {
    primary: '#FF6B35',
    primaryHover: '#E85D2E',
    primaryLight: '#FF8A5B',
    secondary: '#00D4AA',
    secondaryHover: '#00BE96',
  },
  semantic: {
    success: '#00D4AA',
    warning: '#FFB800',
    error: '#FF4757',
    info: '#33DDFF',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B8BCC8',
    tertiary: '#8A8F9E',
    inverse: '#0A0A0F',
    link: '#FF6B35',
  },
  border: {
    subtle: '#1E222C',
    default: '#252A35',
    strong: '#2D3340',
    focus: '#FF6B35',
    error: '#FF4757',
  },
  gradient: {
    brand: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5B 100%)',
    brandSubtle: 'linear-gradient(135deg, rgba(255,107,53,0.15) 0%, rgba(255,138,91,0.1) 100%)',
    premium: 'linear-gradient(135deg, #00D4AA 0%, #00F5C4 100%)',
    cosmic: 'linear-gradient(135deg, #1A1D26 0%, #0A0A0F 100%)',
    cardGlow: 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 100%)',
  },
  shadow: {
    xs: '0 1px 2px rgba(0,0,0,0.3)',
    sm: '0 2px 4px rgba(0,0,0,0.35)',
    md: '0 8px 24px rgba(0,0,0,0.4)',
    lg: '0 16px 48px rgba(0,0,0,0.45)',
    xl: '0 24px 64px rgba(0,0,0,0.5)',
    glow: '0 0 48px rgba(255,107,53,0.25)',
    glowPremium: '0 0 64px rgba(0,212,170,0.2)',
    inner: 'inset 0 1px 0 rgba(255,255,255,0.05)',
  },
} as const

export const typography = {
  fontFamily: {
    display: '"Space Grotesk", system-ui, sans-serif',
    ui: '"Inter", system-ui, sans-serif',
    mono: '"JetBrains Mono", monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
  },
  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.025em',
  },
} as const

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const

export const radius = {
  none: '0',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  full: '9999px',
} as const

export const motion = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
    springGentle: { type: 'spring' as const, stiffness: 180, damping: 22 },
    springBouncy: { type: 'spring' as const, stiffness: 400, damping: 25 },
  },
  stagger: {
    fast: 0.03,
    normal: 0.06,
    slow: 0.1,
  },
} as const

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  toast: 500,
  tooltip: 600,
} as const
