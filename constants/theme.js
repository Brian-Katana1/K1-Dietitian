export const colors = {
  // Primary colors
  primary: '#007AFF',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',

  // Additional colors
  secondary: '#5AC8FA',
  purple: '#AF52DE',
  yellow: '#FFD60A',

  // Backgrounds
  background: '#fff',
  cardBackground: '#f8f9fa',
  lightBlue: '#f0f7ff',
  lightGreen: '#f0fdf4',
  lightYellow: '#fefce8',
  lightPurple: '#faf5ff',
  lightWarning: '#fff3cd',

  // Text colors
  text: '#333',
  textSecondary: '#666',
  textLight: '#8E8E93',
  textDark: '#000',

  // Borders and dividers
  border: '#e0e0e0',
  divider: '#E5E5E5',

  // Semantic colors for diagnosis
  excellent: '#34C759',
  good: '#5AC8FA',
  fair: '#FF9500',
  needs_improvement: '#FF9500',
  concerning: '#FF3B30',

  // Severity levels
  severityLow: '#FFD60A',
  severityModerate: '#FF9500',
  severityHigh: '#FF3B30',

  // Specific colors
  green700: '#166534',
  green800: '#15803d',
  yellow700: '#713f12',
  yellow800: '#854d0e',
  yellow600: '#eab308',
  yellow200: '#fef3c7',
  yellow100: '#fef9c3',
  yellow50: '#fde047',
  purple700: '#6b21a8',
  purple800: '#581c87',
  purple600: '#7c3aed',
  purple500: '#a855f7',
  purple200: '#f3e8ff',
  purple100: '#d8b4fe',
  warning700: '#856404',
};

export const spacing = {
  xs: 5,
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  xxl: 40,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  h4: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 15,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  small: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export const borderRadius = {
  small: 8,
  medium: 10,
  large: 12,
  xlarge: 15,
  xxlarge: 20,
  pill: 50,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
};
