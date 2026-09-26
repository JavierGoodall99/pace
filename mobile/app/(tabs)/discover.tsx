import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { Mascot } from '../../src/components/Mascot';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { showPip } from '../../src/components/PipKit';
import { WhyChips } from '../../src/components/Proof';
import { RhythmStrip, SyncBadge } from '../../src/components/Rhythm';
import { useTabBarSpace } from '../../src/components/TabBar';
import { Button, DisplayTitle, IconButton } from '../../src/components/ui';
import { formatWhen, nextDrop } from '../../src/data/dates';
import { cityWithinRadius, useFilters } from '../../src/data/filters';
import { ATHLETES } from '../../src/data/mockData';
import { Pacer, weeklyPacers } from '../../src/data/pacers';
import { ATHLETE_ACTION_PHOTOS } from '../../src/data/photos';
import { formatKm } from '../../src/data/places';
import { dropAction, dropActions, usePlans } from '../../src/data/plans';
import { useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';
import { useColors } from '../../src/theme/appearance';
import { shadow } from '../../src/theme/tokens';

// This week's pacers. Not an endless swipe deck: a short, curated drop of
// people who fit your week, each with a session already suggested. You
// invite them to train — an accepted invite is the match.

const GAP = 12;

export default function PacersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const me = useMe();
  const { blocked } = useSocial();
  const filters = useFilters();
  const plans = usePlans();
  const [page, setPage] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);

  const cardWidth = width - 40;
  const now = useMemo(() => new Date(), []);

  const excluded = useMemo(
    () => [
      ...blocked,
      ...ATHLETES.filter(
        (a) =>
          a.age < filters.ageMin ||
          a.age > filters.ageMax ||
          (filters.verifiedOnly && !a.verified) ||
          !cityWithinRadius(a.city, filters.radiusKm)
      ).map((a) => a.id),
    ],
    [blocked, filters]
  );
  const pacers = useMemo(() => weeklyPacers(me, excluded, now), [me, excluded, now]);
  const actions = dropActions(plans, now);
  const remaining = pacers.filter((p) => !actions[p.athlete.id]).length;
  const filtersActive =
    filters.ageMin > 18 || filters.ageMax < 60 || filters.radiusKm != null || filters.verifiedOnly;

  const drop = nextDrop(now);
  const daysToDrop = Math.max(1, Math.ceil((drop.getTime() - now.getTime()) / 86400000));

  function invite(p: Pacer) {
    router.push({
      pathname: '/invite/[athleteId]',
      params: {
        athleteId: String(p.athlete.id),
        date: p.suggestion.date.toISOString(),
        place: p.suggestion.place,
        activity: p.suggestion.activity,
        fromDrop: '1',
      },
    });
  }

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + GAP)));
  }

  return (
    <YStack flex={1} bg="$canvas">
      <XStack px={20} pt={insets.top + 8} items="flex-end" justify="space-between">
        <YStack flex={1}>
          <DisplayTitle size={42}>This week’s *pacers*</DisplayTitle>
          <Text fontFamily="$medium" fontSize={14} color="$muted" mt={4}>
            {remaining > 0
              ? `${remaining} of ${pacers.length} left · new drop in ${daysToDrop} day${daysToDrop === 1 ? '' : 's'}`
              : `All done · new drop in ${daysToDrop} day${daysToDrop === 1 ? '' : 's'}`}
          </Text>
        </YStack>
        <YStack>
          <IconButton
            size={40}
            onPress={() => router.push('/discover-filters')}
            accessibilityLabel="Filters"
          >
            <Icon name="sliders" size={18} color={colors.text} />
          </IconButton>
          {filtersActive ? (
            <YStack
              position="absolute"
              t={2}
              r={2}
              width={10}
              height={10}
              rounded={5}
              bg="$accent"
              borderWidth={2}
              borderColor="$canvas"
            />
          ) : null}
        </YStack>
      </XStack>

      <YStack
        flex={1}
        mt={14}
        mb={tabBarSpace - 4}
        onLayout={(e: LayoutChangeEvent) => setCardHeight(e.nativeEvent.layout.height - 30)}
      >
        {remaining === 0 || pacers.length === 0 ? (
          <DropDone days={daysToDrop} onBrowse={() => router.push('/(tabs)/sessions')} />
        ) : cardHeight > 0 ? (
          <>
            <ScrollView
              horizontal
              snapToInterval={cardWidth + GAP}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onScroll={onScroll}
              scrollEventThrottle={32}
              contentContainerStyle={{ px: 20, gap: GAP }}
            >
              {pacers.map((p) => (
                <PacerCard
                  key={p.athlete.id}
                  pacer={p}
                  width={cardWidth}
                  height={cardHeight}
                  action={actions[p.athlete.id]}
                  onOpen={() =>
                    router.push({ pathname: '/athlete/[id]', params: { id: String(p.athlete.id) } })
                  }
                  onInvite={() => invite(p)}
                  onSkip={() => {
                    dropAction(p.athlete.id, 'skipped', now);
                    showPip(`No worries — ${p.athlete.name} might show up another week.`, 'wink');
                  }}
                />
              ))}
            </ScrollView>
            <XStack justify="center" gap={6} mt={12}>
              {pacers.map((p, i) => (
                <YStack
                  key={p.athlete.id}
                  width={i === page ? 18 : 6}
                  height={6}
                  rounded={3}
                  bg={actions[p.athlete.id] ? '$borderStrong' : i === page ? '$accent' : '$border'}
                />
              ))}
            </XStack>
          </>
        ) : null}
      </YStack>
    </YStack>
  );
}

