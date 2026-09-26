import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView as RNScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { Mascot } from '../../src/components/Mascot';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { JourneyLadder } from '../../src/components/Proof';
import { SafetySheet } from '../../src/components/SafetySheet';
import { Badge, IconButton, Input } from '../../src/components/ui';
import {
  ChatMessage,
  composerLock,
  messagesWith,
  sendMessage,
  updateMessage,
  isActiveMatch,
  useChat,
} from '../../src/data/chat';
import { athleteById, PlanStatus as CardStatus } from '../../src/data/mockData';
import { ATHLETE_PHOTOS, galleryFor } from '../../src/data/photos';
import {
  chatCardStatus,
  respondToChatPlan,
  sessionsTogether,
  stageWith,
  usePlans,
} from '../../src/data/plans';
import { useMe } from '../../src/data/session';
import { MATCH_TTL_DAYS, scamSignal, sharesContact } from '../../src/data/trust';
import { useNow } from '../../src/lib/useNow';
import { useSocial } from '../../src/data/social';
import { tapHaptic } from '../../src/lib/haptics';
import { useColors } from '../../src/theme/appearance';
import { formatLabel } from '../../src/theme/tokens';
import { keepPhoto } from '../../src/lib/photoStore';

// A conversation. Text, voice notes and photo replies; a like on a
// photo or prompt shows as a quote at the top of the thread. The
// calendar button turns chat into a session.

