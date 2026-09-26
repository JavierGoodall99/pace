import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageSourcePropType, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import {
  GoalCard,
  Heatmap,
  JourneyLadder,
  PersonalBests,
  WhyMatch,
} from '../../src/components/Proof';
import { RhythmLegend, RhythmStrip, SyncBadge } from '../../src/components/Rhythm';
import { Badge, Button, DisplayTitle } from '../../src/components/ui';
import { athleteById, SPORT_ILLO } from '../../src/data/mockData';
import { LikeSheet } from '../../src/components/LikeSheet';
import { PhotoStory, StoryPage } from '../../src/components/PhotoStory';
import { SafetySheet } from '../../src/components/SafetySheet';
import { hasLiked, LikeTarget, useChat } from '../../src/data/chat';
import { formatHeight, freshnessLabel, genderLabel, lifestyleChips } from '../../src/data/identity';
import { sharedDaysLabel } from '../../src/data/rhythm';
import { depthFor } from '../../src/data/athleteDepth';
import { compatibility } from '../../src/data/compat';
import { sessionsTogether, stageWith, usePlans } from '../../src/data/plans';
import { athletesTrainingFor, raceById } from '../../src/data/races';
import { useMe } from '../../src/data/session';
import { galleryFor } from '../../src/data/photos';
import { COMMUNITIES } from '../../src/data/capeTown';
import { CREW_MEMBERS, useExplore } from '../../src/data/explore';
import { activityLabel, repliesLabel } from '../../src/data/trust';
import { useSocial } from '../../src/data/social';
import { useColors } from '../../src/theme/appearance';
import { formatLabel, shadow } from '../../src/theme/tokens';