function PacerCard({
  pacer,
  width,
  height,
  action,
  onOpen,
  onInvite,
  onSkip,
}: {
  pacer: Pacer;
  width: number;
  height: number;
  action?: 'invited' | 'skipped';
  onOpen: () => void;
  onInvite: () => void;
  onSkip: () => void;
}) {
  const colors = useColors();
  const { athlete: a, compat, suggestion } = pacer;
  const photoHeight = Math.max(220, height - 250);
  return (
    <YStack
      width={width}
      height={height}
      rounded={28}
      overflow="hidden"
      bg="$card"
      borderWidth={1}
      borderColor="$border"
      opacity={action === 'skipped' ? 0.55 : 1}
      style={shadow.card}
    >
      <YStack
        height={photoHeight}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={`View ${a.name}'s profile`}
      >
        <PhotoSlot
          label={a.name}
          shape="rect"
          source={ATHLETE_ACTION_PHOTOS[a.slotId]}
          style={{ width: '100%', height: '100%' }}
        />
        <YStack position="absolute" t={14} l={14}>
          <SyncBadge pct={compat.score} variant="photo" />
        </YStack>
        <YStack pointerEvents="none" position="absolute" l={0} r={0} b={0} height={200}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id={`pacerFade${a.id}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor="#140F10" stopOpacity={0} />
                <Stop offset="1" stopColor="#140F10" stopOpacity={0.88} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill={`url(#pacerFade${a.id})`} />
          </Svg>
        </YStack>
        <YStack position="absolute" l={16} r={16} b={14} gap={8}>
          <XStack items="center" gap={8}>
            <DisplayTitle size={38} color="$onPhoto">{`${a.name} *${a.age}*`}</DisplayTitle>
            {a.verified ? (
              <Icon name="shield-check" size={20} color={colors.onPhoto} strokeWidth={2} />
            ) : null}
          </XStack>
          <XStack items="center" gap={5}>
            <Icon name="map-pin" size={13} color="rgba(255,255,255,0.85)" />
            <Text fontFamily="$medium" fontSize={13} color="rgba(255,255,255,0.85)">
              {a.city} · {formatKm(compat.distanceKm)}
            </Text>
          </XStack>
          <WhyChips compat={compat} onPhoto />
        </YStack>
      </YStack>

      <YStack flex={1} p={14} gap={12} justify="space-between">
        <RhythmStrip mine={compat.mine} theirs={compat.theirs} height={22} />
        <XStack items="center" gap={10} p={12} rounded={16} bg="$accentSoft">
          <Icon name="calendar" size={18} color={colors.accentText} strokeWidth={2} />
          <YStack flex={1}>
            <Text fontFamily="$semibold" fontSize={14} color="$text">
              {formatWhen(suggestion.date.toISOString())}
            </Text>
            <Text fontSize={12} color="$muted" numberOfLines={1}>
              {suggestion.place}
            </Text>
          </YStack>
        </XStack>
        {action ? (
          <XStack height={48} rounded={24} items="center" justify="center" gap={8} bg="$surface">
            <Icon name={action === 'invited' ? 'send' : 'x'} size={16} color={colors.muted} />
            <Text fontFamily="$semibold" fontSize={15} color="$muted">
              {action === 'invited' ? 'Invite sent' : 'Skipped this week'}
            </Text>
          </XStack>
        ) : (
          <XStack gap={10}>
            <Button
              variant="secondary"
              icon="x"
              onPress={onSkip}
              style={{ height: 48, paddingHorizontal: 16 }}
            >
              Skip
            </Button>
            <Button
              icon="send"
              onPress={onInvite}
              style={{ flex: 1, height: 48, paddingHorizontal: 12 }}
            >
              Invite to train
            </Button>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
}

function DropDone({ days, onBrowse }: { days: number; onBrowse: () => void }) {
  return (
    <YStack flex={1} items="center" justify="center" px={32} gap={10}>
      <Mascot size={120} mood="wink" />
      <DisplayTitle size={34} center>
        That’s this week’s *drop*
      </DisplayTitle>
      <Text fontSize={15} lineHeight={22} color="$muted" text="center">
        No endless swiping here. Your next pacers land Sunday evening — in {days} day
        {days === 1 ? '' : 's'}.
      </Text>
      <YStack mt={12}>
        <Button icon="map" onPress={onBrowse}>
          Browse open sessions
        </Button>
      </YStack>
    </YStack>
  );
}
