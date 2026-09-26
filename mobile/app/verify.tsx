import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack } from 'tamagui';
import { FaceScanner, scannerSupported, useScannerPermission } from '../src/components/FaceScanner';
import { Icon } from '../src/components/Icon';
import { Button, ProgressBar, ScreenHeader } from '../src/components/ui';
import {
  type FaceReading,
  instruction,
  type LivenessState,
  progressPct,
  startLiveness,
  stepLiveness,
} from '../src/data/liveness';
import { updateMe, useMe } from '../src/data/session';
import { successHaptic, tapHaptic } from '../src/lib/haptics';
import { useColors } from '../src/theme/appearance';

// Selfie liveness check: the front camera streams face readings into
// src/data/liveness.ts, which walks the person through a random order of
// blink / smile / look both ways. Passing sets `verified` on the profile.
export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const permission = useScannerPermission();
  const [done, setDone] = useState(me.verified);
  const [liveness, setLiveness] = useState<LivenessState>(() => startLiveness(Date.now()));
  const [cameraError, setCameraError] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const livenessRef = useRef(liveness);

  const { hasPermission, canRequestPermission, requestPermission } = permission;
  useEffect(() => {
    if (!done && !hasPermission && canRequestPermission) requestPermission();
  }, [done, hasPermission, canRequestPermission, requestPermission]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => setForeground(s === 'active'));
    return () => sub.remove();
  }, []);

  const onFaces = useCallback((faces: FaceReading[]) => {
    const prev = livenessRef.current;
    const next = stepLiveness(prev, faces, Date.now());
    if (next === prev) return;
    livenessRef.current = next;
    setLiveness(next);
    if (next.index > prev.index) tapHaptic();
    if (next.status === 'passed') {
      successHaptic();
      updateMe({ verified: true }).then(() => setDone(true));
    }
  }, []);

  const onError = useCallback(() => setCameraError(true), []);

  const retry = () => {
    const fresh = startLiveness(Date.now());
    livenessRef.current = fresh;
    setLiveness(fresh);
    setCameraError(false);
  };

  const scanning = !done && scannerSupported && hasPermission && !cameraError;
  const blocked = !done && !scanning;
  const failed = liveness.status === 'failed';

  let title: string;
  let body: string;
  if (done) {
    title = "You're verified";
    body = 'Your card now has the verified badge.';
  } else if (!scannerSupported) {
    title = 'Verify on your phone';
    body = 'Open Pace on your phone to finish.';
  } else if (cameraError) {
    title = 'Camera didn’t start';
    body = 'Close other camera apps and try again.';
  } else if (!hasPermission) {
    title = 'Camera access needed';
    body = canRequestPermission
      ? 'A few seconds. Nothing is saved.'
      : 'Turn on camera access for Pace in Settings.';
  } else {
    title = instruction(liveness);
    body = failed ? 'Find good light and try again.' : 'Follow the prompts. Nothing is saved.';
  }

  const ringColor = done ? colors.success : failed ? colors.muted : colors.accent;

  return (
    <YStack flex={1} bg="$canvas" style={{ paddingBottom: insets.bottom + 20 }}>
      <ScreenHeader title="Verify it’s *you*" onBack={() => router.back()} />

      <YStack flex={1} justify="center" items="center" gap={24} px={20}>
        <YStack
          width={260}
          height={260}
          rounded={130}
          bg={done ? '$successSoft' : '$surface'}
          borderWidth={4}
          style={{ borderColor: ringColor }}
          items="center"
          justify="center"
          overflow="hidden"
        >
          {scanning ? (
            <FaceScanner
              active={foreground && liveness.status === 'running'}
              onFaces={onFaces}
              onError={onError}
            />
          ) : (
            <Icon
              name={done ? 'shield-check' : blocked ? 'camera' : 'user'}
              size={72}
              color={done ? colors.success : colors.muted}
              strokeWidth={1.5}
            />
          )}
        </YStack>

        {scanning && !failed ? (
          <YStack width={200}>
            <ProgressBar pct={progressPct(liveness)} />
          </YStack>
        ) : null}

        <YStack items="center" gap={8} px={10}>
          <Text fontFamily="$bold" fontSize={24} lineHeight={30} color="$text" text="center">
            {title}
          </Text>
          <Text color="$muted" fontSize={16} lineHeight={24} text="center">
            {body}
          </Text>
        </YStack>

        {done ? (
          <Button
            style={{ width: '100%' }}
            onPress={() => {
              if (router.canGoBack()) router.back();
              else router.replace('/onboarding');
            }}
          >
            Done
          </Button>
        ) : failed || cameraError ? (
          <Button style={{ width: '100%' }} icon="rotate-ccw" onPress={retry}>
            Try again
          </Button>
        ) : scannerSupported && !hasPermission ? (
          <Button
            style={{ width: '100%' }}
            icon="camera"
            onPress={() => (canRequestPermission ? requestPermission() : Linking.openSettings())}
          >
            {canRequestPermission ? 'Allow camera' : 'Open Settings'}
          </Button>
        ) : scanning ? (
          <Text fontFamily="$medium" fontSize={14} color="$muted">
            Takes about 10 seconds
          </Text>
        ) : null}
      </YStack>
    </YStack>
  );
}
