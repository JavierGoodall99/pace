import React, { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, XStack, YStack } from 'tamagui';
import { Icon, IconName } from './Icon';
import { showPip } from './PipKit';
import { Button, Input } from './ui';
import type { Athlete } from '../data/mockData';
import { block, report, REPORT_REASONS, unmatch } from '../data/safety';
import type { ReportReason } from '../data/social';
import { tapHaptic } from '../lib/haptics';
import { useColors } from '../theme/appearance';

// One sheet for every safety action on a person: unmatch, block, report.
// Reporting always blocks too. Works the same on web (no Alert dialogs).

type Mode = 'menu' | 'report' | 'confirm-block' | 'confirm-unmatch';

export function SafetySheet({
  athlete,
  visible,
  matched,
  onClose,
  onDone,
}: {
  athlete: Athlete;
  visible: boolean;
  matched: boolean;
  onClose: () => void;
  // Called after unmatch/block/report, e.g. to leave the screen.
  onDone: () => void;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('menu');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [detail, setDetail] = useState('');

  function close() {
    setMode('menu');
    setReason(null);
    setDetail('');
    onClose();
  }

  async function finish(kind: 'unmatch' | 'block' | 'report') {
    if (kind === 'unmatch') await unmatch(athlete.id);
    if (kind === 'block') await block(athlete.id);
    if (kind === 'report' && reason) await report(athlete.id, reason, detail);
    showPip(
      kind === 'report'
        ? 'Thanks for telling us. Our team reviews every report within 24 hours.'
        : kind === 'block'
          ? `${athlete.name} is blocked. They won’t see you anywhere on Pace.`
          : `Unmatched with ${athlete.name}. The chat and any plans are gone.`,
      'thinking'
    );
    close();
    onDone();
  }

  const row = (
    icon: IconName,
    label: string,
    hint: string,
    onPress: () => void,
    danger = false
  ) => (
    <XStack
      key={label}
      accessibilityRole="button"
      onPress={() => {
        tapHaptic();
        onPress();
      }}
      items="center"
      gap={14}
      py={14}
      borderBottomWidth={1}
      borderBottomColor="$border"
    >
      <XStack width={40} height={40} rounded={20} items="center" justify="center" bg="$surface">
        <Icon name={icon} size={18} color={danger ? c.danger : c.text} />
      </XStack>
      <YStack flex={1}>
        <Text
          fontFamily="$semibold"
          fontSize={16}
          color="$text"
          style={danger ? { color: c.danger } : undefined}
        >
          {label}
        </Text>
        <Text fontFamily="$body" fontSize={13} color="$muted">
          {hint}
        </Text>
      </YStack>
    </XStack>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <YStack flex={1} justify="flex-end" bg="$scrim">
          <YStack flex={1} onPress={close} accessibilityLabel="Close" />
          <YStack
            bg="$card"
            px={20}
            pt={12}
            gap={8}
            style={{
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <YStack self="center" width={40} height={5} rounded={3} bg="$borderStrong" mb={6} />

            {mode === 'menu' ? (
              <>
                <Text fontFamily="$bold" fontSize={18} color="$text">
                  {athlete.name}
                </Text>
                {matched
                  ? row('x', 'Unmatch', 'Remove the match, chat and plans', () =>
                      setMode('confirm-unmatch')
                    )
                  : null}
                {row('ban', 'Block', 'They won’t see you or message you again', () =>
                  setMode('confirm-block')
                )}
                {row(
                  'flag',
                  'Report',
                  'Fake profile, harassment or feeling unsafe',
                  () => setMode('report'),
                  true
                )}
                <Button variant="ghost" onPress={close} style={{ width: '100%', marginTop: 8 }}>
                  Cancel
                </Button>
              </>
            ) : null}

            {mode === 'confirm-block' || mode === 'confirm-unmatch' ? (
              <YStack gap={14}>
                <Text fontFamily="$bold" fontSize={20} color="$text">
                  {mode === 'confirm-block' ? `Block ${athlete.name}?` : `Unmatch ${athlete.name}?`}
                </Text>
                <Text fontFamily="$body" fontSize={15} lineHeight={22} color="$muted">
                  {mode === 'confirm-block'
                    ? 'They can’t see or message you. They aren’t told.'
                    : 'Your chat and plans are removed. They aren’t told.'}
                </Text>
                <Button
                  onPress={() => finish(mode === 'confirm-block' ? 'block' : 'unmatch')}
                  style={{ width: '100%', backgroundColor: c.danger }}
                >
                  {mode === 'confirm-block' ? 'Block' : 'Unmatch'}
                </Button>
                <Button variant="ghost" onPress={() => setMode('menu')} style={{ width: '100%' }}>
                  Back
                </Button>
              </YStack>
            ) : null}

            {mode === 'report' ? (
              <YStack gap={10}>
                <Text fontFamily="$bold" fontSize={20} color="$text">
                  What’s going on?
                </Text>
                <Text fontFamily="$body" fontSize={14} color="$muted">
                  {athlete.name} won’t know you reported them. We’ll also block them for you.
                </Text>
                <YStack gap={8}>
                  {REPORT_REASONS.map((r) => {
                    const on = reason === r.id;
                    return (
                      <XStack
                        key={r.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        onPress={() => setReason(r.id)}
                        items="center"
                        gap={12}
                        px={14}
                        py={10}
                        rounded={16}
                        borderWidth={on ? 2 : 1}
                        borderColor={on ? '$accent' : '$border'}
                        bg={on ? '$accentSoft' : '$card'}
                      >
                        <YStack flex={1}>
                          <Text fontFamily="$semibold" fontSize={15} color="$text">
                            {r.label}
                          </Text>
                          <Text fontFamily="$body" fontSize={12} color="$muted">
                            {r.detail}
                          </Text>
                        </YStack>
                        {on ? (
                          <Icon name="check" size={18} color={c.accentText} strokeWidth={2.6} />
                        ) : null}
                      </XStack>
                    );
                  })}
                </YStack>
                {reason ? (
                  <Input
                    placeholder="Anything else we should know? (optional)"
                    value={detail}
                    onChangeText={setDetail}
                  />
                ) : null}
                <Button
                  icon="flag"
                  disabled={!reason}
                  onPress={() => finish('report')}
                  style={{ width: '100%' }}
                >
                  Report and block
                </Button>
                <Button variant="ghost" onPress={() => setMode('menu')} style={{ width: '100%' }}>
                  Back
                </Button>
              </YStack>
            ) : null}
          </YStack>
        </YStack>
      </KeyboardAvoidingView>
    </Modal>
  );
}
