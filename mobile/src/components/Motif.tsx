import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { YStack } from 'tamagui';
import { useColors } from '../theme/appearance';

// Brand motifs shared by the hero moments (welcome, auth, match):
// a heartbeat line that draws itself, and a soft aurora glow.

const AnimatedPath = Animated.createAnimatedComponent(Path);

// One heartbeat across a 200×40 box: flat, a small P-wave, the spike,
// then flat again.
const PULSE_D =
  'M0 22 H62 C66 22 68 16 72 16 C76 16 78 22 82 22 H88 L94 6 L102 38 L108 14 L112 22 H200';
const PULSE_LENGTH = 320;

export function PulseLine({
  width = 200,
  height = 40,
  color,
  strokeWidth = 2.5,
  loop = true,
}: {
  width?: number | string;
  height?: number;
  color?: string;
  strokeWidth?: number;
  loop?: boolean;
}) {
  const c = useColors();
  const draw = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const once = Animated.timing(draw, {
      toValue: 1,
      duration: 1800,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    const anim = loop
      ? Animated.loop(
          Animated.sequence([
            once,
            Animated.delay(600),
            Animated.timing(draw, { toValue: 0, duration: 0, useNativeDriver: false }),
          ])
        )
      : once;
    anim.start();
    return () => anim.stop();
  }, [draw, loop]);

  const dashOffset = draw.interpolate({ inputRange: [0, 1], outputRange: [PULSE_LENGTH, 0] });

  return (
    <Svg width={width as any} height={height} viewBox="0 0 200 40" preserveAspectRatio="none">
      <Path
        d={PULSE_D}
        stroke={color ?? c.accent}
        strokeOpacity={0.18}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <AnimatedPath
        d={PULSE_D}
        stroke={color ?? c.accent}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={`${PULSE_LENGTH}`}
        strokeDashoffset={dashOffset as any}
      />
    </Svg>
  );
}

// Three blurred color pools behind hero content. Sits absolutely at the
// top of its parent and never takes touches.
export function Aurora({ height = 420 }: { height?: number }) {
  const c = useColors();
  const pools = [
    { id: 'a1', cx: '18%', cy: '22%', r: '55%', color: c.accent },
    { id: 'a2', cx: '85%', cy: '12%', r: '50%', color: c.lilac },
    { id: 'a3', cx: '65%', cy: '70%', r: '45%', color: c.peach },
  ];
  return (
    <YStack position="absolute" t={0} l={0} r={0} height={height} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          {pools.map((p) => (
            <RadialGradient key={p.id} id={p.id} cx={p.cx} cy={p.cy} r={p.r} fx={p.cx} fy={p.cy}>
              <Stop offset="0" stopColor={p.color} stopOpacity={c.auroraOpacity} />
              <Stop offset="1" stopColor={p.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {pools.map((p) => (
          <Rect key={p.id} x="0" y="0" width="100%" height="100%" fill={`url(#${p.id})`} />
        ))}
      </Svg>
    </YStack>
  );
}
