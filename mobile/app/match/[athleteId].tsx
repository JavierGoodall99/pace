import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, XStack, YStack } from 'tamagui';
import { buildConfettiPieces, Confetti } from '../../src/components/Confetti';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Button } from '../../src/components/ui';
import { athleteById } from '../../src/data/mockData';
import { ATHLETE_PHOTOS, ME_AVATAR } from '../../src/data/photos';
import { colors } from '../../src/theme/tokens';

// Ported from the "MATCH CELEBRATION OVERLAY" in `../../Pace App.dc.html`
// — shown when a swipe-right lands on a mutual-interest athlete (see
// MATCH_IDS in discover.tsx).
const CONFETTI_COLORS = [colors.ember, colors.flare, colors.bone, colors.mint];
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
      <YStack flex={1} bg="$ink">
        <Text color="$fog" text="center" mt={100}>
          Match not found.
        </Text>
      </YStack>
    );
  }

  return (
    <YStack
      flex={1}
      bg="$ink"
      items="center"
      justify="center"
      px={30}
    >
      <YStack
        pointerEvents="none"
        position="absolute"
        style={{ top: '18%', width: 320, height: 320, borderRadius: 160, backgroundColor: 'rgba(255,77,46,0.16)' }}
      />
      <Confetti pieces={CONFETTI_PIECES} fallDistance={420} />

      <XStack items="center" mb={26}>
        <YStack mr={-20} z={2} width={102} height={102} rounded={51} bg="$ember" p={3}>
          <PhotoSlot
            label="You"
            shape="circle"
            source={ME_AVATAR}
            style={{ width: '100%', height: '100%', borderWidth: 3, borderColor: colors.ink }}
          />
        </YStack>
        <YStack ml={-20} width={102} height={102} rounded={51} bg="$ember" p={3}>
          <PhotoSlot
            label={athlete.name}
            shape="circle"
            source={ATHLETE_PHOTOS[athlete.slotId]}
            style={{ width: '100%', height: '100%', borderWidth: 3, borderColor: colors.ink }}
          />
        </YStack>
      </XStack>

      <Text fontFamily="$mono" fontSize={10} letterSpacing={4} color="$ember">
        MUTUAL INTEREST
      </Text>
      <Text fontFamily="$display" fontSize={46} color="$bone" textTransform="uppercase" lineHeight={44} mt={12} text="center">
        It&apos;s a Match!
      </Text>
      <Text color="$fog" fontSize={13} lineHeight={20} mt={16} mb={28} maxW={270} text="center">
        You and {athlete.name} are both training for something. Say hi before the pace cools off.
      </Text>

      <YStack width="100%" gap={10}>
        <Button
          style={{ width: '100%' }}
          onPress={() =>
            router.replace({ pathname: '/thread/[athleteId]', params: { athleteId: String(athlete.id) } })
          }
        >
          Send a Message
        </Button>
        <Button variant="ghost" style={{ width: '100%' }} onPress={() => router.back()}>
          Keep Discovering
        </Button>
      </YStack>
    </YStack>
  );
}