import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Icon } from '../../src/components/Icon';
import { Badge, Button, Callout, Chip, Input, SectionTitle } from '../../src/components/ui';
import {
  athleteById,
  DISCIPLINES,
  Discipline,
  PLANNER_PARTNER_IDS,
  SESSIONS,
} from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { colors, formatLabel, shadow } from '../../src/theme/tokens';

export default function PlannerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ partnerId?: string }>();

  const [discipline, setDiscipline] = useState<Discipline>('CROSSFIT');
  const [partnerId, setPartnerId] = useState<number>(5);
  const [sent, setSent] = useState(false);

  // The sessions list is module state (mock), so re-read it each time the
  // tab gains focus to pick up invites sent from a chat thread.
  const [, setTick] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setTick((t) => t + 1);
    }, [])
  );

  useEffect(() => {
    if (params.partnerId) {
      const id = Number(params.partnerId);
      if (!Number.isNaN(id)) {
        setPartnerId(id);
        setSent(false);
      }
    }
  }, [params.partnerId]);

  const partner = athleteById(partnerId);

  return (
    <ScrollView flex={1} bg="$canvas" contentContainerStyle={{ pt: insets.top + 12, pb: 32 }}>
      <YStack px={20} pb={20}>
        <Text fontFamily="$bold" fontSize={28} lineHeight={34} letterSpacing={-0.5} color="$text">
          Plans
        </Text>
        <Text fontSize={15} lineHeight={22} color="$muted" mt={4}>
          Turn a match into a session. Pick a sport, a time and a place.
        </Text>
      </YStack>

      {sent ? (
        <YStack mx={20} mb={20}>
          <Callout icon="check" tone="success" title="Invite sent">
            {partner?.name ?? 'They'} will get your invite. We&apos;ll let you know when they reply.
          </Callout>
        </YStack>
      ) : null}

      <YStack
        mx={20}
        p={20}
        gap={24}
        rounded={24}
        bg="$card"
        borderWidth={1}
        borderColor="$border"
        style={shadow.card}
      >
        <YStack>
          <SectionTitle>Activity</SectionTitle>
          <XStack flexWrap="wrap" gap={8}>
            {DISCIPLINES.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={d === discipline}
                onPress={() => setDiscipline(d)}
              />
            ))}
          </XStack>
        </YStack>

        <YStack>
          <SectionTitle>With</SectionTitle>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 14 }}
          >
            {PLANNER_PARTNER_IDS.map((id) => {
              const a = athleteById(id);
              if (!a) return null;
              const active = id === partnerId;
              return (
                <YStack
                  key={id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => {
                    setPartnerId(id);
                    setSent(false);
                  }}
                  items="center"
                  gap={6}
                >
                  <YStack
                    p={2}
                    rounded={32}
                    borderWidth={2}
                    borderColor={active ? '$accent' : 'transparent'}
                  >
                    <PhotoSlot
                      label={a.name}
                      shape="circle"
                      source={ATHLETE_PHOTOS[a.slotId]}
                      style={{ width: 52, height: 52 }}
                    />
                  </YStack>
                  <Text
                    fontFamily={active ? '$semibold' : '$medium'}
                    fontSize={13}
                    color={active ? '$accent' : '$muted'}
                  >
                    {a.name}
                  </Text>
                </YStack>
              );
            })}
          </ScrollView>
        </YStack>

        <YStack>
          <SectionTitle>When</SectionTitle>
          <Input placeholder="e.g. Saturday, 6:00 am" />
        </YStack>

        <YStack>
          <SectionTitle>Where</SectionTitle>
          <Input placeholder="e.g. Sea Point Promenade" />
        </YStack>

        <Button onPress={() => setSent(true)} icon="send" style={{ width: '100%' }}>
          Send invite
        </Button>
      </YStack>

      <YStack px={20} pt={32}>
        <SectionTitle>Upcoming</SectionTitle>
        <YStack gap={10}>
          {SESSIONS.map((s) => {
            const a = athleteById(s.athleteId);
            return (
              <XStack
                key={s.id}
                items="center"
                gap={12}
                p={14}
                rounded={20}
                borderWidth={1}
                borderColor="$border"
                bg="$card"
              >
                <XStack
                  width={44}
                  height={44}
                  rounded={14}
                  bg="$accentSoft"
                  items="center"
                  justify="center"
                >
                  <Icon name="calendar" size={20} color={colors.accent} />
                </XStack>
                <YStack flex={1} minW={0}>
                  <Text fontFamily="$semibold" fontSize={15} color="$text" numberOfLines={1}>
                    {formatLabel(s.activity)} with {a?.name}
                  </Text>
                  <Text fontSize={13} color="$muted" mt={2} numberOfLines={1}>
                    {s.when} · {s.location}
                  </Text>
                </YStack>
                <Badge tone={s.status === 'CONFIRMED' ? 'success' : 'neutral'}>{s.status}</Badge>
              </XStack>
            );
          })}
        </YStack>
      </YStack>
    </ScrollView>
  );
}
