import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, XStack, YStack } from 'tamagui';
import { Illo } from '../../src/components/Illustrations';
import { buildConfettiPieces, Confetti } from '../../src/components/Confetti';
import { Mascot } from '../../src/components/Mascot';
import { Aurora, PulseLine } from '../../src/components/Motif';
import { RhythmStrip, SyncBadge } from '../../src/components/Rhythm';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Badge, Button, DisplayTitle } from '../../src/components/ui';
import { athleteById, SPORT_ILLO } from '../../src/data/mockData';
import { rhythmForAthlete, rhythmForMe, sharedDaysLabel } from '../../src/data/rhythm';
import { compatibility } from '../../src/data/compat';
import { formatWhen } from '../../src/data/dates';
import { matchKind } from '../../src/data/pacers';
import { usePlans } from '../../src/data/plans';
import { useMe } from '../../src/data/session';
import { ATHLETE_PHOTOS, ME_AVATAR } from '../../src/data/photos';
import { useColors } from '../../src/theme/appearance';
import { brand, shadow } from '../../src/theme/tokens';

// Ported from the "MATCH CELEBRATION OVERLAY" in `../../Pace App.dc.html`
// — shown when a like becomes mutual (a swipe right or a like with a
// comment). Matching is what unlocks invites to train.
const CONFETTI_COLORS = [brand.accent, brand.peach, brand.sky, brand.sun];
const CONFETTI_PIECES = buildConfettiPieces(
  Array.from({ length: 12 }, (_, i) => CONFETTI_COLORS[i % CONFETTI_COLORS.length]),
  { leftStep: 31, durationBase: 1.8, durationStep: 0.3, delayStep: 0.1 }
);

export default function MatchScreen() {
  const colors = useColors();
  const router = useRouter();
  const { athleteId, planId } = useLocalSearchParams<{ athleteId: string; planId?: string }>();
  const { plans } = usePlans();
  const plan = plans.find((p) => p.id === planId);
  const athlete = athleteById(Number(athleteId));
  const me = useMe();

  if (!athlete) {
    return (
      <YStack flex={1} bg="$canvas">
        <Text color="$muted" text="center" mt={100}>
          Match not found.
        </Text>
      </YStack>
    );
  }

  const partners = matchKind(me, athlete) === 'partner';
  const mine = rhythmForMe(me.cadence, me.trainingDays);
  const theirs = rhythmForAthlete(athlete);

  return (
    <YStack flex={1} bg="$canvas" items="center" justify="center" px={24}>
      <Aurora height={560} />
      <Confetti pieces={CONFETTI_PIECES} fallDistance={420} />

      <YStack width="100%" items="center" z={1}>
        <XStack items="center" justify="center" mb={8} height={210}>
          <Portrait
            source={me.photos[0] ? { uri: me.photos[0] } : ME_AVATAR}
            label="You"
            tilt="-7deg"
          />
          <Portrait source={ATHLETE_PHOTOS[athlete.slotId]} label={athlete.name} tilt="7deg" />
          <YStack position="absolute" l={-24} r={-24} t={86} pointerEvents="none">
            <PulseLine width="100%" height={44} color={colors.accent} strokeWidth={3} />
          </YStack>
          {/* Pip — a heart itself — joins the two of you. */}
          <YStack position="absolute" b={-26}>
            <Mascot size={78} mood="excited" reactKey="match" />
          </YStack>
        </XStack>

        <YStack mt={18}>
          <DisplayTitle size={60} center>
            {partners ? 'Training *partners*' : 'It’s a *match*'}
          </DisplayTitle>
        </YStack>
        <Text color="$muted" fontSize={16} lineHeight={24} mt={8} maxW={300} text="center">
          {plan
            ? `${athlete.name} said yes to training together. That’s your first session — see you out there.`
            : partners
              ? `You and ${athlete.name} train on the same days. Plan your first session.`
              : `You and ${athlete.name} move to the same beat.`}
        </Text>

        <YStack
          width="100%"
          mt={22}
          mb={24}
          p={14}
          gap={12}
          rounded={22}
          bg="$card"
          borderWidth={1}
          borderColor="$border"
          style={shadow.card}
        >
          <XStack items="center" justify="space-between">
            <Text fontFamily="$semibold" fontSize={14} color="$text">
              {sharedDaysLabel(mine, theirs)}
            </Text>
            <SyncBadge pct={compatibility(me, athlete).score} />
          </XStack>
          <RhythmStrip mine={mine} theirs={theirs} height={30} />
          {plan ? (
            <XStack items="center" gap={10} p={12} rounded={16} bg="$accentSoft">
              <Illo name={SPORT_ILLO[plan.activity]} size={34} />
              <YStack flex={1}>
                <Text fontFamily="$semibold" fontSize={15} color="$text">
                  {formatWhen(plan.date)}
                </Text>
                <Text fontSize={13} color="$muted" numberOfLines={1}>
                  {plan.place}
                </Text>
              </YStack>
              <Badge tone="success" icon="check">
                Confirmed
              </Badge>
            </XStack>
          ) : null}
        </YStack>

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
            {`Message ${athlete.name}`}
          </Button>
          {!plan ? (
            <Button
              variant="secondary"
              icon="send"
              style={{ width: '100%' }}
              onPress={() =>
                router.replace({
                  pathname: '/invite/[athleteId]',
                  params: { athleteId: String(athlete.id) },
                })
              }
            >
              Invite to train
            </Button>
          ) : null}
          <Button
            variant={plan ? 'secondary' : 'ghost'}
            style={{ width: '100%' }}
            onPress={() => (plan ? router.replace('/(tabs)/today') : router.back())}
          >
            {plan ? 'See my week' : 'Keep swiping'}
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}

// Tall arch-framed portrait, tilted, for the match composition.
function Portrait({ source, label, tilt }: { source: any; label: string; tilt: string }) {
  return (
    <YStack
      mx={-10}
      width={128}
      height={176}
      p={4}
      bg="$card"
      rotate={tilt}
      style={{
        ...shadow.raised,
        borderTopLeftRadius: 64,
        borderTopRightRadius: 64,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}
    >
      <PhotoSlot
        label={label}
        shape="rounded"
        source={source}
        style={{
          width: '100%',
          height: '100%',
          borderTopLeftRadius: 60,
          borderTopRightRadius: 60,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      />
    </YStack>
  );
}
