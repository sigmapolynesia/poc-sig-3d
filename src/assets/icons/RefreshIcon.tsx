import React from 'react';
import { IconProps } from './index';

export const RefreshIcon: React.FC<IconProps> = ({
  size = '100%',
  color = 'currentColor',
  strokeWidth = 1.5,
  className = '',
  title = 'Refresh',
  ariaLabel = 'Refresh',
}) => {
  const titleId = `refresh-icon-title-${React.useId()}`;
  
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth={strokeWidth} 
      style={{ width: size, height: size }}
      className={className}
      role="img"
      aria-labelledby={titleId}
      aria-label={ariaLabel}
    >
      <title id={titleId}>{title}</title>
      <path 
        d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4m-4 4a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default RefreshIcon;