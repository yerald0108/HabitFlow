// src/screens/Splash/SplashScreen.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { useTheme } from '../../theme/theme';

interface SplashScreenProps {
  onFinish: () => void;
}

export const AnimatedSplash: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { colors, typography } = useTheme();

  const logoScale   = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const bgOpacity   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo aparece con spring
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue:         1,
          damping:         14,
          stiffness:       150,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue:         1,
          duration:        300,
          useNativeDriver: true,
        }),
      ]),
      // Texto aparece
      Animated.timing(textOpacity, {
        toValue:         1,
        duration:        400,
        delay:           100,
        useNativeDriver: true,
      }),
      // Pausa
      Animated.delay(600),
      // Fade out
      Animated.timing(bgOpacity, {
        toValue:         0,
        duration:        400,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={{
      position:        'absolute',
      top:             0,
      left:            0,
      right:           0,
      bottom:          0,
      backgroundColor: colors.background,
      alignItems:      'center',
      justifyContent:  'center',
      opacity:         bgOpacity,
      zIndex:          999,
    }}>
      <Animated.View style={{
        alignItems:  'center',
        opacity:     logoOpacity,
        transform:   [{ scale: logoScale }],
      }}>
        {/* Logo */}
        <View style={{
          width:           80,
          height:          80,
          borderRadius:    24,
          backgroundColor: colors.accent,
          alignItems:      'center',
          justifyContent:  'center',
          marginBottom:    16,
          shadowColor:     colors.accent,
          shadowOffset:    { width: 0, height: 8 },
          shadowOpacity:   0.4,
          shadowRadius:    20,
          elevation:       12,
        }}>
          <Text style={{ fontSize: 44 }}>✦</Text>
        </View>

        <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
          <Text style={{
            fontSize:      typography.fontSize['2xl'],
            fontWeight:    typography.fontWeight.bold,
            color:         colors.textPrimary,
            letterSpacing: typography.letterSpacing.tight,
          }}>
            HabitFlow
          </Text>
          <Text style={{
            fontSize:   typography.fontSize.sm,
            color:      colors.textTertiary,
            marginTop:  4,
          }}>
            Construye hábitos que duran
          </Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};