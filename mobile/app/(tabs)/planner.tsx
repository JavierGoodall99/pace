import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Badge, Button, Chip, Input } from '../../src/components/ui';
import {
  athleteById,
  DISCIPLINES,
  Discipline,
  PLANNER_PARTNER_IDS,
  SESSIONS,
} from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { colors } from '../../src/theme/tokens';

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
    <ScrollView flex={1} bg="$ink" contentContainerStyle={{ pt: insets.top + 12, pb: 24 }}>
      <YStack px={20} pb={4}>
        <Text fontFamily="$display" fontSize={32} color="$bone" textTransform="uppercase" lineHeight={32}>
          Planner
        </Text>
        <Text color="$fog" fontSize={12} mt={8} mb={16}>
          Turn a match into a session. Pick a sport, time and place.
        </Text>
      </YStack>

      {sent ? (
        <YStack
          mx={20}
          mb={20}
          p={18}
          rounded={16}
          bg="$emberSoft"
          borderWidth={1}
          borderColor="$emberBorder"
        >
          <Text fontFamily="$display" fontSize={16} color="$bone" textTransform="uppercase">
            Invite Sent
          </Text>
          <Text fontSize={12} color="$fog" mt={6}>
            {partner?.name ?? 'They'} will get your session invite. You&apos;ll be notified when
            they respond.
          </Text>
        </YStack>
      ) : null}

      <YStack px={20} gap={18}>
        <YStack>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone">
            ACTIVITY
          </Text>
          <XStack flexWrap="wrap" gap={8} mt={8}>
            {DISCIPLINES.map((d) => (
              <Chip key={d} label={d} selected={d === discipline} onPress={() => setDiscipline(d)} />
            ))}
          </XStack>
        </YStack>

        <YStack>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone">
            WITH
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {PLANNER_PARTNER_IDS.map((id) => {
              const a = athleteById(id);
              if (!a) return null;
              const active = id === partnerId;
              return (
                <YStack
                  key={id}
                  onPress={() => {
                    setPartnerId(id);
                    setSent(false);
                  }}
                  items="center"
                  gap={6}
                >
                  <PhotoSlot
                    label={a.name}
                    shape="circle"
                    source={ATHLETE_PHOTOS[a.slotId]}
                    style={[
                      { width: 52, height: 52 },
                      { borderWidth: 2, borderColor: active ? colors.ember : colors.line },
                    ]}
                  />
                  <Text fontFamily="$mono" fontSize={9} color={active ? '$ember' : '$fog'}>
                    {a.name}
                  </Text>
                </YStack>
              );
            })}
          </ScrollView>
        </YStack>

        <YStack>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone">
            WHEN
          </Text>
          <YStack mt={8}>
            <Input placeholder="SAT · 06:00" />
          </YStack>
        </YStack>

        <YStack>
          <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$bone">
            WHERE
          </Text>
          <YStack mt={8}>
            <Input placeholder="SEA POINT PROMENADE" />
          </YStack>
        </YStack>

        <Button onPress={() => setSent(true)} style={{ width: '100%', marginTop: 4 }}>
          Send Invite
        </Button>
      </YStack>

      <YStack px={20} pt={28}>
        <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$fog">
          UPCOMING SESSIONS
        </Text>
        <YStack gap={10} mt={12}>
          {SESSIONS.map((s) => {
            const a = athleteById(s.athleteId);
            return (
              <XStack
                key={s.id}
                justify="space-between"
                items="center"
                p={14}
                rounded={16}
                borderWidth={1}
                borderColor="$line"
                bg="$ash"
              >
                <YStack>
                  <Text fontFamily="$mono" fontSize={12} color="$bone" letterSpacing={0.5}>
                    {s.activity} · {a?.name}
                  </Text>
                  <Text fontSize={12} color="$fog" mt={4}>
                    {s.when} · {s.location}
                  </Text>
                </YStack>
                <Badge tone={s.status === 'CONFIRMED' ? 'accent' : 'neutral'}>{s.status}</Badge>
              </XStack>
            );
          })}
        </YStack>
      </YStack>
    </ScrollView>
  );
}