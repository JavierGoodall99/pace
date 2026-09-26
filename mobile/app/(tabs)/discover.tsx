import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { LikeSheet } from '../../src/components/LikeSheet';
import { Mascot } from '../../src/components/Mascot';
import { PhotoStory, StoryPage } from '../../src/components/PhotoStory';
import { showPip } from '../../src/components/PipKit';
import { RhythmStrip, SyncBadge } from '../../src/components/Rhythm';
import { SwipeDeck, SwipeDeckHandle, SwipeDir } from '../../src/components/SwipeDeck';
import { useTabBarSpace } from '../../src/components/TabBar';
import { Button, DisplayTitle, IconButton } from '../../src/components/ui';
import { depthFor } from '../../src/data/athleteDepth';
import { hasLiked, LikeTarget, likesLeftToday, sendLike, useChat } from '../../src/data/chat';
import { dropKey, formatWhen, nextDrop, untilLabel } from '../../src/data/dates';
import { usePacerDeck } from '../../src/data/deck';
import { useFilters } from '../../src/data/filters';
import { ACTIVE_DAYS, activityLabel, DEFAULT_RADIUS_KM, LIKES_PER_DAY } from '../../src/data/trust';
import { freshnessLabel, lifestyleChips } from '../../src/data/identity';
import { Athlete } from '../../src/data/mockData';
import { matchKind, type Pacer } from '../../src/data/pacers';
import { galleryFor } from '../../src/data/photos';
import { formatKm } from '../../src/data/places';
import { useMe } from '../../src/data/session';
import { addToPicks, pickReason } from '../../src/data/picks';
import {
  clearPasses,
  passPacer,
  recentlyPassed,
  undoLastPass,
  useSocial,
} from '../../src/data/social';
import { successHaptic, tapHaptic } from '../../src/lib/haptics';
import { upcomingEvents } from '../../src/data/capeTown';
import { EVENT_ATTENDEES, pacersAmong, useExplore } from '../../src/data/explore';
import { useColors } from '../../src/theme/appearance';
import { useNow } from '../../src/lib/useNow';
import { shadow } from '../../src/theme/tokens';

// Pacers: a swipe deck of everyone near you who fits, best training fit
// first. Swipe right (or tap the heart) to like, left to pass. Tapping the
// heart on a photo or prompt likes it with a comment. When you both like
// each other it's a match, and only then can you invite them to train.

const CONTROLS_HEIGHT = 84;

type Liking = { athlete: Athlete; target: LikeTarget; source?: StoryPage } | null;

