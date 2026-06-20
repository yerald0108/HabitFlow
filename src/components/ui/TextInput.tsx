import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  TextInputProps,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

interface AppTextInputProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  onClear?: () => void;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
  label,
  error,
  hint,
  onClear,
  value,
  ...props
}) => {
  const { colors, typography, spacing, borderRadius, borderWidth } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onFocus?.({} as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    props.onBlur?.({} as any);
  };

  const borderColor = borderAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [
      error ? colors.danger : colors.border,
      error ? colors.danger : colors.accent,
    ],
  });

  return (
    <View style={{ marginBottom: spacing[4] }}>
      <Text style={{
        fontSize:      typography.fontSize.sm,
        fontWeight:    typography.fontWeight.semibold,
        color:         error ? colors.danger : colors.textSecondary,
        marginBottom:  spacing[2],
        letterSpacing: typography.letterSpacing.wide,
      }}>
        {label}
      </Text>

      <Animated.View style={{
        flexDirection:   'row',
        alignItems:      'center',
        backgroundColor: colors.surface,
        borderRadius:    borderRadius.md,
        borderWidth:     borderWidth.medium,
        borderColor,
        paddingHorizontal: spacing[4],
      }}>
        <RNTextInput
          {...props}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            flex:       1,
            fontSize:   typography.fontSize.base,
            color:      colors.textPrimary,
            paddingVertical: spacing[3],
            fontWeight: typography.fontWeight.regular,
          }}
          placeholderTextColor={colors.textTertiary}
        />
        {value && onClear && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="x-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {(error || hint) && (
        <Text style={{
          fontSize:   typography.fontSize.xs,
          color:      error ? colors.danger : colors.textTertiary,
          marginTop:  spacing[1],
          marginLeft: spacing[1],
        }}>
          {error ?? hint}
        </Text>
      )}
    </View>
  );
};