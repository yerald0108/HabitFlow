// src/hooks/useTabBarHeight.ts
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Altura total que ocupa el tab bar flotante, incluyendo
 * el safe area inferior del dispositivo y el margen.
 * Usar este hook en lugar del cálculo inline en cada pantalla.
 */
export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return 64 + (insets.bottom > 0 ? insets.bottom : 16) + 16;
}