export default function ThreadScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { athleteId, draft } = useLocalSearchParams<{ athleteId: string; draft?: string }>();
  const athlete = athleteById(Number(athleteId));
  const me = useMe();
  const chat = useChat();
  const plansState = usePlans();
  const social = useSocial();
  const now = useNow();
  const [note, setNote] = useState(draft ?? '');
  const [recording, setRecording] = useState<number | null>(null); // seconds
  const [safety, setSafety] = useState(false);
  const scroll = useRef<RNScrollView>(null);

  const messages = athlete ? messagesWith(chat, athlete.id) : [];

  // Mock recorder: counts seconds while "recording".
  useEffect(() => {
    if (recording === null) return;
    const t = setInterval(() => setRecording((s) => (s === null ? s : Math.min(s + 1, 59))), 1000);
    return () => clearInterval(t);
  }, [recording === null]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const t = setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length]);

  if (!athlete) {
    return (
      <YStack flex={1} bg="$canvas">
        <Text color="$muted" text="center" mt={100}>
          Conversation not found.
        </Text>
      </YStack>
    );
  }

  const matched = isActiveMatch(athlete.id, social, chat, now);
  const stage = stageWith(plansState, athlete.id, matched);
  const together = sessionsTogether(plansState, athlete.id);
  const lock = !matched
    ? social.matches.includes(athlete.id) && !social.blocked.includes(athlete.id)
      ? `This match expired — nobody said hi within ${MATCH_TTL_DAYS} days.`
      : 'You can only message matches.'
    : composerLock(me, athlete.id, chat);
  const gallery = galleryFor(athlete.slotId);
  const inviteToTrain = () =>
    router.push({ pathname: '/invite/[athleteId]', params: { athleteId: String(athlete.id) } });

  const sendText = () => {
    if (!note.trim()) return;
    sendMessage(athlete.id, { from: 'me', text: note.trim() });
    setNote('');
  };

  const sendVoice = () => {
    const sec = Math.max(1, recording ?? 1);
    setRecording(null);
    sendMessage(athlete.id, { from: 'me', text: '', voiceSec: sec });
  };

  async function sendPhoto() {
    if (!athlete) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;
    sendMessage(athlete.id, { from: 'me', text: '', photoUri: keepPhoto(result.assets[0].uri) });
  }

  const respondTo = (index: number, status: 'CONFIRMED' | 'DECLINED') => {
    const plan = messages[index]?.plan;
    if (!plan) return;
    const planId = respondToChatPlan(athlete.id, plan, status === 'CONFIRMED');
    updateMessage(athlete.id, index, { plan: { ...plan, planId, status } });
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
        <IconButton
          size={40}
          onPress={() => setSafety(true)}
          accessibilityLabel={`Safety options for ${athlete.name}`}
          aria-label={`Safety options for ${athlete.name}`}
        >
          <Icon name="more" size={18} color={colors.text} />
        </IconButton>
      </XStack>

      <YStack px={20} py={12} bg="$card" borderBottomWidth={1} borderBottomColor="$border">
        <JourneyLadder stage={stage ?? 'match'} sessions={together} compact />
      </YStack>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scroll as never}
          flex={1}
          contentContainerStyle={{ p: 20, gap: 10, pb: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <YStack items="center" gap={10} py={30}>
              <Mascot size={90} mood={lock ? 'thinking' : 'excited'} />
              <Text fontSize={15} color="$muted" text="center" maxW={280}>
                {lock ? lock : `You matched with ${athlete.name}! Say hi or invite them to train.`}
              </Text>
            </YStack>
          ) : null}
          {messages.map((m, i) => (
            <Bubble
              key={i}
              m={m}
              likedSource={m.like?.kind === 'photo' ? gallery[m.like.index]?.source : undefined}
              planStatus={m.plan ? chatCardStatus(plansState, m.plan) : undefined}
              onRespond={(s) => respondTo(i, s)}
              onReport={() => setSafety(true)}
            />
          ))}
        </ScrollView>

        {lock ? (
          <XStack
            items="center"
            gap={12}
            px={20}
            pt={14}
            borderTopWidth={1}
            borderTopColor="$border"
            bg="$card"
            style={{ paddingBottom: insets.bottom + 14 }}
          >
            <Icon name="lock" size={18} color={colors.muted} />
            <Text flex={1} fontSize={14} color="$muted">
              {lock}
            </Text>
          </XStack>
        ) : recording !== null ? (
          <XStack
            items="center"
            gap={10}
            px={16}
            pt={10}
            borderTopWidth={1}
            borderTopColor="$border"
            bg="$card"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            <IconButton size={44} onPress={() => setRecording(null)} accessibilityLabel="Cancel">
              <Icon name="trash" size={18} color={colors.text} />
            </IconButton>
            <XStack
              flex={1}
              height={44}
              rounded={22}
              bg="$accentSoft"
              items="center"
              px={16}
              gap={10}
            >
              <YStack
                width={10}
                height={10}
                rounded={5}
                style={{ backgroundColor: colors.danger }}
              />
              <Text fontFamily="$semibold" fontSize={15} color="$text">
                Recording 0:{String(recording).padStart(2, '0')}
              </Text>
            </XStack>
            <IconButton
              tone="solid"
              size={44}
              onPress={sendVoice}
              accessibilityLabel="Send voice note"
            >
              <Icon name="send" size={18} color={colors.onAccent} />
            </IconButton>
          </XStack>
        ) : (
          <YStack bg="$card">
            {sharesContact(note) ? (
              <XStack items="center" gap={8} px={20} pt={10}>
                <Icon name="shield-check" size={15} color={colors.accentText} />
                <Text flex={1} fontSize={13} color="$muted">
                  Keep chatting on Pace until you’ve trained together.
                </Text>
              </XStack>
            ) : null}
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
              <IconButton size={44} onPress={sendPhoto} accessibilityLabel="Send a photo">
                <Icon name="image" size={19} color={colors.text} />
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
              {note.trim() ? (
                <IconButton tone="solid" size={44} onPress={sendText} accessibilityLabel="Send">
                  <Icon name="send" size={18} color={colors.onAccent} />
                </IconButton>
              ) : (
                <IconButton
                  tone="accent"
                  size={44}
                  onPress={() => {
                    tapHaptic();
                    setRecording(0);
                  }}
                  accessibilityLabel="Record a voice note"
                  aria-label="Record a voice note"
                >
                  <Icon name="mic" size={19} color={colors.accentText} />
                </IconButton>
              )}
            </XStack>
          </YStack>
        )}
      </KeyboardAvoidingView>

      <SafetySheet
        athlete={athlete}
        visible={safety}
        matched={matched}
        onClose={() => setSafety(false)}
        onDone={() => router.back()}
      />
    </YStack>
  );
}

