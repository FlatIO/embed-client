import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FlatEmbed from './FlatEmbed.vue';

// Mock flat-embed
vi.mock('flat-embed', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      ready: vi.fn().mockResolvedValue(undefined),
      on: vi.fn(),
      off: vi.fn(),
      loadFlatScore: vi.fn().mockResolvedValue(undefined),
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
    })),
  };
});

describe('FlatEmbed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a container div', () => {
    const wrapper = mount(FlatEmbed, {
      props: {
        score: 'test-score',
        appId: 'test',
      },
    });

    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('accepts config prop', () => {
    const wrapper = mount(FlatEmbed, {
      props: {
        config: {
          score: 'test-score',
          embedParams: { appId: 'test-app-id' },
        },
      },
    });

    expect(wrapper.find('div').exists()).toBe(true);
  });

  it('applies width and height styles', () => {
    const wrapper = mount(FlatEmbed, {
      props: {
        score: 'test-score',
        appId: 'test',
        width: '800px',
        height: '600px',
      },
    });

    const div = wrapper.find('div');
    expect(div.attributes('style')).toContain('width: 800px');
    expect(div.attributes('style')).toContain('height: 600px');
  });
});
