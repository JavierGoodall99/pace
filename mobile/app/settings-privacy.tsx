import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { athleteById } from '../src/data/mockData';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { updateMe, useMe } from '../src/data/session';
import { PrivacySettings, setPrivacy, useSettings, Visibility } from '../src/data/settings';
import { unblockAthlete, useSocial } from '../src/data/social';
import {
  Callout,
  Card,
  ScreenHeader,
  SectionTitle,
  SegmentedControl,
  ToggleRow,
} from '../src/components/ui';

const VISIBILITY_OPTIONS: Visibility[] = ['EVERYONE', 'MATCHES ONLY'];

type CardToggle = 'showStats' | 'showCity' | 'publicTrainingPhotos';

const TOGGLES: { key: CardToggle; label: string; hint?: string }[] = [
  { key: 'showStats', label: 'Show my effort level' },
  { key: 'showCity', label: 'Show my city', hint: 'Used for match radius' },
  {
    key: 'publicTrainingPhotos',
    label: 'Public training photos',
    hint: 'Visible to people you haven’t matched with',
  },
];

export default function SettingsPrivacyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { blocked } = useSocial();

  const { privacy } = useSettings();
  const visibility = privacy.visibility;

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: insets.bottom + 32 }}>
      <ScreenHeader title="Your *privacy*" onBack={() => router.back()} />

      <YStack px={20} pt={20} gap={28}>
        <YStack>
          <SectionTitle>Who can see your profile</SectionTitle>
          <SegmentedControl
            options={VISIBILITY_OPTIONS}
            value={visibility}
            onChange={(v) => setPrivacy({ visibility: v as Visibility })}
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
                value={privacy[t.key]}
                onChange={(v) => setPrivacy({ [t.key]: v } as Partial<PrivacySettings>)}
              />
            ))}
          </Card>
        </YStack>

        {me.gender !== 'man' ? (
          <YStack>
            <SectionTitle>Messaging</SectionTitle>
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
          <SectionTitle>Blocked</SectionTitle>
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
            ? 'Anyone on Pace can see your profile.'
            : 'Only your matches can see your full profile.'}
        </Callout>
      </YStack>
    </ScrollView>
  );
}
