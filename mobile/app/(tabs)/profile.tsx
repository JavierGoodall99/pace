import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScrollView, Text, XStack, YStack } from 'tamagui';
import { Icon } from '../../src/components/Icon';
import { PhotoSlot } from '../../src/components/PhotoSlot';
import { Badge } from '../../src/components/ui';
import { ME_AVATAR, ME_COVER, TRAINING_PHOTOS } from '../../src/data/photos';
import { useMe } from '../../src/data/session';
import { useSocial } from '../../src/data/social';
import { colors } from '../../src/theme/tokens';

const STATS = [
  { value: '42KM', label: 'WEEKLY VOL.' },
  { value: '5', label: 'SESSIONS/WK' },
  { value: '94%', label: 'PROFILE MATCH' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const me = useMe();
  const { matches, likes } = useSocial();

  const avatar = me.photos[0] ? { uri: me.photos[0] } : ME_AVATAR;
  const primary = me.disciplines[0] ?? 'ATHLETE';
  const photoTiles: (string | null)[] = [me.photos[0] ?? null, me.photos[1] ?? null, me.photos[2] ?? null];

  return (
    <ScrollView flex={1} bg="$ink" contentContainerStyle={{ pb: 24 }}>
      <YStack>
        <PhotoSlot
          label="Cover photo"
          shape="rect"
          source={ME_COVER}
          style={{ width: '100%', height: 160, marginTop: insets.top }}
        />
        <XStack
          accessibilityRole="button"
          accessibilityLabel="Settings"
          onPress={() => router.push('/settings')}
          position="absolute"
          t={insets.top + 12}
          r={16}
          width={40}
          height={40}
          rounded={20}
          items="center"
          justify="center"
          bg="rgba(10,10,13,0.55)"
          borderWidth={1}
          borderColor="$lineHover"
        >
          <Icon name="settings" size={18} color={colors.bone} />
        </XStack>
      </YStack>

      <YStack px={20} mt={-40}>
        <PhotoSlot
          label={me.name}
          shape="circle"
          source={avatar}
          style={{ width: 84, height: 84, borderWidth: 3, borderColor: colors.ink }}
        />
        <Text fontFamily="$display" fontSize={30} color="$bone" textTransform="uppercase" lineHeight={30} mt={14}>
          {me.name || 'You'}
        </Text>
        <XStack items="center" gap={8} mt={8}>
          {me.verified ? (
            <>
              <Icon name="shield-check" size={13} color={colors.ember} />
              <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$ember" textTransform="uppercase">
                Verified · {me.city || 'City TBD'}
              </Text>
            </>
          ) : (
            <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$fog" textTransform="uppercase">
              {me.city || 'Location'} · Unverified
            </Text>
          )}
        </XStack>
        <Text color="$fog" fontSize={13} lineHeight={20} my={14}>
          {me.bio || 'No bio yet — add one in Edit Profile.'}
        </Text>
        <XStack gap={8} mb={18}>
          <Badge tone="accent">{primary}</Badge>
          {me.cadence ? <Badge>{me.cadence}</Badge> : null}
        </XStack>

        <XStack gap={10} mb={20}>
          {STATS.map((s) => (
            <YStack key={s.label} flex={1} items="center" py={14} px={8} rounded={16} borderWidth={1} borderColor="$line" bg="$ash">
              <Text fontFamily="$display" fontSize={22} color="$bone">
                {s.value}
              </Text>
              <Text fontFamily="$mono" fontSize={9} color="$fog" letterSpacing={1} mt={4}>
                {s.label}
              </Text>
            </YStack>
          ))}
        </XStack>

        <XStack gap={10} mb={24}>
          <YStack
            flex={1}
            onPress={() => router.push('/matches')}
            pressStyle={{ opacity: 0.7 }}
            items="center"
            gap={6}
            py={14}
            rounded={16}
            borderWidth={1}
            borderColor="$line"
            bg="$ash"
          >
            <Text fontFamily="$display" fontSize={26} color="$bone">
              {matches.length}
            </Text>
            <Text fontFamily="$mono" fontSize={9} color="$fog" letterSpacing={1.5}>
              MATCHES
            </Text>
          </YStack>
          <YStack
            flex={1}
            onPress={() => router.push('/likes')}
            pressStyle={{ opacity: 0.7 }}
            items="center"
            gap={6}
            py={14}
            rounded={16}
            borderWidth={1}
            borderColor={likes.length > 0 ? '$emberBorder' : '$line'}
            bg={likes.length > 0 ? '$emberSoft' : '$ash'}
          >
            <Text fontFamily="$display" fontSize={26} color={likes.length > 0 ? '$ember' : '$bone'}>
              {likes.length}
            </Text>
            <Text fontFamily="$mono" fontSize={9} color={likes.length > 0 ? '$ember' : '$fog'} letterSpacing={1.5}>
              LIKES
            </Text>
          </YStack>
          <YStack
            flex={1}
            onPress={() => router.push('/edit-profile')}
            pressStyle={{ opacity: 0.7 }}
            items="center"
            justify="center"
            gap={6}
            py={14}
            rounded={16}
            borderWidth={1}
            borderColor="$line"
            bg="$ash"
          >
            <Icon name="user" size={20} color={colors.fog} />
            <Text fontFamily="$mono" fontSize={9} color="$fog" letterSpacing={1.5}>
              EDIT
            </Text>
          </YStack>
        </XStack>

        <Text fontFamily="$mono" fontSize={10} letterSpacing={2} color="$fog">
          TRAINING PHOTOS
        </Text>
        <XStack gap={8} mt={10}>
          {photoTiles.map((uri, i) => (
            <PhotoSlot
              key={i}
              label="Photo"
              shape="rounded"
              source={uri ? { uri } : TRAINING_PHOTOS[i]}
              style={{ flex: 1, aspectRatio: 1 }}
            />
          ))}
        </XStack>

        {__DEV__ ? (
          <XStack onPress={() => router.push('/onboarding')} mt={24} py={12} rounded={12} borderWidth={1} borderColor="$line" borderStyle="dashed" items="center">
            <Text fontFamily="$mono" fontSize={10} letterSpacing={1.5} color="$fog">
              DEV · VIEW ONBOARDING
            </Text>
          </XStack>
        ) : null}
      </YStack>
    </ScrollView>
  );
}