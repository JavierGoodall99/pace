import { useEffect } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { type ConsentKind, recordConsent } from '../data/consent';
import { track } from '../lib/analytics';
import { useColors } from '../theme/appearance';
import { Icon, type IconName } from './Icon';
import { Button, DisplayTitle } from './ui';

// Plain-language consent before health or biometric processing. Wording
// is a draft pending legal review (versioned in data/consent.ts).

export const CONSENT_COPY: Record<ConsentKind, { title: string; points: [IconName, string][] }> = {
  health: {
    title: 'Before you *connect*',
    points: [
      [
        'activity',
        'Pace imports your last 4 weeks of workouts (type, date, time, distance) and your personal bests.',
      ],
      ['heart', 'This is health-related data. For now it stays on this phone.'],
      ['x', 'Disconnect any time in Settings → Connected apps. That deletes what was imported.'],
    ],
  },
  biometric: {
    title: 'Before the *selfie check*',
    points: [
      ['camera', 'Your front camera watches your face follow a few prompts: blink, smile, turn.'],
      ['lock', 'Your face is processed on this phone. Nothing is uploaded or saved.'],
      ['check', 'Pace only keeps the result: passed or not.'],
    ],
  },
};

export function ConsentPrompt({
  kind,
  onAllow,
  onDecline,
}: {
  kind: ConsentKind;
  onAllow: () => void;
  onDecline: () => void;
}) {
  const colors = useColors();
  const copy = CONSENT_COPY[kind];

  useEffect(() => {
    track('consent_shown', { kind });
  }, [kind]);

  return (
    <YStack gap={20}>
      <DisplayTitle size={30}>{copy.title}</DisplayTitle>
      <YStack gap={14}>
        {copy.points.map(([icon, text]) => (
          <XStack key={text} gap={12} items="flex-start">
            <Icon name={icon} size={18} color={colors.accentText} />
            <Text flex={1} fontSize={15} lineHeight={22} color="$text">
              {text}
            </Text>
          </XStack>
        ))}
      </YStack>
      <YStack gap={10} mt={4}>
        <Button
          onPress={() => {
            recordConsent(kind, true);
            onAllow();
          }}
          style={{ width: '100%' }}
        >
          Allow
        </Button>
        <Button
          variant="ghost"
          onPress={() => {
            recordConsent(kind, false);
            onDecline();
          }}
          style={{ width: '100%' }}
        >
          Not now
        </Button>
      </YStack>
    </YStack>
  );
}