export default function PacersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const me = useMe();
  const social = useSocial();
  const { blocked } = social;
  const filters = useFilters();
  const chat = useChat();
  const [areaHeight, setAreaHeight] = useState(0);
  const [liking, setLiking] = useState<Liking>(null);
  // The pass you just undid goes back on top of the deck.
  const [rewound, setRewound] = useState<number | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const deckRef = useRef<SwipeDeckHandle | null>(null);

  const now = useNow();
  const { deck: ranked, passedCount, poolSize } = usePacerDeck(now);
  const deck = useMemo(() => {
    const i = ranked.findIndex((p) => p.athlete.id === rewound);
    return i > 0 ? [ranked[i], ...ranked.slice(0, i), ...ranked.slice(i + 1)] : ranked;
  }, [ranked, rewound]);
  const likesLeft = likesLeftToday(chat, now);

  const filtersActive =
    !filters.ageAuto || filters.radiusKm !== DEFAULT_RADIUS_KM || filters.times.length > 0;

  // When the deck runs dry, point at events where people you'd like are going.
  const goingCount = new Set(
    upcomingEvents(now)
      .filter((e) => e.at.getTime() - now.getTime() < 7 * 86400000)
      .flatMap(({ event }) => pacersAmong(me, EVENT_ATTENDEES[event.id], blocked).map((a) => a.id))
  ).size;
  const goingNote = goingCount
    ? `${goingCount} pacer${goingCount === 1 ? '' : 's'} you might like ${goingCount === 1 ? 'is' : 'are'} going to Cape Town events this week.`
    : undefined;

  function openMatch(athleteId: number) {
    successHaptic();
    router.push({ pathname: '/match/[athleteId]', params: { athleteId: String(athleteId) } });
  }

  // Can this swipe go through? Likes need a verified profile and a like
  // left today; passes always can.
  function allowSwipe(p: Pacer, dir: SwipeDir): boolean {
    if (dir === 'left') return true;
    if (!me.verified) {
      showPip('Verify your selfie to start liking.', 'thinking');
      router.push('/verify');
      return false;
    }
    if (likesLeft <= 0) {
      showPip('Out of likes — they reset at midnight.', 'thinking');
      return false;
    }
    return true;
  }

  function onSwiped(p: Pacer, dir: SwipeDir) {
    if (rewound === p.athlete.id) setRewound(null);
    if (dir === 'left') {
      tapHaptic();
      passPacer(p.athlete.id, now);
      setCanUndo(true);
      return;
    }
    const g = galleryFor(p.athlete.slotId)[0];
    const result = sendLike(
      p.athlete.id,
      { kind: 'photo', index: 0, label: g?.caption ?? `${p.athlete.name}’s photo` },
      '',
      { onMatch: openMatch }
    );
    setCanUndo(false);
    if (result === 'sent') tapHaptic();
  }

  async function undo() {
    const id = await undoLastPass();
    setCanUndo(false);
    if (id !== null) setRewound(id);
  }

  const likingSource = liking?.source?.kind === 'photo' ? liking.source.source : undefined;

  return (
    <YStack flex={1} bg="$canvas">
      <XStack px={20} pt={insets.top + 8} items="flex-end" justify="space-between" gap={10}>
        <YStack flex={1}>
          <DisplayTitle size={40}>Nearby *pacers*</DisplayTitle>
          <Text fontFamily="$medium" fontSize={14} color="$muted" mt={4}>
            {deck.length
              ? `${deck.length} ${deck.length === 1 ? 'pick' : 'picks'} today · ${likesLeft} of ${LIKES_PER_DAY} likes left`
              : `${likesLeft} of ${LIKES_PER_DAY} likes left today`}
          </Text>
        </YStack>
        <XStack gap={8}>
          <YStack>
            <IconButton
              size={40}
              onPress={() => router.push('/discover-filters')}
              accessibilityLabel="Filters"
              aria-label="Filters"
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
      </XStack>

      <YStack
        flex={1}
        mt={12}
        mb={tabBarSpace - 4}
        onLayout={(e: LayoutChangeEvent) => setAreaHeight(e.nativeEvent.layout.height)}
      >
        {deck.length === 0 ? (
          <DeckDone
            empty={poolSize === 0 && passedCount === 0}
            nextIn={untilLabel(nextDrop(now), now)}
            passedCount={passedCount}
            radius={filters.radiusKm}
            onReviewPassed={() => {
              // Back into today's picks, not just out of the passed list.
              addToPicks(dropKey(now), recentlyPassed(social, now));
              clearPasses();
            }}
            onFilters={() => router.push('/discover-filters')}
            onClubs={() => router.push('/(tabs)/sessions')}
            goingNote={goingNote}
          />
        ) : areaHeight > 0 ? (
          <>
            <SwipeDeck
              deckRef={deckRef}
              items={deck}
              keyOf={(p) => p.athlete.id}
              height={areaHeight - CONTROLS_HEIGHT}
              allow={allowSwipe}
              onSwiped={onSwiped}
              renderCard={(p, isTop) => (
                <PacerCard
                  pacer={p}
                  height={areaHeight - CONTROLS_HEIGHT}
                  liked={hasLiked(chat, p.athlete.id)}
                  onOpen={() =>
                    router.push({
                      pathname: '/athlete/[id]',
                      params: { id: String(p.athlete.id) },
                    })
                  }
                  onLike={
                    isTop
                      ? (pg, index) =>
                          setLiking({
                            athlete: p.athlete,
                            source: pg,
                            target:
                              pg.kind === 'prompt'
                                ? {
                                    kind: 'prompt',
                                    index,
                                    label: pg.prompt.q,
                                    text: pg.prompt.a,
                                  }
                                : {
                                    kind: 'photo',
                                    index,
                                    label:
                                      pg.kind === 'photo' && pg.caption
                                        ? pg.caption
                                        : `${p.athlete.name}’s photo`,
                                  },
                          })
                      : undefined
                  }
                />
              )}
            />
            <DeckControls
              name={deck[0].athlete.name}
              canUndo={canUndo}
              onUndo={undo}
              onPass={() => deckRef.current?.swipe('left')}
              onLike={() => deckRef.current?.swipe('right')}
            />
          </>
        ) : null}
      </YStack>

      {liking ? (
        <LikeSheet
          athlete={liking.athlete}
          target={liking.target}
          source={likingSource}
          onMatch={openMatch}
          onClose={() => setLiking(null)}
        />
      ) : null}
    </YStack>
  );
}

