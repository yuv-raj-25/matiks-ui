import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import ScoreRevealScreen from '@/components/score-reveal/ScoreRevealScreen';
import { MatiksColors } from '@/constants/theme';

/**
 * Route: /score-reveal
 * Renders the post-game score reveal with demo data.
 */
export default function ScoreRevealRoute() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScoreRevealScreen
        finalScore={2840}
        comboStreak={7}
        rank={3}
        totalPlayers={1200}
        playerName="You"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: MatiksColors.bg,
  },
});
