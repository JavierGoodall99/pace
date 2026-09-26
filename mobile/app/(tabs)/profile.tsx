import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { PipTip } from '../../src/components/PipKit';
import { GoalCard, Heatmap, PersonalBests, PromptCard } from '../../src/components/Proof';
import { profileTip } from '../../src/data/pip';
import { RhythmStrip } from '../../src/components/Rhythm';
import { useTabBarSpace } from '../../src/components/TabBar';
import { Badge, Button, Callout, DisplayTitle } from '../../src/components/ui';
import { rhythmForMe, WEEK_DAY_NAMES } from '../../src/data/rhythm';
import { levelLabel } from '../../src/data/athleteDepth';
import { effectiveStatus, usePlans } from '../../src/data/plans';
import { athletesTrainingFor, raceById } from '../../src/data/races';
import { ME_AVATAR, ME_COVER, TRAINING_PHOTOS } from '../../src/data/photos';
import { lifestyleChips } from '../../src/data/identity';
import { availableProviders, hasSync, providerList, syncLabel } from '../../src/data/sync';
import { communityById } from '../../src/data/capeTown';
import { completedChallenges, passport, useExplore } from '../../src/data/explore';
import { useMe } from '../../src/data/session';
import { activityText, streakText, useMyTraining } from '../../src/data/training';
import { ACTIVE_DAYS } from '../../src/data/trust';
import { useNow } from '../../src/lib/useNow';
import { useColors } from '../../src/theme/appearance';
import { shadow } from '../../src/theme/tokens';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const tabBarSpace = useTabBarSpace();
  const router = useRouter();
  const me = useMe();
  const explore = useExplore();
  const now = useNow();
  const training = useMyTraining(now);
  const { activity } = training;

  const avatar = me.photos[0] ? { uri: me.photos[0] } : ME_AVATAR;
  const primary = me.disciplines[0] ?? 'ATHLETE';
  const myRhythm = rhythmForMe(me.cadence, me.trainingDays);
  const myDays = myRhythm.map((on, i) => (on ? WEEK_DAY_NAMES[i] : null)).filter(Boolean);
  const plansState = usePlans();
  const sessionsDone = plansState.plans.filter((p) => effectiveStatus(p) === 'done').length;
  const STATS = [
    { value: String(myDays.length), label: 'Days / week' },
    { value: me.level ? levelLabel(me.level).split(' ')[0] : '—', label: 'Effort' },
    { value: String(sessionsDone), label: 'Sessions' },
  ];
  const goal = raceById(me.goalRaceId);
  const photoTiles: (string | null)[] = [
    me.photos[0] ?? null,
    me.photos[1] ?? null,
    me.photos[2] ?? null,
  ];

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pb: tabBarSpace + 16 }}>
      <YStack>
        <PhotoSlot
          label="Cover photo"
          shape="rect"
          source={ME_COVER}
          style={{ width: '100%', height: 180 + insets.top }}
        />
        <XStack
          accessibilityRole="button"
          accessibilityLabel="Settings"
          aria-label="Settings"
          onPress={() => router.push('/settings')}
          pressStyle={{ opacity: 0.8 }}
          position="absolute"
          t={insets.top + 12}
          r={16}
          width={40}
          height={40}
          rounded={20}
          items="center"
          justify="center"
          bg="$glass"
        >
          <Icon name="settings" size={20} color={colors.text} />
        </XStack>
      </YStack>

      <YStack px={20} mt={-48}>
        <XStack items="flex-end" justify="space-between">
          <YStack p={3} rounded={54} bg="$canvas" borderWidth={2} borderColor="$accent">
            <PhotoSlot
              label={me.name}
              shape="circle"
              source={avatar}
              style={{ width: 96, height: 96 }}
            />
          </YStack>
          <Button
            variant="ghost"
            icon="pencil"
            onPress={() => router.push('/edit-profile')}
            style={{ height: 40, paddingHorizontal: 16 }}
          >
            Edit profile
          </Button>
        </XStack>

        <XStack items="center" gap={8} mt={12}>
          <DisplayTitle size={44}>{me.name || 'You'}</DisplayTitle>
          {me.verified ? (
            <Icon name="shield-check" size={20} color={colors.accentText} strokeWidth={2} />
          ) : null}
        </XStack>
        <XStack items="center" gap={5} mt={4}>
          <Icon name="map-pin" size={14} color={colors.muted} />
          <Text fontFamily="$medium" fontSize={14} color="$muted">
            {me.city || 'Add your city'}
            {me.verified ? ' · Verified' : ' · Not verified yet'}
          </Text>
        </XStack>
        <XStack
          items="center"
          gap={5}
          mt={4}
          accessibilityRole="button"
          onPress={() => router.push('/log-training')}
        >
          <Icon
            name="zap"
            size={14}
            color={activity.active ? colors.accentText : colors.muted}
            filled={activity.trainedToday}
          />
          <Text fontFamily="$medium" fontSize={14} color={activity.active ? '$text' : '$muted'}>
            {activityText(activity)}
          </Text>
        </XStack>
        {!activity.active ? (
          <YStack mt={12}>
            <Callout icon="activity" title="You’re hidden from other people’s decks">
              {`Pace only shows people who trained in the last ${ACTIVE_DAYS} days. Log a session or connect ${providerList()} to show up again.`}
            </Callout>
            <XStack gap={10} mt={10}>
              <Button icon="plus" onPress={() => router.push('/log-training')} style={{ flex: 1 }}>
                Log training
              </Button>
              {!hasSync(me) ? (
                <Button
                  variant="secondary"
                  onPress={() =>
                    router.push({
                      pathname: '/connect/[provider]',
                      params: { provider: availableProviders()[0] },
                    })
                  }
                  style={{ flex: 1 }}
                >
                  Connect data
                </Button>
              ) : null}
            </XStack>
          </YStack>
        ) : null}
        <Text color="$text" fontSize={15} lineHeight={22} mt={14}>
          {me.bio || 'No bio yet — add one in Edit profile.'}
        </Text>
        <XStack gap={8} mt={14} flexWrap="wrap">
          <Badge tone="accent">{primary}</Badge>
          {me.cadence ? <Badge>{me.cadence}</Badge> : null}
          {lifestyleChips(me.lifestyle).map((b) => (
            <Badge key={b}>{b}</Badge>
          ))}
        </XStack>

        <XStack
          mt={24}
          py={16}
          rounded={20}
          borderWidth={1}
          borderColor="$border"
          bg="$card"
          style={shadow.card}
        >
          {STATS.map((s, i) => (
            <YStack
              key={s.label}
              flex={1}
              items="center"
              borderLeftWidth={i === 0 ? 0 : 1}
              borderLeftColor="$border"
            >
              <Text fontFamily="$display" fontSize={32} lineHeight={36} color="$text">
                {s.value}
              </Text>
              <Text fontSize={13} color="$muted" mt={2}>
                {s.label}
              </Text>
            </YStack>
          ))}
        </XStack>

        <YStack
          mt={12}
          p={16}
          gap={12}
          rounded={20}
          borderWidth={1}
          borderColor="$border"
          bg="$card"
        >
          <XStack items="baseline" justify="space-between">
            <DisplayTitle size={26}>Your *week*</DisplayTitle>
            <Text fontFamily="$medium" fontSize={13} color="$muted">
              {myDays.length} days
            </Text>
          </XStack>
          <RhythmStrip mine={myRhythm} theirs={myRhythm} height={34} />
          <Text fontSize={13} color="$muted">
            We match you with people who train on {myDays.slice(0, 3).join(', ')} and more.
          </Text>
        </YStack>

        <YStack mt={16} mb={4}>
          <PipTip line={profileTip(me)} />
        </YStack>

        <YStack mt={12}>
          {goal ? (
            <GoalCard
              race={goal}
              others={athletesTrainingFor(goal.id).length}
              mine
              onPress={() => router.push({ pathname: '/race/[id]', params: { id: goal.id } })}
            />
          ) : (
            <Button
              variant="ghost"
              icon="plus"
              onPress={() => router.push('/races')}
              style={{ width: '100%' }}
            >
              Add a race you’re training for
            </Button>
          )}
        </YStack>

        <YStack mt={12} p={16} rounded={20} borderWidth={1} borderColor="$border" bg="$card">
          <Heatmap
            rhythm={myRhythm}
            data={training.heatmap}
            source={
              training.all.length
                ? `${streakText(activity.streak)} · ${activity.thisWeek} session${activity.thisWeek === 1 ? '' : 's'} this week${me.sync ? ` · ${syncLabel(me.sync)}` : ''}`
                : 'Nothing logged yet'
            }
          />
          <Button
            variant="ghost"
            icon="plus"
            onPress={() => router.push('/log-training')}
            style={{ width: '100%', marginTop: 12 }}
          >
            Log training
          </Button>
        </YStack>

        <YStack
          mt={12}
          p={16}
          gap={12}
          rounded={20}
          borderWidth={1}
          borderColor="$border"
          bg="$card"
          onPress={() => router.push('/(tabs)/sessions')}
          accessibilityRole="button"
        >
          <XStack items="center" justify="space-between">
            <Text fontFamily="$semibold" fontSize={15} color="$text">
              Pace passport
            </Text>
            <Text fontFamily="$bold" fontSize={15} color="$accentText">
              {passport(explore).visited}/{passport(explore).total} Cape Town spots
            </Text>
          </XStack>
          {completedChallenges(explore).length || explore.crews.length ? (
            <XStack gap={8} flexWrap="wrap">
              {completedChallenges(explore).map((c) => (
                <Badge key={c.id} tone="accent" illo="medal">
                  {c.badge}
                </Badge>
              ))}
              {explore.crews.map((id) => {
                const crew = communityById(id);
                return crew ? <Badge key={id}>{crew.name}</Badge> : null;
              })}
            </XStack>
          ) : (
            <Text fontSize={13} color="$muted">
              Check in at spots and follow your crews — they show here for matches to see.
            </Text>
          )}
        </YStack>

        <YStack mt={20} gap={10}>
          <XStack items="baseline" justify="space-between">
            <Text fontFamily="$semibold" fontSize={17} color="$text">
              Personal bests
            </Text>
            <Text
              fontFamily="$semibold"
              fontSize={14}
              color="$accentText"
              accessibilityRole="button"
              onPress={() => router.push('/edit-highlights')}
            >
              {me.pbs.length ? 'Edit' : 'Add'}
            </Text>
          </XStack>
          {me.pbs.length ? (
            <PersonalBests pbs={me.pbs} />
          ) : (
            <Button
              variant="ghost"
              icon="plus"
              onPress={() => router.push('/edit-highlights')}
              style={{ width: '100%' }}
            >
              Add a personal best
            </Button>
          )}
        </YStack>

        <YStack mt={20} gap={10}>
          <XStack items="baseline" justify="space-between">
            <Text fontFamily="$semibold" fontSize={17} color="$text">
              Favourite routes
            </Text>
            <Text
              fontFamily="$semibold"
              fontSize={14}
              color="$accentText"
              accessibilityRole="button"
              onPress={() => router.push('/edit-highlights')}
            >
              {me.routes.length ? 'Edit' : 'Add'}
            </Text>
          </XStack>
          {me.routes.length ? (
            <YStack p={16} gap={12} rounded={20} borderWidth={1} borderColor="$border" bg="$card">
              {me.routes.map((r) => (
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
                    {r.detail ? (
                      <Text fontSize={13} color="$muted">
                        {r.detail}
                      </Text>
                    ) : null}
                  </YStack>
                </XStack>
              ))}
            </YStack>
          ) : (
            <Button
              variant="ghost"
              icon="plus"
              onPress={() => router.push('/edit-highlights')}
              style={{ width: '100%' }}
            >
              Add a favourite route
            </Button>
          )}
        </YStack>

        {me.prompts.map((p) => (
          <YStack key={p.q} mt={12}>
            <PromptCard prompt={p} />
          </YStack>
        ))}
        {me.prompts.length === 0 ? (
          <Button
            variant="ghost"
            icon="plus"
            onPress={() => router.push('/edit-profile')}
            style={{ width: '100%', marginTop: 12 }}
          >
            Add a prompt to your card
          </Button>
        ) : null}

        <XStack items="center" justify="space-between" mt={28} mb={12}>
          <Text fontFamily="$semibold" fontSize={17} color="$text">
            Training photos
          </Text>
          <Text fontFamily="$medium" fontSize={14} color="$muted">
            {photoTiles.filter(Boolean).length || 3} of 3
          </Text>
        </XStack>
        <XStack gap={8}>
          {photoTiles.map((uri, i) => (
            <PhotoSlot
              key={i}
              label="Photo"
              shape="rounded"
              radius={16}
              source={uri ? { uri } : TRAINING_PHOTOS[i]}
              style={{ flex: 1, aspectRatio: 0.8 }}
            />
          ))}
        </XStack>

        {__DEV__ ? (
          <XStack
            onPress={() => router.push('/onboarding')}
            mt={24}
            py={12}
            rounded={14}
            borderWidth={1}
            borderColor="$borderStrong"
            borderStyle="dashed"
            justify="center"
          >
            <Text fontFamily="$medium" fontSize={13} color="$muted">
              Dev · View onboarding
            </Text>
          </XStack>
        ) : null}
      </YStack>
    </ScrollView>
  );
}
