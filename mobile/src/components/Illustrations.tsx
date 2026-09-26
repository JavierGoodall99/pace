import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { useColors } from '../theme/appearance';

// Pace's spot illustrations: one hand-drawn-feeling set (48×48 grid,
// rounded ink outlines, flat brand fills) used everywhere the app would
// otherwise reach for an emoji — sports, answers, check-ins, races.
// Pass `color` to draw a single-color version, e.g. on an accent fill.

export type IlloName =
  | 'run'
  | 'cycle'
  | 'trail'
  | 'swim'
  | 'lift'
  | 'climb'
  | 'medal'
  | 'heart'
  | 'buddies'
  | 'sparkle'
  | 'sunrise'
  | 'sun'
  | 'moon'
  | 'calendar'
  | 'repeat'
  | 'coffee'
  | 'flag'
  | 'seedling'
  | 'level1'
  | 'level2'
  | 'level3'
  | 'level4';

interface Ink {
  ink: string; // outlines
  main: string; // primary fill (brand)
  alt: string; // secondary fill
  warm: string; // tertiary fill
  paper: string; // light fill inside shapes
  hi: string; // highlights
  green: string;
}

// Four-point sparkle centred on (cx, cy).
function star4(cx: number, cy: number, R: number, r: number) {
  return `M${cx} ${cy - R} Q${cx + r} ${cy - r} ${cx + R} ${cy} Q${cx + r} ${cy + r} ${cx} ${cy + R} Q${cx - r} ${cy + r} ${cx - R} ${cy} Q${cx - r} ${cy - r} ${cx} ${cy - R} Z`;
}

