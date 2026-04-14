/**
 * RankReveal — Slides up player rank with staggered animations
 *
 * Design direction: premium, dramatic reveal.
 * Instead of fading the whole block at once, elements enter in a staggered sequence:
 * 1. Top/Bottom glow lines scale outward from center
 * 2. "YOUR RANK" header fades and slides up
 * 3. The huge rank number springs up aggressively
 * 4. "of X players" slides up softly
 *
 * Also includes an infinite slow pulsing glow on the rank number to keep it alive.
 *
 * Driven entirely by Reanimated shared values on the UI thread. No setState.
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
import { AnimationTiming, MatiksColors } from '@/constants/theme';

interface RankRevealProps {
  rank: number;
  totalPlayers: number;
  /** Whether the counter has completed — triggers this reveal */
  triggered: boolean;
}

export default function RankReveal({
  rank,
  totalPlayers,
  triggered,
}: RankRevealProps) {
  // ── Entry animations
  const lineScaleX = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(20);
  
  const rankScale = useSharedValue(0.4);
  const rankOpacity = useSharedValue(0);
  const rankTranslateY = useSharedValue(40);
  
  const totalOpacity = useSharedValue(0);
  const totalTranslateY = useSharedValue(20);

  // ── Idle animations
  const rankGlowOpacity = useSharedValue(0.7);

  useEffect(() => {
    if (!triggered) return;

    const baseDelay = AnimationTiming.rankRevealDelay; // 200ms

    // 1. Glow lines expand from center
    lineScaleX.value = withDelay(
      baseDelay,
      withSpring(1, { damping: 14, stiffness: 100 })
    );

    // 2. Header slides up
    headerOpacity.value = withDelay(
      baseDelay + 100,
      withTiming(1, { duration: 400 })
    );
    headerTranslateY.value = withDelay(
      baseDelay + 100,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // 3. Huge rank number springs up forcefully
    rankOpacity.value = withDelay(
      baseDelay + 200,
      withTiming(1, { duration: 300 })
    );
    rankScale.value = withDelay(
      baseDelay + 200,
      withSequence(
        withSpring(1.05, { damping: 10, stiffness: 180 }),
        withSpring(1.0, { damping: 15, stiffness: 200 })
      )
    );
    rankTranslateY.value = withDelay(
      baseDelay + 200,
      withSpring(0, { damping: 12, stiffness: 150 })
    );

    // 4. Total players text slides up softly
    totalOpacity.value = withDelay(
      baseDelay + 350,
      withTiming(1, { duration: 400 })
    );
    totalTranslateY.value = withDelay(
      baseDelay + 350,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) })
    );

    // 5. Idle breathing neon glow on the rank number
    rankGlowOpacity.value = withDelay(
      baseDelay + 800,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      )
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggered]);

  const lineAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scaleX: lineScaleX.value }],
    };
  });

  const headerAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: headerOpacity.value,
      transform: [{ translateY: headerTranslateY.value }],
    };
  });

  const rankAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: rankOpacity.value,
      transform: [
        { translateY: rankTranslateY.value },
        { scale: rankScale.value },
      ],
    };
  });
  
  const rankGlowAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: rankGlowOpacity.value,
    };
  });

  const totalAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: totalOpacity.value,
      transform: [{ translateY: totalTranslateY.value }],
    };
  });

  const suffix = (n: number) => {
    if (n === 1) return 'st';
    if (n === 2) return 'nd';
    if (n === 3) return 'rd';
    return 'th';
  };

  const formattedTotal = totalPlayers.toLocaleString();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glowLine, lineAnimStyle]} />
      
      <Animated.Text style={[styles.headerLabel, headerAnimStyle]}>
        YOUR RANK
      </Animated.Text>
      
      <Animated.View style={[styles.rankRow, rankAnimStyle]}>
        {/* Breathing glowing background behind the number */}
        <Animated.View style={[styles.rankBackGlow, rankGlowAnimStyle]} />
        
        <Text style={styles.rankHash}>#</Text>
        <Text style={styles.rankNumber}>{rank}</Text>
        <Text style={styles.rankSuffix}>{suffix(rank)}</Text>
      </Animated.View>
      
      <Animated.Text style={[styles.totalText, totalAnimStyle]}>
        of {formattedTotal} players
      </Animated.Text>

      <Animated.View style={[styles.glowLine, lineAnimStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
  },
  glowLine: {
    width: 140,
    height: 1,
    backgroundColor: MatiksColors.electricCyan,
    marginVertical: 12,
    shadowColor: MatiksColors.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: MatiksColors.electricCyan,
    opacity: 0.6,
    letterSpacing: 6,
    marginBottom: 8,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    position: 'relative',
    paddingHorizontal: 16,
  },
  rankBackGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MatiksColors.electricCyanGlow,
    borderRadius: 40,
    filter: [{ blur: 20 }], // Available in newer Expo + React Native Web
    transform: [{ scale: 1.2 }],
    zIndex: -1,
  },
  rankHash: {
    fontSize: 32,
    fontWeight: '900',
    color: MatiksColors.electricCyan,
    opacity: 0.5,
    lineHeight: 64,
  },
  rankNumber: {
    fontSize: 82,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -3,
    lineHeight: 88,
    textShadowColor: MatiksColors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 24,
  },
  rankSuffix: {
    fontSize: 22,
    fontWeight: '800',
    color: MatiksColors.electricCyan,
    opacity: 0.7,
    lineHeight: 38,
    marginLeft: 2,
  },
  totalText: {
    fontSize: 15,
    color: MatiksColors.textSubtle,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginTop: 6,
  },
});
