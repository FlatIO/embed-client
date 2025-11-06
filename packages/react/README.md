# @flat/embed-react

React components and hooks for [Flat's Sheet Music Embed](https://flat.io/embed).

[![NPM Version](https://img.shields.io/npm/v/@flat/embed-react.svg)](https://www.npmjs.org/package/@flat/embed-react)

## Features

- 🎼 **Declarative API** - Use Flat Embed as a React component
- 🪝 **Hooks Support** - Headless hooks for custom UIs
- 🎯 **TypeScript** - Full type safety with autocomplete
- ⚡ **Modern React** - React 18 support with Suspense
- 🧪 **Testing Utils** - Mock embeds for easy testing
- 🎨 **Loading States** - Built-in skeleton components
- ♿ **Accessible** - ARIA labels and screen reader support
- 🌳 **Tree-shakeable** - Only pay for what you use

## Installation

```bash
npm install @flat/embed-react flat-embed
# or
pnpm add @flat/embed-react flat-embed
# or
yarn add @flat/embed-react flat-embed
```

## Quick Start

### Simple Usage

```tsx
import { FlatEmbed } from '@flat/embed-react';

function App() {
  return (
    <FlatEmbed
      score="56ae21579a127715a02901a6"
      appId="your-app-id"
      height="600px"
      onReady={() => console.log('Ready!')}
      onPlay={() => console.log('Playing')}
    />
  );
}
```

### With Config Object

```tsx
import { FlatEmbed } from '@flat/embed-react';

const embedConfig = {
  score: '56ae21579a127715a02901a6',
  embedParams: {
    appId: 'your-app-id',
    mode: 'view',
    layout: 'responsive',
    zoom: 1.2,
    controlsPlay: true,
    themePrimary: '#007bff',
  },
};

function App() {
  return (
    <FlatEmbed
      config={embedConfig}
      onReady={() => console.log('Ready!')}
    />
  );
}
```

### With Imperative Control

```tsx
import { FlatEmbed, FlatEmbedHandle } from '@flat/embed-react';
import { useRef } from 'react';

function MusicPlayer() {
  const embedRef = useRef<FlatEmbedHandle>(null);

  const handlePlay = () => embedRef.current?.play();
  const handlePause = () => embedRef.current?.pause();
  const handleZoomIn = async () => {
    const zoom = await embedRef.current?.getZoom();
    if (zoom) {
      await embedRef.current?.setZoom(zoom + 0.1);
    }
  };

  return (
    <>
      <FlatEmbed
        ref={embedRef}
        score="56ae21579a127715a02901a6"
        appId="your-app-id"
      />

      <div>
        <button onClick={handlePlay}>Play</button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleZoomIn}>Zoom In</button>
      </div>
    </>
  );
}
```

## Hooks

### `useFlatEmbed` - Headless Hook

```tsx
import { useFlatEmbed } from '@flat/embed-react';

function CustomPlayer() {
  const {
    embedRef,
    isReady,
    isPlaying,
    play,
    pause,
    cursorPosition,
  } = useFlatEmbed({
    score: '56ae21579a127715a02901a6',
    embedParams: {
      appId: 'your-app-id',
    },
    onPlay: () => console.log('Playing'),
  });

  return (
    <div>
      <div ref={embedRef} style={{ height: 600 }} />

      {!isReady && <div>Loading...</div>}

      {isReady && (
        <>
          <button onClick={play} disabled={isPlaying}>
            {isPlaying ? 'Playing...' : 'Play'}
          </button>
          <button onClick={pause} disabled={!isPlaying}>
            Pause
          </button>

          {cursorPosition && (
            <div>Measure: {cursorPosition.measureIdx + 1}</div>
          )}
        </>
      )}
    </div>
  );
}
```

## Multiple Embeds

Use `FlatEmbedProvider` to manage multiple embeds:

```tsx
import { FlatEmbedProvider, FlatEmbed, useFlatEmbedContext } from '@flat/embed-react';

function App() {
  return (
    <FlatEmbedProvider appId="your-app-id">
      <FlatEmbed id="main" score="score-1" />
      <FlatEmbed id="reference" score="score-2" />
      <GlobalControls />
    </FlatEmbedProvider>
  );
}

function GlobalControls() {
  const { embeds } = useFlatEmbedContext();

  const playAll = async () => {
    await Promise.all(
      Object.values(embeds).map(e => e?.play())
    );
  };

  return <button onClick={playAll}>Play All</button>;
}
```

## Loading States

Built-in skeleton component:

```tsx
import { FlatEmbed, EmbedSkeleton } from '@flat/embed-react';

<FlatEmbed
  score="..."
  appId="..."
  loading={<EmbedSkeleton animated />}
/>

// Or use standalone
{!isReady && <EmbedSkeleton height="600px" pulse />}
```

## Accessibility

```tsx
<FlatEmbed
  score="..."
  appId="..."
  ariaLabel="Beethoven Symphony No. 5"
  ariaDescription="Interactive sheet music viewer with playback controls"
  announceStateChanges={true}
/>
```

## Testing

```tsx
import { createMockEmbed } from '@flat/embed-react/testing';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('should play on button click', async () => {
  const mockEmbed = createMockEmbed();

  render(<MyMusicPlayer embed={mockEmbed} />);

  await userEvent.click(screen.getByRole('button', { name: 'Play' }));
  expect(mockEmbed.play).toHaveBeenCalled();
});
```

## API Reference

### `<FlatEmbed>`

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `config` | `FlatEmbedConfig` | Configuration object (see below) |
| `score` | `string` | Score ID (shorthand for `config.score`) |
| `appId` | `string` | App ID (shorthand for `config.embedParams.appId`) |
| `width` | `string` | Width (default: `'100%'`) |
| `height` | `string` | Height (default: `'600px'`) |
| `loading` | `ReactNode` | Loading component |
| `ariaLabel` | `string` | ARIA label |
| `ariaDescription` | `string` | ARIA description |
| `className` | `string` | Additional className |
| `style` | `CSSProperties` | Additional styles |

#### Events

| Event | Type | Description |
|-------|------|-------------|
| `onReady` | `() => void` | Embed is ready |
| `onScoreLoaded` | `() => void` | Score loaded |
| `onPlay` | `() => void` | Playback started |
| `onPause` | `() => void` | Playback paused |
| `onStop` | `() => void` | Playback stopped |
| `onCursorPosition` | `(pos: NoteCursorPosition) => void` | Cursor moved |
| `onPlaybackPosition` | `(pos: PlaybackPosition) => void` | Playback position changed |
| `onFullscreen` | `(isFullscreen: boolean) => void` | Fullscreen toggled |

[See all events in the docs](https://flat.io/developers/docs/embed/api/events)

#### Config Object

```typescript
interface FlatEmbedConfig {
  score?: string;
  width?: string;
  height?: string;
  lazy?: boolean;
  embedParams?: {
    appId?: string;
    mode?: 'view' | 'edit';
    locale?: string;
    layout?: 'responsive' | 'page' | 'track';
    zoom?: 'auto' | number;
    // ... 50+ more options
  };
}
```

[See all embed parameters](https://flat.io/developers/docs/embed/url-parameters)

### `useFlatEmbed(options)`

Returns:

```typescript
{
  embedRef: RefObject<HTMLDivElement>;
  embed: Embed | null;
  isReady: boolean;
  isPlaying: boolean;
  cursorPosition: NoteCursorPosition | null;
  playbackPosition: PlaybackPosition | null;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  loadScore: (scoreId: string) => Promise<void>;
  setZoom: (zoom: number) => Promise<number>;
  getZoom: () => Promise<number>;
}
```

## TypeScript

Full TypeScript support with autocomplete:

```tsx
import type { FlatEmbedConfig, FlatEmbedHandle } from '@flat/embed-react';

const config: FlatEmbedConfig = {
  score: '...',
  embedParams: {
    mode: 'view', // ✓ Autocomplete: 'view' | 'edit'
    locale: 'en', // ✓ Autocomplete: all 30 locales
  },
};

const ref = useRef<FlatEmbedHandle>(null);
// ✓ Full autocomplete on ref.current
```

## SSR Support

Safe for Next.js and other SSR frameworks:

```tsx
'use client'; // Next.js 13+ App Router

import { FlatEmbed } from '@flat/embed-react';

export default function Page() {
  return <FlatEmbed score="..." appId="..." />;
}
```

## Examples

- [Simple Player](../../examples/react-vite)
- [Next.js App](../../examples/react-nextjs)
- [Custom Controls](../../examples/react-custom-controls)
- [Multiple Embeds](../../examples/react-multi-embed)

## Documentation

- [Embed API Documentation](https://flat.io/developers/docs/embed/)
- [URL Parameters Reference](https://flat.io/developers/docs/embed/url-parameters)
- [Events Reference](https://flat.io/developers/docs/embed/api/events)

## Support

- [Developer Docs](https://flat.io/developers/docs/embed/)
- [Email Support](mailto:developers@flat.io)
- [GitHub Issues](https://github.com/FlatIO/embed-client/issues)

## License

Apache-2.0 - see [LICENSE](../../LICENSE)
