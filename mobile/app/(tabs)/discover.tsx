import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { LikeSheet } from '../../src/components/LikeSheet';
import { Mascot } from '../../src/components/Mascot';
import { PhotoStory, StoryPage } from '../../src/components/PhotoStory';
import { showPip } from '../../src/components/PipKit';
import { WhyChips } from '../../src/components/Proof';
import { RhythmStrip, SyncBadge } from '../../src/components/Rhythm';
import { useTabBarSpace } from '../../src/components/TabBar';
import { Button, DisplayTitle, IconButton, SegmentedControl } from '../../src/components/ui';
import { depthFor } from '../../src/data/athleteDepth';
import { hasLiked, LikeTarget, useChat } from '../../src/data/chat';
import { formatWhen, nextDrop, untilLabel } from '../../src/data/dates';
import { ageWindow, useFilters } from '../../src/data/filters';
import { ACTIVE_DAYS, activityLabel, DEFAULT_RADIUS_KM } from '../../src/data/trust';
import { formatHeight, freshnessLabel, lifestyleChips } from '../../src/data/identity';
import { Athlete, ATHLETES } from '../../src/data/mockData';
import { dailyPacers, Pacer, standouts } from '../../src/data/pacers';
import { ATHLETE_PHOTOS, galleryFor } from '../../src/data/photos';
import { distanceTo, formatKm } from '../../src/data/places';
import { dropAction, DropAction, dropActions, usePlans } from '../../src/data/plans';
import { activeCity, isTravelling, useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';
import { useColors } from '../../src/theme/appearance';
import { shadow } from '../../src/theme/tokens';

// Today's pacers. Not an endless swipe deck: a short daily drop of people
// who fit your training, photos first. Like a photo or prompt with a
// comment, or skip straight to an invite to train. Standouts shows the
// most-liked people near you.

const GAP = 12;
const TABS = ['For you', 'Standouts'];

type Liking = { athlete: Athlete; target: LikeTarget; source?: StoryPage } | null;

export default function PacersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const me = useMe();
  const { blocked, matches } = useSocial();
  const filters = useFilters();
  const plans = usePlans();
  const chat = useChat();
  const [tab, setTab] = useState(TABS[0]);
  const [page, setPage] = useState(0);
  const [cardHeight, setCardHeight] = useState(0);
  const [liking, setLiking] = useState<Liking>(null);

  const cardWidth = width - 40;
  const now = useMemo(() => new Date(), []);

  const [ageMin, ageMax] = ageWindow(filters, me.age);
  const here = activeCity(me, now);
  const excluded = useMemo(
    () => [
      ...blocked,
      ...ATHLETES.filter((a) => {
        const d = depthFor(a);
        return (
          a.age < ageMin ||
          a.age > ageMax ||
          d.heightCm < filters.heightMin ||
          d.heightCm > filters.heightMax ||
          (filters.radiusKm != null && distanceTo(here, a.city, d.nearKm) > filters.radiusKm)
        );
      }).map((a) => a.id),
    ],
    [blocked, filters, ageMin, ageMax, here]
  );
  // Already-matched people don't come back in the drop.
  const pacers = useMemo(
    () => dailyPacers(me, [...excluded, ...matches], now),
    [me, excluded, matches, now]
  );
  const stand = useMemo(() => standouts(me, [...excluded, ...matches]), [me, excluded, matches]);
  const actions = dropActions(plans, now);
  const remaining = pacers.filter((p) => !actions[p.athlete.id]).length;
  const filtersActive =
    !filters.ageAuto ||
    filters.radiusKm !== DEFAULT_RADIUS_KM ||
    filters.heightMin > 145 ||
    filters.heightMax < 210;

  const until = untilLabel(nextDrop(now), now);
  const travelling = isTravelling(me, now);

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

  const likingSource = liking?.source?.kind === 'photo' ? liking.source.source : undefined;

  return (
    <YStack flex={1} bg="$canvas">
      <XStack px={20} pt={insets.top + 8} items="flex-end" justify="space-between" gap={10}>
        <YStack flex={1}>
          <DisplayTitle size={40}>Today’s *pacers*</DisplayTitle>
          <Text fontFamily="$medium" fontSize={14} color="$muted" mt={4}>
            {remaining > 0
              ? `${remaining} of ${pacers.length} left · next drop in ${until}`
              : pacers.length
                ? `All done · next drop in ${until}`
                : `Next drop in ${until}`}
          </Text>
        </YStack>
        <XStack gap={8}>
          <IconButton
            size={40}
            tone={travelling ? 'accent' : undefined}
            onPress={() => router.push('/travel')}
            accessibilityLabel="Travel mode"
            aria-label="Travel mode"
          >
            <Icon name="plane" size={18} color={travelling ? colors.accentText : colors.text} />
          </IconButton>
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

      <YStack px={20} mt={12} gap={10}>
        {travelling ? (
          <XStack
            accessibilityRole="button"
            onPress={() => router.push('/travel')}
            items="center"
            gap={8}
            px={12}
            height={36}
            rounded="$full"
            bg="$accentSoft"
            self="flex-start"
          >
            <Icon name="plane" size={14} color={colors.accentText} />
            <Text fontFamily="$semibold" fontSize={13} color="$accentText">
              Matching in {activeCity(me, now)} until{' '}
              {new Date(me.travel!.until).toLocaleDateString('en-ZA', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </Text>
          </XStack>
        ) : null}
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </YStack>

      {tab === 'Standouts' ? (
        <Standouts
          list={stand}
          liked={(id) => hasLiked(chat, id)}
          bottom={tabBarSpace + 16}
          onOpen={(a) => router.push({ pathname: '/athlete/[id]', params: { id: String(a.id) } })}
          onLike={(a) => {
            const g = galleryFor(a.slotId)[0];
            setLiking({
              athlete: a,
              target: { kind: 'photo', index: 0, label: g?.caption ?? `${a.name}’s photo` },
              source: g ? { kind: 'photo', source: g.source, label: g.label } : undefined,
            });
          }}
        />
      ) : (
        <YStack
          flex={1}
          mt={12}
          mb={tabBarSpace - 4}
          onLayout={(e: LayoutChangeEvent) => setCardHeight(e.nativeEvent.layout.height - 22)}
        >
          {remaining === 0 || pacers.length === 0 ? (
            <DropDone
              until={until}
              empty={pacers.length === 0}
              radius={filters.radiusKm}
              onBrowse={() => setTab('Standouts')}
              onTravel={() => router.push('/travel')}
              onFilters={() => router.push('/discover-filters')}
              onClubs={() => router.push('/(tabs)/sessions')}
            />
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
                    liked={hasLiked(chat, p.athlete.id)}
                    onOpen={() =>
                      router.push({
                        pathname: '/athlete/[id]',
                        params: { id: String(p.athlete.id) },
                      })
                    }
                    onLike={(pg, index) =>
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
                    }
                    onInvite={() => invite(p)}
                    onSkip={() => {
                      dropAction(p.athlete.id, 'skipped', now);
                      showPip(`No worries — ${p.athlete.name} might show up another day.`, 'wink');
                    }}
                  />
                ))}
              </ScrollView>
              <XStack justify="center" gap={6} mt={10}>
                {pacers.map((p, i) => (
                  <YStack
                    key={p.athlete.id}
                    width={i === page ? 18 : 6}
                    height={6}
                    rounded={3}
                    bg={
                      actions[p.athlete.id] ? '$borderStrong' : i === page ? '$accent' : '$border'
                    }
                  />
                ))}
              </XStack>
            </>
          ) : null}
        </YStack>
      )}

      {liking ? (
        <LikeSheet
          athlete={liking.athlete}
          target={liking.target}
          source={likingSource}
          fromDrop={tab === 'For you'}
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
  width,
  height,
  action,
  liked,
  onOpen,
  onLike,
  onInvite,
  onSkip,
}: {
  pacer: Pacer;
  width: number;
  height: number;
  action?: DropAction;
  liked: boolean;
  onOpen: () => void;
  onLike: (page: StoryPage, index: number) => void;
  onInvite: () => void;
  onSkip: () => void;
}) {
  const colors = useColors();
  const { athlete: a, compat } = pacer;
  const d = depthFor(a);
  const pages = useMemo(() => pagesFor(pacer), [pacer]);
  const storyHeight = height - 74;

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
      <PhotoStory
        pages={pages}
        height={storyHeight}
        liked={liked || action === 'liked'}
        onLike={action ? undefined : onLike}
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
                {formatHeight(d.heightCm)} · {a.city} · {formatKm(compat.distanceKm)}
              </Text>
              <XStack items="center" gap={5}>
                <Icon name="zap" size={13} color="#FFFFFF" filled />
                <Text fontFamily="$semibold" fontSize={13} color="#FFFFFF">
                  {activityLabel(d)}
                </Text>
              </XStack>
              <WhyChips compat={compat} onPhoto />
            </YStack>
          ) : pg.kind === 'prompt' ? (
            <Text fontFamily="$semibold" fontSize={14} color="$muted">
              {a.name}, {a.age}
            </Text>
          ) : null
        }
      />

      <XStack flex={1} px={14} gap={10} items="center">
        {action ? (
          <XStack
            flex={1}
            height={48}
            rounded={24}
            items="center"
            justify="center"
            gap={8}
            bg="$surface"
          >
            <Icon
              name={action === 'invited' ? 'send' : action === 'liked' ? 'heart' : 'x'}
              size={16}
              color={colors.muted}
            />
            <Text fontFamily="$semibold" fontSize={15} color="$muted">
              {action === 'invited'
                ? 'Invite sent'
                : action === 'liked'
                  ? 'Like sent'
                  : 'Skipped for today'}
            </Text>
          </XStack>
        ) : (
          <>
            <IconButton size={48} onPress={onSkip} accessibilityLabel={`Skip ${a.name}`}>
              <Icon name="x" size={20} color={colors.text} strokeWidth={2.2} />
            </IconButton>
            <Button
              icon="send"
              onPress={onInvite}
              style={{ flex: 1, height: 48, paddingHorizontal: 12 }}
            >
              Invite to train
            </Button>
          </>
        )}
      </XStack>
    </YStack>
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