// Five-point star centred on (cx, cy).
function star5(cx: number, cy: number, R: number, r: number) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rad = i % 2 === 0 ? R : r;
    return `${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
  });
  return `M${pts.join(' L')} Z`;
}

function Gauge({ k, level }: { k: Ink; level: number }) {
  const f = level / 4;
  const a = Math.PI * (1 - f);
  const pt = (r: number) =>
    `${(24 + r * Math.cos(a)).toFixed(2)} ${(33 - r * Math.sin(a)).toFixed(2)}`;
  return (
    <G strokeLinecap="round">
      <Path
        d="M5 33 A19 19 0 0 1 43 33"
        stroke={k.ink}
        strokeWidth={7}
        fill="none"
        opacity={0.12}
      />
      <Path d={`M5 33 A19 19 0 0 1 ${pt(19)}`} stroke={k.main} strokeWidth={7} fill="none" />
      <Path d={`M24 33 L${pt(13)}`} stroke={k.ink} strokeWidth={3.2} />
      <Circle cx={24} cy={33} r={4} fill={k.ink} />
      <Path d="M9 41 h30" stroke={k.ink} strokeWidth={2.2} opacity={0.25} />
    </G>
  );
}

function draw(name: IlloName, k: Ink) {
  const line = {
    stroke: k.ink,
    strokeWidth: 2.2,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };
  switch (name) {
    case 'run':
      return (
        <G>
          <Path d="M3 22h5 M2 27h5" {...line} opacity={0.5} />
          <Path
            d="M9 32 V27 C9 24 11 22 14 22 H19 C21 22 22 21 23 19 L25 15 C26 13 28 13 29 14 L31 17 C32 19 34 21 37 22 L40 23 C43 24 44 27 44 30 V32 Z"
            fill={k.main}
            {...line}
          />
          <Path d="M7 32 H46 C46 35 44 38 41 38 H10 C8 38 7 36 7 32 Z" fill={k.paper} {...line} />
          <Path
            d="M26 18.5 l3 1.6 M24.5 22 l3.2 1.3"
            stroke={k.hi}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </G>
      );
    case 'cycle':
      return (
        <G>
          <Circle cx={12} cy={32} r={8} fill="none" {...line} />
          <Circle cx={36} cy={32} r={8} fill="none" {...line} />
          <Path
            d="M12 32 L24 32 L19 19 Z M19 19 H32 L24 32 M32 19 L36 32"
            stroke={k.main}
            strokeWidth={3}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="none"
          />
          <Path d="M16 16.5 h6 M30.5 14.5 L32 19 M30.5 14.5 h4" {...line} />
          <Circle cx={12} cy={32} r={2} fill={k.warm} />
          <Circle cx={36} cy={32} r={2} fill={k.warm} />
        </G>
      );
    case 'trail':
      return (
        <G>
          <Circle cx={38} cy={10} r={4.5} fill={k.warm} />
          <Path d="M20 39 L31 18 L44 39 Z" fill={k.alt} {...line} />
          <Path d="M4 39 L18 14 L32 39 Z" fill={k.main} {...line} />
          <Path
            d="M13.5 22.5 L18 14 L22.5 22.5 L20 21 L18 23 L16 21 Z"
            fill={k.paper}
            {...line}
            strokeWidth={1.6}
          />
          <Path d="M2 39 H46" {...line} />
        </G>
      );
    case 'swim':
      return (
        <G>
          <Path d="M23 23 C26 12 36 11 41 19" fill="none" {...line} strokeWidth={2.6} />
          <Circle cx={16} cy={20} r={6} fill={k.main} {...line} />
          <Path d="M10.5 18.5 h11" stroke={k.hi} strokeWidth={2} strokeLinecap="round" />
          <Path
            d="M4 30 q5 -4 10 0 t10 0 t10 0 t10 0"
            stroke={k.alt}
            strokeWidth={3.2}
            fill="none"
            strokeLinecap="round"
          />
          <Path d="M4 38 q5 -4 10 0 t10 0 t10 0 t10 0" fill="none" {...line} />
        </G>
      );
    case 'lift':
      return (
        <G>
          <Path d="M16 22 C13 9 35 9 32 22" fill="none" {...line} strokeWidth={3.4} />
          <Circle cx={24} cy={30} r={12} fill={k.main} {...line} />
          <Path
            d="M16.5 28 a8 8 0 0 1 5 -5.5"
            stroke={k.hi}
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
          <Path d="M13 43 h22" {...line} opacity={0.35} />
        </G>
      );
    case 'climb':
      return (
        <G>
          <Rect x={6} y={5} width={36} height={38} rx={9} fill={k.alt} opacity={0.55} />
          <Path
            d="M38 3 C29 17 40 28 27 45"
            stroke={k.ink}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray="0.1 4.5"
          />
          <Circle cx={15} cy={14} r={3.8} fill={k.main} {...line} strokeWidth={1.8} />
          <Circle cx={31} cy={12} r={3} fill={k.warm} {...line} strokeWidth={1.8} />
          <Circle cx={22} cy={25} r={4.4} fill={k.main} {...line} strokeWidth={1.8} />
          <Circle cx={34} cy={31} r={3.2} fill={k.main} {...line} strokeWidth={1.8} />
          <Circle cx={14} cy={35} r={3.2} fill={k.warm} {...line} strokeWidth={1.8} />
        </G>
      );
    case 'medal':
      return (
        <G>
          <Path d="M15 4 L22 20 L27 18 L21 4 Z" fill={k.main} {...line} />
          <Path d="M33 4 L26 20 L21 18 L27 4 Z" fill={k.alt} {...line} />
          <Circle cx={24} cy={31} r={11} fill={k.warm} {...line} />
          <Path
            d={star5(24, 31.5, 6, 2.6)}
            fill={k.main}
            strokeLinejoin="round"
            stroke={k.ink}
            strokeWidth={1.4}
          />
        </G>
      );
    case 'heart':
      return (
        <G>
          <Path
            d="M24 41 C10 32 5 25 5 18 C5 12 10 8 15 8 C19 8 22 10 24 13 C26 10 29 8 33 8 C38 8 43 12 43 18 C43 25 38 32 24 41 Z"
            fill={k.main}
            {...line}
          />
          <Path
            d="M11.5 17 C11.5 14.5 13 13 15 13"
            stroke={k.hi}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
          <Path d={star4(40, 7, 5, 1.2)} fill={k.warm} />
        </G>
      );
    case 'buddies':
      return (
        <G>
          <Circle cx={31} cy={15} r={6} fill={k.alt} {...line} />
          <Path d="M20 40 C20 31 25 26.5 31 26.5 C37 26.5 42 31 42 40 Z" fill={k.alt} {...line} />
          <Circle cx={17} cy={19} r={6.5} fill={k.main} {...line} />
          <Path d="M5 43 C5 34 10 30 17 30 C24 30 29 34 29 43 Z" fill={k.main} {...line} />
        </G>
      );
    case 'sparkle':
      return (
        <G>
          <Path d={star4(21, 27, 15, 3.5)} fill={k.main} {...line} />
          <Path d={star4(37, 11, 7, 1.6)} fill={k.warm} {...line} strokeWidth={1.6} />
          <Circle cx={39} cy={36} r={2.5} fill={k.alt} />
        </G>
      );
    case 'sunrise':
      return (
        <G>
          {[150, 120, 90, 60, 30].map((deg) => {
            const a = (deg * Math.PI) / 180;
            return (
              <Path
                key={deg}
                d={`M${24 + 16 * Math.cos(a)} ${33 - 16 * Math.sin(a)} L${24 + 20 * Math.cos(a)} ${33 - 20 * Math.sin(a)}`}
                stroke={k.main}
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}
          <Path d="M12 33 A12 12 0 0 1 36 33 Z" fill={k.warm} {...line} />
          <Path d="M4 33 H44" {...line} />
          <Path d="M12 39 H36" {...line} opacity={0.35} />
        </G>
      );
    case 'sun':
      return (
        <G>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <Path
                key={i}
                d={`M${24 + 14 * Math.cos(a)} ${24 + 14 * Math.sin(a)} L${24 + 19 * Math.cos(a)} ${24 + 19 * Math.sin(a)}`}
                stroke={k.main}
                strokeWidth={3}
                strokeLinecap="round"
              />
            );
          })}
          <Circle cx={24} cy={24} r={9} fill={k.warm} {...line} />
        </G>
      );
    case 'moon':
      return (
        <G>
          <Path d="M28 7 A17 17 0 1 0 41 33 A13.5 13.5 0 1 1 28 7 Z" fill={k.alt} {...line} />
          <Path d={star4(36, 12, 5, 1.2)} fill={k.warm} />
          <Path d={star4(42, 22, 3, 0.8)} fill={k.main} />
        </G>
      );
    case 'calendar':
      return (
        <G>
          <Rect x={7} y={10} width={34} height={31} rx={6} fill={k.paper} {...line} />
          <Path d="M7 16 a6 6 0 0 1 6 -6 h22 a6 6 0 0 1 6 6 v4 H7 Z" fill={k.main} {...line} />
          <Path d="M16 6 v7 M32 6 v7" {...line} strokeWidth={2.6} />
          {[0, 1, 2].map((col) =>
            [0, 1].map((row) => (
              <Rect
                key={`${col}-${row}`}
                x={13 + col * 9}
                y={25 + row * 8}
                width={5}
                height={4.5}
                rx={1.5}
                fill={col === 2 && row === 1 ? k.main : k.ink}
                opacity={col === 2 && row === 1 ? 1 : 0.3}
              />
            ))
          )}
        </G>
      );
    case 'repeat':
      return (
        <G strokeLinecap="round" strokeLinejoin="round" fill="none">
          <Path d="M10 21 C12 12 22 8 30 11 C33 12 35 14 37 17" stroke={k.main} strokeWidth={3.4} />
          <Path d="M38.5 10 L37.5 17.5 L30 16.5" stroke={k.main} strokeWidth={3.4} />
          <Path d="M38 27 C36 36 26 40 18 37 C15 36 13 34 11 31" stroke={k.ink} strokeWidth={3} />
          <Path d="M9.5 38 L10.5 30.5 L18 31.5" stroke={k.ink} strokeWidth={3} />
        </G>
      );
    case 'coffee':
      return (
        <G>
          <Path
            d="M16 5 c-2 3 2 5 0 8 M22.5 3 c-2 3 2 5 0 8 M29 5 c-2 3 2 5 0 8"
            stroke={k.main}
            strokeWidth={2.4}
            strokeLinecap="round"
            fill="none"
          />
          <Path d="M33 21 h3 a5.5 5.5 0 0 1 0 11 h-4" fill="none" {...line} />
          <Path d="M9 17 H33 V27 A12 12 0 0 1 21 39 A12 12 0 0 1 9 27 Z" fill={k.warm} {...line} />
          <Path d="M9 21 H33" stroke={k.ink} strokeWidth={1.4} opacity={0.35} />
          <Path d="M5 43 H37" {...line} />
        </G>
      );
    case 'flag':
      return (
        <G>
          <Rect x={10} y={7} width={30} height={18} fill={k.paper} />
          {[0, 1, 2, 3, 4].map((col) =>
            [0, 1, 2].map((row) =>
              (col + row) % 2 === 0 ? (
                <Rect
                  key={`${col}-${row}`}
                  x={10 + col * 6}
                  y={7 + row * 6}
                  width={6}
                  height={6}
                  fill={k.main}
                />
              ) : null
            )
          )}
          <Rect x={10} y={7} width={30} height={18} fill="none" {...line} />
          <Path d="M10 44 V4" {...line} strokeWidth={3} />
          <Path d="M5 44 H17" {...line} opacity={0.4} />
        </G>
      );
    case 'seedling':
      return (
        <G>
          <Path d="M24 38 V21" {...line} strokeWidth={2.6} />
          <Path d="M24 27 C16 27 10 22 10 14 C18 14 24 19 24 27 Z" fill={k.green} {...line} />
          <Path
            d="M24 22 C24 14 30 8 39 8 C39 16 33 22 24 22 Z"
            fill={k.green}
            {...line}
            opacity={0.85}
          />
          <Path d="M11 40 A13 5 0 0 1 37 40 Z" fill={k.warm} {...line} />
          <Path d="M6 40 H42" {...line} />
        </G>
      );
    case 'level1':
      return <Gauge k={k} level={1} />;
    case 'level2':
      return <Gauge k={k} level={2} />;
    case 'level3':
      return <Gauge k={k} level={3} />;
    case 'level4':
      return <Gauge k={k} level={4} />;
  }
}

export function Illo({
  name,
  size = 32,
  color,
}: {
  name: IlloName;
  size?: number;
  color?: string;
}) {
  const c = useColors();
  const k: Ink = color
    ? {
        ink: color,
        main: color,
        alt: 'transparent',
        warm: 'transparent',
        paper: 'transparent',
        hi: 'transparent',
        green: color,
      }
    : {
        ink: c.text,
        main: c.accent,
        alt: c.sky,
        warm: c.sun,
        paper: c.card,
        hi: '#FFFFFF',
        green: c.success,
      };
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      {draw(name, k)}
    </Svg>
  );
}
