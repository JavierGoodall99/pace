import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { JourneyLadder } from '../../src/components/Proof';
import { Badge, IconButton, Input } from '../../src/components/ui';
import {
  athleteById,
  THREAD_MESSAGES,
  ThreadMessage,
  updateSessionStatus,
} from '../../src/data/mockData';
import { ATHLETE_PHOTOS } from '../../src/data/photos';
import { sessionsTogether, stageWith, usePlans } from '../../src/data/plans';
import { useSocial } from '../../src/data/social';
import { useColors } from '../../src/theme/appearance';
import { formatLabel } from '../../src/theme/tokens';

export default function ThreadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const athlete = athleteById(Number(athleteId));

  const [messages, setMessages] = useState<ThreadMessage[]>(
    () => THREAD_MESSAGES[Number(athleteId)] ?? []
  );
  const [note, setNote] = useState('');
  const plansState = usePlans();
  const { matches } = useSocial();

  if (!athlete) {
    return (
      <YStack flex={1} bg="$canvas">
        <Text color="$muted" text="center" mt={100}>
          Conversation not found.
        </Text>
      </YStack>
    );
  }

  const stage = stageWith(plansState, athlete.id, matches.includes(athlete.id));
  const together = sessionsTogether(plansState, athlete.id);
  const inviteToTrain = () =>
    router.push({ pathname: '/invite/[athleteId]', params: { athleteId: String(athlete.id) } });

  const sendText = () => {
    if (!note.trim()) return;
    setMessages((prev) => [...prev, { from: 'me', text: note.trim() }]);
    setNote('');
  };

  const respondTo = (index: number, status: 'CONFIRMED' | 'DECLINED') => {
    const plan = messages[index]?.plan;
    if (!plan) return;
    updateSessionStatus(plan.id, status);
    setMessages((prev) =>
      prev.map((m, i) => (i === index && m.plan ? { ...m, plan: { ...m.plan, status } } : m))
    );
  };

  return (
    <YStack flex={1} bg="$canvas">
      <XStack
        items="center"
        gap={12}
        px={16}
        pb={12}
        pt={insets.top + 8}
        borderBottomWidth={1}
        borderBottomColor="$border"
        bg="$card"
      >
        <IconButton size={40} onPress={() => router.back()} accessibilityLabel="Back">
          <Icon name="chevron-left" size={20} color={colors.text} />
        </IconButton>
        <XStack
          flex={1}
          items="center"
          gap={10}
          onPress={() =>
            router.push({ pathname: '/athlete/[id]', params: { id: String(athlete.id) } })
          }
        >
          <PhotoSlot
            label={athlete.name}
            shape="circle"
            source={ATHLETE_PHOTOS[athlete.slotId]}
            style={{ width: 40, height: 40 }}
          />
          <YStack>
            <Text fontFamily="$semibold" fontSize={16} color="$text">
              {athlete.name}
            </Text>
            <Text fontSize={13} color="$muted">
              {formatLabel(athlete.discipline)} · {athlete.city}
            </Text>
          </YStack>
        </XStack>
      </XStack>

      <YStack px={20} py={12} bg="$card" borderBottomWidth={1} borderBottomColor="$border">
        <JourneyLadder stage={stage ?? 'match'} sessions={together} compact />
      </YStack>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          flex={1}
          contentContainerStyle={{
            p: 20,
            gap: 10,
            pb: 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((m, i) => {
            const mine = m.from === 'me';
            const plan = m.plan;
            return (
              <YStack key={i} items={mine ? 'flex-end' : 'flex-start'}>
                <YStack
                  bg={mine ? '$accent' : '$card'}
                  borderWidth={mine ? 0 : 1}
                  borderColor="$border"
                  maxW="80%"
                  px={14}
                  py={10}
                  rounded={20}
                  borderBottomRightRadius={mine ? 6 : 20}
                  borderBottomLeftRadius={mine ? 20 : 6}
                >
                  {m.text ? (
                    <Text color={mine ? '$onAccent' : '$text'} fontSize={15} lineHeight={21}>
                      {m.text}
                    </Text>
                  ) : null}
                  {plan ? (
                    <YStack
                      minW={220}
                      gap={8}
                      p={14}
                      rounded={16}
                      bg="$card"
                      borderWidth={mine ? 0 : 1}
                      borderColor="$border"
                      mt={m.text ? 10 : 0}
                    >
                      <XStack items="center" justify="space-between" gap={8}>
                        <Text fontFamily="$bold" fontSize={16} color="$text">
                          {formatLabel(plan.activity)}
                        </Text>
                        <Badge
                          tone={
                            plan.status === 'CONFIRMED'
                              ? 'success'
                              : plan.status === 'DECLINED'
                                ? 'neutral'
                                : 'accent'
                          }
                        >
                          {plan.status === 'INVITE' ? 'Invite' : plan.status}
                        </Badge>
                      </XStack>
                      <XStack items="center" gap={8}>
                        <Icon name="clock" size={15} color={colors.muted} />
                        <Text fontSize={14} color="$text">
                          {plan.when}
                        </Text>
                      </XStack>
                      <XStack items="center" gap={8}>
                        <Icon name="map-pin" size={15} color={colors.muted} />
                        <Text fontSize={14} color="$text">
                          {plan.location}
                        </Text>
                      </XStack>
                      {!mine && plan.status === 'INVITE' ? (
                        <XStack gap={8} mt={10}>
                          <XStack
                            flex={1}
                            height={40}
                            rounded="$full"
                            items="center"
                            justify="center"
                            bg="$surface"
                            pressStyle={{ opacity: 0.8 }}
                            onPress={() => respondTo(i, 'DECLINED')}
                          >
                            <Text fontFamily="$semibold" fontSize={14} color="$text">
                              Decline
                            </Text>
                          </XStack>
                          <XStack
                            flex={1}
                            height={40}
                            rounded="$full"
                            items="center"
                            justify="center"
                            bg="$accent"
                            pressStyle={{ opacity: 0.85 }}
                            onPress={() => respondTo(i, 'CONFIRMED')}
                          >
                            <Text fontFamily="$semibold" fontSize={14} color="$onAccent">
                              Accept
                            </Text>
                          </XStack>
                        </XStack>
                      ) : null}
                    </YStack>
                  ) : null}
                </YStack>
              </YStack>
            );
          })}
        </ScrollView>

        {
          <XStack
            items="center"
            gap={8}
            px={16}
            pt={10}
            borderTopWidth={1}
            borderTopColor="$border"
            bg="$card"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <IconButton
              size={44}
              tone="accent"
              onPress={inviteToTrain}
              accessibilityLabel="Invite to train"
            >
              <Icon name="calendar" size={20} color={colors.accentText} />
            </IconButton>
            <YStack flex={1}>
              <Input
                placeholder="Message"
                value={note}
                onChangeText={setNote}
                returnKeyType="send"
                onSubmitEditing={sendText}
                style={{
                  borderRadius: 22,
                  height: 44,
                  backgroundColor: colors.surface,
                  borderWidth: 0,
                }}
              />
            </YStack>
            <IconButton
              tone={note.trim() ? 'solid' : 'accent'}
              size={44}
              onPress={sendText}
              accessibilityLabel="Send"
            >
              <Icon
                name="send"
                size={18}
                color={note.trim() ? colors.onAccent : colors.accentText}
              />
            </IconButton>
          </XStack>
        }
      </KeyboardAvoidingView>
    </YStack>
  );
}