function pagesFor(p: Pacer): StoryPage[] {
  const d = depthFor(p.athlete);
  const g = galleryFor(p.athlete.slotId);
  const photo = (k: number): StoryPage | null =>
    g[k]
      ? {
          kind: 'photo',
          source: g[k].source,
          label: g[k].label,
          caption: g[k].caption,
          motion: k === 0 && d.motion,
        }
      : null;
  const pages: (StoryPage | null)[] = [
    photo(0),
    d.prompts[0] ? { kind: 'prompt', prompt: d.prompts[0] } : null,
    photo(1),
    { kind: 'info', content: <InfoPage pacer={p} /> },
    d.prompts[1] ? { kind: 'prompt', prompt: d.prompts[1] } : null,
    ...g.slice(2).map((_, k) => photo(k + 2)),
  ];
  return pages.filter((x): x is StoryPage => !!x);
}

function PacerCard({
  pacer,
  height,
  liked,
  onOpen,
  onLike,
}: {
  pacer: Pacer;
  height: number;
  liked: boolean;
  onOpen: () => void;
  onLike?: (page: StoryPage, index: number) => void;
}) {
  const colors = useColors();
  const me = useMe();
  const explore = useExplore();
  const { athlete: a, compat } = pacer;
  const d = depthFor(a);
  const pages = useMemo(() => pagesFor(pacer), [pacer]);

  return (
    <YStack
      height={height}
      rounded={28}
      overflow="hidden"
      bg="$card"
      borderWidth={1}
      borderColor="$border"
      style={shadow.card}
    >
      <PhotoStory
        pages={pages}
        height={height}
        liked={liked}
        onLike={onLike}
        topRight={(onPhoto) => (
          <SyncBadge pct={compat.score} variant={onPhoto ? 'photo' : 'card'} />
        )}
        footer={(pg) =>
          pg.kind === 'photo' ? (
            <YStack gap={6}>
              <XStack
                items="center"
                gap={8}
                onPress={onOpen}
                accessibilityRole="button"
                accessibilityLabel={`View ${a.name}'s full profile`}
                aria-label={`View ${a.name}'s full profile`}
              >
                <DisplayTitle size={36} color="$onPhoto">{`${a.name} *${a.age}*`}</DisplayTitle>
                {a.verified ? (
                  <Icon name="shield-check" size={20} color={colors.onPhoto} strokeWidth={2} />
                ) : null}
              </XStack>
              <Text fontFamily="$medium" fontSize={13} color="rgba(255,255,255,0.88)">
                {a.city} · {formatKm(compat.distanceKm)}
                {matchKind(me, a) === 'partner' ? ' · Training partner' : ''}
              </Text>
              <XStack items="center" gap={5}>
                <Icon name="zap" size={13} color="#FFFFFF" filled />
                <Text fontFamily="$semibold" fontSize={13} color="#FFFFFF">
                  {activityLabel(d)}
                </Text>
              </XStack>
              <XStack items="center" gap={6}>
                <Icon name="sparkles" size={14} color="#FFFFFF" />
                <Text
                  flex={1}
                  fontFamily="$semibold"
                  fontSize={14}
                  color="#FFFFFF"
                  numberOfLines={2}
                >
                  {pickReason(me, a, compat, explore.crews)}
                </Text>
              </XStack>
            </YStack>
          ) : pg.kind === 'prompt' ? (
            <Text fontFamily="$semibold" fontSize={14} color="$muted">
              {a.name}, {a.age}
            </Text>
          ) : null
        }
      />
    </YStack>
  );
}

// Rewind · Pass · Like, under the deck.
function DeckControls({
  name,
  canUndo,
  onUndo,
  onPass,
  onLike,
}: {
  name: string;
  canUndo: boolean;
  onUndo: () => void;
  onPass: () => void;
  onLike: () => void;
}) {
  const colors = useColors();
  return (
    <XStack height={CONTROLS_HEIGHT} items="center" justify="center" gap={18}>
      <YStack opacity={canUndo ? 1 : 0.35}>
        <IconButton
          size={48}
          onPress={canUndo ? onUndo : undefined}
          accessibilityLabel="Undo last pass"
          aria-label="Undo last pass"
        >
          <Icon name="rotate-ccw" size={19} color={colors.text} strokeWidth={2.2} />
        </IconButton>
      </YStack>
      <IconButton
        size={64}
        onPress={onPass}
        accessibilityLabel={`Pass on ${name}`}
        aria-label={`Pass on ${name}`}
      >
        <Icon name="x" size={28} color={colors.text} strokeWidth={2.4} />
      </IconButton>
      <IconButton
        size={64}
        tone="solid"
        onPress={onLike}
        accessibilityLabel={`Like ${name}`}
        aria-label={`Like ${name}`}
      >
        <Icon name="heart" size={28} color={colors.onAccent} filled strokeWidth={2.2} />
      </IconButton>
      {/* Keeps the like/pass pair centred opposite the undo button. */}
      <YStack width={48} />
    </XStack>
  );
}