export default function AthleteDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const athlete = athleteById(Number(id));
  const me = useMe();
  const plansState = usePlans();
  const { matches } = useSocial();
  const chat = useChat();
  const explore = useExplore();
  const { height } = useWindowDimensions();
  const [safety, setSafety] = useState(false);
  const [liking, setLiking] = useState<{ target: LikeTarget; source?: ImageSourcePropType } | null>(
    null
  );

  if (!athlete) {
    return (
      <YStack flex={1} bg="$canvas">
        <Text color="$muted" text="center" mt={100}>
          Athlete not found.
        </Text>
      </YStack>
    );
  }

  const compat = compatibility(me, athlete);
  const { mine, theirs } = compat;
  const sync = compat.score;
  const depth = depthFor(athlete);
  const goal = raceById(depth.goalRaceId);
  const matched = matches.includes(athlete.id);
  const stage = stageWith(plansState, athlete.id, matched);
  const together = sessionsTogether(plansState, athlete.id);
  const gallery = galleryFor(athlete.slotId);
  const crews = COMMUNITIES.filter((c) => CREW_MEMBERS[c.id]?.includes(athlete.id));
  const shared = crews.filter((c) => explore.crews.includes(c.id));
  const liked = hasLiked(chat, athlete.id);
  const basics = [
    formatHeight(depth.heightCm),
    genderLabel(depth.gender),
    ...lifestyleChips(depth.lifestyle),
  ].filter(Boolean);

  const pages: StoryPage[] = [];
  gallery.forEach((g, i) => {
    pages.push({
      kind: 'photo',
      source: g.source,
      label: g.label,
      caption: g.caption,
      motion: i === 0 && depth.motion,
    });
    if (depth.prompts[i]) pages.push({ kind: 'prompt', prompt: depth.prompts[i] });
  });
  depth.prompts.slice(gallery.length).forEach((p) => pages.push({ kind: 'prompt', prompt: p }));

  function likePage(pg: StoryPage, index: number) {
    if (!athlete) return;
    if (pg.kind === 'photo') {
      setLiking({
        target: { kind: 'photo', index, label: pg.caption ?? `${athlete.name}’s photo` },
        source: pg.source,
      });
    } else if (pg.kind === 'prompt') {
      setLiking({
        target: { kind: 'prompt', index, label: pg.prompt.q, text: pg.prompt.a },
      });
    }
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScrollView flex={1} contentContainerStyle={{ pt: insets.top, pb: 24 }}>
        <YStack width="100%">
          <PhotoStory
            pages={pages}
            height={Math.round(height * 0.62)}
            bottomFade={false}
            insetBottom={28}
            labelAt="bottom"
            liked={liked}
            onLike={liked ? undefined : (pg, i) => likePage(pg, i)}
          />
          <XStack
            position="absolute"
            l={20}
            r={20}
            t={36}
            items="center"
            justify="space-between"
            pointerEvents="box-none"
          >
            <XStack
              accessibilityRole="button"
              accessibilityLabel="Back"
              aria-label="Back"
              onPress={() => router.back()}
              pressStyle={{ opacity: 0.7 }}
              width={40}
              height={40}
              rounded={20}
              items="center"
              justify="center"
              bg="$glass"
            >
              <Icon name="chevron-left" size={20} color={colors.text} />
            </XStack>
            <XStack
              accessibilityRole="button"
              accessibilityLabel={`Safety options for ${athlete.name}`}
              aria-label={`Safety options for ${athlete.name}`}
              onPress={() => setSafety(true)}
              pressStyle={{ opacity: 0.7 }}
              width={40}
              height={40}
              rounded={20}
              items="center"
              justify="center"
              bg="$glass"
            >
              <Icon name="more" size={18} color={colors.text} />
            </XStack>
          </XStack>
        </YStack>

        <YStack
          mx={16}
          mt={-28}
          p={20}
          rounded={28}
          bg="$card"
          borderWidth={1}
          borderColor="$border"
          style={shadow.raised}
        >
          <XStack items="center" gap={8}>
            <DisplayTitle size={44}>{`${athlete.name} *${athlete.age}*`}</DisplayTitle>
            {athlete.verified ? (
              <Icon name="shield-check" size={22} color={colors.accentText} strokeWidth={2} />
            ) : null}
          </XStack>
          <XStack items="center" gap={5} mt={4}>
            <Icon name="map-pin" size={14} color={colors.muted} />
            <Text fontFamily="$medium" fontSize={14} color="$muted">
              {athlete.city}
              {athlete.verified ? ' · Verified athlete' : ' · Not verified yet'}
            </Text>
          </XStack>
          <XStack gap={8} mt={16} flexWrap="wrap">
            <Badge tone="accent" illo={SPORT_ILLO[athlete.discipline]}>
              {athlete.discipline}
            </Badge>
            <Badge>{athlete.pace}</Badge>
            {basics.map((b) => (
              <Badge key={b}>{b}</Badge>
            ))}
          </XStack>
          <XStack items="center" gap={6} mt={12}>
            <Icon name="camera" size={14} color={colors.muted} />
            <Text fontSize={13} color="$muted">
              {freshnessLabel(depth.photosDaysAgo)}
              {athlete.verified ? ' · Selfie matches photos' : ''}
            </Text>
          </XStack>
          <XStack items="center" gap={6} mt={6}>
            <Icon name="zap" size={14} color={colors.success} filled />
            <Text fontSize={13} color="$muted">
              {activityLabel(depth)} · {repliesLabel(depth.replies)}
            </Text>
          </XStack>
          {crews.length ? (
            <XStack items="center" gap={6} mt={6}>
              <Icon name="users" size={14} color={colors.accentText} />
              <Text flex={1} fontSize={13} color="$muted">
                {shared.length
                  ? `You both run with ${shared.map((c) => c.name).join(' & ')}`
                  : `Runs with ${crews.map((c) => c.name).join(', ')}`}
              </Text>
            </XStack>
          ) : null}

          <Text color="$text" fontSize={16} lineHeight={24} mt={18}>
            {athlete.bio}
          </Text>

          <XStack mt={20} pt={18} borderTopWidth={1} borderTopColor="$border">
            <StatCard value={String(athlete.weekly)} label="Sessions / wk" />
            <StatCard value={formatLabel(athlete.pace)} label="Avg pace" divider />
            <StatCard value={`${sync}%`} label="In sync" divider />
          </XStack>
        </YStack>

        {stage ? (
          <Section>
            <DisplayTitle size={26}>{`Your *journey*`}</DisplayTitle>
            <JourneyLadder stage={stage} sessions={together} />
          </Section>
        ) : null}

        <Section>
          <WhyMatch compat={compat} name={athlete.name} />
        </Section>

        {goal ? (
          <YStack mx={16} mt={12}>
            <GoalCard
              race={goal}
              others={athletesTrainingFor(goal.id).length - 1}
              onPress={() => router.push({ pathname: '/race/[id]', params: { id: goal.id } })}
            />
          </YStack>
        ) : null}

        <Section>
          <Heatmap rhythm={theirs} seed={athlete.id} />
        </Section>

        {depth.pbs.length ? (
          <YStack mx={16} mt={12} gap={10}>
            <Text fontFamily="$semibold" fontSize={17} color="$text" mx={4}>
              Personal bests
            </Text>
            <PersonalBests pbs={depth.pbs} />
          </YStack>
        ) : null}

        {depth.routes.length ? (
          <Section>
            <Text fontFamily="$semibold" fontSize={17} color="$text">
              Favourite routes
            </Text>
            {depth.routes.map((r) => (
              <XStack key={r.name} items="center" gap={12}>
                <XStack
                  width={38}
                  height={38}
                  rounded={12}
                  bg="$surface"
                  items="center"
                  justify="center"
                >
                  <Icon name="map" size={18} color={colors.accentText} />
                </XStack>
                <YStack flex={1}>
                  <Text fontFamily="$semibold" fontSize={15} color="$text">
                    {r.name}
                  </Text>
                  <Text fontSize={13} color="$muted">
                    {r.detail}
                  </Text>
                </YStack>
              </XStack>
            ))}
          </Section>
        ) : null}

        <YStack
          mx={16}
          mt={12}
          p={20}
          gap={14}
          rounded={28}
          bg="$card"
          borderWidth={1}
          borderColor="$border"
        >
          <XStack items="flex-start" justify="space-between" gap={12}>
            <YStack flex={1}>
              <DisplayTitle size={28}>Your week, *together*</DisplayTitle>
              <Text fontSize={14} color="$muted" mt={4}>
                {sharedDaysLabel(mine, theirs)}
              </Text>
            </YStack>
            <SyncBadge pct={sync} />
          </XStack>
          <RhythmStrip mine={mine} theirs={theirs} height={40} />
          <RhythmLegend />
        </YStack>
      </ScrollView>

      <XStack
        gap={10}
        px={20}
        pt={12}
        borderTopWidth={1}
        borderTopColor="$border"
        bg="$card"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {matched ? (
          <Button
            variant="secondary"
            icon="message-circle"
            style={{ paddingHorizontal: 18 }}
            onPress={() =>
              router.replace({
                pathname: '/thread/[athleteId]',
                params: { athleteId: String(athlete.id) },
              })
            }
          >
            Chat
          </Button>
        ) : null}
        <Button
          icon="send"
          style={{ flex: 1, paddingHorizontal: 12 }}
          onPress={() =>
            router.push({
              pathname: '/invite/[athleteId]',
              params: { athleteId: String(athlete.id) },
            })
          }
        >
          Invite to train
        </Button>
      </XStack>

      <SafetySheet
        athlete={athlete}
        visible={safety}
        matched={matched}
        onClose={() => setSafety(false)}
        onDone={() => router.back()}
      />
      {liking ? (
        <LikeSheet
          athlete={athlete}
          target={liking.target}
          source={liking.source}
          onClose={() => setLiking(null)}
        />
      ) : null}
    </YStack>
  );
}

function StatCard({
  value,
  label,
  divider = false,
}: {
  value: string;
  label: string;
  divider?: boolean;
}) {
  return (
    <YStack
      flex={1}
      items="center"
      px={6}
      borderLeftWidth={divider ? 1 : 0}
      borderLeftColor="$border"
    >
      <Text
        fontFamily="$bold"
        fontSize={17}
        lineHeight={22}
        color="$text"
        text="center"
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text fontSize={12} color="$muted" mt={2} text="center">
        {label}
      </Text>
    </YStack>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return (
    <YStack
      mx={16}
      mt={12}
      p={20}
      gap={14}
      rounded={28}
      bg="$card"
      borderWidth={1}
      borderColor="$border"
    >
      {children}
    </YStack>
  );
}
