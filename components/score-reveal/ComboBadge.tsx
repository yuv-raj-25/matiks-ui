/**
 * ComboBadge — "Volcanic Heat" aesthetic
 *
 * Design direction: maximalist arcade heat. The badge erupts onto the screen
 * like a living thing — radiating rings, spinning fire border, floating flame,
 * and a number that feels branded in. Unforgettable.
 *
 * Animation architecture (all UI thread, no setState):
 *
 * ENTRY SEQUENCE (staggered, fires on mount):
 *   t=0ms   → outerRingScale: 0→2.4 (fast bloom, fades out = shockwave)
 *   t=0ms   → badgeScale: 0→1.15→1.0 (withSequence spring bounce)
 *   t=60ms  → badgeOpacity: 0→1 (quick fade)
 *   t=80ms  → innerGlow expands with spring
 *   t=220ms → streak number & text slides up with fade
 *   t=400ms → flame pulse loop begins
 *   t=600ms → border spin loop begins
 *
 * IDLE LOOPS (withRepeat, infinite):
 *   • flameScale  — 1.0 ↔ 1.35 (elastic bounce, 480ms)
 *   • flameFloat  — translateY 0 ↔ −7 (sine wave, 800ms)
 *   • flameRot    — −8deg ↔ +8deg (wobble, 600ms)
 *   • flameOpac   — 1.0 ↔ 0.6 (breath, 480ms, offset phase)
 *   • borderRot   — 0 → 360deg (continuous spin, 4000ms linear)
 *   • pulseRing   — scale 1→1.6, opacity 0.6→0 (expanding ring, 1200ms)
 *   • bgShimmer   — translateX sweep (heat-wave shimmer, 2200ms)
 */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MatiksColors } from '@/constants/theme';

// ─── Spark particle (tiny View that flies off the badge edge) ────────────────
interface SparkProps {
  angle: number;    // degrees
  delay: number;    // ms
  distance: number; // px from center
}

function Spark({ angle, delay, distance }: SparkProps) {
  const rad = (angle * Math.PI) / 180;
  const tx = Math.cos(rad) * distance;
  const ty = Math.sin(rad) * distance;
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 120 }),
          withTiming(0, { duration: 780, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 100 })
        ),
        -1,
        false
      )
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: tx * progress.value },
        { translateY: ty * progress.value },
        { scale: 1 - progress.value * 0.6 },
      ],
      opacity: opacity.value,
    };
  });

  return <Animated.View style={[styles.spark, animStyle]} />;
}

// ─── Main component ──────────────────────────────────────────────────────────
interface ComboBadgeProps {
  comboStreak: number;
}

const SPARK_CONFIGS: SparkProps[] = [
  { angle: -75, delay: 600,  distance: 72 },
  { angle: -45, delay: 780,  distance: 80 },
  { angle: -20, delay: 650,  distance: 68 },
  { angle: 200, delay: 700,  distance: 75 },
  { angle: 240, delay: 850,  distance: 78 },
  { angle: 280, delay: 720,  distance: 70 },
  { angle: 110, delay: 800,  distance: 74 },
  { angle: 160, delay: 900,  distance: 66 },
];

