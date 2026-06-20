import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../theme/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const { colors, typography, spacing, borderRadius, layout, borderWidth } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const heightMap = {
    sm: layout.buttonHeightSm,
    md: layout.buttonHeightMd,
    lg: layout.buttonHeightLg,
  };

  const fontSizeMap = {
    sm: typography.fontSize.sm,
    md: typography.fontSize.base,
    lg: typography.fontSize.md,
  };

  // Estilos por variante
  const variantStyles: Record<string, { container: ViewStyle; label: TextStyle }> = {
    primary: {
      container: {
        backgroundColor: disabled ? colors.textTertiary : colors.accent,
      },
      label: { color: colors.textOnAccent },
    },
    secondary: {
      container: {
        backgroundColor: colors.accentLight,
        borderWidth: borderWidth.thin,
        borderColor: colors.accentMedium,
      },
      label: { color: colors.accent },
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
      },
      label: { color: colors.accent },
    },
    danger: {
      container: {
        backgroundColor: disabled ? colors.textTertiary : colors.danger,
      },
      label: { color: colors.textOnAccent },
    },
  };

  const containerStyle: ViewStyle = {
    height: heightMap[size],
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: size === 'sm' ? spacing[4] : spacing[6],
    alignSelf: fullWidth ? 'stretch' : 'flex-start',
    opacity: disabled ? 0.5 : 1,
    ...variantStyles[variant].container,
  };

  const labelStyle: TextStyle = {
    fontSize: fontSizeMap[size],
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.tight,
    ...variantStyles[variant].label,
  };

  return (
    <AnimatedTouchable
      style={[animatedStyle, containerStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles[variant].label.color} size="small" />
      ) : (
        <Text style={labelStyle}>{label}</Text>
      )}
    </AnimatedTouchable>
  );
};