import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { buildConfettiPieces, Confetti } from '../../src/components/Confetti';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Button } from '../../src/components/ui';
import { athleteById } from '../../src/data/mockData';
import { ATHLETE_PHOTOS, ME_AVATAR } from '../../src/data/photos';
import { colors, fonts } from '../../src/theme/tokens';

// Ported from the "MATCH CELEBRATION OVERLAY" in `../../Pace App.dc.html`
// — shown when a swipe-right lands on a mutual-interest athlete (see
// MATCH_IDS in discover.tsx).
const CONFETTI_COLORS = [colors.ember, colors.flare, colors.bone, colors.mint];
const CONFETTI_PIECES = buildConfettiPieces(
  Array.from({ length: 12 }, (_, i) => CONFETTI_COLORS[i % CONFETTI_COLORS.length]),
  { leftStep: 31, durationBase: 1.8, durationStep: 0.3, delayStep: 0.1 }
);

export default function MatchScreen() {
  const router = useRouter();
  const { athleteId } = useLocalSearchParams<{ athleteId: string }>();
  const athlete = athleteById(Number(athleteId));

  if (!athlete) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>Match not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.glow} pointerEvents="none" />
      <Confetti pieces={CONFETTI_PIECES} fallDistance={420} />

      <View style={styles.avatars}>
        <View style={[styles.ring, styles.avatarLeft]}>
          <PhotoSlot label="You" shape="circle" source={ME_AVATAR} style={styles.avatar} />
        </View>
        <View style={[styles.ring, styles.avatarRight]}>
          <PhotoSlot
            label={athlete.name}
            shape="circle"
            source={ATHLETE_PHOTOS[athlete.slotId]}
            style={styles.avatar}
          />
        </View>
      </View>

      <Text style={styles.eyebrow}>MUTUAL INTEREST</Text>
      <Text style={styles.title}>It&apos;s a Match!</Text>
      <Text style={styles.body}>
        You and {athlete.name} are both training for something. Say hi before the pace cools off.
      </Text>

      <View style={styles.actions}>
        <Button
          style={{ width: '100%' }}
          onPress={() =>
            router.replace({ pathname: '/thread/[athleteId]', params: { athleteId: String(athlete.id) } })
          }
        >
          Send a Message
        </Button>
        <Button variant="ghost" style={{ width: '100%' }} onPress={() => router.back()}>
          Keep Discovering
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  glow: {
    position: 'absolute',
    top: '18%',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255,77,46,0.16)',
  },
  avatars: { flexDirection: 'row', alignItems: 'center', marginBottom: 26 },
  ring: {
    width: 102,
    height: 102,
    borderRadius: 51,
    backgroundColor: colors.ember,
    padding: 3,
  },
  avatar: { width: '100%', height: '100%', borderWidth: 3, borderColor: colors.ink },
  avatarLeft: { marginRight: -20, zIndex: 2 },
  avatarRight: { marginLeft: -20 },
  eyebrow: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 4, color: colors.ember },
  title: {
    fontFamily: fonts.display,
    fontSize: 46,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 44,
    marginTop: 12,
    textAlign: 'center',
  },
  body: { color: colors.fog, fontSize: 13, lineHeight: 20, marginTop: 16, marginBottom: 28, maxWidth: 270, textAlign: 'center' },
  actions: { width: '100%', gap: 10 },
  missing: { color: colors.fog, textAlign: 'center', marginTop: 100 },
});
