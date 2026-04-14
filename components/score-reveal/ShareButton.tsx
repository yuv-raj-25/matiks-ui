/**
 * ShareButton — Premium / Arcade Aesthetic
 *
 * Design Direction: High-fidelity interactive CTA.
 * 
 * Animations (UI Thread):
 * 1. Infinite Glint: Sweeps a linear gradient from left to right, waits, and repeats.
 * 2. Infinite Ambient Glow: The cyan shadow aggressively breathes to draw attention.
 * 3. Press Physics (Springs):
 *    - In: Squeezes down tightly with an immediate timing.
 *    - Out: Bounces back with a heavy, satisfying spring constraint.
 * 4. Micro-interactions: The icon slightly bumps up on hold.
 * 
 * Haptics trigger on JS side upon user press.
 */
import React, { useCallback, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AnimationTiming, MatiksColors } from '@/constants/theme';

interface ShareButtonProps {
  score: number;
  rank: number;
  totalPlayers: number;
}

const BUTTON_WIDTH = 300;
const SHIMMER_WIDTH = 120;

export default function ShareButton({
  score,
  rank,
  totalPlayers,
}: ShareButtonProps) {
  // ── Animation Shared Values
  const shimmerX = useSharedValue(-SHIMMER_WIDTH);
  const pressScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);
  const iconTranslateY = useSharedValue(0);

  useEffect(() => {
    // 1. Shimmer/Glint effect: sweeps quickly, then waits 2.5 seconds.
    shimmerX.value = withRepeat(
      withSequence(
        withTiming(BUTTON_WIDTH + SHIMMER_WIDTH, {
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
        }),
        // Reset instantly to left side
        withTiming(-SHIMMER_WIDTH, { duration: 0 }),
        // Pause before next glint
        withDelay(2500, withTiming(-SHIMMER_WIDTH, { duration: 0 }))
      ),
      -1, // infinite
      false
    );

    // 2. Ambient breathing glow behind the button
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animated Styles
  const shimmerAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateX: shimmerX.value }],
    };
  });

  const buttonAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: pressScale.value }],
    };
  });

  const glowAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: glowOpacity.value,
    };
  });

  const iconAnimStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ translateY: iconTranslateY.value }],
    };
  });

  // ── Interaction Handlers
  const handlePressIn = useCallback(() => {
    // Aggressive squeeze down
    pressScale.value = withTiming(0.92, {
      duration: 120,
      easing: Easing.out(Easing.quad),
    });
    // Icon bumps up slightly
    iconTranslateY.value = withSpring(-3, { damping: 10, stiffness: 300 });

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePressOut = useCallback(() => {
    // Heavy, satisfying bounce back
    pressScale.value = withSpring(1, {
      damping: 12,
      stiffness: 280,
      mass: 0.8,
    });
    // Icon drops back to center
    iconTranslateY.value = withSpring(0, { damping: 12, stiffness: 300 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `🎮 I just scored ${score.toLocaleString()} points on Matiks and ranked #${rank} of ${totalPlayers.toLocaleString()} players! Can you beat me? #Matiks #MathDuel`,
        title: 'My Matiks Score',
      });
    } catch {
      // Share cancelled or error silently ignored
    }
  }, [score, rank, totalPlayers]);

  return (
    <View style={styles.container}>
      {/* Intense Breathing Ambient Glow */}
      <Animated.View style={[styles.ambientGlow, glowAnimStyle]} />

      <Animated.View style={[styles.wrapper, buttonAnimStyle]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleShare}
          style={styles.pressable}
          accessibilityRole="button"
          accessibilityLabel="Share your result"
        >
          {/* Base gradient background */}
          <LinearGradient
            colors={[MatiksColors.shareGradientStart, MatiksColors.shareGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Shimmer stripe masked inside wrapper */}
          <Animated.View style={[styles.shimmerStripe, shimmerAnimStyle]}>
            <LinearGradient
              colors={[
                'transparent',
                'rgba(0, 229, 255, 0.1)',
                'rgba(255, 255, 255, 0.35)',
                'rgba(0, 229, 255, 0.1)',
                'transparent',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          {/* Button Content */}
          <View style={styles.labelRow}>
            <Animated.View style={iconAnimStyle}>
              <Text style={styles.shareIcon}>↑</Text>
            </Animated.View>
            <Text style={styles.labelText}>Share Result</Text>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
  },
  ambientGlow: {
    position: 'absolute',
    width: BUTTON_WIDTH,
    height: 56,
    borderRadius: 20,
    backgroundColor: MatiksColors.electricCyanGlow,
    shadowColor: MatiksColors.electricCyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 10,
    transform: [{ scaleY: 1.2 }, { scaleX: 1.05 }],
  },
  wrapper: {
    width: BUTTON_WIDTH,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: MatiksColors.shareBorder,
    backgroundColor: '#0D1A30',
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerStripe: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SHIMMER_WIDTH,
    // Intense slant
    transform: [{ skewX: '-30deg' }],
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shareIcon: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '900',
    textShadowColor: MatiksColors.electricCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  labelText: {
    fontSize: 17,
    fontWeight: '800',
    color: MatiksColors.textPrimary,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
