import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, XStack, YStack } from 'tamagui';
import { buildConfettiPieces, Confetti } from '../../src/components/Confetti';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Button } from '../../src/components/ui';
import { athleteById } from '../../src/data/mockData';
import { ATHLETE_PHOTOS, ME_AVATAR } from '../../src/data/photos';
import { colors, shadow } from '../../src/theme/tokens';

// Ported from the "MATCH CELEBRATION OVERLAY" in `../../Pace App.dc.html`
// — shown when a swipe-right lands on a mutual-interest athlete (see
// MATCH_IDS in discover.tsx).
const CONFETTI_COLORS = [colors.accent, colors.peach, colors.lilac, colors.sun];
const CONFETTI_PIECES = buildConfettiPieces(
  Array.from({ length: 12 }, (_, i) => CONFETTI_COLORS[i % CONFETTI_COLORS.length]),
  { leftStep: 31, durationBase: 1.8, durationStep: 0.3, delayStep: 0.1 }
);

export default function MatchScreen() {
  const router = useRouter();
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const athlete = athleteById(Number(athleteId));

  if (!athlete) {
    return (
      <YStack flex={1} bg="$canvas">
        <Text color="$muted" text="center" mt={100}>
          Match not found.
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg="$canvas" items="center" justify="center" px={28}>
      <YStack
        pointerEvents="none"
        position="absolute"
        style={{
          top: '14%',
          width: 340,
          height: 340,
          borderRadius: 170,
          backgroundColor: colors.accentSoft,
        }}
      />
      <Confetti pieces={CONFETTI_PIECES} fallDistance={420} />

      <YStack width="100%" items="center" z={1}>
        <XStack items="center" mb={28}>
          <YStack
            mr={-18}
            z={2}
            width={116}
            height={116}
            rounded={58}
            bg="$card"
            p={4}
            style={shadow.raised}
          >
            <PhotoSlot
              label="You"
              shape="circle"
              source={ME_AVATAR}
              style={{ width: '100%', height: '100%' }}
            />
          </YStack>
          <YStack
            ml={-18}
            width={116}
            height={116}
            rounded={58}
            bg="$card"
            p={4}
            style={shadow.raised}
          >
            <PhotoSlot
              label={athlete.name}
              shape="circle"
              source={ATHLETE_PHOTOS[athlete.slotId]}
              style={{ width: '100%', height: '100%' }}
            />
          </YStack>
          <XStack
            position="absolute"
            l="50%"
            b={-10}
            ml={-22}
            z={3}
            width={44}
            height={44}
            rounded={22}
            bg="$accent"
            borderWidth={3}
            borderColor="$canvas"
            items="center"
            justify="center"
          >
            <Icon name="heart" size={20} color={colors.onAccent} filled />
          </XStack>
        </XStack>

        <Text fontFamily="$semibold" fontSize={15} color="$accent">
          You both said yes
        </Text>
        <Text
          fontFamily="$heading"
          fontSize={38}
          lineHeight={44}
          letterSpacing={-1}
          color="$text"
          mt={8}
          text="center"
        >
          It&apos;s a match!
        </Text>
        <Text color="$muted" fontSize={16} lineHeight={24} mt={12} mb={32} maxW={300} text="center">
          You and {athlete.name} are both training for something. Say hi and plan your first
          session.
        </Text>

        <YStack width="100%" gap={10}>
          <Button
            icon="message-circle"
            style={{ width: '100%' }}
            onPress={() =>
              router.replace({
                pathname: '/thread/[athleteId]',
                params: { athleteId: String(athlete.id) },
              })
            }
          >
            Send a message
          </Button>
          <Button variant="secondary" style={{ width: '100%' }} onPress={() => router.back()}>
            Keep discovering
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
