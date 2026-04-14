/**
 * ConfettiCanvas — Bonus: @shopify/react-native-skia v2 particle burst
 *
 * Skia v2 uses Reanimated SharedValues directly as props (via SkiaProps<T>).
 * Architecture:
 *   - A single `elapsed` SharedValue is driven by useSharedValueEffect + timing.
 *   - Each particle computes x, y, rotation, opacity via useDerivedValue.
 *   - These derived values are passed directly to Skia's <Group> and <RoundedRect>.
 *   - 60 particles, all on the UI thread, zero setState.
 *
 * Renders on a full-screen Canvas with pointerEvents='none'.
 */
import React, { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Canvas,
  Group,
  RoundedRect,
} from '@shopify/react-native-skia';
import {
  useDerivedValue,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { MatiksColors } from '@/constants/theme';

const { width: SW, height: SH } = Dimensions.get('window');
const PARTICLE_COUNT = 60;
const BURST_DURATION = 2800; // ms total animation
const GRAVITY = 0.0009; // px/ms²

interface ParticleConfig {
  x0: number;
  y0: number;
  vx: number; // px/ms
  vy: number; // px/ms (negative = upward)
  rotSpeed: number; // radians/ms
  color: string;
  w: number;
  h: number;
  lifeRatio: number; // 0.6–1.0 (fraction of BURST_DURATION)
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function createParticleConfig(): ParticleConfig {
  const angle = rand(-Math.PI * 0.85, -Math.PI * 0.15); // upward fan
  const speed = rand(0.3, 0.85); // px/ms
  return {
    x0: rand(SW * 0.25, SW * 0.75),
    y0: SH * 0.36,
    vx: Math.cos(angle) * speed * rand(0.5, 1.5),
    vy: Math.sin(angle) * speed,
    rotSpeed: rand(-0.006, 0.006),
    color:
      MatiksColors.confetti[
        Math.floor(Math.random() * MatiksColors.confetti.length)
      ],
    w: rand(6, 13),
    h: rand(4, 9),
    lifeRatio: rand(0.65, 1.0),
  };
}

interface ParticleProps {
  config: ParticleConfig;
  elapsed: ReturnType<typeof useSharedValue<number>>;
}

function Particle({ config, elapsed }: ParticleProps) {
  const { x0, y0, vx, vy, rotSpeed, color, w, h, lifeRatio } = config;
  const lifetime = BURST_DURATION * lifeRatio;
  const cx = w / 2;
  const cy = h / 2;

  // All computed on UI thread via useDerivedValue → passed to Skia as SharedValue
  const transform = useDerivedValue(() => {
    'worklet';
    const t = elapsed.value;
    const x = x0 + vx * t;
    const y = y0 + vy * t + 0.5 * GRAVITY * t * t;
    const rot = rotSpeed * t;
    return [
      { translateX: x + cx },
      { translateY: y + cy },
      { rotate: rot },
      { translateX: -cx },
      { translateY: -cy },
    ];
  });

  const opacity = useDerivedValue(() => {
    'worklet';
    const progress = elapsed.value / lifetime;
    return Math.max(0, 1 - progress);
  });

  return (
    <Group transform={transform} opacity={opacity}>
      <RoundedRect x={0} y={0} width={w} height={h} r={2} color={color} />
    </Group>
  );
}

interface ConfettiCanvasProps {
  visible: boolean;
}

export default function ConfettiCanvas({ visible }: ConfettiCanvasProps) {
  const particles = useMemo(
    () => Array.from({ length: PARTICLE_COUNT }, createParticleConfig),
    []
  );

  // Single shared elapsed time drives all particles
  const elapsed = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    elapsed.value = 0;
    elapsed.value = withTiming(BURST_DURATION, {
      duration: BURST_DURATION,
      easing: Easing.linear,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Canvas style={StyleSheet.absoluteFillObject}>
        {particles.map((config, i) => (
          <Particle key={i} config={config} elapsed={elapsed} />
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
});
