/**
 * Sistema de Diseño - Tigo Ecuador
 * Colores corporativos y tokens de diseño
 */

export const colors = {
  // Colores corporativos Tigo
  primary: "#00377B",        // Azul Tigo
  primaryLight: "#E6EEF7",   // Azul claro
  secondary: "#00B0F0",      // Cyan Tigo
  accent: "#FFD100",         // Amarillo Tigo
  
  // Estados
  success: "#4CAF50",
  danger: "#E53935",
  warning: "#FF9800",
  info: "#2196F3",

  // Neutros
  background: "#F5F7FA",
  white: "#FFFFFF",
  black: "#000000",

  // Textos
  textPrimary: "#1A1A1A",
  textSecondary: "#666666",
  textTertiary: "#999999",
  textLight: "#FFFFFF",

  // Bordes
  border: "#E0E0E0",
  borderLight: "#F0F0F0",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 34,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};