import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

// Shared by the onboarding Launch step and the Discover match
// celebration — both ports of the same `confettiFall` CSS keyframe in
// the design mockups, just with different color sets / spacing.
export interface ConfettiPiece {
  color: string;
  left: number;
  round: boolean;
  duration: number;
  delay: number;
}

export function buildConfettiPieces(
  colors: string[],
  opts: { leftStep?: number; durationBase?: number; durationStep?: number; delayStep?: number } = {}
): ConfettiPiece[] {
  const { leftStep = 37, durationBase = 1.6, durationStep = 0.3, delayStep = 0.12 } = opts;
  return colors.map((color, i) => ({
    color,
    left: (i * leftStep) % 100,
    round: i % 2 !== 0,
    duration: durationBase + (i % 4) * durationStep,
    delay: (i % 5) * delayStep,
  }));
}

export function Confetti({ pieces, fallDistance = 300 }: { pieces: ConfettiPiece[]; fallDistance?: number }) {
  const anims = useRef(pieces.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    anims.forEach((v, i) => {
      v.setValue(0);
      Animated.timing(v, {
        toValue: 1,
        duration: pieces[i].duration * 1000,
        delay: pieces[i].delay * 1000,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
    // Mount-once burst — deliberately no deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.field} pointerEvents="none">
      {pieces.map((piece, i) => {
        const anim = anims[i];
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: `${piece.left}%`,
              width: 6,
              height: 6,
              borderRadius: piece.round ? 3 : 1,
              backgroundColor: piece.color,
              opacity: anim.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 0] }),
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, fallDistance] }) },
                { rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '240deg'] }) },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { width: '100%', height: 0, overflow: 'visible' },
});
