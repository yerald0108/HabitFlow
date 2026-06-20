import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/theme';
import { HabitFrequency, WeekDay } from '../../domain/models/Habit';

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string; description: string }[] = [
  { value: 'daily',   label: 'Diario',       description: 'Todos los días' },
  { value: 'weekly',  label: 'Semanal',       description: 'Una vez por semana' },
  { value: 'custom',  label: 'Personalizado', description: 'Elige los días' },
];

const WEEK_DAYS: { value: WeekDay; label: string }[] = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'X' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
];

interface FrequencyPickerProps {
  frequency: HabitFrequency;
  weekDays: WeekDay[];
  onFrequencyChange: (f: HabitFrequency) => void;
  onWeekDaysChange:  (days: WeekDay[]) => void;
}

export const FrequencyPicker: React.FC<FrequencyPickerProps> = ({
  frequency,
  weekDays,
  onFrequencyChange,
  onWeekDaysChange,
}) => {
  const { colors, typography, spacing, borderRadius, borderWidth } = useTheme();

  const toggleDay = (day: WeekDay) => {
    if (weekDays.includes(day)) {
      onWeekDaysChange(weekDays.filter(d => d !== day));
    } else {
      onWeekDaysChange([...weekDays, day]);
    }
  };

  return (
    <View style={{ marginBottom: spacing[4] }}>
      <Text style={{
        fontSize:     typography.fontSize.sm,
        fontWeight:   typography.fontWeight.semibold,
        color:        colors.textSecondary,
        marginBottom: spacing[2],
        letterSpacing: typography.letterSpacing.wide,
      }}>
        Frecuencia
      </Text>

      {/* Opciones de frecuencia */}
      <View style={{ gap: spacing[2], marginBottom: spacing[3] }}>
        {FREQUENCY_OPTIONS.map(option => {
          const isSelected = frequency === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onFrequencyChange(option.value)}
              style={{
                flexDirection:   'row',
                alignItems:      'center',
                backgroundColor: isSelected ? colors.accentLight : colors.surface,
                borderRadius:    borderRadius.md,
                borderWidth:     borderWidth.medium,
                borderColor:     isSelected ? colors.accent : colors.border,
                padding:         spacing[3],
                gap:             spacing[3],
              }}
            >
              {/* Radio button */}
              <View style={{
                width:           20,
                height:          20,
                borderRadius:    10,
                borderWidth:     2,
                borderColor:     isSelected ? colors.accent : colors.borderStrong,
                alignItems:      'center',
                justifyContent:  'center',
              }}>
                {isSelected && (
                  <View style={{
                    width:           10,
                    height:          10,
                    borderRadius:    5,
                    backgroundColor: colors.accent,
                  }} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize:   typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color:      isSelected ? colors.accent : colors.textPrimary,
                }}>
                  {option.label}
                </Text>
                <Text style={{
                  fontSize: typography.fontSize.xs,
                  color:    colors.textTertiary,
                  marginTop: 1,
                }}>
                  {option.description}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selector de días — visible solo en weekly y custom */}
      {(frequency === 'weekly' || frequency === 'custom') && (
        <View>
          <Text style={{
            fontSize:     typography.fontSize.xs,
            color:        colors.textTertiary,
            marginBottom: spacing[2],
          }}>
            {frequency === 'weekly'
              ? 'Selecciona el día de la semana'
              : 'Selecciona los días'}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            {WEEK_DAYS.map(day => {
              const isSelected = weekDays.includes(day.value);
              return (
                <TouchableOpacity
                  key={day.value}
                  onPress={() => {
                    if (frequency === 'weekly') {
                      // Solo un día permitido en modo semanal
                      onWeekDaysChange([day.value]);
                    } else {
                      toggleDay(day.value);
                    }
                  }}
                  style={{
                    flex:            1,
                    height:          40,
                    alignItems:      'center',
                    justifyContent:  'center',
                    borderRadius:    borderRadius.md,
                    backgroundColor: isSelected ? colors.accent : colors.backgroundSecondary,
                  }}
                >
                  <Text style={{
                    fontSize:   typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    color:      isSelected ? colors.textOnAccent : colors.textSecondary,
                  }}>
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};