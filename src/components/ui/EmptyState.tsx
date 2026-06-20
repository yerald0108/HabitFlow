// src/components/ui/EmptyState.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/theme';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  emoji,
  title,
  subtitle,
  action,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={{
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
      paddingHorizontal: spacing[10],
    }}>
      <Text style={{ fontSize: 64, marginBottom: spacing[4] }}>{emoji}</Text>

      <Text style={{
        fontSize:    typography.fontSize.xl,
        fontWeight:  typography.fontWeight.bold,
        color:       colors.textPrimary,
        textAlign:   'center',
        marginBottom: spacing[2],
        letterSpacing: typography.letterSpacing.tight,
      }}>
        {title}
      </Text>

      <Text style={{
        fontSize:  typography.fontSize.base,
        color:     colors.textSecondary,
        textAlign: 'center',
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
      }}>
        {subtitle}
      </Text>

      {action && (
        <View style={{ marginTop: spacing[6] }}>
          {action}
        </View>
      )}
    </View>
  );
};