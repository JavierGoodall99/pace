import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, YStack } from 'tamagui';
import { ScreenHeader } from '../../src/components/ui';
import { isLegalDoc, LEGAL, LEGAL_UPDATED } from '../../src/data/legal';

// Terms, Privacy Policy and Community Code. Opened from the welcome
// screen and Settings.
export default function LegalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const page = LEGAL[isLegalDoc(doc) ? doc : 'terms'];

  return (
    <YStack flex={1} bg="$canvas">
      <ScreenHeader
        title={page.title}
        subtitle={`Updated ${LEGAL_UPDATED}`}
        onBack={() => router.back()}
      />
      <ScrollView flex={1} contentContainerStyle={{ p: 20, gap: 20, pb: insets.bottom + 32 }}>
        <Text fontSize={16} lineHeight={24} color="$text">
          {page.intro}
        </Text>
        {page.sections.map((s) => (
          <YStack key={s.heading} gap={6}>
            <Text fontFamily="$semibold" fontSize={17} color="$text">
              {s.heading}
            </Text>
            <Text fontSize={15} lineHeight={23} color="$muted">
              {s.body}
            </Text>
          </YStack>
        ))}
      </ScrollView>
    </YStack>
  );
}
