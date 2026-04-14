import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MatiksColors } from '@/constants/theme';
import { ScoreRevealProps } from './types';
import AnimatedCounter from './AnimatedCounter';
import ComboBadge from './ComboBadge';
import RankReveal from './RankReveal';
import ShareButton from './ShareButton';

// Dynamic import of Skia confetti — gracefully absent if Skia not installed
let ConfettiCanvas: React.ComponentType<{ visible: boolean }> | null = null;
try {
  ConfettiCanvas = require('./ConfettiCanvas').default;
} catch {
  // Skia not available — skip confetti
}

const { width: SW, height: SH } = Dimensions.get('window');
const GRID_COLS = 12;
const GRID_GAP = SW / GRID_COLS;

/**
 * ScoreRevealScreen — Orchestrates the post-game score reveal sequence.
 *
 * Animation timeline:
 *   t=0ms    → AnimatedCounter begins, ComboBadge bounces in
 *   t≈2000ms → Counter settles (onComplete fires via runOnJS)
 *   t≈2200ms → RankReveal slides up (200ms stagger via withDelay in RankReveal)
 *   t≈2200ms → ConfettiCanvas mounts (Skia burst begins)
 *
 * Key constraint: `counterDone` is the only piece of React state — it's a
 * boolean set once after the counter completes. All animation values live
 * in Reanimated shared values on the UI thread.
 */
export default function ScoreRevealScreen({
  finalScore,
  comboStreak,
  rank,
  totalPlayers,
  playerName = 'You',
}: ScoreRevealProps) {
  // Single piece of state — controls RankReveal trigger & Skia canvas mount.
  // Only set once, after counter completes.
  const [counterDone, setCounterDone] = useState(false);

  const handleCounterComplete = useCallback(() => {
    setCounterDone(true);
  }, []);

  return (
    <View style={styles.root}>
      {/* Background: deep dark gradient */}
      <LinearGradient
        colors={['#0A0E1A', '#080C16', '#060810']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Vertical grid lines for depth */}
      <View style={styles.gridOverlay} pointerEvents="none">
        {Array.from({ length: GRID_COLS + 1 }).map((_, i) => (
          <View
            key={i}
            style={[styles.gridLine, { left: i * GRID_GAP }]}
          />
        ))}
      </View>

      {/* Ambient glow spots */}
      <View style={[styles.glowSpot, styles.glowSpotTop]} pointerEvents="none" />
      <View style={[styles.glowSpot, styles.glowSpotBottom]} pointerEvents="none" />

      {/* Confetti overlaid on everything */}
      {ConfettiCanvas && <ConfettiCanvas visible={counterDone} />}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>MATH DUEL · RESULTS</Text>
          </View>
          <Text style={styles.title}>MATIKS</Text>
          <Text style={styles.subtitle}>Game Over</Text>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerDot}>◆</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Score Counter ── */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreSectionLabel}>FINAL SCORE</Text>
          <AnimatedCounter
            finalScore={finalScore}
            onComplete={handleCounterComplete}
          />
        </View>

        {/* ── Combo Streak Badge ── */}
        <ComboBadge comboStreak={comboStreak} />

        {/* ── Divider ── */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerDot}>◆</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Rank Reveal ── */}
        <RankReveal
          rank={rank}
          totalPlayers={totalPlayers}
          triggered={counterDone}
        />

        {/* ── Stats Row ── */}
        <View style={styles.statsRow}>
          <StatCard label="Accuracy" value="94%" />
          <StatCard label="Avg Speed" value="1.4s" />
          <StatCard label="Best Streak" value={`${comboStreak}x`} />
        </View>

        {/* ── Share Button ── */}
        <ShareButton
          score={finalScore}
          rank={rank}
          totalPlayers={totalPlayers}
        />

        {/* ── Footer ── */}
        <Text style={styles.footerText}>Plays on Matiks</Text>
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MatiksColors.bg,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  gridLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: MatiksColors.gridLine,
  },
  glowSpot: {
    position: 'absolute',
    borderRadius: 9999,
  },
  glowSpotTop: {
    top: -SH * 0.1,
    alignSelf: 'center',
    width: SW * 0.8,
    height: SW * 0.8,
    backgroundColor: 'rgba(255,184,39,0.04)',
    // Heavy blur needed — approximate with large shadow
    shadowColor: MatiksColors.neonAmber,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 120,
  },
  glowSpotBottom: {
    bottom: -SH * 0.15,
    alignSelf: 'center',
    width: SW * 0.7,
    height: SW * 0.7,
    backgroundColor: 'rgba(0,229,255,0.03)',
    shadowColor: MatiksColors.electricCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 100,
  },
  scrollContent: {
    paddingTop: 64,
    paddingBottom: 52,
    alignItems: 'center',
  },
  // ── Header
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  modeBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 12,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: MatiksColors.textMuted,
    letterSpacing: 3,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: MatiksColors.textPrimary,
    letterSpacing: 12,
  },
  subtitle: {
    fontSize: 13,
    color: MatiksColors.textSubtle,
    fontWeight: '400',
    letterSpacing: 3,
    marginTop: 4,
  },
  // ── Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 32,
    gap: 8,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: MatiksColors.gridLine,
  },
  dividerDot: {
    fontSize: 8,
    color: MatiksColors.textMuted,
  },
  // ── Score
  scoreSection: {
    alignItems: 'center',
    width: '100%',
  },
  scoreSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MatiksColors.textMuted,
    letterSpacing: 5,
    marginBottom: 4,
  },
  // ── Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: MatiksColors.gridLine,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: MatiksColors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    color: MatiksColors.textMuted,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  // ── Footer
  footerText: {
    marginTop: 36,
    fontSize: 12,
    color: MatiksColors.textMuted,
    letterSpacing: 2,
    fontWeight: '500',
  },
});
