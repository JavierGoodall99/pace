import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { Badge, Button, IconButton } from '../src/components/ui';
import { colors, fonts } from '../src/theme/tokens';

const PRO_FEATURES = [
  'Unlimited likes',
  'See who liked you',
  'Priority match radius · 2x',
  'Verified stats badge',
];

export default function SettingsSubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 }}
    >
      <View style={styles.header}>
        <IconButton size={40} onPress={() => router.back()}>
          <Icon name="chevron-left" size={14} color={colors.bone} />
        </IconButton>
        <Text style={styles.title}>Subscription</Text>
      </View>

      <View style={styles.currentCard}>
        <View style={styles.currentRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.currentName}>PACE FREE</Text>
            <Text style={styles.currentMeta}>R0 / month · forever</Text>
          </View>
          <Badge>CURRENT PLAN</Badge>
        </View>
        <Text style={styles.currentBody}>
          5 likes a day, standard match radius, and your training log.
        </Text>
      </View>

      <View style={styles.proCard}>
        <View style={styles.proGlow} pointerEvents="none" />
        <View style={styles.proHeader}>
          <View>
            <Text style={styles.proEyebrow}>GO FURTHER</Text>
            <Text style={styles.proName}>PACE PRO</Text>
          </View>
          <Text style={styles.proPrice}>
            <Text style={styles.proPriceBig}>R79</Text>
            <Text style={styles.proPriceUnit}> / MONTH</Text>
          </Text>
        </View>

        <View style={styles.features}>
          {PRO_FEATURES.map((f) => (
            <View key={f} style={styles.featureRow}>
              <Icon name="check" size={14} color={colors.ember} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <Button
          style={{ width: '100%', marginTop: 18 }}
          onPress={() =>
            Alert.alert('Pace Pro', 'Upgrade flow coming soon — this is a shipping milestone, not a live payment screen.', [
              { text: 'Got It' },
            ])
          }
        >
          Upgrade to Pro
        </Button>
        <Button
          variant="ghost"
          style={{ width: '100%', marginTop: 10 }}
          onPress={() =>
            Alert.alert('Manage Payment', 'Payment method and receipts will live here.', [{ text: 'Got It' }])
          }
        >
          Manage Payment
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 2,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 30,
  },
  currentCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ash,
  },
  currentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  currentName: { fontFamily: fonts.display, fontSize: 20, color: colors.bone, textTransform: 'uppercase', lineHeight: 20 },
  currentMeta: { fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.fog, marginTop: 4 },
  currentBody: { color: colors.fog, fontSize: 12, lineHeight: 18, marginTop: 12 },
  proCard: {
    position: 'relative',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,77,46,0.4)',
    backgroundColor: colors.ash,
    overflow: 'hidden',
  },
  proGlow: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,77,46,0.14)',
  },
  proHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  proEyebrow: { fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.ember },
  proName: {
    fontFamily: fonts.display,
    fontSize: 30,
    color: colors.bone,
    textTransform: 'uppercase',
    lineHeight: 30,
    marginTop: 6,
  },
  proPrice: { flexDirection: 'row', alignItems: 'baseline' },
  proPriceBig: { fontFamily: fonts.display, fontSize: 30, color: colors.ember },
  proPriceUnit: { fontFamily: fonts.mono, fontSize: 10, color: colors.fog, letterSpacing: 1 },
  features: { marginTop: 18, gap: 10 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureText: { flex: 1, fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.bone },
});