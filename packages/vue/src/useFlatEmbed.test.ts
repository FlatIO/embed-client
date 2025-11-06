import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ref } from 'vue';
import { useFlatEmbed } from './composables/useFlatEmbed';

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
    const containerRef = ref<HTMLDivElement | null>(null);
    containerRef.value = document.createElement('div');

    const result = useFlatEmbed(containerRef, { score: 'test-score', appId: 'test' });

    expect(result.isReady.value).toBe(false);
    expect(result.isPlaying.value).toBe(false);
    expect(result.embedRef.value).toBeDefined();
  });

  it('exposes play method', () => {
    const containerRef = ref<HTMLDivElement | null>(null);
    containerRef.value = document.createElement('div');

    const result = useFlatEmbed(containerRef, { score: 'test-score', appId: 'test' });

    expect(result.play).toBeDefined();
    expect(typeof result.play).toBe('function');
  });

  it('exposes pause method', () => {
    const containerRef = ref<HTMLDivElement | null>(null);
    containerRef.value = document.createElement('div');

    const result = useFlatEmbed(containerRef, { score: 'test-score', appId: 'test' });

    expect(result.pause).toBeDefined();
    expect(typeof result.pause).toBe('function');
  });

  it('exposes zoom methods', () => {
    const containerRef = ref<HTMLDivElement | null>(null);
    containerRef.value = document.createElement('div');

    const result = useFlatEmbed(containerRef, { score: 'test-score', appId: 'test' });

    expect(result.getZoom).toBeDefined();
    expect(result.setZoom).toBeDefined();
    expect(typeof result.getZoom).toBe('function');
    expect(typeof result.setZoom).toBe('function');
  });
});
