import { Image } from 'expo-image';
import { Pressable, Platform, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { MatiksColors } from '@/constants/theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export default function HomeScreen() {
  const demoButtonScale = useSharedValue(1);

  const demoButtonStyle = useAnimatedStyle(() => {
    'worklet';
    return { transform: [{ scale: demoButtonScale.value }] };
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>

      {/* ── Matiks Demo Entry ── */}
      <ThemedView style={styles.demoSection}>
        <ThemedText type="subtitle">🎮 Matiks Assignment</ThemedText>
        <ThemedText>
          Tap below to preview the animated post-game Score Reveal screen.
        </ThemedText>
        <Animated.View style={demoButtonStyle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Watch Score Reveal"
            style={styles.demoButton}
            onPressIn={() => {
              demoButtonScale.value = withTiming(0.95, { duration: 80 });
            }}
            onPressOut={() => {
              demoButtonScale.value = withSpring(1, { damping: 10, stiffness: 300 });
            }}
            onPress={() => router.push('/score-reveal')}
          >
            <Text style={styles.demoButtonText}>▶  Watch Score Reveal</Text>
          </Pressable>
        </Animated.View>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoSection: {
    gap: 12,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(0,229,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.14)',
  },
  demoButton: {
    backgroundColor: MatiksColors.surface,
    borderColor: MatiksColors.electricCyan,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  demoButtonText: {
    color: MatiksColors.electricCyan,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
