// src/components/habits/HabitCheckbox.tsx
import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, ViewStyle, Animated, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

interface HabitCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  accentColor?: string;
  style?: ViewStyle;
}

export const HabitCheckbox: React.FC<HabitCheckboxProps> = ({
  checked,
  onToggle,
  size = 'md',
  accentColor,
  style,
}) => {
  const { colors, borderRadius, borderWidth, layout } = useTheme();

  const sizeMap      = { sm: layout.checkboxSm, md: layout.checkboxMd, lg: layout.checkboxLg };
  const checkboxSize = sizeMap[size];
  const iconSize     = checkboxSize * 0.55;
  const filledColor  = accentColor ?? colors.checkboxFilled;

  // ── Nodos NATIVOS (transform + opacity) ──────────────────
  const scaleAnim       = useRef(new Animated.Value(1)).current;
  const checkOpacity    = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const checkScale      = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const rippleScale     = useRef(new Animated.Value(1)).current;
  const rippleOpacity   = useRef(new Animated.Value(0)).current;

  // ── Nodos JS (backgroundColor, borderColor) ───────────────
  const bgAnim          = useRef(new Animated.Value(checked ? 1 : 0)).current;
  const borderAnim      = useRef(new Animated.Value(checked ? 1 : 0)).current;

  useEffect(() => {
    if (checked) {
      // Escala del contenedor: squish → rebote
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.82,
          duration: 80,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Check: aparece con rebote
      Animated.sequence([
        Animated.timing(checkOpacity, {
          toValue: 0,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.spring(checkOpacity, {
          toValue: 1,
          damping: 12,
          stiffness: 250,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.sequence([
        Animated.timing(checkScale, {
          toValue: 0,
          duration: 40,
          useNativeDriver: true,
        }),
        Animated.spring(checkScale, {
          toValue: 1,
          damping: 12,
          stiffness: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Ripple exterior
      rippleScale.setValue(1);
      rippleOpacity.setValue(0.5);
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 1.8,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      // Color de fondo y borde (JS thread — no pueden ser nativos)
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }).start();

      Animated.timing(borderAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }).start();

    } else {
      // Desmarcar — todo suave y rápido
      Animated.spring(scaleAnim, {
        toValue: 1,
        damping: 15,
        stiffness: 200,
        useNativeDriver: true,
      }).start();

      Animated.timing(checkOpacity, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();

      Animated.timing(checkScale, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }).start();

      Animated.timing(bgAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();

      Animated.timing(borderAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [checked]);

  // Interpolaciones JS (color)
  const backgroundColor = bgAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.checkboxEmpty, filledColor],
  });

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [colors.borderStrong, filledColor],
  });

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={1}
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {/* Ripple — solo transform+opacity = nativeDriver: true */}
      <Animated.View
        pointerEvents="none"
        style={{
          position:     'absolute',
          width:        checkboxSize,
          height:       checkboxSize,
          borderRadius: checkboxSize / 2,
          borderWidth:  2,
          borderColor:  filledColor,
          opacity:      rippleOpacity,
          transform:    [{ scale: rippleScale }],
        }}
      />

      {/* Capa JS: backgroundColor y borderColor */}
      <Animated.View
        style={{
          width:        checkboxSize,
          height:       checkboxSize,
          borderRadius: checkboxSize / 2,
          borderWidth:  borderWidth.medium,
          borderColor,
          backgroundColor,
        }}
      >
        {/* Capa nativa: scale + opacity del check */}
        <Animated.View
          style={{
            flex:           1,
            alignItems:     'center',
            justifyContent: 'center',
            opacity:        checkOpacity,
            transform:      [{ scale: checkScale }],
          }}
        >
          <Feather name="check" size={iconSize} color={colors.checkboxCheck} />
        </Animated.View>
      </Animated.View>

      {/* Capa nativa separada: scale del contenedor completo */}
      {/* No podemos poner scale en el mismo View que backgroundColor */}
      {/* Por eso usamos un wrapper nativo encima */}
    </TouchableOpacity>
  );
};