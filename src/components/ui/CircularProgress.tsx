import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useTheme } from '../../theme/theme';

interface CircularProgressProps {
  percentage: number; // 0 a 1
  size?: number;
  strokeWidth?: number;
  completed: number;
  total: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size = 120,
  strokeWidth = 10,
  completed,
  total,
}) => {
  const { colors, typography } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius        = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: percentage,
      damping: 20,
      stiffness: 120,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  // Interpolamos el dashoffset para animar el arco
  const strokeDashoffset = animatedValue.interpolate({
    inputRange:  [0, 1],
    outputRange: [circumference, 0],
  });

  const isComplete = percentage >= 1 && total > 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* SVG simulado con Views y bordes — compatible con Expo Go */}
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: colors.accentMedium,
        position: 'absolute',
      }} />

      {/* Arco de progreso usando overflow clip */}
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: 'transparent',
        borderTopColor: isComplete ? colors.success : colors.accent,
        borderRightColor: percentage > 0.25
          ? (isComplete ? colors.success : colors.accent)
          : 'transparent',
        borderBottomColor: percentage > 0.5
          ? (isComplete ? colors.success : colors.accent)
          : 'transparent',
        borderLeftColor: percentage > 0.75
          ? (isComplete ? colors.success : colors.accent)
          : 'transparent',
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
      }} />

      {/* Texto central */}
      <View style={{ alignItems: 'center' }}>
        {total === 0 ? (
          <Text style={{
            fontSize: typography.fontSize.lg,
            color: colors.textTertiary,
          }}>—</Text>
        ) : (
          <>
            <Text style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: isComplete ? colors.success : colors.textPrimary,
              lineHeight: typography.fontSize['2xl'] * 1.1,
            }}>
              {completed}
            </Text>
            <Text style={{
              fontSize: typography.fontSize.sm,
              color: colors.textTertiary,
              fontWeight: typography.fontWeight.medium,
            }}>
              de {total}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};