// The "why you match" page inside the story.
function InfoPage({ pacer }: { pacer: Pacer }) {
  const colors = useColors();
  const { athlete: a, compat, suggestion } = pacer;
  const d = depthFor(a);
  const chips = lifestyleChips(d.lifestyle);
  return (
    <YStack flex={1} px={18} pt={48} pb={18} gap={14}>
      <DisplayTitle size={28}>{`You & *${a.name}*`}</DisplayTitle>
      <YStack gap={8}>
        {compat.factors.slice(0, 3).map((f) => (
          <XStack key={f.key} items="center" gap={8}>
            <Icon name="check" size={15} color={colors.accentText} strokeWidth={2.6} />
            <Text flex={1} fontSize={14} color="$text" numberOfLines={1}>
              {f.detail}
            </Text>
          </XStack>
        ))}
      </YStack>
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
      {chips.length ? (
        <XStack gap={6} flexWrap="wrap">
          {chips.map((c) => (
            <XStack key={c} height={28} px={10} rounded="$full" items="center" bg="$surface">
              <Text fontFamily="$semibold" fontSize={12} color="$text">
                {c}
              </Text>
            </XStack>
          ))}
        </XStack>
      ) : null}
      <Text fontSize={12} color="$muted" mt="auto">
        {freshnessLabel(d.photosDaysAgo)}
      </Text>
    </YStack>
  );
}

function DeckDone({
  empty,
  passedCount,
  radius,
  onReviewPassed,
  onFilters,
  onClubs,
  goingNote,
  nextIn,
}: {
  nextIn: string;
  empty: boolean;
  passedCount: number;
  radius: number | null;
  onReviewPassed: () => void;
  onFilters: () => void;
  onClubs: () => void;
  goingNote?: string;
}) {
  // An honest empty state: we'd rather show nobody than show people who
  // are fake, inactive or two hours away.
  if (empty) {
    return (
      <YStack flex={1} items="center" justify="center" px={28} gap={10}>
        <Mascot size={110} mood="thinking" />
        <DisplayTitle size={30} center>
          No one new *nearby* yet
        </DisplayTitle>
        <Text fontSize={15} lineHeight={22} color="$muted" text="center">
          We only show selfie-verified people who trained in the last {ACTIVE_DAYS} days
          {radius ? `, within ${radius} km` : ''}. No ghosts, no one hours away.
        </Text>
        <YStack mt={12} gap={10} self="stretch">
          {goingNote ? (
            <Text fontFamily="$semibold" fontSize={14} color="$accentText" text="center">
              {goingNote}
            </Text>
          ) : null}
          <Button icon="map" onPress={onClubs} style={{ width: '100%' }}>
            Explore Cape Town
          </Button>
          <Button variant="secondary" icon="sliders" onPress={onFilters} style={{ width: '100%' }}>
            Filters
          </Button>
        </YStack>
      </YStack>
    );
  }
  return (
    <YStack flex={1} items="center" justify="center" px={32} gap={10}>
      <Mascot size={120} mood="wink" />
      <DisplayTitle size={34} center>
        That’s today’s *picks*
      </DisplayTitle>
      <Text fontSize={15} lineHeight={22} color="$muted" text="center">
        {`New picks ${nextIn}.`}
      </Text>
      {goingNote ? (
        <Text fontFamily="$semibold" fontSize={14} color="$accentText" text="center" mt={4}>
          {goingNote}
        </Text>
      ) : null}
      <YStack mt={12} gap={10} self="stretch">
        {passedCount > 0 ? (
          <Button icon="rotate-ccw" onPress={onReviewPassed} style={{ width: '100%' }}>
            {`See the ${passedCount} ${passedCount === 1 ? 'person' : 'people'} you passed`}
          </Button>
        ) : null}
        <Button
          variant={passedCount > 0 ? 'secondary' : 'primary'}
          icon="map"
          onPress={onClubs}
          style={{ width: '100%' }}
        >
          Explore Cape Town
        </Button>
        <Button variant="secondary" icon="sliders" onPress={onFilters} style={{ width: '100%' }}>
          Filters
        </Button>
      </YStack>
    </YStack>
  );
}
