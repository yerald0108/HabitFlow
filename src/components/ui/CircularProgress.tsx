// src/components/ui/CircularProgress.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../theme/theme';

interface CircularProgressProps {
  percentage:  number;
  size?:       number;
  strokeWidth?: number;
  completed:   number;
  total:       number;
}

// Componente SVG animado
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percentage,
  size        = 120,
  strokeWidth = 10,
  completed,
  total,
}) => {
  const { colors, typography, palette } = useTheme();

  const radius        = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center        = size / 2;

  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue:         percentage,
      damping:         18,
      stiffness:       60,
      mass:            1,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animatedProgress.interpolate({
    inputRange:  [0, 1],
    outputRange: [circumference, 0],
  });

  const isComplete = percentage >= 1 && total > 0;
  const trackColor = isComplete ? colors.successLight : colors.accentMedium;
  const arcColor   = isComplete ? colors.success      : colors.accent;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={arcColor} stopOpacity="1" />
            <Stop offset="100%" stopColor={isComplete ? palette.emerald400 : palette.indigo400} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Pista de fondo */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Arco de progreso animado */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#arcGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>

      {/* Texto central */}
      <View style={{ alignItems: 'center' }}>
        {total === 0 ? (
          <Text style={{ fontSize: typography.fontSize.lg, color: colors.textTertiary }}>—</Text>
        ) : (
          <>
            <Text style={{
              fontSize:      typography.fontSize['2xl'],
              fontWeight:    typography.fontWeight.bold,
              color:         isComplete ? colors.success : colors.textPrimary,
              lineHeight:    typography.fontSize['2xl'] * 1.1,
              letterSpacing: typography.letterSpacing.tight,
            }}>
              {completed}
            </Text>
            <Text style={{
              fontSize:   typography.fontSize.xs,
              color:      colors.textTertiary,
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