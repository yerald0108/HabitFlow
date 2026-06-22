// ============================================================
// SISTEMA DE DISEÑO — HabitFlow
// Fuente única de verdad para todos los tokens visuales.
// NUNCA sobreescribir estilos inline; siempre referenciar aquí.
// ============================================================

// ─── PALETA BASE ────────────────────────────────────────────
// Concepto: "Presencia serena" — índigo profundo como ancla,
// violeta suave como acento, blancos cálidos para respirar.
// El modo oscuro usa un azul-grafito propio, no un negro puro.

const palette = {
  // Acento principal: índigo-violeta
  indigo50:  '#EEF0FF',
  indigo100: '#E0E3FF',
  indigo200: '#C7CDFE',
  indigo400: '#818CF8',
  indigo500: '#6366F1',
  indigo600: '#4F46E5',
  indigo700: '#4338CA',

  // Acento secundario: esmeralda para logros/éxito
  emerald400: '#34D399',
  emerald500: '#10B981',
  emerald600: '#059669',

  // Ámbar para rachas / fuego
  amber400: '#FBBF24',
  amber500: '#F59E0B',

  // Rojo suave para eliminar / alertas
  rose400: '#FB7185',
  rose500: '#F43F5E',

  // Escala de grises cálidos (modo claro)
  warmWhite:  '#FAFAF9',
  gray50:     '#F5F5F4',
  gray100:    '#E7E5E4',
  gray200:    '#D6D3D1',
  gray300:    '#A8A29E',
  gray400:    '#78716C',
  gray500:    '#57534E',
  gray700:    '#292524',
  gray900:    '#1C1917',

  // Escala de azul-grafito (modo oscuro — diseñada específicamente)
  dark900:  '#0F1117',  // fondo principal oscuro
  dark800:  '#161B27',  // fondo de tarjetas
  dark700:  '#1E2636',  // bordes sutiles
  dark600:  '#263045',  // elementos elevados
  dark400:  '#4A5568',  // texto deshabilitado
  dark200:  '#9BA3B2',  // texto secundario oscuro
  dark100:  '#C9D1DC',  // texto primario oscuro

  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ─── TOKENS DE COLOR POR MODO ───────────────────────────────

export const lightColors = {
  // Fondos
  background:        palette.warmWhite,
  backgroundSecondary: palette.gray50,
  surface:           palette.white,
  surfaceElevated:   palette.white,

  // Texto
  textPrimary:       palette.gray900,
  textSecondary:     palette.gray500,
  textTertiary:      palette.gray300,
  textInverse:       palette.white,
  textOnAccent:      palette.white,

  // Bordes
  border:            palette.gray100,
  borderStrong:      palette.gray200,

  // Acento
  accent:            palette.indigo500,
  accentLight:       palette.indigo50,
  accentMedium:      palette.indigo100,
  accentDark:        palette.indigo700,

  // Semánticos
  success:           palette.emerald500,
  successLight:      '#D1FAE5',
  streak:            palette.amber500,
  streakLight:       '#FEF3C7',
  danger:            palette.rose500,
  dangerLight:       '#FFE4E6',

  // UI específica
  tabBarBackground:  palette.white,
  tabBarBorder:      palette.gray100,
  tabBarActive:      palette.indigo500,
  tabBarInactive:    palette.gray300,

  checkboxEmpty:     palette.gray200,
  checkboxFilled:    palette.indigo500,
  checkboxCheck:     palette.white,

  // Sombras
  shadowColor:       palette.gray900,
} as const;

export const darkColors: Record<keyof typeof lightColors, string> = {
  // Fondos
  background:        palette.dark900,
  backgroundSecondary: palette.dark800,
  surface:           palette.dark800,
  surfaceElevated:   palette.dark700,

  // Texto
  textPrimary:       palette.dark100,
  textSecondary:     palette.dark200,
  textTertiary:      palette.dark400,
  textInverse:       palette.gray900,
  textOnAccent:      palette.white,

  // Bordes
  border:            palette.dark700,
  borderStrong:      palette.dark600,

  // Acento (levemente más brillante en oscuro para contraste)
  accent:            palette.indigo400,
  accentLight:       '#1E1F3D',
  accentMedium:      '#252649',
  accentDark:        palette.indigo200,

  // Semánticos
  success:           palette.emerald400,
  successLight:      '#052E16',
  streak:            palette.amber400,
  streakLight:       '#2D1B00',
  danger:            palette.rose400,
  dangerLight:       '#2D0A14',

  // UI específica
  tabBarBackground:  palette.dark800,
  tabBarBorder:      palette.dark700,
  tabBarActive:      palette.indigo400,
  tabBarInactive:    palette.dark400,

  checkboxEmpty:     palette.dark600,
  checkboxFilled:    palette.indigo400,
  checkboxCheck:     palette.white,

  // Sombras
  shadowColor:       palette.black,
} as const;

// ─── TIPOGRAFÍA ─────────────────────────────────────────────
// Sistema de fuentes: SF Pro / Inter para iOS y Android.
// Pesos usados con intención, no por defecto.

export const typography = {
  // Familias
  fontFamily: {
    regular:  'System',
    medium:   'System',
    semibold: 'System',
    bold:     'System',
    mono:     'Courier New',
  },

  // Escala tipográfica (en puntos)
  fontSize: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   17,
    lg:   20,
    xl:   24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
  },

  // Pesos
  fontWeight: {
    regular:  '400' as const,
    medium:   '500' as const,
    semibold: '600' as const,
    bold:     '700' as const,
    heavy:    '800' as const,
  },

  // Altura de línea (multiplicador)
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.7,
  },

  // Espaciado de letras
  letterSpacing: {
    tight:  -0.5,
    normal:  0,
    wide:    0.5,
    wider:   1.0,
    widest:  2.0,  // Para labels en mayúsculas
  },
} as const;

