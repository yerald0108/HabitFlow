import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

export const HABIT_COLORS = [
  '#6366F1', // Índigo (default)
  '#8B5CF6', // Violeta
  '#EC4899', // Rosa
  '#F43F5E', // Rojo rosa
  '#F97316', // Naranja
  '#F59E0B', // Ámbar
  '#10B981', // Esmeralda
  '#06B6D4', // Cian
  '#3B82F6', // Azul
  '#84CC16', // Lima
  '#14B8A6', // Teal
  '#A855F7', // Púrpura
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const { colors, typography, spacing, borderRadius, borderWidth } = useTheme();

  return (
    <View style={{ marginBottom: spacing[4] }}>
      <Text style={{
        fontSize:     typography.fontSize.sm,
        fontWeight:   typography.fontWeight.semibold,
        color:        colors.textSecondary,
        marginBottom: spacing[2],
        letterSpacing: typography.letterSpacing.wide,
      }}>
        Color
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing[2], paddingVertical: spacing[1] }}
      >
        {HABIT_COLORS.map(color => {
          const isSelected = color === value;
          return (
            <TouchableOpacity
              key={color}
              onPress={() => onChange(color)}
              style={{
                width:           44,
                height:          44,
                borderRadius:    borderRadius.full,
                backgroundColor: color,
                alignItems:      'center',
                justifyContent:  'center',
                borderWidth:     isSelected ? 3 : 0,
                borderColor:     colors.surface,
                // Anillo exterior cuando está seleccionado
                shadowColor:     color,
                shadowOffset:    { width: 0, height: 0 },
                shadowOpacity:   isSelected ? 0.6 : 0,
                shadowRadius:    6,
                elevation:       isSelected ? 4 : 0,
              }}
            >
              {isSelected && (
                <Feather name="check" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};