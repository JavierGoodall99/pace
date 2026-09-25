import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import {
  GoalCard,
  Heatmap,
  JourneyLadder,
  PersonalBests,
  PromptCard,
  WhyMatch,
} from '../../src/components/Proof';
import { RhythmLegend, RhythmStrip, SyncBadge } from '../../src/components/Rhythm';
import { Badge, Button, DisplayTitle } from '../../src/components/ui';
import { athleteById } from '../../src/data/mockData';
import { sharedDaysLabel } from '../../src/data/rhythm';
import { depthFor } from '../../src/data/athleteDepth';
import { compatibility } from '../../src/data/compat';
import { sessionsTogether, stageWith, usePlans } from '../../src/data/plans';
import { athletesTrainingFor, raceById } from '../../src/data/races';
import { useMe } from '../../src/data/session';
import { ATHLETE_ACTION_PHOTOS } from '../../src/data/photos';
import { blockAthlete, useSocial } from '../../src/data/social';
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

  function confirmBlock() {
    if (!athlete) return;
    Alert.alert(
      `Block ${athlete.name}?`,
      "They won't be able to message you, and won't appear in Discover again.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            await blockAthlete(athlete.id);
            router.back();
          },
        },
      ]
    );
  }

  return (
    <YStack flex={1} bg="$canvas">
      <ScrollView flex={1} contentContainerStyle={{ pt: insets.top, pb: 24 }}>
        <YStack width="100%" height={400} bg="$card" overflow="hidden">
          {/* The image box is taller than the window and anchored to
              its top, so the crop shows the top of the action shot —
              a portrait source keeps its subject's head instead of
              cover-centering and clipping it. */}
          <Image
            source={ATHLETE_ACTION_PHOTOS[athlete.slotId]}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Header sits on the photo, held up by a light scrim so the
              frosted buttons read cleanly over the image. */}
          <YStack pointerEvents="none" position="absolute" t={0} l={0} r={0} height={150}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="heroTopFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#1C1917" stopOpacity={0.35} />
                  <Stop offset="1" stopColor="#1C1917" stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroTopFade)" />
            </Svg>
          </YStack>
          <XStack position="absolute" l={20} r={20} t={8} items="center" justify="space-between">
            <XStack
              accessibilityRole="button"
              accessibilityLabel="Back"
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
              accessibilityLabel={`Block ${athlete.name}`}
              onPress={confirmBlock}
              pressStyle={{ opacity: 0.7 }}
              width={40}
              height={40}
              rounded={20}
              items="center"
              justify="center"
              bg="$glass"
            >
              <Icon name="ban" size={18} color={colors.text} />
            </XStack>
          </XStack>

          {/* Bottom fade dissolves the photo into the body — no hard
              dividing line between the hero and the profile info. */}
          <YStack pointerEvents="none" position="absolute" l={0} r={0} b={0} height={130}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="heroBottomFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.canvas} stopOpacity={0} />
                  <Stop offset="1" stopColor={colors.canvas} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroBottomFade)" />
            </Svg>
          </YStack>
        </YStack>

        <YStack
          mx={16}
          mt={-56}
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
            <Badge tone="accent">{athlete.discipline}</Badge>
            <Badge>{athlete.pace}</Badge>
          </XStack>

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

        {depth.prompts.map((p) => (
          <YStack key={p.q} mx={16} mt={12}>
            <PromptCard prompt={p} />
          </YStack>
        ))}

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

const styles = {
  heroImage: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%' as const,
    height: 620,
  },
};

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
