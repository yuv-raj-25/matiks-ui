/**
 * AnimatedCounter — animates a score from 0 → finalScore + overshoot → finalScore
 *
 * UI-thread animation chain:
 *   Phase 1 — Fast count-up: 0 → finalScore+overshoot  (1800ms, ease-out-expo)
 *   Phase 2 — Snap back:     overshoot → finalScore     (220ms, ease-in-out-quad)
 *
 * "Tick-up" feel is produced by:
 *   • A staged easing: exponential ease-out so numbers fly fast early and
 *     visibly decelerate/tick digit-by-digit in the final stretch.
 *   • A separate `tickBump` shared value pulses the score scale every ~80ms
 *     during counting, giving a mechanical odometer feel.
 *   • Glow ring breathes with a looping opacity pulse while counting, then
 *     snaps to full glow on completion.
 *
 * All updates happen on the UI thread:
 *   - displayText via useDerivedValue
 *   - animatedProps via useAnimatedProps → Animated(TextInput).value
 *   - glow/scale via useAnimatedStyle
 *   - NO setState inside any animation callback
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { AnimationTiming, MatiksColors } from '@/constants/theme';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface AnimatedCounterProps {
  finalScore: number;
  onComplete: () => void;
}

// Custom easing: exponential ease-out
// Numbers rip fast then visibly slow — creates the "ticking" illusion in the final digits
const EXPO_OUT = Easing.out(Easing.exp);

export default function AnimatedCounter({
  finalScore,
  onComplete,
}: AnimatedCounterProps) {
  const progress    = useSharedValue(0);
  const tickBump    = useSharedValue(1);    // scale micro-pulse per tick
  const glowOpacity = useSharedValue(0.4);  // glow ring breathes while counting
  const glowScale   = useSharedValue(0.85); // glow ring grows on complete
  const labelOpacity = useSharedValue(0);   // "POINTS" fades in after a beat

  const overshoot = Math.round(finalScore * 0.028); // ~2.8% overshoot

  // ── Display text: formatted number, on UI thread ──────────────────────────
  const displayText = useDerivedValue(() => {
    'worklet';
    const val = Math.round(progress.value);
    // Thousands separator (worklet-safe: no locale API)
    const s = val.toString();
    let result = '';
    for (let i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) result += ',';
      result += s[i];
    }
    return result;
  });

  const animatedProps = useAnimatedProps(() => {
    'worklet';
    return { value: displayText.value };
  });

  // ── Score digit scale-bump — tiny odometer tick feel ─────────────────────
  const scoreContainerStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: tickBump.value }],
    };
  });

  // ── Glow ring animation ───────────────────────────────────────────────────
  const glowStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: glowOpacity.value,
      transform: [{ scale: glowScale.value }],
    };
  });

  // ── POINTS label fade-in ──────────────────────────────────────────────────
  const labelStyle = useAnimatedStyle(() => {
    'worklet';
    return { opacity: labelOpacity.value };
  });

  useEffect(() => {
    // ── 1. Glow breathes during count ──────────────────────────────────────
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );

    // ── 2. Tick bump — micro scale pulse every 90ms during count ──────────
    //    withRepeat fires the 90ms pulse ~20 times across the 1800ms count
    tickBump.value = withRepeat(
      withSequence(
        withTiming(1.018, { duration: 45, easing: Easing.out(Easing.quad) }),
        withTiming(1.0,   { duration: 45, easing: Easing.in(Easing.quad) })
      ),
      Math.ceil(AnimationTiming.counterDuration / 90),
      false
    );

    // ── 3. Main count-up with overshoot ──────────────────────────────────
    progress.value = withSequence(
      // Phase 1: fly up to score + overshoot (exponential ease-out = fast then slows)
      withTiming(finalScore + overshoot, {
        duration: AnimationTiming.counterDuration,
        easing: EXPO_OUT,
      }),
      // Phase 2: snap back to final score (short, inOut feel = settled)
      withTiming(
        finalScore,
        {
          duration: AnimationTiming.counterOvershoot + 40,
          easing: Easing.inOut(Easing.quad),
        },
        (finished) => {
          'worklet';
          if (finished) {
            // Stop glow breath → snap to full bright glow
            glowOpacity.value = withTiming(1, { duration: 300 });
            glowScale.value = withSpring(1.15, { damping: 8, stiffness: 120 });
            // Stop tick bump
            tickBump.value = withSpring(1, { damping: 6, stiffness: 200 });
            runOnJS(onComplete)();
          }
        }
      )
    );

    // ── 4. POINTS label fades in with a 300ms delay ───────────────────────
    labelOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.container}>
      {/* Breathing glow ring behind the number */}
      <Animated.View style={[styles.glowRing, glowStyle]} />

      {/* Score number — scale-bumped per tick */}
      <Animated.View style={scoreContainerStyle}>
        <AnimatedTextInput
          style={styles.scoreText}
          animatedProps={animatedProps}
          editable={false}
          underlineColorAndroid="transparent"
          defaultValue="0"
          caretHidden
          selectTextOnFocus={false}
          contextMenuHidden
        />
      </Animated.View>

      {/* "POINTS" label */}
      <Animated.Text style={[styles.labelText, labelStyle]}>
        POINTS
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  glowRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: MatiksColors.neonAmberGlow,
    shadowColor: MatiksColors.neonAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 70,
    elevation: 20,
  },
  scoreText: {
    fontSize: 88,
    fontWeight: '900',
    color: MatiksColors.neonAmber,
    letterSpacing: -4,
    textAlign: 'center',
    textShadowColor: MatiksColors.neonAmber,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 28,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
    // Remove TextInput chrome
    borderWidth: 0,
    backgroundColor: 'transparent',
    padding: 0,
    minWidth: 220,
    pointerEvents: 'none',
  },
  labelText: {
    fontSize: 13,
    fontWeight: '700',
    color: MatiksColors.textMuted,
    letterSpacing: 6,
    marginTop: 6,
  },
});
