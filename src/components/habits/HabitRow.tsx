import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { HabitCheckbox } from './HabitCheckbox';
import { useTheme } from '../../theme/theme';
import { Habit } from '../../domain/models/Habit';

interface HabitRowProps {
  habit: Habit;
  isCompleted: boolean;
  currentStreak: number;
  onToggle: () => void;
  onPress: () => void;
}

export const HabitRow: React.FC<HabitRowProps> = ({
  habit,
  isCompleted,
  currentStreak,
  onToggle,
  onPress,
}) => {
  const { colors, typography, spacing, borderRadius, borderWidth, shadows } = useTheme();

  // Animación de entrada en la lista
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Animación sutil cuando se completa
  const completedScale = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Animated.sequence([
      Animated.timing(completedScale, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(completedScale, {
        toValue: 1,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={{
      opacity:   fadeAnim,
      transform: [
        { translateY: slideAnim },
        { scale: completedScale },
      ],
    }}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          flexDirection:   'row',
          alignItems:      'center',
          backgroundColor: colors.surface,
          borderRadius:    borderRadius.lg,
          padding:         spacing[4],
          marginBottom:    spacing[3],
          borderWidth:     borderWidth.thin,
          borderColor:     isCompleted ? colors.accentMedium : colors.border,
          ...shadows.sm,
        }}
      >
        {/* Emoji / color del hábito */}
        <View style={{
          width:           44,
          height:          44,
          borderRadius:    borderRadius.md,
          backgroundColor: habit.color + '20', // color con 12% opacidad
          alignItems:      'center',
          justifyContent:  'center',
          marginRight:     spacing[3],
        }}>
          <Text style={{ fontSize: 22 }}>{habit.emoji}</Text>
        </View>

        {/* Nombre y racha */}
        <View style={{ flex: 1, marginRight: spacing[3] }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize:       typography.fontSize.base,
              fontWeight:     typography.fontWeight.semibold,
              color:          isCompleted ? colors.textSecondary : colors.textPrimary,
              textDecorationLine: isCompleted ? 'line-through' : 'none',
              letterSpacing:  typography.letterSpacing.tight,
            }}
          >
            {habit.name}
          </Text>

          {/* Racha — solo si hay racha activa */}
          {currentStreak > 0 && (
            <View style={{
              flexDirection: 'row',
              alignItems:    'center',
              marginTop:     spacing[1],
              gap:           4,
            }}>
              <Text style={{ fontSize: 12 }}>🔥</Text>
              <Text style={{
                fontSize:   typography.fontSize.xs,
                color:      colors.streak,
                fontWeight: typography.fontWeight.medium,
              }}>
                {currentStreak} {currentStreak === 1 ? 'día' : 'días'}
              </Text>
            </View>
          )}
        </View>

        {/* Checkbox */}
        <HabitCheckbox
          checked={isCompleted}
          onToggle={handleToggle}
          accentColor={habit.color}
          size="md"
        />
      </TouchableOpacity>
    </Animated.View>
  );
};