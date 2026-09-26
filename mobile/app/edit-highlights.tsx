import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../src/components/Icon';
import {
  Button,
  Callout,
  Card,
  Chip,
  Input,
  ScreenHeader,
  SectionTitle,
} from '../src/components/ui';
import { CT_SPOTS } from '../src/data/capeTown';
import { addRoute, MAX_PBS, MAX_ROUTES, pbPresetsFor, upsertPb } from '../src/data/highlights';
import { updateMe, useMe } from '../src/data/session';
import { hasSync, PROVIDER_LABEL, providerList } from '../src/data/sync';
import { tapHaptic } from '../src/lib/haptics';
import { useColors } from '../src/theme/appearance';

// Personal bests and favourite routes: the proof-of-effort bits of your
// card. Changes save straight away.
export default function EditHighlightsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();

  const [pbLabel, setPbLabel] = useState('');
  const [pbValue, setPbValue] = useState('');
  const [pbError, setPbError] = useState<string | null>(null);
  const [routeName, setRouteName] = useState('');
  const [routeDetail, setRouteDetail] = useState('');
  const [routeError, setRouteError] = useState<string | null>(null);

  const presets = pbPresetsFor(me.disciplines).filter(
    (l) => !me.pbs.some((p) => p.label.toLowerCase() === l.toLowerCase())
  );
  const spotSuggestions = CT_SPOTS.filter(
    (s) => me.disciplines.length === 0 || s.sports.some((x) => me.disciplines.includes(x))
  )
    .map((s) => s.name)
    .filter((n) => !me.routes.some((r) => r.name === n))
    .slice(0, 6);

  function savePb() {
    const res = upsertPb(me.pbs, pbLabel, pbValue);
    if (!res.ok) return setPbError(res.error);
    tapHaptic();
    updateMe({ pbs: res.value });
    setPbLabel('');
    setPbValue('');
    setPbError(null);
  }

  function saveRoute() {
    const res = addRoute(me.routes, routeName, routeDetail);
    if (!res.ok) return setRouteError(res.error);
    tapHaptic();
    updateMe({ routes: res.value });
    setRouteName('');
    setRouteDetail('');
    setRouteError(null);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} bg="$canvas">
        <ScreenHeader title="PBs & *routes*" onBack={() => router.back()} />
        <ScrollView
          flex={1}
          contentContainerStyle={{ p: 20, gap: 28, pb: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack gap={12}>
            <SectionTitle hint={`${me.pbs.length} of ${MAX_PBS}`}>Personal bests</SectionTitle>
            {me.pbs.length ? (
              <Card>
                {me.pbs.map((pb, i) => (
                  <XStack
                    key={pb.label}
                    items="center"
                    gap={12}
                    py={12}
                    borderBottomWidth={i === me.pbs.length - 1 ? 0 : 1}
                    borderBottomColor="$border"
                  >
                    <YStack
                      flex={1}
                      onPress={() => {
                        setPbLabel(pb.label);
                        setPbValue(pb.value);
                      }}
                      accessibilityRole="button"
                      aria-label={`Edit ${pb.label}`}
                    >
                      <Text fontFamily="$semibold" fontSize={16} color="$text">
                        {pb.value}
                      </Text>
                      <Text fontSize={13} color="$muted">
                        {pb.label}
                        {pb.source ? ` · Verified by ${PROVIDER_LABEL[pb.source]}` : ''}
                      </Text>
                    </YStack>
                    <RemoveButton
                      label={`Remove ${pb.label}`}
                      onPress={() => updateMe({ pbs: me.pbs.filter((_, k) => k !== i) })}
                    />
                  </XStack>
                ))}
              </Card>
            ) : null}

            {presets.length ? (
              <XStack flexWrap="wrap" gap={8}>
                {presets.map((l) => (
                  <Chip key={l} label={l} selected={pbLabel === l} onPress={() => setPbLabel(l)} />
                ))}
              </XStack>
            ) : null}
            <XStack gap={10}>
              <YStack flex={1.3}>
                <Input placeholder="PB, e.g. 10 km" value={pbLabel} onChangeText={setPbLabel} />
              </YStack>
              <YStack flex={1}>
                <Input
                  placeholder="44:12 / 105 kg"
                  value={pbValue}
                  onChangeText={setPbValue}
                  returnKeyType="done"
                  onSubmitEditing={savePb}
                />
              </YStack>
            </XStack>
            {pbError ? <ErrorText>{pbError}</ErrorText> : null}
            <Button variant="secondary" icon="plus" onPress={savePb} style={{ width: '100%' }}>
              {me.pbs.some((p) => p.label.toLowerCase() === pbLabel.trim().toLowerCase())
                ? 'Update PB'
                : 'Add PB'}
            </Button>
            <Text fontSize={12} color="$muted">
              {hasSync(me)
                ? 'PBs you type in show without a verified badge. Editing a synced PB removes its badge.'
                : `Connect ${providerList()} to get a “verified” badge on synced PBs.`}
            </Text>
          </YStack>

          <YStack gap={12}>
            <SectionTitle hint={`${me.routes.length} of ${MAX_ROUTES}`}>
              Favourite routes
            </SectionTitle>
            {me.routes.length ? (
              <Card>
                {me.routes.map((r, i) => (
                  <XStack
                    key={r.name}
                    items="center"
                    gap={12}
                    py={12}
                    borderBottomWidth={i === me.routes.length - 1 ? 0 : 1}
                    borderBottomColor="$border"
                  >
                    <XStack
                      width={38}
                      height={38}
                      rounded={12}
                      bg="$surface"
                      items="center"
                      justify="center"
                    >
                      <Icon name="map" size={18} color={colors.accentText} />
                    </XStack>
                    <YStack flex={1}>
                      <Text fontFamily="$semibold" fontSize={15} color="$text">
                        {r.name}
                      </Text>
                      {r.detail ? (
                        <Text fontSize={13} color="$muted">
                          {r.detail}
                        </Text>
                      ) : null}
                    </YStack>
                    <RemoveButton
                      label={`Remove ${r.name}`}
                      onPress={() => updateMe({ routes: me.routes.filter((_, k) => k !== i) })}
                    />
                  </XStack>
                ))}
              </Card>
            ) : null}

            {spotSuggestions.length ? (
              <XStack flexWrap="wrap" gap={8}>
                {spotSuggestions.map((n) => (
                  <Chip
                    key={n}
                    label={n}
                    selected={routeName === n}
                    onPress={() => setRouteName(n)}
                  />
                ))}
              </XStack>
            ) : null}
            <Input placeholder="Route name" value={routeName} onChangeText={setRouteName} />
            <Input
              placeholder="Details, e.g. 10 km · flat (optional)"
              value={routeDetail}
              onChangeText={setRouteDetail}
              returnKeyType="done"
              onSubmitEditing={saveRoute}
            />
            {routeError ? <ErrorText>{routeError}</ErrorText> : null}
            <Button variant="secondary" icon="plus" onPress={saveRoute} style={{ width: '100%' }}>
              Add route
            </Button>
          </YStack>

          <Callout icon="sparkles">Matches see these on your card.</Callout>
        </ScrollView>
      </YStack>
    </KeyboardAvoidingView>
  );
}

function RemoveButton({ label, onPress }: { label: string; onPress: () => void }) {
  const colors = useColors();
  return (
    <XStack
      accessibilityRole="button"
      aria-label={label}
      accessibilityLabel={label}
      onPress={onPress}
      width={36}
      height={36}
      rounded={18}
      items="center"
      justify="center"
      bg="$surface"
      pressStyle={{ opacity: 0.7 }}
    >
      <Icon name="x" size={16} color={colors.muted} />
    </XStack>
  );
}

function ErrorText({ children }: { children: string }) {
  return (
    <Text fontFamily="$medium" fontSize={13} color="$accentText">
      {children}
    </Text>
  );
}