export default function ComboBadge({ comboStreak }: ComboBadgeProps) {
  // ── Entry shared values
  const badgeScale    = useSharedValue(0);
  const badgeOpacity  = useSharedValue(0);
  const innerGlow     = useSharedValue(0.3);
  const textTranslateY = useSharedValue(14);
  const textOpacity   = useSharedValue(0);
  const outerRing     = useSharedValue(0.3);   // shockwave ring
  const outerRingOp   = useSharedValue(0.8);

  // ── Idle loop shared values
  const flameScale    = useSharedValue(1);
  const flameFloat    = useSharedValue(0);
  const flameRot      = useSharedValue(0);
  const flameOpacity  = useSharedValue(1);
  const borderRot     = useSharedValue(0);
  const pulseRingScale = useSharedValue(1);
  const pulseRingOp   = useSharedValue(0);
  const bgShimmerX    = useSharedValue(-200);

  useEffect(() => {
    // ── 1. ENTRY: Shockwave ring blooms out and fades ──────────────────
    outerRing.value = withTiming(2.4, { duration: 700, easing: Easing.out(Easing.quad) });
    outerRingOp.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });

    // ── 2. ENTRY: Badge pops in with spring bounce ─────────────────────
    badgeOpacity.value = withTiming(1, { duration: 60 });
    badgeScale.value = withSequence(
      withSpring(1.15, { damping: 5, stiffness: 220, mass: 0.8 }),
      withSpring(1.0,  { damping: 12, stiffness: 160 })
    );

    // ── 3. ENTRY: Inner glow blooms with spring ────────────────────────
    innerGlow.value = withDelay(
      80,
      withSpring(1, { damping: 8, stiffness: 120 })
    );

    // ── 4. ENTRY: Text slides up from below ───────────────────────────
    textTranslateY.value = withDelay(
      220,
      withSpring(0, { damping: 14, stiffness: 200 })
    );
    textOpacity.value = withDelay(
      220,
      withTiming(1, { duration: 280 })
    );

    // ── 5. LOOP: Flame scale (elastic pounce) ─────────────────────────
    flameScale.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withSpring(1.35, { damping: 3, stiffness: 260, mass: 0.6 }),
          withSpring(1.0,  { damping: 7, stiffness: 180 }),
          withTiming(1.0, { duration: 120 })           // rest beat
        ),
        -1,
        false
      )
    );

    // ── 6. LOOP: Flame vertical float (sine wave) ─────────────────────
    flameFloat.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-7, { duration: 400, easing: Easing.inOut(Easing.sin) }),
          withTiming(0,  { duration: 400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // ── 7. LOOP: Flame rotation wobble ────────────────────────────────
    flameRot.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(-8, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          withTiming( 8, { duration: 300, easing: Easing.inOut(Easing.quad) }),
          withTiming( 0, { duration: 300, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      )
    );

    // ── 8. LOOP: Flame opacity breath (offset phase from scale) ───────
    flameOpacity.value = withDelay(
      640,   // offset from scale pulse
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 480, easing: Easing.inOut(Easing.sin) }),
          withTiming(1.0,  { duration: 480, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );

    // ── 9. LOOP: Border rotation (continuous spin) ────────────────────
    borderRot.value = withDelay(
      600,
      withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      )
    );

    // ── 10. LOOP: Expanding pulse ring ────────────────────────────────
    pulseRingOp.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 80 }),
          withTiming(0,    { duration: 1120, easing: Easing.out(Easing.quad) }),
          withTiming(0,    { duration: 400 })       // rest between beats
        ),
        -1,
        false
      )
    );
    pulseRingScale.value = withDelay(
      500,
      withRepeat(
        withSequence(
          withTiming(1,   { duration: 0 }),
          withTiming(1.7, { duration: 1200, easing: Easing.out(Easing.cubic) }),
          withTiming(1,   { duration: 400 })
        ),
        -1,
        false
      )
    );

    // ── 11. LOOP: Heat shimmer sweep ──────────────────────────────────
    bgShimmerX.value = withDelay(
      300,
      withRepeat(
        withTiming(260, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        -1,
        false
      )
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animated styles ────────────────────────────────────────────────────────
  const shockwaveStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: outerRing.value }],
      opacity: outerRingOp.value,
    };
  });

  const badgeStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: badgeScale.value }],
      opacity: badgeOpacity.value,
    };
  });

  const innerGlowStyle = useAnimatedStyle(() => {
    'worklet';
    return { opacity: innerGlow.value };
  });

  const flameStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateY: flameFloat.value },
        { rotate: `${flameRot.value}deg` },
        { scale: flameScale.value },
      ],
      opacity: flameOpacity.value,
    };
  });

  const textSlideStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: textTranslateY.value }],
      opacity: textOpacity.value,
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ rotate: `${borderRot.value}deg` }],
    };
  });

  const pulseRingStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: pulseRingScale.value }],
      opacity: pulseRingOp.value,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: bgShimmerX.value }],
    };
  });

  return (
    <View style={styles.outerContainer}>
      {/* Shockwave ring — entry only */}
      <Animated.View style={[styles.shockwave, shockwaveStyle]} />

      {/* Expanding pulse ring — idle loop */}
      <Animated.View style={[styles.pulseRing, pulseRingStyle]} />

      {/* Spark particles — 8 radial bursts */}
      {SPARK_CONFIGS.map((s, i) => (
        <View key={i} style={styles.sparkOrigin}>
          <Spark {...s} />
        </View>
      ))}

      {/* Main badge */}
      <Animated.View style={[styles.badge, badgeStyle]}>
        {/* Inner atmospheric glow */}
        <Animated.View style={[styles.innerGlow, innerGlowStyle]} />

        {/* Spinning dashed border overlay */}
        <Animated.View style={[styles.spinBorder, borderStyle]} />

        {/* Heat shimmer stripe */}
        <View style={styles.shimmerClip}>
          <Animated.View style={[styles.shimmerStripe, shimmerStyle]} />
        </View>

        {/* Content row */}
        <View style={styles.contentRow}>
          {/* Flame — 3-axis animated */}
          <Animated.Text style={[styles.flameEmoji, flameStyle]}>
            🔥
          </Animated.Text>

          {/* Text block slides up */}
          <Animated.View style={textSlideStyle}>
            <View style={styles.textBlock}>
              <Text style={styles.streakNumber}>{comboStreak}</Text>
              <View style={styles.textRight}>
                <Text style={styles.comboLabel}>COMBO</Text>
                <Text style={styles.streakLabel}>STREAK</Text>
              </View>
              <Text style={styles.bangText}>!</Text>
            </View>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const BADGE_W = 280;
const BADGE_H = 68;
const BADGE_R = 22;

const styles = StyleSheet.create({
  outerContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    width: BADGE_W + 80,
    height: BADGE_H + 80,
  },
  // ── Shockwave ring (entry only)
  shockwave: {
    position: 'absolute',
    width: BADGE_W,
    height: BADGE_H,
    borderRadius: BADGE_R,
    borderWidth: 2,
    borderColor: MatiksColors.fireOrange,
  },
  // ── Pulse ring (idle loop)
  pulseRing: {
    position: 'absolute',
    width: BADGE_W,
    height: BADGE_H,
    borderRadius: BADGE_R,
    borderWidth: 1.5,
    borderColor: MatiksColors.fireSoft,
  },
  // ── Spark particles
  sparkOrigin: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  spark: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: MatiksColors.neonAmber,
    shadowColor: MatiksColors.neonAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  // ── Badge body
  badge: {
    width: BADGE_W,
    height: BADGE_H,
    borderRadius: BADGE_R,
    backgroundColor: '#160800',
    borderWidth: 1.5,
    borderColor: MatiksColors.fireOrange,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // Dramatic fire shadow
    shadowColor: MatiksColors.fireOrange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 24,
  },
  // ── Inner glow fill
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 70, 20, 0.13)',
    borderRadius: BADGE_R,
  },
  // ── Spinning dashed border
  spinBorder: {
    position: 'absolute',
    inset: -3,
    borderRadius: BADGE_R + 4,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: 'rgba(255, 140, 50, 0.55)',
    borderRightColor: 'rgba(255, 90, 30, 0.25)',
  },
  // ── Heat shimmer
  shimmerClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: BADGE_R,
  },
  shimmerStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 50,
    left: -60,
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ skewX: '-20deg' }],
  },
  // ── Content
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  flameEmoji: {
    fontSize: 32,
    lineHeight: 38,
  },
  textBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakNumber: {
    fontSize: 40,
    fontWeight: '900',
    color: MatiksColors.neonAmber,
    letterSpacing: -1,
    textShadowColor: MatiksColors.neonAmber,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    lineHeight: 46,
    includeFontPadding: false,
  },
  textRight: {
    flexDirection: 'column',
    gap: 1,
  },
  comboLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: MatiksColors.fireSoft,
    letterSpacing: 3,
    lineHeight: 13,
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,140,66,0.6)',
    letterSpacing: 3,
    lineHeight: 13,
  },
  bangText: {
    fontSize: 34,
    fontWeight: '900',
    color: MatiksColors.fireOrange,
    textShadowColor: MatiksColors.fireOrange,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    lineHeight: 46,
    includeFontPadding: false,
  },
});
