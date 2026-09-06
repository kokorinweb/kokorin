import React from 'react';
import type { IconName } from '../script/types';

const PATHS: Record<IconName, string> = {
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
  check: 'M4 13l5 5L20 6',
  clipboard: 'M9 4h6v3H9zM7 5H5v16h14V5h-2M8.5 12h7M8.5 16h5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  cursor: 'M5 3l14 8-6 1.6L10 20z',
  arrow: 'M4 12h15M13 6l6 6-6 6',
  spark: 'M12 3l2.2 6.3L21 12l-6.8 2.7L12 21l-2.2-6.3L3 12l6.8-2.7z',
  warning: 'M12 4l9 16H3zM12 10v5M12 17.5v.5',
};

export const Icon: React.FC<{ name: IconName; size?: number; color: string }> = ({
  name,
  size = 120,
  color,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d={PATHS[name]}
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
