import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { unreadCount, useReadNotifications } from '../data/notifications';
import { useSocial } from '../data/social';
import { useColors } from '../theme/appearance';
import { Icon } from './Icon';
import { IconButton } from './ui';

// Bell in the Today and Chats headers, with a dot while anything is unread.
export function NotificationBell() {
  const colors = useColors();
  const router = useRouter();
  const readIds = useReadNotifications();
  const { blocked } = useSocial();
  const unread = unreadCount(blocked, readIds);
  const label = unread > 0 ? `Notifications, ${unread} unread` : 'Notifications';

  return (
    <YStack>
      <IconButton
        size={40}
        onPress={() => router.push('/notifications')}
        accessibilityLabel={label}
      >
        <Icon name="bell" size={18} color={colors.text} />
      </IconButton>
      {unread > 0 ? (
        <YStack
          pointerEvents="none"
          position="absolute"
          t={2}
          r={2}
          width={10}
          height={10}
          rounded={5}
          bg="$accent"
          borderWidth={2}
          borderColor="$canvas"
        />
      ) : null}
    </YStack>
  );
}
