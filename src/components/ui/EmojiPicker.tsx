// src/components/ui/EmojiPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useTheme } from '../../theme/theme';

const EMOJI_LIST = [
  '🏃','💪','🧘','🚴','🏊','⚽','🎯','📚','✍️','🎨',
  '🎸','🎹','🌱','🥗','💧','☕','🛌','🧹','💰','📝',
  '🧠','❤️','🌞','🚶','🍎','🥦','🏋️','🤸','🧗','🏄',
  '🎤','🎭','📷','🖥️','🌍','✈️','🚗','🐕','🐈','🌸',
  '⭐','🔥','💎','🏆','🎁','🙏','😊','💡','🔑','⚡',
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange }) => {
  const { colors, typography, spacing, borderRadius, borderWidth, shadows } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

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
          Icono
        </Text>

        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          style={{
            flexDirection:   'row',
            alignItems:      'center',
            backgroundColor: colors.surface,
            borderRadius:    borderRadius.md,
            borderWidth:     borderWidth.medium,
            borderColor:     colors.border,
            paddingVertical:   spacing[3],
            paddingHorizontal: spacing[4],
            gap: spacing[3],
          }}
        >
          <Text style={{ fontSize: 28 }}>{value}</Text>
          <Text style={{
            fontSize:  typography.fontSize.base,
            color:     colors.textTertiary,
          }}>
            Toca para cambiar
          </Text>
        </TouchableOpacity>
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
              backgroundColor: colors.surface,
              borderTopLeftRadius:  borderRadius['2xl'],
              borderTopRightRadius: borderRadius['2xl'],
              padding: spacing[5],
              ...shadows.lg,
            }}>
              <Text style={{
                fontSize:     typography.fontSize.lg,
                fontWeight:   typography.fontWeight.bold,
                color:        colors.textPrimary,
                marginBottom: spacing[4],
                textAlign:    'center',
              }}>
                Elige un icono
              </Text>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] }}>
                  {EMOJI_LIST.map(emoji => (
                    <TouchableOpacity
                      key={emoji}
                      onPress={() => { onChange(emoji); setIsOpen(false); }}
                      style={{
                        width:           52,
                        height:          52,
                        alignItems:      'center',
                        justifyContent:  'center',
                        borderRadius:    borderRadius.md,
                        backgroundColor: emoji === value ? colors.accentLight : colors.backgroundSecondary,
                        borderWidth:     emoji === value ? borderWidth.medium : 0,
                        borderColor:     colors.accent,
                      }}
                    >
                      <Text style={{ fontSize: 26 }}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={{
                  marginTop:       spacing[4],
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
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
};