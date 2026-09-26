import { useRouter } from 'expo-router';
import { Text, XStack } from 'tamagui';
import { useMyTraining } from '../data/training';
import { useNow } from '../lib/useNow';
import { useColors } from '../theme/appearance';
import { Icon } from './Icon';
import { showPip } from './PipKit';

// Weekly training streak, next to the bell on Today, so logging has a
// visible payoff. Filled when this week counts, outlined when the streak
// is at risk, quiet at zero. Tap to hear what it means (and log, if this
// week still needs a session).
export function StreakBadge() {
  const colors = useColors();
  const router = useRouter();
  const now = useNow();
  const { streak } = useMyTraining(now).activity;
  const { weeks, atRisk } = streak;
  const safe = weeks > 0 && !atRisk;

  function explain() {
    if (safe) {
      showPip(`${weeks}-week streak! One session a week keeps it going.`, 'excited');
      return;
    }
    showPip(
      weeks > 0
        ? `${weeks}-week streak! Log a session by Sunday to keep it.`
        : 'Log a session this week to start a streak.',
      'happy'
    );
    router.push('/log-training');
  }

  const label =
    weeks === 0
      ? 'No streak yet. Log a session to start one.'
      : `${weeks}-week streak${atRisk ? ', log a session this week to keep it' : ''}`;

  return (
    <XStack
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-label={label}
      onPress={explain}
      pressStyle={{ opacity: 0.7 }}
      hitSlop={6}
      height={40}
      px={12}
      gap={5}
      rounded={20}
      items="center"
      borderWidth={1}
      borderColor={safe ? '$accent' : atRisk ? '$accentBorder' : '$border'}
      bg={safe ? '$accent' : atRisk ? '$accentSoft' : '$card'}
    >
      <Icon
        name="zap"
        size={16}
        filled={weeks > 0}
        color={safe ? colors.onAccent : weeks > 0 ? colors.accentText : colors.muted}
      />
      <Text
        fontFamily="$bold"
        fontSize={15}
        color={safe ? '$onAccent' : weeks > 0 ? '$accentText' : '$muted'}
      >
        {weeks}
      </Text>
    </XStack>
  );
}
