import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { EmptyState, IconButton, ScreenHeader } from '../src/components/ui';
import { athleteById } from '../src/data/mockData';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { useSocial } from '../src/data/social';
import { useColors } from '../src/theme/appearance';
import { formatLabel } from '../src/theme/tokens';

export default function MatchesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { matches } = useSocial();

  return (
    <YStack flex={1} bg="$canvas">
      <ScreenHeader
        title="Your *matches*"
        subtitle={
          matches.length > 0
            ? `${matches.length} ${matches.length === 1 ? 'person' : 'people'} to train with`
            : undefined
        }
        onBack={() => router.back()}
      />

      <ScrollView flex={1} contentContainerStyle={{ p: 20, gap: 10, pb: insets.bottom + 24 }}>
        {matches.length === 0 ? (
          <YStack mt={60}>
            <EmptyState
              mood="happy"
              title="No matches yet"
              body="Like people who train like you. When they like you back, they’ll show up here."
            />
          </YStack>
        ) : null}

        {matches.map((id) => {
          const a = athleteById(id);
          if (!a) return null;
          return (
            <XStack
              key={id}
              onPress={() =>
                router.push({ pathname: '/thread/[athleteId]', params: { athleteId: String(id) } })
              }
              pressStyle={{ opacity: 0.8 }}
              items="center"
              gap={14}
              p={12}
              rounded={20}
              borderWidth={1}
              borderColor="$border"
              bg="$card"
            >
              <PhotoSlot
                label={a.name}
                shape="circle"
                source={ATHLETE_PHOTOS[a.slotId]}
                style={{ width: 56, height: 56 }}
              />
              <YStack flex={1} minW={0}>
                <Text fontFamily="$semibold" fontSize={16} color="$text">
                  {a.name}
                </Text>
                <Text fontSize={14} color="$muted" mt={2} numberOfLines={1}>
                  {formatLabel(a.discipline)} · {formatLabel(a.pace)}
                </Text>
              </YStack>
              <IconButton size={40} tone="accent" accessibilityLabel={`Message ${a.name}`}>
                <Icon name="message-circle" size={18} color={colors.accentText} />
              </IconButton>
            </XStack>
          );
        })}
      </ScrollView>
    </YStack>
  );
}
