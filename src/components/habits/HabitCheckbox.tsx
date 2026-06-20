import React, { useEffect } from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

interface HabitCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  accentColor?: string;  // opcional: color personalizado por hábito
  style?: ViewStyle;
}

export const HabitCheckbox: React.FC<HabitCheckboxProps> = ({
  checked,
  onToggle,
  size = 'md',
  accentColor,
  style,
}) => {
  const { colors, borderRadius, borderWidth, animation, layout } = useTheme();

  const sizeMap = {
    sm: layout.checkboxSm,
    md: layout.checkboxMd,
    lg: layout.checkboxLg,
  };
  const checkboxSize = sizeMap[size];
  const iconSize = checkboxSize * 0.55;

  // Valores animados
  const progress = useSharedValue(checked ? 1 : 0);
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(checked ? 1 : 0);
  const ripple = useSharedValue(0);

  const filledColor = accentColor ?? colors.checkboxFilled;

  useEffect(() => {
    if (checked) {
      // Secuencia satisfactoria al marcar:
      // 1. Pequeño "squish" inicial
      // 2. Relleno del color con spring
      // 3. El check aparece con rebote
      // 4. Ripple exterior sutil
      scale.value = withSequence(
        withSpring(0.85, { damping: 10, stiffness: 400 }),
        withSpring(1.08, animation.spring.bouncy),
        withSpring(1, animation.spring.gentle),
      );
      progress.value = withSpring(1, animation.spring.smooth);
      checkScale.value = withSequence(
        withTiming(0, { duration: 50 }),
        withSpring(1.2, animation.spring.bouncy),
        withSpring(1, animation.spring.gentle),
      );
      ripple.value = withSequence(
        withTiming(1, { duration: animation.duration.normal, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
      );
    } else {
      // Al desmarcar: suave y rápido
      scale.value = withSpring(1, animation.spring.gentle);
      progress.value = withTiming(0, { duration: animation.duration.fast });
      checkScale.value = withTiming(0, { duration: animation.duration.fast });
    }
  }, [checked]);

  // Estilo animado del contenedor (color de fondo)
  const containerAnimated = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [colors.checkboxEmpty, filledColor],
      ),
      transform: [{ scale: scale.value }],
      borderWidth: progress.value < 0.5 ? borderWidth.medium : 0,
    };
  });

  // Estilo animado del check interior
  const checkAnimated = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  // Ripple exterior
  const rippleAnimated = useAnimatedStyle(() => ({
    position: 'absolute',
    width: checkboxSize + 12,
    height: checkboxSize + 12,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: filledColor,
    opacity: ripple.value * 0.3,
    transform: [{ scale: 0.8 + ripple.value * 0.5 }],
  }));

  const containerStyle: ViewStyle = {
    width: checkboxSize,
    height: checkboxSize,
    borderRadius: borderRadius.full,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={1}
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {/* Ripple exterior */}
      <Animated.View style={rippleAnimated} pointerEvents="none" />

      {/* Checkbox principal */}
      <Animated.View style={[containerStyle, containerAnimated]}>
        <Animated.View style={checkAnimated}>
          <Feather
            name="check"
            size={iconSize}
            color={colors.checkboxCheck}
            style={{ fontWeight: '700' }}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};