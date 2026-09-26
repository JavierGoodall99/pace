import React, { useState } from 'react';
import { Image as RNImage } from 'react-native';
import { Text, XStack, YStack } from 'tamagui';
import { Icon } from './Icon';
import { PHOTO_LABELS, PhotoLabel } from '../data/identity';
import { useColors } from '../theme/appearance';

// Labelled photo grid used in onboarding and edit profile. Every photo
// gets a label (In action, Post-session, Race day, Off the clock) and at
// least one has to be Off the clock.

export function PhotoGrid({
  max,
  photos,
  labels,
  onPick,
  onLabel,
  onRemove,
}: {
  max: number;
  photos: string[];
  labels: PhotoLabel[];
  onPick: () => void;
  onLabel: (i: number, l: PhotoLabel) => void;
  onRemove: (i: number) => void;
}) {
  const colors = useColors();
  const firstUnlabeled = photos.findIndex((_, i) => !labels[i]);
  const [picked, setPicked] = useState<number | null>(null);
  const active = picked !== null && picked < photos.length ? picked : firstUnlabeled;
  return (
    <YStack gap={14}>
      <XStack flexWrap="wrap" gap={10}>
        {Array.from({ length: max }).map((_, i) => {
          const uri = photos[i];
          const label = labels[i];
          const selected = uri && i === active;
          return (
            <YStack
              key={i}
              onPress={uri ? () => setPicked(i) : onPick}
              accessibilityRole="button"
              accessibilityLabel={uri ? `Photo ${i + 1}` : 'Add a photo'}
              aria-label={uri ? `Photo ${i + 1}` : 'Add a photo'}
              width={max > 4 ? '31%' : '48%'}
              height={max > 4 ? 150 : 190}
              rounded={22}
              bg={uri ? '$card' : '$surface'}
              borderWidth={selected ? 3 : uri ? 0 : 2}
              borderColor={selected ? '$accent' : '$borderStrong'}
              borderStyle={uri ? 'solid' : 'dashed'}
              overflow="hidden"
              items="center"
              justify="center"
            >
              {uri ? (
                <>
                  <RNImage
                    source={{ uri }}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  <XStack
                    position="absolute"
                    b={8}
                    l={8}
                    height={26}
                    px={10}
                    rounded="$full"
                    items="center"
                    bg={label ? 'rgba(18,16,14,0.55)' : '$accent'}
                  >
                    <Text fontFamily="$semibold" fontSize={12} color="#FFFFFF">
                      {label ? PHOTO_LABELS.find((x) => x.id === label)!.label : 'Add a label'}
                    </Text>
                  </XStack>
                  <XStack
                    position="absolute"
                    t={8}
                    r={8}
                    width={28}
                    height={28}
                    rounded={14}
                    items="center"
                    justify="center"
                    bg="rgba(18,16,14,0.55)"
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                    aria-label="Remove photo"
                    onPress={(e) => {
                      e.stopPropagation();
                      setPicked(null);
                      onRemove(i);
                    }}
                  >
                    <Icon name="x" size={14} color="#FFFFFF" strokeWidth={2.4} />
                  </XStack>
                </>
              ) : (
                <YStack items="center" gap={8}>
                  <XStack
                    width={40}
                    height={40}
                    rounded={20}
                    bg="$accent"
                    items="center"
                    justify="center"
                  >
                    <Icon name="plus" size={22} color={colors.onAccent} strokeWidth={2.4} />
                  </XStack>
                  {i === 0 ? (
                    <Text fontFamily="$semibold" fontSize={13} color="$muted">
                      Main photo
                    </Text>
                  ) : null}
                </YStack>
              )}
            </YStack>
          );
        })}
      </XStack>

      {active >= 0 && photos[active] ? (
        <YStack gap={8}>
          <Text fontFamily="$semibold" fontSize={14} color="$text">
            What’s in photo {active + 1}?
          </Text>
          <XStack flexWrap="wrap" gap={8}>
            {PHOTO_LABELS.map((l) => {
              const on = labels[active] === l.id;
              return (
                <XStack
                  key={l.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => {
                    onLabel(active, l.id);
                    setPicked(null);
                  }}
                  height={38}
                  px={14}
                  rounded="$full"
                  items="center"
                  borderWidth={1}
                  borderColor={on ? '$accent' : '$border'}
                  bg={on ? '$accent' : '$card'}
                >
                  <Text fontFamily="$semibold" fontSize={14} color={on ? '$onAccent' : '$text'}>
                    {l.label}
                  </Text>
                </XStack>
              );
            })}
          </XStack>
        </YStack>
      ) : null}

      <XStack items="center" gap={8} justify="center">
        <Icon
          name={labels.includes('offclock') ? 'check' : 'camera'}
          size={15}
          color={labels.includes('offclock') ? colors.success : colors.muted}
          strokeWidth={2.4}
        />
        <Text fontSize={13} color="$muted">
          {photos.length} of {max} · at least one Off the clock photo
        </Text>
      </XStack>
    </YStack>
  );
}
