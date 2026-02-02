export const colors = {
  primary: '#E84393',
  primaryDark: '#C73883',
  primaryLight: '#F8E1EC',
  secondary: '#6C5CE7',
  accent: '#00CEC9',
  
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundDark: '#1A1A2E',
  surface: '#F5F5F5',
  
  text: '#2D3436',
  textSecondary: '#636E72',
  textLight: '#B2BEC3',
  textWhite: '#FFFFFF',
  
  success: '#00B894',
  warning: '#FDCB6E',
  error: '#D63031',
  
  border: '#DFE6E9',
  shadow: '#00000015',
  
  card: '#FFFFFF',
  cardDark: '#252540',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
