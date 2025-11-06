import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFlatEmbed } from './useFlatEmbed';

// Mock flat-embed
vi.mock('flat-embed', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      ready: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      off: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      loadFlatScore: vi.fn().mockResolvedValue(undefined),
      getZoom: vi.fn().mockResolvedValue(1),
      setZoom: vi.fn().mockResolvedValue(1),
      destroy: vi.fn(),
    })),
  };
});

describe('useFlatEmbed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const containerRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useFlatEmbed(containerRef, { score: 'test-score', appId: 'test' })
    );

    expect(result.current.isReady).toBe(false);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.embedRef.current).toBeDefined();
  });

  it('exposes play method', () => {
    const containerRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useFlatEmbed(containerRef, { score: 'test-score', appId: 'test' })
    );

    expect(result.current.play).toBeDefined();
    expect(typeof result.current.play).toBe('function');
  });

  it('exposes pause method', () => {
    const containerRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useFlatEmbed(containerRef, { score: 'test-score', appId: 'test' })
    );

    expect(result.current.pause).toBeDefined();
    expect(typeof result.current.pause).toBe('function');
  });

  it('exposes zoom methods', () => {
    const containerRef = { current: document.createElement('div') };
    const { result } = renderHook(() =>
      useFlatEmbed(containerRef, { score: 'test-score', appId: 'test' })
    );

    expect(result.current.getZoom).toBeDefined();
    expect(result.current.setZoom).toBeDefined();
    expect(typeof result.current.getZoom).toBe('function');
    expect(typeof result.current.setZoom).toBe('function');
  });
});
