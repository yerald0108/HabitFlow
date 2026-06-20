import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;    // sombra media
  flat?: boolean;        // sin sombra, solo borde
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevated = false,
  flat = false,
  padding = 'md',
}) => {
  const { colors, spacing, borderRadius, borderWidth, shadows } = useTheme();

  const paddingMap = {
    none: 0,
    sm:   spacing[3],
    md:   spacing[4],
    lg:   spacing[6],
  };

  const cardStyle: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: paddingMap[padding],
    ...(flat
      ? {
          borderWidth: borderWidth.thin,
          borderColor: colors.border,
        }
      : elevated
      ? shadows.md
      : shadows.sm),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
};