// src/components/ui/Confetti.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

const COLORS = [
  '#6366F1', '#8B5CF6', '#EC4899',
  '#F59E0B', '#10B981', '#3B82F6',
  '#F97316', '#84CC16',
];

const PARTICLE_COUNT = 60;

interface Particle {
  x:        Animated.Value;
  y:        Animated.Value;
  opacity:  Animated.Value;
  rotate:   Animated.Value;
  color:    string;
  size:     number;
  startX:   number;
}

function createParticle(): Particle {
  const startX = Math.random() * W;
  return {
    x:       new Animated.Value(startX),
    y:       new Animated.Value(-20),
    opacity: new Animated.Value(1),
    rotate:  new Animated.Value(0),
    color:   COLORS[Math.floor(Math.random() * COLORS.length)],
    size:    Math.random() * 8 + 4,
    startX,
  };
}

export const Confetti: React.FC<{ visible: boolean }> = ({ visible }) => {
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLE_COUNT }, createParticle)
  ).current;

  useEffect(() => {
    if (!visible) return;

    // Reiniciar partículas
    particles.forEach(p => {
      p.x.setValue(p.startX);
      p.y.setValue(-20);
      p.opacity.setValue(1);
      p.rotate.setValue(0);
    });

    // Animar todas las partículas con delay escalonado
    const animations = particles.map((p, i) => {
      const delay    = Math.random() * 600;
      const duration = 1200 + Math.random() * 800;
      const endX     = p.startX + (Math.random() - 0.5) * 200;

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(p.y, {
            toValue:         H * 0.85,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue:         endX,
            duration,
            useNativeDriver: true,
          }),
          Animated.timing(p.rotate, {
            toValue:         Math.random() * 10 - 5,
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue:         1,
              duration:        duration * 0.7,
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue:         0,
              duration:        duration * 0.3,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]);
    });

    Animated.parallel(animations).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rotate.interpolate({
          inputRange:  [-5, 5],
          outputRange: ['-180deg', '180deg'],
        });

        return (
          <Animated.View
            key={i}
            style={{
              position:        'absolute',
              width:           p.size,
              height:          p.size * 0.6,
              backgroundColor: p.color,
              borderRadius:    1,
              opacity:         p.opacity,
              transform:       [
                { translateX: p.x },
                { translateY: p.y },
                { rotate },
              ],
            }}
          />
        );
      })}
    </View>
  );
};