function Standouts({
  list,
  liked,
  bottom,
  onOpen,
  onLike,
}: {
  list: Athlete[];
  liked: (id: number) => boolean;
  bottom: number;
  onOpen: (a: Athlete) => void;
  onLike: (a: Athlete) => void;
}) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const tile = (width - 40 - 12) / 2;
  if (!list.length) {
    return (
      <YStack flex={1} items="center" justify="center" px={32} gap={10}>
        <Mascot size={110} mood="thinking" />
        <Text fontSize={15} color="$muted" text="center">
          No standouts near you yet. Try widening your filters.
        </Text>
      </YStack>
    );
  }
  return (
    <ScrollView flex={1} contentContainerStyle={{ px: 20, pt: 14, pb: bottom, gap: 12 }}>
      <Text fontSize={14} color="$muted">
        The most-liked people near you this week. A like with a comment stands out most.
      </Text>
      <XStack flexWrap="wrap" gap={12}>
        {list.map((a) => {
          const d = depthFor(a);
          const isLiked = liked(a.id);
          return (
            <YStack
              key={a.id}
              width={tile}
              height={tile * 1.45}
              rounded={22}
              overflow="hidden"
              bg="$surface"
              onPress={() => onOpen(a)}
              accessibilityRole="button"
              accessibilityLabel={`View ${a.name}`}
              aria-label={`View ${a.name}`}
            >
              <Image
                source={ATHLETE_PHOTOS[a.slotId]}
                resizeMode="cover"
                style={{ position: 'absolute', width: '100%', height: '100%' }}
              />
              <YStack position="absolute" l={0} r={0} b={0} p={12} gap={2} bg="rgba(18,16,14,0.5)">
                <Text fontFamily="$bold" fontSize={16} color="#FFFFFF">
                  {a.name}, {a.age}
                </Text>
                <XStack items="center" gap={4}>
                  <Icon name="star" size={12} color="#FFFFFF" strokeWidth={2.2} />
                  <Text fontFamily="$medium" fontSize={12} color="rgba(255,255,255,0.9)">
                    {d.likesThisWeek} likes this week
                  </Text>
                </XStack>
              </YStack>
              <XStack
                position="absolute"
                t={10}
                r={10}
                width={40}
                height={40}
                rounded={20}
                items="center"
                justify="center"
                bg={isLiked ? '$accent' : '$card'}
                accessibilityRole="button"
                accessibilityLabel={`Like ${a.name}`}
                aria-label={`Like ${a.name}`}
                onPress={(e) => {
                  e.stopPropagation();
                  if (!isLiked) onLike(a);
                }}
              >
                <Icon
                  name="heart"
                  size={19}
                  color={isLiked ? colors.onAccent : colors.accent}
                  filled={isLiked}
                  strokeWidth={2.2}
                />
              </XStack>
            </YStack>
          );
        })}
      </XStack>
    </ScrollView>
  );
}