// ─── ESPACIADO ──────────────────────────────────────────────
// Basado en una cuadrícula de 4pt. Todo el espaciado es
// múltiplo de 4 para consistencia perfecta.

export const spacing = {
  0:   0,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  7:   28,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  20:  80,
  24:  96,
} as const;

// ─── BORDES Y RADIOS ────────────────────────────────────────

export const borderRadius = {
  none:   0,
  sm:     6,
  md:     10,
  lg:     14,
  xl:     20,
  '2xl':  28,
  full:   9999,
} as const;

export const borderWidth = {
  hairline: 0.5,
  thin:     1,
  medium:   1.5,
  thick:    2,
} as const;

// ─── SOMBRAS ────────────────────────────────────────────────
// Sombras sutiles que aportan profundidad sin recargar.
// El parámetro `color` se inyecta dinámicamente según el tema.

export const getShadow = (color: string, isDark: boolean = false) => ({
  none: {},

  xs: {
    shadowColor:   color,
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.3 : 0.04,
    shadowRadius:  2,
    elevation:     1,
  },

  sm: {
    shadowColor:   color,
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.4 : 0.06,
    shadowRadius:  6,
    elevation:     2,
  },

  md: {
    shadowColor:   color,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.5 : 0.08,
    shadowRadius:  12,
    elevation:     4,
  },

  lg: {
    shadowColor:   color,
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: isDark ? 0.6 : 0.10,
    shadowRadius:  20,
    elevation:     8,
  },
});

// ─── ANIMACIONES ────────────────────────────────────────────

export const animation = {
  // Duraciones (ms)
  duration: {
    instant:  100,
    fast:     200,
    normal:   300,
    slow:     500,
    slower:   700,
  },

  // Configuraciones de spring para Reanimated
  spring: {
    // Para checkboxes: rebote satisfactorio
    bouncy: {
      damping: 14,
      stiffness: 200,
      mass: 0.8,
    },
    // Para transiciones de pantalla: suave y fluido
    smooth: {
      damping: 20,
      stiffness: 180,
      mass: 1,
    },
    // Para elementos que aparecen: gentil
    gentle: {
      damping: 25,
      stiffness: 120,
      mass: 1,
    },
  },
} as const;

// ─── LAYOUT ─────────────────────────────────────────────────

export const layout = {
  // Ancho máximo del contenido en tablets
  maxContentWidth: 480,

  // Altura de elementos UI estándar
  tabBarHeight:      84,
  headerHeight:      56,
  buttonHeightSm:    36,
  buttonHeightMd:    48,
  buttonHeightLg:    56,

  // Tamaño de checkboxes
  checkboxSm:  24,
  checkboxMd:  28,
  checkboxLg:  36,

  // Padding horizontal de pantalla
  screenPaddingH: 20,
  screenPaddingV: 24,
} as const;

// ─── HOOK DE TEMA ───────────────────────────────────────────
// Importar este hook en cada componente para acceder al tema.

import { useColorScheme } from 'react-native';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark  = scheme === 'dark';
  const colors  = isDark ? darkColors : lightColors;
  const shadows = getShadow(colors.shadowColor, isDark);

  return {
    colors,
    typography,
    spacing,
    borderRadius,
    borderWidth,
    shadows,
    animation,
    layout,
    isDark,
    palette,
  };
}

// Tipo exportado para usar en componentes
export type Theme = ReturnType<typeof useTheme>;
export type Colors = typeof lightColors;