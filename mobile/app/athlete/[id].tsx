import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { Badge, Button } from '../../src/components/ui';
import { athleteById } from '../../src/data/mockData';
import { ATHLETE_ACTION_PHOTOS } from '../../src/data/photos';
import { colors } from '../../src/theme/tokens';

export default function AthleteDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const athlete = athleteById(Number(id));

  if (!athlete) {
    return (
      <YStack flex={1} bg="$ink">
        <Text color="$fog" text="center" mt={100}>
          Athlete not found.
        </Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg="$ink">
      <ScrollView flex={1} contentContainerStyle={{ pt: insets.top, pb: 24 }}>
        <YStack width="100%" height={400} bg="$ash" overflow="hidden">
          {/* The image box is taller than the window and anchored to
              its top, so the crop shows the top of the action shot —
              a portrait source keeps its subject's head instead of
              cover-centering and clipping it. */}
          <Image
            source={ATHLETE_ACTION_PHOTOS[athlete.slotId]}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Header sits on the photo, held up by an ink fade so the
              back button reads cleanly over the image. */}
          <YStack pointerEvents="none" position="absolute" t={0} l={0} r={0} height={150}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="heroTopFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.ink} stopOpacity={0.9} />
                  <Stop offset="1" stopColor={colors.ink} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroTopFade)" />
            </Svg>
          </YStack>
          <XStack position="absolute" l={20} r={20} t={8} items="center">
            <XStack
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.back()}
              pressStyle={{ opacity: 0.7 }}
              width={40}
              height={40}
              rounded={20}
              items="center"
              justify="center"
              bg="rgba(10,10,13,0.55)"
              borderWidth={1}
              borderColor="$lineHover"
            >
              <Icon name="chevron-left" size={14} color={colors.bone} />
            </XStack>
          </XStack>

          {/* Bottom fade dissolves the photo into the body — no hard
              dividing line between the hero and the profile info. */}
          <YStack pointerEvents="none" position="absolute" l={0} r={0} b={0} height={130}>
            <Svg width="100%" height="100%">
              <Defs>
                <LinearGradient id="heroBottomFade" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={colors.ink} stopOpacity={0} />
                  <Stop offset="1" stopColor={colors.ink} stopOpacity={1} />
                </LinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroBottomFade)" />
            </Svg>
          </YStack>
        </YStack>

        <YStack px={20} mt={-36}>
          <XStack items="baseline" gap={10}>
            <Text fontFamily="$display" fontSize={34} color="$bone" textTransform="uppercase" lineHeight={34}>
              {athlete.name}
            </Text>
            <Text fontFamily="$mono" fontSize={14} color="$fog">
              {athlete.age}
            </Text>
          </XStack>
          <XStack items="center" gap={8} mt={10}>
            <Icon name="shield-check" size={14} color={colors.ember} />
            <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$ember" textTransform="uppercase">
              Verified Athlete
            </Text>
            <Text fontFamily="$mono" fontSize={10} color="$fog">
              · {athlete.city}
            </Text>
          </XStack>
          <XStack gap={8} mt={16}>
            <Badge tone="accent">{athlete.discipline}</Badge>
            <Badge>{athlete.pace}</Badge>
          </XStack>

          <XStack gap={10} mt={18}>
            <StatCard value={String(athlete.weekly)} label="SESSIONS/WK" />
            <StatCard value={athlete.pace} label="AVG PACE" />
            <StatCard value="94%" label="PROFILE MATCH" />
          </XStack>

          <Text color="$fog" fontSize={13} lineHeight={20} mt={18}>
            {athlete.bio}
          </Text>
        </YStack>
      </ScrollView>

      <XStack
        gap={10}
        px={20}
        pt={16}
        borderTopWidth={1}
        borderTopColor="$line"
        bg="$ink"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Button
          style={{ flex: 1 }}
          onPress={() =>
            router.replace({ pathname: '/thread/[athleteId]', params: { athleteId: String(athlete.id) } })
          }
        >
          Message
        </Button>
        <Button
          variant="ghost"
          style={{ flex: 1, paddingHorizontal: 12 }}
          onPress={() =>
            router.replace({
              pathname: '/(tabs)/planner',
              params: { partnerId: String(athlete.id) },
            })
          }
        >
          Plan Session
        </Button>
      </XStack>
    </YStack>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <YStack flex={1} items="center" py={14} px={8} rounded={16} borderWidth={1} borderColor="$line" bg="$ash">
      <Text fontFamily="$display" fontSize={20} color="$bone" text="center">
        {value}
      </Text>
      <Text fontFamily="$mono" fontSize={9} color="$fog" letterSpacing={1} mt={4} text="center">
        {label}
      </Text>
    </YStack>
  );
}

const styles = {
  heroImage: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%' as const,
    height: 620,
  },
};