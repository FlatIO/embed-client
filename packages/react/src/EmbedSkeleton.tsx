import React from 'react';
import type { EmbedSkeletonProps } from './types';

/**
 * Loading skeleton component for Flat Embed
 *
 * @example
 * ```tsx
 * <FlatEmbed
 *   score="..."
 *   appId="..."
 *   loading={<EmbedSkeleton animated />}
 * />
 * ```
 *
 * @example Standalone usage
 * ```tsx
 * {!isReady && <EmbedSkeleton height="600px" pulse />}
 * ```
 */
export function EmbedSkeleton({
  width = '100%',
  height = '600px',
  animated = true,
  pulse = false,
  className,
  style,
}: EmbedSkeletonProps) {
  const animationStyle = animated
    ? pulse
      ? pulseAnimation
      : shimmerAnimation
    : {};

  const containerStyle: React.CSSProperties = {
    width,
    height,
    backgroundColor: '#f0f0f0',
    borderRadius: '4px',
    overflow: 'hidden',
    position: 'relative',
    ...animationStyle,
    ...style,
  };

  return (
    <div className={className} style={containerStyle} aria-label="Loading sheet music embed">
      {/* Header skeleton */}
      <div style={headerStyle}>
        <div style={{ ...barStyle, width: '40%', height: '20px' }} />
        <div style={{ ...barStyle, width: '30%', height: '16px', marginTop: '8px' }} />
      </div>

      {/* Staff lines skeleton */}
      <div style={staffContainerStyle}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={staffLineStyle} />
        ))}
      </div>

      {/* Controls skeleton */}
      <div style={controlsStyle}>
        <div style={{ ...buttonSkeletonStyle, width: '40px', height: '40px', borderRadius: '50%' }} />
        <div style={{ ...barStyle, flex: 1, height: '4px', margin: '0 16px' }} />
        <div style={{ ...buttonSkeletonStyle, width: '32px', height: '32px' }} />
        <div style={{ ...buttonSkeletonStyle, width: '32px', height: '32px' }} />
      </div>

      {/* Shimmer effect */}
      {animated && !pulse && (
        <div style={shimmerOverlayStyle}>
          <div style={shimmerGradientStyle} />
        </div>
      )}
    </div>
  );
}

// Styles
const headerStyle: React.CSSProperties = {
  padding: '24px',
};

const barStyle: React.CSSProperties = {
  backgroundColor: '#e0e0e0',
  borderRadius: '4px',
};

const staffContainerStyle: React.CSSProperties = {
  padding: '40px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const staffLineStyle: React.CSSProperties = {
  height: '1px',
  backgroundColor: '#d0d0d0',
};

const controlsStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '0',
  left: '0',
  right: '0',
  height: '60px',
  backgroundColor: '#fafafa',
  borderTop: '1px solid #e0e0e0',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  gap: '8px',
};

const buttonSkeletonStyle: React.CSSProperties = {
  backgroundColor: '#e0e0e0',
  borderRadius: '4px',
};

const shimmerAnimation: React.CSSProperties = {
  animation: 'none', // Handled by overlay
};

const pulseAnimation: React.CSSProperties = {
  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
};

const shimmerOverlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
};

const shimmerGradientStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: '-100%',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
  animation: 'shimmer 2s infinite',
};

// Add keyframes via style tag
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @keyframes shimmer {
      0% { transform: translateX(0); }
      100% { transform: translateX(200%); }
    }
  `;
  // Only add if not already present
  if (!document.querySelector('[data-flat-embed-skeleton-styles]')) {
    styleTag.setAttribute('data-flat-embed-skeleton-styles', 'true');
    document.head.appendChild(styleTag);
  }
}
