import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';
import { useHabitStore } from '../../store/habitStore';
import { AppTextInput } from '../../components/ui/TextInput';
import { EmojiPicker } from '../../components/ui/EmojiPicker';
import { ColorPicker, HABIT_COLORS } from '../../components/ui/ColorPicker';
import { FrequencyPicker } from '../../components/ui/FrequencyPicker';
import { HabitFrequency, WeekDay } from '../../domain/models/Habit';

interface HabitFormScreenProps {
  habitId?: string;   // Si viene, es edición; si no, es creación
  onClose: () => void;
}

export const HabitFormScreen: React.FC<HabitFormScreenProps> = ({
  habitId,
  onClose,
}) => {
  const { colors, typography, spacing, borderRadius, shadows } = useTheme();
  const insets    = useSafeAreaInsets();
  const isEditing = !!habitId;

  // Cargar datos si es edición
  const existingHabit = useHabitStore(s =>
    habitId ? s.habits.find(h => h.id === habitId) : undefined
  );
  const createHabit = useHabitStore(s => s.createHabit);
  const updateHabit = useHabitStore(s => s.updateHabit);

  // ── ESTADO DEL FORMULARIO ────────────────────────────────
  const [name,        setName]        = useState(existingHabit?.name        ?? '');
  const [description, setDescription] = useState(existingHabit?.description ?? '');
  const [emoji,       setEmoji]       = useState(existingHabit?.emoji       ?? '⭐');
  const [color,       setColor]       = useState(existingHabit?.color       ?? HABIT_COLORS[0]);
  const [frequency,   setFrequency]   = useState<HabitFrequency>(existingHabit?.frequency ?? 'daily');
  const [weekDays,    setWeekDays]    = useState<WeekDay[]>(existingHabit?.weekDays ?? []);
  const [isSaving,    setIsSaving]    = useState(false);
  const [nameError,   setNameError]   = useState('');

  // ── ANIMACIÓN DE ENTRADA ─────────────────────────────────
  const slideAnim = useRef(new Animated.Value(600)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue:   0,
        damping:   22,
        stiffness: 200,
        mass:      0.9,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue:  1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
    // El teclado no se abre solo — el usuario toca cuando quiera
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  // ── VALIDACIÓN ───────────────────────────────────────────
  const validate = (): boolean => {
    if (!name.trim()) {
      setNameError('El nombre es obligatorio');
      return false;
    }
    if (name.trim().length < 2) {
      setNameError('El nombre debe tener al menos 2 caracteres');
      return false;
    }
    if ((frequency === 'weekly' || frequency === 'custom') && weekDays.length === 0) {
      return false;
    }
    setNameError('');
    return true;
  };

  // ── GUARDAR ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (isEditing && habitId) {
        await updateHabit({
          id: habitId,
          name: name.trim(),
          description: description.trim(),
          emoji,
          color,
          frequency,
          weekDays: frequency === 'daily' ? [] : weekDays,
        });
      } else {
        await createHabit({
          name:        name.trim(),
          description: description.trim(),
          emoji,
          color,
          frequency,
          weekDays:    frequency === 'daily' ? [] : weekDays,
          reminderTime: null,
        });
      }
      handleClose();
    } catch (error) {
      console.error('[HabitForm] Error al guardar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const canSave =
    name.trim().length >= 2 &&
    (frequency === 'daily' || weekDays.length > 0);

  return (
    <View style={{ flex: 1 }}>
      {/* Fondo oscuro semitransparente */}
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: fadeAnim,
        }}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={handleClose} />
      </Animated.View>

      {/* Panel deslizante */}
      <Animated.View style={{
        position:  'absolute',
        bottom:    0,
        left:      0,
        right:     0,
        transform: [{ translateY: slideAnim }],
        backgroundColor:    colors.surface,
        borderTopLeftRadius:  borderRadius['2xl'],
        borderTopRightRadius: borderRadius['2xl'],
        maxHeight: '92%',
        ...shadows.lg,
      }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Handle y Header */}
          <View style={{ alignItems: 'center', paddingTop: spacing[3] }}>
            <View style={{
              width:           40,
              height:          4,
              borderRadius:    2,
              backgroundColor: colors.border,
            }} />
          </View>

          <View style={{
            flexDirection:   'row',
            alignItems:      'center',
            justifyContent:  'space-between',
            paddingHorizontal: spacing[5],
            paddingVertical:   spacing[4],
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{
                fontSize:   typography.fontSize.base,
                color:      colors.textSecondary,
                fontWeight: typography.fontWeight.medium,
              }}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <Text style={{
              fontSize:   typography.fontSize.md,
              fontWeight: typography.fontWeight.bold,
              color:      colors.textPrimary,
            }}>
              {isEditing ? 'Editar hábito' : 'Nuevo hábito'}
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave || isSaving}
              style={{
                backgroundColor: canSave ? colors.accent : colors.accentMedium,
                paddingHorizontal: spacing[4],
                paddingVertical:   spacing[2],
                borderRadius:      borderRadius.full,
              }}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colors.textOnAccent} />
              ) : (
                <Text style={{
                  fontSize:   typography.fontSize.sm,
                  fontWeight: typography.fontWeight.semibold,
                  color:      canSave ? colors.textOnAccent : colors.textTertiary,
                }}>
                  {isEditing ? 'Guardar' : 'Crear'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding:       spacing[5],
              paddingBottom: insets.bottom + spacing[8],
            }}
          >
            {/* Preview del hábito */}
            <View style={{
              flexDirection:   'row',
              alignItems:      'center',
              backgroundColor: color + '15',
              borderRadius:    borderRadius.lg,
              padding:         spacing[4],
              marginBottom:    spacing[5],
              gap:             spacing[3],
            }}>
              <View style={{
                width:           52,
                height:          52,
                borderRadius:    borderRadius.md,
                backgroundColor: color + '25',
                alignItems:      'center',
                justifyContent:  'center',
              }}>
                <Text style={{ fontSize: 28 }}>{emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize:   typography.fontSize.md,
                  fontWeight: typography.fontWeight.bold,
                  color:      colors.textPrimary,
                }} numberOfLines={1}>
                  {name.trim() || 'Nombre del hábito'}
                </Text>
                <Text style={{
                  fontSize:  typography.fontSize.xs,
                  color:     colors.textTertiary,
                  marginTop: 2,
                }}>
                  {frequency === 'daily'   ? 'Todos los días' :
                   frequency === 'weekly'  ? 'Semanal' :
                                             'Personalizado'}
                </Text>
              </View>
              {/* Dot de color */}
              <View style={{
                width:           12,
                height:          12,
                borderRadius:    6,
                backgroundColor: color,
              }} />
            </View>

            {/* Campos */}
            <AppTextInput
              label="NOMBRE"
              value={name}
              onChangeText={text => { setName(text); setNameError(''); }}
              onClear={() => setName('')}
              placeholder="ej. Meditar 10 minutos"
              error={nameError}
              maxLength={50}
            />

            <AppTextInput
              label="DESCRIPCIÓN (opcional)"
              value={description}
              onChangeText={setDescription}
              onClear={() => setDescription('')}
              placeholder="¿Por qué es importante para ti?"
              maxLength={120}
              multiline
            />

            <EmojiPicker value={emoji} onChange={setEmoji} />

            <ColorPicker value={color} onChange={setColor} />

            <FrequencyPicker
              frequency={frequency}
              weekDays={weekDays}
              onFrequencyChange={freq => {
                setFrequency(freq);
                setWeekDays([]);
              }}
              onWeekDaysChange={setWeekDays}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

// Necesario para el overlay absoluteFill
import { StyleSheet } from 'react-native';