function DropDone({
  until,
  empty,
  radius,
  onBrowse,
  onTravel,
  onFilters,
  onClubs,
}: {
  until: string;
  empty: boolean;
  radius: number | null;
  onBrowse: () => void;
  onTravel: () => void;
  onFilters: () => void;
  onClubs: () => void;
}) {
  // An honest empty state: we'd rather show nobody than show people who
  // are fake, inactive or two hours away.
  if (empty) {
    return (
      <YStack flex={1} items="center" justify="center" px={28} gap={10}>
        <Mascot size={110} mood="thinking" />
        <DisplayTitle size={30} center>
          No one new *nearby* today
        </DisplayTitle>
        <Text fontSize={15} lineHeight={22} color="$muted" text="center">
          We only show selfie-verified people who trained in the last {ACTIVE_DAYS} days
          {radius ? `, within ${radius} km` : ''}. No ghosts, no one hours away.
        </Text>
        <YStack mt={12} gap={10} self="stretch">
          <Button icon="users" onPress={onClubs} style={{ width: '100%' }}>
            Join a singles run club
          </Button>
          <XStack gap={10}>
            <Button variant="secondary" icon="plane" onPress={onTravel} style={{ flex: 1 }}>
              Travel
            </Button>
            <Button variant="secondary" icon="sliders" onPress={onFilters} style={{ flex: 1 }}>
              Filters
            </Button>
          </XStack>
        </YStack>
      </YStack>
    );
  }
  return (
    <YStack flex={1} items="center" justify="center" px={32} gap={10}>
      <Mascot size={120} mood="wink" />
      <DisplayTitle size={34} center>
        That’s today’s *drop*
      </DisplayTitle>
      <Text fontSize={15} lineHeight={22} color="$muted" text="center">
        No endless swiping here. Fresh pacers land every morning at 7 — next one in {until}.
      </Text>
      <YStack mt={12}>
        <Button icon="star" onPress={onBrowse}>
          See standouts
        </Button>
      </YStack>
    </YStack>
  );
}
