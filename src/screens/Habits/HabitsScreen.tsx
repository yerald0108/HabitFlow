// src/screens/Habits/HabitsScreen.tsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useHabitStore } from '../../store/habitStore';
import { useUIStore } from '../../store/uiStore';
import { HabitFormScreen } from './HabitFormScreen';
import { Habit } from '../../domain/models/Habit';

// ─── CONSTANTES ──────────────────────────────────────────────

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH    = 160;

// ─── FILA DE HÁBITO CON SWIPE ────────────────────────────────

const SwipeableHabitRow: React.FC<{
  habit:      Habit;
  onEdit:     () => void;
  onArchive:  () => void;
  onDelete:   () => void;
  isArchived: boolean;
}> = ({ habit, onEdit, onArchive, onDelete, isArchived }) => {
  const { colors, typography, spacing, borderRadius, borderWidth, shadows } = useTheme();

  const translateX    = useRef(new Animated.Value(0)).current;
  const rowHeight     = useRef(new Animated.Value(72)).current;
  const rowOpacity    = useRef(new Animated.Value(1)).current;
  const isSwipedOpen  = useRef(false);

  // Cerrar el swipe
  const closeSwipe = useCallback(() => {
    Animated.spring(translateX, {
      toValue:         0,
      damping:         20,
      stiffness:       200,
      useNativeDriver: true,
    }).start();
    isSwipedOpen.current = false;
  }, []);

  // Abrir el swipe
  const openSwipe = useCallback(() => {
    Animated.spring(translateX, {
      toValue:         -ACTION_WIDTH,
      damping:         20,
      stiffness:       200,
      useNativeDriver: true,
    }).start();
    isSwipedOpen.current = true;
  }, []);

  // Animación de eliminación de la fila
  const animateRemove = useCallback((callback: () => void) => {
    Animated.parallel([
      Animated.timing(rowHeight, {
        toValue:         0,
        duration:        250,
        useNativeDriver: false,
      }),
      Animated.timing(rowOpacity, {
        toValue:         0,
        duration:        200,
        useNativeDriver: false,
      }),
    ]).start(() => callback());
  }, []);

  const handleArchive = () => {
    closeSwipe();
    setTimeout(() => {
      animateRemove(onArchive);
    }, 150);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar hábito',
      `¿Estás seguro de que quieres eliminar "${habit.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: closeSwipe },
        {
          text:    'Eliminar',
          style:   'destructive',
          onPress: () => animateRemove(onDelete),
        },
      ]
    );
  };

  // Manejo del gesto de swipe manual con Animated
  const touchStartX  = useRef(0);
  const currentX     = useRef(0);

  const handleTouchStart = (e: any) => {
    touchStartX.current = e.nativeEvent.pageX;
    currentX.current    = isSwipedOpen.current ? -ACTION_WIDTH : 0;
  };

  const handleTouchMove = (e: any) => {
    const dx   = e.nativeEvent.pageX - touchStartX.current;
    const newX = Math.min(0, Math.max(-ACTION_WIDTH, currentX.current + dx));
    translateX.setValue(newX);
  };

  const handleTouchEnd = (e: any) => {
    const dx = e.nativeEvent.pageX - touchStartX.current;
    if (dx < -SWIPE_THRESHOLD) {
      openSwipe();
    } else if (dx > SWIPE_THRESHOLD) {
      closeSwipe();
    } else if (isSwipedOpen.current) {
      openSwipe();
    } else {
      closeSwipe();
    }
  };

  return (
    <Animated.View style={{
      height:  rowHeight,
      opacity: rowOpacity,
      marginBottom: spacing[2],
      overflow: 'hidden',
    }}>
      <View style={{ flex: 1, position: 'relative' }}>

        {/* Acciones detrás del swipe */}
        <View style={{
          position:        'absolute',
          right:           0,
          top:             0,
          bottom:          0,
          width:           ACTION_WIDTH,
          flexDirection:   'row',
          borderRadius:    borderRadius.lg,
          overflow:        'hidden',
        }}>
          {/* Botón editar */}
          <TouchableOpacity
            onPress={() => { closeSwipe(); setTimeout(onEdit, 200); }}
            style={{
              flex:            1,
              backgroundColor: colors.accent,
              alignItems:      'center',
              justifyContent:  'center',
              gap:             4,
            }}
          >
            <Feather name="edit-2" size={18} color={colors.textOnAccent} />
            <Text style={{
              fontSize:   typography.fontSize.xs,
              color:      colors.textOnAccent,
              fontWeight: typography.fontWeight.semibold,
            }}>
              Editar
            </Text>
          </TouchableOpacity>

          {/* Botón archivar/desarchivar */}
          <TouchableOpacity
            onPress={handleArchive}
            style={{
              flex:            1,
              backgroundColor: isArchived ? colors.success : colors.streak,
              alignItems:      'center',
              justifyContent:  'center',
              gap:             4,
            }}
          >
            <Feather
              name={isArchived ? 'refresh-cw' : 'archive'}
              size={18}
              color={colors.textOnAccent}
            />
            <Text style={{
              fontSize:   typography.fontSize.xs,
              color:      colors.textOnAccent,
              fontWeight: typography.fontWeight.semibold,
            }}>
              {isArchived ? 'Activar' : 'Archivar'}
            </Text>
          </TouchableOpacity>

          {/* Botón eliminar */}
          <TouchableOpacity
            onPress={handleDelete}
            style={{
              flex:            1,
              backgroundColor: colors.danger,
              alignItems:      'center',
              justifyContent:  'center',
              gap:             4,
            }}
          >
            <Feather name="trash-2" size={18} color={colors.textOnAccent} />
            <Text style={{
              fontSize:   typography.fontSize.xs,
              color:      colors.textOnAccent,
              fontWeight: typography.fontWeight.semibold,
            }}>
              Eliminar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Fila principal con swipe */}
        <Animated.View
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            position:        'absolute',
            left:            0,
            right:           0,
            top:             0,
            bottom:          0,
            transform:       [{ translateX }],
            backgroundColor: colors.surface,
            borderRadius:    borderRadius.lg,
            flexDirection:   'row',
            alignItems:      'center',
            paddingHorizontal: spacing[4],
            borderWidth:     borderWidth.thin,
            borderColor:     colors.border,
            ...shadows.sm,
          }}
        >
          {/* Emoji */}
          <View style={{
            width:           44,
            height:          44,
            borderRadius:    borderRadius.md,
            backgroundColor: habit.color + '20',
            alignItems:      'center',
            justifyContent:  'center',
            marginRight:     spacing[3],
          }}>
            <Text style={{ fontSize: 22 }}>{habit.emoji}</Text>
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize:   typography.fontSize.base,
                fontWeight: typography.fontWeight.semibold,
                color:      isArchived ? colors.textTertiary : colors.textPrimary,
                letterSpacing: typography.letterSpacing.tight,
              }}
            >
              {habit.name}
            </Text>
            <Text style={{
              fontSize:  typography.fontSize.xs,
              color:     colors.textTertiary,
              marginTop: 2,
            }}>
              {habit.frequency === 'daily'
                ? 'Todos los días'
                : habit.frequency === 'weekly'
                ? 'Semanal'
                : 'Personalizado'}
            </Text>
          </View>

          {/* Dot de color + indicador */}
          <View style={{ alignItems: 'center', gap: 4 }}>
            <View style={{
              width:           10,
              height:          10,
              borderRadius:    5,
              backgroundColor: isArchived ? colors.textTertiary : habit.color,
            }} />
            {isArchived && (
              <Text style={{
                fontSize: 9,
                color:    colors.textTertiary,
                fontWeight: typography.fontWeight.medium,
              }}>
                Archivado
              </Text>
            )}
          </View>

          {/* Indicador de swipe */}
          <Feather
            name="chevron-left"
            size={16}
            color={colors.textTertiary}
            style={{ marginLeft: spacing[2] }}
          />
        </Animated.View>
      </View>
    </Animated.View>
  );
};

// ─── SECCIÓN CON TÍTULO ───────────────────────────────────────

const SectionHeader: React.FC<{
  title:       string;
  count:       number;
  isCollapsed: boolean;
  onToggle:    () => void;
}> = ({ title, count, isCollapsed, onToggle }) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        flexDirection:  'row',
        alignItems:     'center',
        paddingVertical: spacing[3],
        gap:            spacing[2],
      }}
    >
      <Text style={{
        fontSize:      typography.fontSize.xs,
        fontWeight:    typography.fontWeight.semibold,
        color:         colors.textTertiary,
        letterSpacing: typography.letterSpacing.widest,
        textTransform: 'uppercase',
        flex:          1,
      }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: colors.backgroundSecondary,
        borderRadius:    12,
        paddingHorizontal: spacing[2],
        paddingVertical:   2,
      }}>
        <Text style={{
          fontSize:   typography.fontSize.xs,
          color:      colors.textTertiary,
          fontWeight: typography.fontWeight.medium,
        }}>
          {count}
        </Text>
      </View>
      <Feather
        name={isCollapsed ? 'chevron-right' : 'chevron-down'}
        size={16}
        color={colors.textTertiary}
      />
    </TouchableOpacity>
  );
};

// ─── PANTALLA PRINCIPAL ──────────────────────────────────────

export const HabitsScreen: React.FC = () => {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const habits        = useHabitStore(s => s.habits);
  const archiveHabit  = useHabitStore(s => s.archiveHabit);
  const unarchiveHabit = useHabitStore(s => s.unarchiveHabit);
  const deleteHabit   = useHabitStore(s => s.deleteHabit);

  const openHabitForm  = useUIStore(s => s.openHabitForm);
  const closeHabitForm = useUIStore(s => s.closeHabitForm);
  const isFormVisible  = useUIStore(s => s.isHabitFormOpen);
  const editingHabitId = useUIStore(s => s.editingHabitId);

  const [archivedCollapsed, setArchivedCollapsed] = useState(true);

  const activeHabits   = habits.filter(h => !h.isArchived);
  const archivedHabits = habits.filter(h => h.isArchived);

  const TAB_BAR_TOTAL = 64 + (insets.bottom > 0 ? insets.bottom : 16) + 16;

  const fabScale = useRef(new Animated.Value(1)).current;

  const handleFabPressIn = () => {
    Animated.spring(fabScale, {
      toValue: 0.92, damping: 15, stiffness: 300, useNativeDriver: true,
    }).start();
  };

  const handleFabPressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1, damping: 15, stiffness: 300, useNativeDriver: true,
    }).start();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top }}>
        <View style={{
          paddingHorizontal: spacing[5],
          paddingTop:        spacing[4],
          paddingBottom:     spacing[2],
        }}>
          <Text style={{
            fontSize:      typography.fontSize['2xl'],
            fontWeight:    typography.fontWeight.bold,
            color:         colors.textPrimary,
            letterSpacing: typography.letterSpacing.tight,
          }}>
            Hábitos
          </Text>
          <Text style={{
            fontSize:  typography.fontSize.sm,
            color:     colors.textSecondary,
            marginTop: 2,
          }}>
            Desliza un hábito para ver opciones
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: spacing[5],
          paddingBottom:     TAB_BAR_TOTAL + spacing[8],
          flexGrow:          1,
        }}
      >
        {/* Estado vacío */}
        {activeHabits.length === 0 && archivedHabits.length === 0 && (
          <View style={{
            flex:           1,
            alignItems:     'center',
            justifyContent: 'center',
            paddingTop:     spacing[20],
          }}>
            <Text style={{ fontSize: 56, marginBottom: spacing[4] }}>📋</Text>
            <Text style={{
              fontSize:     typography.fontSize.xl,
              fontWeight:   typography.fontWeight.bold,
              color:        colors.textPrimary,
              textAlign:    'center',
              marginBottom: spacing[2],
            }}>
              Sin hábitos aún
            </Text>
            <Text style={{
              fontSize:  typography.fontSize.base,
              color:     colors.textSecondary,
              textAlign: 'center',
            }}>
              Toca el botón + para crear tu primer hábito.
            </Text>
          </View>
        )}

        {/* Hábitos activos */}
        {activeHabits.length > 0 && (
          <View>
            <SectionHeader
              title="Activos"
              count={activeHabits.length}
              isCollapsed={false}
              onToggle={() => {}}
            />
            {activeHabits.map(habit => (
              <SwipeableHabitRow
                key={habit.id}
                habit={habit}
                isArchived={false}
                onEdit={() => openHabitForm(habit.id)}
                onArchive={() => archiveHabit(habit.id)}
                onDelete={() => deleteHabit(habit.id)}
              />
            ))}
          </View>
        )}

        {/* Hábitos archivados */}
        {archivedHabits.length > 0 && (
          <View style={{ marginTop: spacing[4] }}>
            <SectionHeader
              title="Archivados"
              count={archivedHabits.length}
              isCollapsed={archivedCollapsed}
              onToggle={() => setArchivedCollapsed(v => !v)}
            />
            {!archivedCollapsed && archivedHabits.map(habit => (
              <SwipeableHabitRow
                key={habit.id}
                habit={habit}
                isArchived={true}
                onEdit={() => openHabitForm(habit.id)}
                onArchive={() => unarchiveHabit(habit.id)}
                onDelete={() => deleteHabit(habit.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <Animated.View style={{
        position:  'absolute',
        right:     spacing[5],
        bottom:    TAB_BAR_TOTAL + spacing[4],
        transform: [{ scale: fabScale }],
        ...shadows.lg,
      }}>
        <TouchableOpacity
          onPress={() => openHabitForm()}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          activeOpacity={1}
          style={{
            width:           56,
            height:          56,
            borderRadius:    28,
            backgroundColor: colors.accent,
            alignItems:      'center',
            justifyContent:  'center',
          }}
        >
          <Feather name="plus" size={26} color={colors.textOnAccent} />
        </TouchableOpacity>
      </Animated.View>

      {/* Modal de formulario */}
      {isFormVisible && (
        <View style={StyleSheet.absoluteFill}>
          <HabitFormScreen
            habitId={editingHabitId ?? undefined}
            onClose={() => closeHabitForm()}
          />
        </View>
      )}
    </View>
  );
};