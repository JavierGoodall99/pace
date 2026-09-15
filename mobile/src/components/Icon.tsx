import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Path data ported from `../assets/icons/*.svg` (lucide-style, 24x24 viewBox).
export type IconName =
  | 'chevron-left'
  | 'shield-check'
  | 'arrow-right'
  | 'heart'
  | 'activity'
  | 'zap'
  | 'map'
  | 'repeat'
  | 'map-pin'
  | 'users'
  | 'check'
  | 'x'
  | 'bell'
  | 'settings'
  | 'lock'
  | 'credit-card'
  | 'log-out'
  | 'trash'
  | 'chevron-right'
  | 'user'
  | 'mail'
  | 'upload'
  | 'ban';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export function Icon({ name, size = 20, color = '#8f8d97' }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'chevron-left':
      return (
        <Svg {...common}>
          <Path d="m15 18-6-6 6-6" />
        </Svg>
      );
    case 'shield-check':
      return (
        <Svg {...common}>
          <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.78 17 5 19 5a1 1 0 0 1 1 1z" />
          <Path d="m9 12 2 2 4-4" />
        </Svg>
      );
    case 'arrow-right':
      return (
        <Svg {...common}>
          <Path d="M5 12h14" />
          <Path d="m12 5 7 7-7 7" />
        </Svg>
      );
    case 'heart':
      return (
        <Svg {...common}>
          <Path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </Svg>
      );
    case 'activity':
      return (
        <Svg {...common}>
          <Path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
        </Svg>
      );
    case 'zap':
      return (
        <Svg {...common}>
          <Path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
        </Svg>
      );
    case 'map':
      return (
        <Svg {...common}>
          <Path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
          <Path d="M15 5.764v15" />
          <Path d="M9 3.236v15" />
        </Svg>
      );
    case 'repeat':
      return (
        <Svg {...common}>
          <Path d="m17 2 4 4-4 4" />
          <Path d="M3 11v-1a4 4 0 0 1 4-4h14" />
          <Path d="m7 22-4-4 4-4" />
          <Path d="M21 13v1a4 4 0 0 1-4 4H3" />
        </Svg>
      );
    case 'map-pin':
      return (
        <Svg {...common}>
          <Path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
          <Circle cx="12" cy="10" r="3" />
        </Svg>
      );
    case 'users':
      return (
        <Svg {...common}>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </Svg>
      );
    case 'check':
      return (
        <Svg {...common}>
          <Path d="M20 6 9 17l-5-5" />
        </Svg>
      );
    case 'x':
      return (
        <Svg {...common}>
          <Path d="M18 6 6 18" />
          <Path d="m6 6 12 12" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg {...common}>
          <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </Svg>
      );
    case 'settings':
      return (
        <Svg {...common}>
          <Path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <Circle cx="12" cy="12" r="3" />
        </Svg>
      );
    case 'lock':
      return (
        <Svg {...common}>
          <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </Svg>
      );
    case 'credit-card':
      return (
        <Svg {...common}>
          <Rect width="20" height="14" x="2" y="5" rx="2" />
          <Path d="M2 10h20" />
        </Svg>
      );
    case 'log-out':
      return (
        <Svg {...common}>
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Path d="m16 17 5-5-5-5" />
          <Path d="M21 12H9" />
        </Svg>
      );
    case 'trash':
      return (
        <Svg {...common}>
          <Path d="M3 6h18" />
          <Path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <Path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg {...common}>
          <Path d="m9 18 6-6-6-6" />
        </Svg>
      );
    case 'user':
      return (
        <Svg {...common}>
          <Path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );
    case 'mail':
      return (
        <Svg {...common}>
          <Rect width="20" height="16" x="2" y="4" rx="2" />
          <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </Svg>
      );
    case 'upload':
      return (
        <Svg {...common}>
          <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <Path d="m17 8-5-5-5 5" />
          <Path d="M12 3v12" />
        </Svg>
      );
    case 'ban':
      return (
        <Svg {...common}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="m4.9 4.9 14.2 14.2" />
        </Svg>
      );
    default:
      return null;
  }
}