function Bubble({
  m,
  likedSource,
  planStatus,
  onRespond,
  onReport,
}: {
  m: ChatMessage;
  likedSource?: number;
  planStatus?: CardStatus;
  onRespond: (s: 'CONFIRMED' | 'DECLINED') => void;
  onReport: () => void;
}) {
  const colors = useColors();
  const mine = m.from === 'me';
  const signal = mine ? null : scamSignal(m.text);
  const plan = m.plan ? { ...m.plan, status: planStatus ?? m.plan.status } : undefined;
  return (
    <YStack items={mine ? 'flex-end' : 'flex-start'} gap={6}>
      {m.like ? (
        <XStack maxW="80%" items="center" gap={10} p={8} pr={14} rounded={16} bg="$surface">
          {likedSource ? (
            <Image source={likedSource} style={{ width: 40, height: 52, borderRadius: 10 }} />
          ) : (
            <XStack
              width={40}
              height={52}
              rounded={10}
              bg="$accentSoft"
              items="center"
              justify="center"
            >
              <Icon name="heart" size={16} color={colors.accentText} filled />
            </XStack>
          )}
          <YStack flex={1}>
            <Text fontFamily="$semibold" fontSize={12} color="$muted">
              {mine ? 'You liked' : 'Liked your'} {m.like.kind === 'photo' ? 'photo' : 'answer'}
            </Text>
            <Text fontFamily="$semibold" fontSize={14} color="$text" numberOfLines={2}>
              {m.like.kind === 'prompt' ? `“${m.like.text}”` : m.like.label}
            </Text>
          </YStack>
        </XStack>
      ) : null}

      {m.photoUri ? (
        <Image
          source={{ uri: m.photoUri }}
          style={{ width: 220, height: 280, borderRadius: 20 }}
          resizeMode="cover"
        />
      ) : null}

      {m.voiceSec ? <VoiceNote sec={m.voiceSec} mine={mine} /> : null}

      {m.text || plan ? (
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
                    onPress={() => onRespond('DECLINED')}
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
                    onPress={() => onRespond('CONFIRMED')}
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
      ) : null}

      {signal ? (
        <XStack
          maxW="88%"
          items="flex-start"
          gap={10}
          p={12}
          rounded={16}
          borderWidth={1}
          borderColor="$accentBorder"
          bg="$accentSoft"
        >
          <Mascot size={36} mood="thinking" />
          <YStack flex={1} gap={6}>
            <Text fontFamily="$semibold" fontSize={14} lineHeight={19} color="$text">
              {signal === 'money'
                ? 'Heads up: never send money, crypto or gift cards to someone you haven’t met. Real athletes don’t ask.'
                : 'Keep chatting on Pace until you’ve trained together. Moving to another app early is a common scam tactic.'}
            </Text>
            <Text
              fontFamily="$semibold"
              fontSize={13}
              color="$accentText"
              onPress={onReport}
              accessibilityRole="button"
            >
              Report this
            </Text>
          </YStack>
        </XStack>
      ) : null}
    </YStack>
  );
}

// Waveform bubble. Playback is simulated until real audio is wired up.
const BARS = [6, 12, 18, 10, 22, 14, 8, 16, 24, 12, 18, 9, 14, 20, 11, 7, 15, 10];

function VoiceNote({ sec, mine }: { sec: number; mine: boolean }) {
  const colors = useColors();
  const [pos, setPos] = useState<number | null>(null);
  useEffect(() => {
    if (pos === null) return;
    const t = setTimeout(() => setPos((p) => (p === null || p + 1 >= sec ? null : p + 1)), 1000);
    return () => clearTimeout(t);
  }, [pos, sec]);
  const fg = mine ? colors.onAccent : colors.accentText;
  const progress = pos === null ? 0 : pos / sec;
  return (
    <XStack
      items="center"
      gap={10}
      px={12}
      py={10}
      rounded={22}
      bg={mine ? '$accent' : '$card'}
      borderWidth={mine ? 0 : 1}
      borderColor="$border"
    >
      <XStack
        accessibilityRole="button"
        accessibilityLabel={pos === null ? 'Play voice note' : 'Pause voice note'}
        aria-label={pos === null ? 'Play voice note' : 'Pause voice note'}
        onPress={() => setPos(pos === null ? 0 : null)}
        width={34}
        height={34}
        rounded={17}
        items="center"
        justify="center"
        style={{ backgroundColor: mine ? 'rgba(255,255,255,0.22)' : colors.accentSoft }}
      >
        <Icon name={pos === null ? 'play' : 'pause'} size={15} color={fg} />
      </XStack>
      <XStack items="center" gap={2.5}>
        {BARS.map((h, k) => (
          <YStack
            key={k}
            width={3}
            height={h}
            rounded={2}
            style={{
              backgroundColor: fg,
              opacity: k / BARS.length <= progress ? 1 : 0.45,
            }}
          />
        ))}
      </XStack>
      <Text fontFamily="$semibold" fontSize={13} color={mine ? '$onAccent' : '$text'}>
        0:{String(pos ?? sec).padStart(2, '0')}
      </Text>
    </XStack>
  );
}
