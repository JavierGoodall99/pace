import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { athleteById } from '../src/data/mockData';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { updateMe, useMe } from '../src/data/session';
import { unblockAthlete, useSocial } from '../src/data/social';
import {
  Callout,
  Card,
  ScreenHeader,
  SectionTitle,
  SegmentedControl,
  ToggleRow,
} from '../src/components/ui';

const VISIBILITY_OPTIONS = ['EVERYONE', 'MATCHES ONLY'];

const TOGGLES: { label: string; hint: string; default: boolean }[] = [
  { label: 'Show pace & stats', hint: 'Your training stats on your card', default: true },
  { label: 'Show my city', hint: 'Used for match radius', default: true },
  {
    label: 'Public training photos',
    hint: 'Visible to people you haven’t matched with',
    default: false,
  },
];

export default function SettingsPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { blocked } = useSocial();

  const [visibility, setVisibility] = useState<string>('EVERYONE');
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(TOGGLES.map((t) => [t.label, t.default]))
  );

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader
        title="Your *privacy*"
        subtitle="You decide who sees what."
        onBack={() => router.back()}
      />

      <YStack px={20} pt={20} gap={28}>
        <YStack>
          <SectionTitle>Who can see your profile</SectionTitle>
          <SegmentedControl
            options={VISIBILITY_OPTIONS}
            value={visibility}
            onChange={setVisibility}
          />
        </YStack>

        <YStack>
          <SectionTitle>On your card</SectionTitle>
          <Card>
            {TOGGLES.map((t, i) => (
              <ToggleRow
                key={t.label}
                label={t.label}
                hint={t.hint}
                last={i === TOGGLES.length - 1}
                value={!!toggles[t.label]}
                onChange={(v) => setToggles((prev) => ({ ...prev, [t.label]: v }))}
              />
            ))}
          </Card>
        </YStack>

        {me.gender !== 'man' ? (
          <YStack>
            <SectionTitle hint="After you match, only you can send the first message.">
              Messaging
            </SectionTitle>
            <Card>
              <ToggleRow
                label="I make the first move"
                hint="Matches wait for you to say hi"
                last
                value={me.womenFirst}
                onChange={(v) => updateMe({ womenFirst: v })}
              />
            </Card>
          </YStack>
        ) : null}

        <YStack>
          <SectionTitle hint="They can’t see you, message you or join your sessions.">
            Blocked
          </SectionTitle>
          <Card>
            {blocked.length === 0 ? (
              <Text fontSize={14} color="$muted" py={6}>
                You haven’t blocked anyone.
              </Text>
            ) : (
              blocked.map((id, i) => {
                const a = athleteById(id);
                if (!a) return null;
                return (
                  <XStack
                    key={id}
                    items="center"
                    gap={12}
                    py={10}
                    borderBottomWidth={i === blocked.length - 1 ? 0 : 1}
                    borderBottomColor="$border"
                  >
                    <PhotoSlot
                      label={a.name}
                      shape="circle"
                      source={ATHLETE_PHOTOS[a.slotId]}
                      style={{ width: 40, height: 40 }}
                    />
                    <Text flex={1} fontFamily="$semibold" fontSize={15} color="$text">
                      {a.name}
                    </Text>
                    <XStack
                      accessibilityRole="button"
                      onPress={() => unblockAthlete(id)}
                      height={34}
                      px={14}
                      rounded="$full"
                      items="center"
                      bg="$surface"
                    >
                      <Text fontFamily="$semibold" fontSize={13} color="$text">
                        Unblock
                      </Text>
                    </XStack>
                  </XStack>
                );
              })
            )}
          </Card>
        </YStack>

        <Callout icon="lock">
          {visibility === 'EVERYONE'
            ? 'Anyone on Pace can see your profile. Switch to Matches only to hide from Discover.'
            : 'Only people you match with can see your full profile.'}
        </Callout>
      </YStack>
    </ScrollView>
  );
}
