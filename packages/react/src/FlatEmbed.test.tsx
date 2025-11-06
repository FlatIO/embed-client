import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FlatEmbed } from './FlatEmbed';

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
    const { container } = render(<FlatEmbed score="test-score" appId="test" />);
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('accepts config object', () => {
    const config = {
      score: 'test-score',
      embedParams: { appId: 'test-app-id' },
    };

    const { container } = render(<FlatEmbed config={config} />);
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('merges config with individual props', () => {
    const config = {
      score: 'config-score',
      embedParams: { appId: 'config-app-id' },
    };

    const { container } = render(
      <FlatEmbed config={config} score="prop-score" appId="prop-app-id" />
    );
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it('applies width and height styles', () => {
    const { container } = render(
      <FlatEmbed score="test-score" appId="test" width="800px" height="600px" />
    );

    const div = container.firstChild as HTMLElement;
    expect(div.style.width).toBe('800px');
    expect(div.style.height).toBe('600px');
  });
});
