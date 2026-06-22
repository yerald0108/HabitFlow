// src/screens/Onboarding/OnboardingScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/theme';

const { width: W } = Dimensions.get('window');

const SLIDES = [
  {
    emoji:    '🌱',
    title:    'Bienvenido a HabitFlow',
    subtitle: 'La app más elegante para construir hábitos que duran. Simple, privada y completamente tuya.',
  },
  {
    emoji:    '✅',
    title:    'Marca tus hábitos',
    subtitle: 'Cada día es una nueva oportunidad. Marca tus hábitos completados y observa cómo crece tu racha.',
  },
  {
    emoji:    '📊',
    title:    'Visualiza tu progreso',
    subtitle: 'Heatmaps, rachas y estadísticas detalladas para que siempre sepas cómo vas.',
  },
  {
    emoji:    '🔒',
    title:    '100% privado',
    subtitle: 'Sin servidores, sin cuentas, sin anuncios. Tus datos viven solo en tu teléfono.',
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onFinish }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const insets    = useSafeAreaInsets();
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim  = useRef(new Animated.Value(1)).current;

  const goToSlide = (index: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue:         0,
        duration:        150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue:         1,
        duration:        200,
        useNativeDriver: true,
      }),
    ]).start();

    setCurrent(index);
    scrollRef.current?.scrollTo({ x: index * W, animated: true });
  };

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      goToSlide(current + 1);
    } else {
      onFinish();
    }
  };

  const isLast = current === SLIDES.length - 1;

  return (
    <View style={{
      flex:            1,
      backgroundColor: colors.background,
    }}>
      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <Animated.View
            key={i}
            style={{
              width:          W,
              flex:           1,
              alignItems:     'center',
              justifyContent: 'center',
              paddingHorizontal: spacing[10],
              opacity:        i === current ? fadeAnim : 1,
            }}
          >
            <Text style={{ fontSize: 96, marginBottom: spacing[8] }}>
              {slide.emoji}
            </Text>

            <Text style={{
              fontSize:      typography.fontSize['2xl'],
              fontWeight:    typography.fontWeight.bold,
              color:         colors.textPrimary,
              textAlign:     'center',
              letterSpacing: typography.letterSpacing.tight,
              marginBottom:  spacing[4],
            }}>
              {slide.title}
            </Text>

            <Text style={{
              fontSize:   typography.fontSize.base,
              color:      colors.textSecondary,
              textAlign:  'center',
              lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
            }}>
              {slide.subtitle}
            </Text>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Footer */}
      <View style={{
        paddingHorizontal: spacing[8],
        paddingBottom:     insets.bottom + spacing[6],
        gap:               spacing[6],
      }}>
        {/* Indicadores de página */}
        <View style={{
          flexDirection:  'row',
          justifyContent: 'center',
          gap:            spacing[2],
        }}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => goToSlide(i)}
            >
              <View style={{
                width:           i === current ? 24 : 8,
                height:          8,
                borderRadius:    4,
                backgroundColor: i === current
                  ? colors.accent
                  : colors.border,
              }} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón principal */}
        <TouchableOpacity
          onPress={handleNext}
          style={{
            height:          56,
            borderRadius:    borderRadius.full,
            backgroundColor: colors.accent,
            alignItems:      'center',
            justifyContent:  'center',
          }}
        >
          <Text style={{
            fontSize:   typography.fontSize.md,
            fontWeight: typography.fontWeight.bold,
            color:      colors.textOnAccent,
          }}>
            {isLast ? '¡Empezar ahora!' : 'Siguiente'}
          </Text>
        </TouchableOpacity>

        {/* Saltar */}
        {!isLast && (
          <TouchableOpacity onPress={onFinish} style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize:  typography.fontSize.sm,
              color:     colors.textTertiary,
              fontWeight: typography.fontWeight.medium,
            }}>
              Saltar
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};