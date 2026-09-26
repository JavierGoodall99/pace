import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageSourcePropType, KeyboardAvoidingView, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { showPip } from './PipKit';
import { Button, Input } from './ui';
import { LikeTarget, likesLeftToday, sendLike, useChat } from '../data/chat';
import { useMe } from '../data/session';
import { LIKES_PER_DAY } from '../data/trust';
import type { Athlete } from '../data/mockData';
import { successHaptic } from '../lib/haptics';
import { useColors } from '../theme/appearance';

// Like a specific photo or prompt, with an optional comment. If it's
// mutual you match: your comment opens the chat and you can invite each
// other to train. Invites aren't offered here; they need a match first.

const QUICK: Record<LikeTarget['kind'], string[]> = {
  photo: ['That view though', 'Okay, strong', 'Teach me your ways'],
  prompt: ['Same!', 'Tell me more', 'We need to train'],
};

export function LikeSheet({
  athlete,
  target,
  source,
  onMatch,
  onClose,
}: {
  athlete: Athlete;
  target: LikeTarget | null;
  source?: ImageSourcePropType;
  // Where to go on a match; defaults to the match screen.
  onMatch?: (athleteId: number) => void;
  onClose: () => void;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState('');
  const me = useMe();
  const left = likesLeftToday(useChat());

  function send() {
    if (!target || left <= 0 || !me.verified) return;
    successHaptic();
    const result = sendLike(athlete.id, target, comment, {
      onMatch: (id) => {
        showPip(`It’s mutual! ${athlete.name} liked you back.`, 'excited');
        if (onMatch) onMatch(id);
        else router.push({ pathname: '/match/[athleteId]', params: { athleteId: String(id) } });
      },
    });
    if (result === 'sent') {
      showPip(
        comment.trim()
          ? 'Comment sent!'
          : `Like sent! I’ll tell you if ${athlete.name} likes you back.`,
        'wink'
      );
    }
    setComment('');
    onClose();
  }

  return (
    <Modal visible={!!target} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <YStack flex={1} justify="flex-end" bg="$scrim">
          <YStack flex={1} onPress={onClose} accessibilityLabel="Close" />
          <YStack
            bg="$card"
            px={20}
            pt={12}
            gap={16}
            style={{
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <YStack self="center" width={40} height={5} rounded={3} bg="$borderStrong" />
            {target ? (
              <>
                <XStack gap={12} items="center">
                  {target.kind === 'photo' && source ? (
                    <Image
                      source={source}
                      style={{ width: 64, height: 84, borderRadius: 14 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <YStack
                      width={64}
                      height={84}
                      rounded={14}
                      bg="$accentSoft"
                      items="center"
                      justify="center"
                    >
                      <Icon name="message-circle" size={24} color={c.accentText} />
                    </YStack>
                  )}
                  <YStack flex={1} gap={4}>
                    <Text fontFamily="$semibold" fontSize={13} color="$muted">
                      {target.kind === 'photo' ? 'Liking their photo' : 'Liking their answer'}
                    </Text>
                    <Text fontFamily="$bold" fontSize={17} color="$text" numberOfLines={2}>
                      {target.kind === 'prompt' ? target.text : target.label}
                    </Text>
                    {target.kind === 'prompt' ? (
                      <Text fontFamily="$body" fontSize={13} color="$muted" numberOfLines={1}>
                        {target.label}
                      </Text>
                    ) : null}
                  </YStack>
                </XStack>

                <YStack gap={10}>
                  <Input
                    placeholder={`Add a comment for ${athlete.name} (optional)`}
                    value={comment}
                    onChangeText={(v) => setComment(v.slice(0, 140))}
                  />
                  <XStack gap={8} flexWrap="wrap">
                    {QUICK[target.kind].map((q) => (
                      <XStack
                        key={q}
                        accessibilityRole="button"
                        onPress={() => setComment(q)}
                        height={34}
                        px={12}
                        rounded="$full"
                        items="center"
                        bg="$surface"
                      >
                        <Text fontFamily="$semibold" fontSize={13} color="$text">
                          {q}
                        </Text>
                      </XStack>
                    ))}
                  </XStack>
                </YStack>

                <YStack gap={8}>
                  {!me.verified ? (
                    <Button
                      icon="shield-check"
                      onPress={() => {
                        onClose();
                        router.push('/verify');
                      }}
                      style={{ width: '100%' }}
                    >
                      Do the selfie check to like
                    </Button>
                  ) : (
                    <Button
                      icon="heart"
                      disabled={left <= 0}
                      onPress={send}
                      style={{ width: '100%' }}
                    >
                      {left <= 0
                        ? 'No likes left today'
                        : comment.trim()
                          ? 'Send like with comment'
                          : 'Send like'}
                    </Button>
                  )}
                  <Text fontFamily="$body" fontSize={12} color="$muted" text="center">
                    {!me.verified
                      ? 'Liking needs a live selfie check.'
                      : left <= 0
                        ? 'Likes reset at midnight.'
                        : `${left} of ${LIKES_PER_DAY} likes left today`}
                  </Text>
                </YStack>
              </>
            ) : null}
          </YStack>
        </YStack>
      </KeyboardAvoidingView>
    </Modal>
  );
}
