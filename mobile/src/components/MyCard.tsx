import { useMemo } from 'react';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { PhotoStory, StoryPage } from './PhotoStory';
import { RhythmStrip } from './Rhythm';
import { DisplayTitle } from './ui';
import { levelLabel } from '../data/athleteDepth';
import { lifestyleChips } from '../data/identity';
import { useSettings } from '../data/settings';
import type { Rhythm } from '../data/rhythm';
import type { MeProfile } from '../data/session';
import { useColors } from '../theme/appearance';
import { formatLabel, shadow } from '../theme/tokens';

// Your own card, built exactly like the Discover deck card — same story
// pages, same footer — so what you see is what other people swipe on.
export function MyCard({
  me,
  rhythm,
  height,
  topRight,
}: {
  me: MeProfile;
  rhythm: Rhythm;
  height: number;
  topRight?: React.ReactNode;
}) {
  const colors = useColors();
  // Card privacy settings apply to how others see you.
  const { privacy } = useSettings();
  const pages = useMemo(
    () => myPages(me, rhythm, privacy.showStats),
    [me, rhythm, privacy.showStats]
  );
  const sports = me.disciplines.map(formatLabel);
  const details = privacy.showCity ? me.city : '';

  return (
    <YStack
      height={height}
      width="100%"
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
        topRight={topRight ? () => topRight : undefined}
        footer={(pg) =>
          pg.kind === 'photo' ? (
            <YStack gap={6}>
              <XStack items="center" gap={8}>
                <DisplayTitle size={36} color="$onPhoto">
                  {`${me.name || 'You'} *${me.age || ''}*`}
                </DisplayTitle>
                {me.verified ? (
                  <Icon name="shield-check" size={20} color={colors.onPhoto} strokeWidth={2} />
                ) : null}
              </XStack>
              {details ? (
                <Text fontFamily="$medium" fontSize={13} color="rgba(255,255,255,0.88)">
                  {details}
                </Text>
              ) : null}
              <XStack items="center" gap={5}>
                <Icon name="zap" size={13} color="#FFFFFF" filled />
                <Text fontFamily="$semibold" fontSize={13} color="#FFFFFF">
                  {me.level && privacy.showStats ? `${levelLabel(me.level)} pace` : 'On Pace'}
                </Text>
              </XStack>
              {sports.length ? (
                <XStack gap={6} flexWrap="wrap">
                  {sports.map((s) => (
                    <XStack
                      key={s}
                      height={28}
                      px={10}
                      rounded="$full"
                      items="center"
                      bg="rgba(255,255,255,0.16)"
                    >
                      <Text fontFamily="$semibold" fontSize={12} color="$onPhoto">
                        {s}
                      </Text>
                    </XStack>
                  ))}
                </XStack>
              ) : null}
            </YStack>
          ) : pg.kind === 'prompt' ? (
            <Text fontFamily="$semibold" fontSize={14} color="$muted">
              {me.name}, {me.age}
            </Text>
          ) : null
        }
      />
    </YStack>
  );
}

// Same order as the Discover card: photo, prompt, photo, about, prompt, rest.
function myPages(me: MeProfile, rhythm: Rhythm, showStats: boolean): StoryPage[] {
  const photo = (k: number): StoryPage | null =>
    me.photos[k]
      ? { kind: 'photo', source: { uri: me.photos[k] }, label: me.photoLabels[k] ?? 'action' }
      : null;
  const pages: (StoryPage | null)[] = [
    photo(0),
    me.prompts[0] ? { kind: 'prompt', prompt: me.prompts[0] } : null,
    photo(1),
    { kind: 'info', content: <AboutPage me={me} rhythm={rhythm} showStats={showStats} /> },
    me.prompts[1] ? { kind: 'prompt', prompt: me.prompts[1] } : null,
    ...me.photos.slice(2).map((_, k) => photo(k + 2)),
  ];
  return pages.filter((x): x is StoryPage => !!x);
}

// Stands in for the "You & them" page: there's no one to compare with
// yet, so it shows what your matches will compare against.
function AboutPage({
  me,
  rhythm,
  showStats,
}: {
  me: MeProfile;
  rhythm: Rhythm;
  showStats: boolean;
}) {
  const colors = useColors();
  const chips = lifestyleChips(me.lifestyle);
  const facts = [
    me.disciplines.length ? me.disciplines.map(formatLabel).join(', ') : null,
    me.level && showStats ? `${levelLabel(me.level)} pace` : null,
    me.times.length ? `Trains ${me.times.map(formatLabel).join(' & ').toLowerCase()}` : null,
  ].filter((x): x is string => !!x);

  return (
    <YStack flex={1} px={18} pt={48} pb={18} gap={14}>
      <DisplayTitle size={28}>{`About *${me.name || 'you'}*`}</DisplayTitle>
      <YStack gap={8}>
        {facts.map((f) => (
          <XStack key={f} items="center" gap={8}>
            <Icon name="check" size={15} color={colors.accentText} strokeWidth={2.6} />
            <Text flex={1} fontSize={14} color="$text" numberOfLines={1}>
              {f}
            </Text>
          </XStack>
        ))}
      </YStack>
      <RhythmStrip mine={rhythm} theirs={rhythm} height={22} />
      {me.bio ? (
        <Text fontSize={14} lineHeight={20} color="$text">
          {me.bio}
        </Text>
      ) : null}
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
    </YStack>
  );
}
