import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { PhotoSlot } from '../src/components/PhotoSlot';
import { showPip } from '../src/components/PipKit';
import { Button, EmptyState, ScreenHeader } from '../src/components/ui';
import { athleteById } from '../src/data/mockData';
import { ATHLETE_PHOTOS } from '../src/data/photos';
import { useMe } from '../src/data/session';
import { likeBack, passOn, useSocial } from '../src/data/social';
import { formatLabel, shadow } from '../src/theme/tokens';

export default function LikesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { likes } = useSocial();
  const me = useMe();

  function respond(id: number, like: boolean) {
    // Same rule as the deck: only selfie-verified members can like.
    if (like && !me.verified) {
      showPip('Do the live selfie check to like back.', 'thinking');
      router.push('/verify');
      return;
    }
    if (like) {
      likeBack(id);
      // They already liked you — liking back is an instant match.
      setTimeout(() => {
        router.push({ pathname: '/match/[athleteId]', params: { athleteId: String(id) } });
      }, 250);
    } else {
      passOn(id);
    }
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScreenHeader
        title="Who *likes* you"
        subtitle={
          likes.length > 0
            ? `${likes.length} ${likes.length === 1 ? 'person likes' : 'people like'} you`
            : undefined
        }
        onBack={() => router.back()}
      />

      <ScrollView flex={1} contentContainerStyle={{ p: 20, gap: 12, pb: insets.bottom + 24 }}>
        {likes.length === 0 ? (
          <YStack mt={60}>
            <EmptyState
              mood="happy"
              title="You're all caught up"
              body="Nobody new has liked you yet. Keep training — your next match is one session away."
            />
          </YStack>
        ) : null}

        {likes.map((id) => {
          const a = athleteById(id);
          if (!a) return null;
          return (
            <YStack
              key={id}
              p={14}
              rounded={24}
              borderWidth={1}
              borderColor="$border"
              bg="$card"
              gap={14}
              style={shadow.card}
            >
              <XStack items="center" gap={14}>
                <PhotoSlot
                  label={a.name}
                  shape="circle"
                  source={ATHLETE_PHOTOS[a.slotId]}
                  style={{ width: 60, height: 60 }}
                />
                <YStack flex={1} minW={0}>
                  <Text fontFamily="$semibold" fontSize={17} color="$text">
                    {a.name}, {a.age}
                  </Text>
                  <Text fontSize={14} color="$muted" mt={2} numberOfLines={1}>
                    {formatLabel(a.discipline)} · {a.city}
                  </Text>
                </YStack>
              </XStack>
              <XStack gap={10}>
                <Button
                  variant="secondary"
                  icon="x"
                  onPress={() => respond(a.id, false)}
                  style={{ flex: 1, height: 46 }}
                >
                  Pass
                </Button>
                <Button
                  icon={me.verified ? 'heart' : 'shield-check'}
                  onPress={() => respond(a.id, true)}
                  style={{ flex: 1, height: 46 }}
                >
                  {me.verified ? 'Like back' : 'Selfie check to like'}
                </Button>
              </XStack>
            </YStack>
          );
        })}
      </ScrollView>
    </YStack>
  );
}
