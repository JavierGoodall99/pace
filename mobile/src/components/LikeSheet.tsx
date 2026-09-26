import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, ImageSourcePropType, KeyboardAvoidingView, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { showPip } from './PipKit';
import { Button, Input } from './ui';
import { LikeTarget, sendLike } from '../data/chat';
import type { Athlete } from '../data/mockData';
import { dropAction } from '../data/plans';
import { successHaptic } from '../lib/haptics';
import { useColors } from '../theme/appearance';

// Like a specific photo or prompt, with an optional comment. Lighter
// than an invite to train — if it's mutual, your comment opens the chat.

const QUICK: Record<LikeTarget['kind'], string[]> = {
  photo: ['That view though', 'Okay, strong', 'Teach me your ways'],
  prompt: ['Same!', 'Tell me more', 'We need to train'],
};

export function LikeSheet({
  athlete,
  target,
  source,
  fromDrop,
  onClose,
}: {
  athlete: Athlete;
  target: LikeTarget | null;
  source?: ImageSourcePropType;
  fromDrop?: boolean;
  onClose: () => void;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState('');

  function send() {
    if (!target) return;
    successHaptic();
    sendLike(athlete.id, target, comment, {
      onMatch: (id) => {
        showPip(`It’s mutual! ${athlete.name} liked you back.`, 'excited');
        router.push({ pathname: '/thread/[athleteId]', params: { athleteId: String(id) } });
      },
    });
    if (fromDrop) dropAction(athlete.id, 'liked');
    showPip(
      comment.trim()
        ? `Comment sent! ${athlete.name} sees exactly what caught your eye.`
        : `Like sent! I’ll tell you if ${athlete.name} likes you back.`,
      'wink'
    );
    setComment('');
    onClose();
  }

  function invite() {
    onClose();
    router.push({
      pathname: '/invite/[athleteId]',
      params: { athleteId: String(athlete.id), fromDrop: fromDrop ? '1' : undefined },
    });
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
                  <Button icon="heart" onPress={send} style={{ width: '100%' }}>
                    {comment.trim() ? 'Send like with comment' : 'Send like'}
                  </Button>
                  <Button variant="ghost" icon="send" onPress={invite} style={{ width: '100%' }}>
                    Invite to train instead
                  </Button>
                </YStack>
              </>
            ) : null}
          </YStack>
        </YStack>
      </KeyboardAvoidingView>
    </Modal>
  );
}
