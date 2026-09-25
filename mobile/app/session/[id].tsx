import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { isPublicSpot, SafetyPanel } from '../../src/components/Sessions';
import { Badge, Button, Callout, DisplayTitle, ScreenHeader } from '../../src/components/ui';
import { levelLabel } from '../../src/data/athleteDepth';
import { formatWhen } from '../../src/data/dates';
import { athleteById, SPORT_EMOJI } from '../../src/data/mockData';
import { ATHLETE_PHOTOS, ME_AVATAR } from '../../src/data/photos';
import { joinOpen, leaveOpen, usePlans } from '../../src/data/plans';
import { useMe } from '../../src/data/session';
import { useColors } from '../../src/theme/appearance';
import { formatLabel } from '../../src/theme/tokens';

export default function SessionDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { open } = usePlans();
  const s = open.find((o) => o.id === id);
  const [share, setShare] = useState(false);
  const [timer, setTimer] = useState(true);

  if (!s) {
    return (
      <YStack flex={1} bg="$canvas">
        <ScreenHeader title="Session" onBack={() => router.back()} />
        <Text color="$muted" text="center" mt={60}>
          This session has ended or was removed.
        </Text>
      </YStack>
    );
  }

  const hosting = s.hostId === 'me';
  const going = s.joined.includes('me');
  const full = s.joined.length >= s.spots && !going;
  const host = hosting ? null : athleteById(s.hostId as number);
  const attendees = [s.hostId, ...s.joined];

  return (
    <YStack flex={1} bg="$canvas">
      <ScrollView flex={1} contentContainerStyle={{ pb: 24 }}>
        <ScreenHeader title={s.title} onBack={() => router.back()} />
        <YStack px={20} gap={16} mt={12}>
          <XStack gap={8} flexWrap="wrap">
            <Badge tone="accent">{`${SPORT_EMOJI[s.activity]} ${formatLabel(s.activity)}`}</Badge>
            <Badge>{levelLabel(s.level)}</Badge>
            <Badge>{s.spots > 1 ? `Group · ${s.spots} spots` : '1-on-1'}</Badge>
          </XStack>

          <YStack p={16} gap={12} rounded={22} bg="$card" borderWidth={1} borderColor="$border">
            <Row icon="clock" text={formatWhen(s.date)} />
            <Row icon="map-pin" text={`${s.place}, ${s.city}`} badge={isPublicSpot(s.place) ? 'Public spot' : undefined} />
            <Row icon="activity" text={s.distance} />
          </YStack>

          {s.note ? (
            <YStack p={16} rounded={20} bg="$accentSoft">
              <Text fontFamily="$display" fontSize={22} lineHeight={27} color="$text">
                “{s.note}”
              </Text>
              <Text fontSize={13} color="$muted" mt={6}>
                — {hosting ? 'You' : host?.name}
              </Text>
            </YStack>
          ) : null}

          <YStack gap={10}>
            <DisplayTitle size={26}>{`Who’s *going*`}</DisplayTitle>
            <XStack gap={10} flexWrap="wrap">
              {attendees.map((who, i) => {
                const a = who === 'me' ? null : athleteById(who);
                const name = who === 'me' ? 'You' : (a?.name ?? '');
                return (
                  <YStack
                    key={`${String(who)}-${i}`}
                    items="center"
                    gap={4}
                    onPress={a ? () => router.push({ pathname: '/athlete/[id]', params: { id: String(a.id) } }) : undefined}
                  >
                    <PhotoSlot
                      label={name}
                      shape="circle"
                      source={who === 'me' ? (me.photos[0] ? { uri: me.photos[0] } : ME_AVATAR) : a ? ATHLETE_PHOTOS[a.slotId] : undefined}
                      style={{ width: 56, height: 56 }}
                    />
                    <Text fontSize={12} color="$muted">
                      {i === 0 ? `${name} · host` : name}
                    </Text>
                  </YStack>
                );
              })}
              {Array.from({ length: Math.max(0, s.spots - s.joined.length) }).map((_, i) => (
                <YStack key={`open-${i}`} items="center" gap={4}>
                  <XStack width={56} height={56} rounded={28} borderWidth={2} borderStyle="dashed" borderColor="$borderStrong" items="center" justify="center">
                    <Icon name="plus" size={18} color={colors.muted} />
                  </XStack>
                  <Text fontSize={12} color="$muted">
                    Open
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>

          <SafetyPanel
            share={share}
            onShare={setShare}
            timer={timer}
            onTimer={setTimer}
            summary={`${s.title} · ${formatWhen(s.date)} · ${s.place}, ${s.city}`}
          />
          {s.spots > 1 ? (
            <Callout icon="users" title="A great first meet">
              Group sessions keep things easy — meet someone new with others around, then plan a 1-on-1 if it clicks.
            </Callout>
          ) : null}
        </YStack>
      </ScrollView>

      {hosting ? null : (
        <XStack px={20} pt={12} gap={10} bg="$card" borderTopWidth={1} borderTopColor="$border" style={{ paddingBottom: insets.bottom + 12 }}>
          {going ? (
            <Button variant="secondary" onPress={() => leaveOpen(s.id)} style={{ flex: 1 }}>
              Leave session
            </Button>
          ) : (
            <Button icon={full ? undefined : 'check'} disabled={full} onPress={() => joinOpen(s.id)} style={{ flex: 1 }}>
              {full ? 'Session full' : s.spots > 1 ? 'Join session' : `Ask to join ${host?.name ?? ''}`}
            </Button>
          )}
        </XStack>
      )}
    </YStack>
  );
}

function Row({ icon, text, badge }: { icon: 'clock' | 'map-pin' | 'activity'; text: string; badge?: string }) {
  const colors = useColors();
  return (
    <XStack items="center" gap={10}>
      <Icon name={icon} size={17} color={colors.muted} />
      <Text flex={1} fontSize={15} color="$text">
        {text}
      </Text>
      {badge ? (
        <Badge tone="success" icon="shield-check">
          {badge}
        </Badge>
      ) : null}
    </XStack>
  );
}
