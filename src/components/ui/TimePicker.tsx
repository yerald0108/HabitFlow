// src/components/ui/TimePicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

interface TimePickerProps {
  value:    string | null;  // "HH:MM" o null
  onChange: (time: string | null) => void;
}

const HOURS   = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  const { colors, typography, spacing, borderRadius, borderWidth, shadows } = useTheme();
  const [isOpen,     setIsOpen]     = useState(false);
  const [tempHour,   setTempHour]   = useState(8);
  const [tempMinute, setTempMinute] = useState(0);

  const handleOpen = () => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setTempHour(h);
      setTempMinute(m);
    }
    setIsOpen(true);
  };

  const handleConfirm = () => {
    const hStr = String(tempHour).padStart(2, '0');
    const mStr = String(tempMinute).padStart(2, '0');
    onChange(`${hStr}:${mStr}`);
    setIsOpen(false);
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
  };

  return (
    <>
      <View style={{ marginBottom: spacing[4] }}>
        <Text style={{
          fontSize:     typography.fontSize.sm,
          fontWeight:   typography.fontWeight.semibold,
          color:        colors.textSecondary,
          marginBottom: spacing[2],
          letterSpacing: typography.letterSpacing.wide,
        }}>
          Recordatorio (opcional)
        </Text>

        <View style={{ flexDirection: 'row', gap: spacing[2] }}>
          {/* Botón para activar/seleccionar hora */}
          <TouchableOpacity
            onPress={handleOpen}
            style={{
              flex:              1,
              flexDirection:     'row',
              alignItems:        'center',
              backgroundColor:   value ? colors.accentLight : colors.surface,
              borderRadius:      borderRadius.md,
              borderWidth:       borderWidth.medium,
              borderColor:       value ? colors.accent : colors.border,
              paddingHorizontal: spacing[4],
              paddingVertical:   spacing[3],
              gap:               spacing[3],
            }}
          >
            <Feather
              name="clock"
              size={18}
              color={value ? colors.accent : colors.textTertiary}
            />
            <Text style={{
              fontSize:   typography.fontSize.base,
              color:      value ? colors.accent : colors.textTertiary,
              fontWeight: value
                ? typography.fontWeight.semibold
                : typography.fontWeight.regular,
            }}>
              {value ? formatTime(value) : 'Sin recordatorio'}
            </Text>
          </TouchableOpacity>

          {/* Botón para quitar la hora */}
          {value && (
            <TouchableOpacity
              onPress={() => onChange(null)}
              style={{
                width:           48,
                alignItems:      'center',
                justifyContent:  'center',
                backgroundColor: colors.dangerLight,
                borderRadius:    borderRadius.md,
                borderWidth:     borderWidth.medium,
                borderColor:     colors.danger,
              }}
            >
              <Feather name="x" size={18} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={{
              backgroundColor:      colors.surface,
              borderTopLeftRadius:  borderRadius['2xl'],
              borderTopRightRadius: borderRadius['2xl'],
              padding:              spacing[5],
              ...shadows.lg,
            }}>
              <Text style={{
                fontSize:     typography.fontSize.lg,
                fontWeight:   typography.fontWeight.bold,
                color:        colors.textPrimary,
                textAlign:    'center',
                marginBottom: spacing[4],
              }}>
                Seleccionar hora
              </Text>

              {/* Seleccionadores de hora y minuto */}
              <View style={{ flexDirection: 'row', gap: spacing[4] }}>
                {/* Horas */}
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize:     typography.fontSize.xs,
                    color:        colors.textTertiary,
                    textAlign:    'center',
                    marginBottom: spacing[2],
                    letterSpacing: typography.letterSpacing.wider,
                  }}>
                    HORA
                  </Text>
                  <ScrollView style={{ height: 200 }} showsVerticalScrollIndicator={false}>
                    {HOURS.map(h => (
                      <TouchableOpacity
                        key={h}
                        onPress={() => setTempHour(h)}
                        style={{
                          paddingVertical:  spacing[3],
                          alignItems:       'center',
                          backgroundColor:  h === tempHour
                            ? colors.accentLight
                            : 'transparent',
                          borderRadius:     borderRadius.md,
                          marginBottom:     spacing[1],
                        }}
                      >
                        <Text style={{
                          fontSize:   typography.fontSize.lg,
                          fontWeight: h === tempHour
                            ? typography.fontWeight.bold
                            : typography.fontWeight.regular,
                          color:      h === tempHour
                            ? colors.accent
                            : colors.textSecondary,
                        }}>
                          {String(h).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Separador */}
                <View style={{ justifyContent: 'center' }}>
                  <Text style={{
                    fontSize:   typography.fontSize['2xl'],
                    color:      colors.textTertiary,
                    fontWeight: typography.fontWeight.bold,
                  }}>
                    :
                  </Text>
                </View>

                {/* Minutos */}
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize:     typography.fontSize.xs,
                    color:        colors.textTertiary,
                    textAlign:    'center',
                    marginBottom: spacing[2],
                    letterSpacing: typography.letterSpacing.wider,
                  }}>
                    MINUTO
                  </Text>
                  <ScrollView style={{ height: 200 }} showsVerticalScrollIndicator={false}>
                    {MINUTES.map(m => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setTempMinute(m)}
                        style={{
                          paddingVertical: spacing[3],
                          alignItems:      'center',
                          backgroundColor: m === tempMinute
                            ? colors.accentLight
                            : 'transparent',
                          borderRadius:    borderRadius.md,
                          marginBottom:    spacing[1],
                        }}
                      >
                        <Text style={{
                          fontSize:   typography.fontSize.lg,
                          fontWeight: m === tempMinute
                            ? typography.fontWeight.bold
                            : typography.fontWeight.regular,
                          color:      m === tempMinute
                            ? colors.accent
                            : colors.textSecondary,
                        }}>
                          {String(m).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Preview de la hora seleccionada */}
              <View style={{
                alignItems:      'center',
                paddingVertical: spacing[4],
              }}>
                <Text style={{
                  fontSize:   typography.fontSize['3xl'],
                  fontWeight: typography.fontWeight.bold,
                  color:      colors.accent,
                }}>
                  {String(tempHour).padStart(2, '0')}:{String(tempMinute).padStart(2, '0')}
                </Text>
              </View>

              {/* Botones */}
              <View style={{ flexDirection: 'row', gap: spacing[3] }}>
                <TouchableOpacity
                  onPress={() => setIsOpen(false)}
                  style={{
                    flex:            1,
                    paddingVertical: spacing[4],
                    alignItems:      'center',
                    backgroundColor: colors.backgroundSecondary,
                    borderRadius:    borderRadius.lg,
                  }}
                >
                  <Text style={{
                    fontSize:   typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color:      colors.textSecondary,
                  }}>
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleConfirm}
                  style={{
                    flex:            1,
                    paddingVertical: spacing[4],
                    alignItems:      'center',
                    backgroundColor: colors.accent,
                    borderRadius:    borderRadius.lg,
                  }}
                >
                  <Text style={{
                    fontSize:   typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color:      colors.textOnAccent,
                  }}>
                    Confirmar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};