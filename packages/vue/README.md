# @flat/embed-vue

Vue 3 components and composables for [Flat's Sheet Music Embed](https://flat.io/embed).

[![NPM Version](https://img.shields.io/npm/v/@flat/embed-vue.svg)](https://www.npmjs.org/package/@flat/embed-vue)

## Features

- 🎼 **Declarative API** - Use Flat Embed as a Vue component
- 🪝 **Composables** - Headless composables for custom UIs
- 🎯 **TypeScript** - Full type safety with autocomplete
- ⚡ **Vue 3** - Composition API with `<script setup>`
- 🧪 **Testing Utils** - Mock embeds for easy testing
- 🎨 **Loading States** - Built-in skeleton components
- ♿ **Accessible** - ARIA labels and screen reader support
- 🌳 **Tree-shakeable** - Only pay for what you use

## Installation

```bash
npm install @flat/embed-vue
# or
pnpm add @flat/embed-vue
# or
yarn add @flat/embed-vue
```

## Quick Start

### Simple Usage

```vue
<script setup>
import { FlatEmbed } from '@flat/embed-vue';
</script>

<template>
  <FlatEmbed
    score="56ae21579a127715a02901a6"
    app-id="your-app-id"
    height="600px"
    @ready="() => console.log('Ready!')"
    @play="() => console.log('Playing')"
  />
</template>
```

### With Config Object

```vue
<script setup>
import { FlatEmbed } from '@flat/embed-vue';

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
</script>

<template>
  <FlatEmbed
    :config="embedConfig"
    @ready="() => console.log('Ready!')"
  />
</template>
```

### With Template Ref (Imperative Control)

```vue
<script setup>
import { FlatEmbed } from '@flat/embed-vue';
import { ref } from 'vue';

const embedRef = ref();

const handlePlay = () => embedRef.value?.play();
const handlePause = () => embedRef.value?.pause();
const handleZoomIn = async () => {
  const zoom = await embedRef.value?.getZoom();
  if (zoom) {
    await embedRef.value?.setZoom(zoom + 0.1);
  }
};
</script>

<template>
  <div>
    <FlatEmbed
      ref="embedRef"
      score="56ae21579a127715a02901a6"
      app-id="your-app-id"
    />

    <div>
      <button @click="handlePlay">Play</button>
      <button @click="handlePause">Pause</button>
      <button @click="handleZoomIn">Zoom In</button>
    </div>
  </div>
</template>
```

## Composables

### `useFlatEmbed` - Headless Composable

```vue
<script setup>
import { useFlatEmbed } from '@flat/embed-vue';
import { ref } from 'vue';

const containerRef = ref();

const {
  isReady,
  isPlaying,
  play,
  pause,
  cursorPosition,
} = useFlatEmbed(containerRef, {
  score: '56ae21579a127715a02901a6',
  embedParams: {
    appId: 'your-app-id',
  },
  onPlay: () => console.log('Playing'),
});
</script>

<template>
  <div>
    <div ref="containerRef" style="height: 600px" />

    <div v-if="!isReady">Loading...</div>

    <div v-if="isReady">
      <button @click="play" :disabled="isPlaying">
        {{ isPlaying ? 'Playing...' : 'Play' }}
      </button>
      <button @click="pause" :disabled="!isPlaying">
        Pause
      </button>

      <div v-if="cursorPosition">
        Measure: {{ cursorPosition.measureIdx + 1 }}
      </div>
    </div>
  </div>
</template>
```

## Multiple Embeds

Use `FlatEmbedProvider` to manage multiple embeds:

```vue
<script setup>
import { FlatEmbedProvider, FlatEmbed, useFlatEmbedContext } from '@flat/embed-vue';

const { embeds } = useFlatEmbedContext();

const playAll = async () => {
  await Promise.all(
    Object.values(embeds.value).map(e => e?.play())
  );
};
</script>

<template>
  <FlatEmbedProvider app-id="your-app-id">
    <FlatEmbed id="main" score="score-1" />
    <FlatEmbed id="reference" score="score-2" />

    <button @click="playAll">Play All</button>
  </FlatEmbedProvider>
</template>
```

## Loading States

Use the `useFlatEmbed` composable to implement custom loading states:

```vue
<script setup>
import { useFlatEmbed } from '@flat/embed-vue';

const { embedRef, isReady } = useFlatEmbed({
  score: '...',
  embedParams: { appId: '...' },
});
</script>

<template>
  <div>
    <div v-if="!isReady">Loading score...</div>
    <div ref="embedRef" style="height: 600px" />
  </div>
</template>
```

## Accessibility

```vue
<template>
  <FlatEmbed
    score="..."
    app-id="..."
    aria-label="Beethoven Symphony No. 5"
    aria-description="Interactive sheet music viewer with playback controls"
    :announce-state-changes="true"
  />
</template>
```

## Testing

```ts
import { createMockEmbed } from '@flat/embed-vue/testing';
import { mount } from '@vue/test-utils';

test('should play on button click', async () => {
  const mockEmbed = createMockEmbed();

  const wrapper = mount(MyMusicPlayer, {
    props: { embed: mockEmbed }
  });

  await wrapper.find('button').trigger('click');
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
| `app-id` | `string` | App ID (shorthand for `config.embedParams.appId`) |
| `width` | `string` | Width (default: `'100%'`) |
| `height` | `string` | Height (default: `'600px'`) |
| `aria-label` | `string` | ARIA label |
| `aria-description` | `string` | ARIA description |
| `id` | `string` | Unique ID (for use with Provider) |

#### Events

| Event | Type | Description |
|-------|------|-------------|
| `@ready` | `() => void` | Embed is ready |
| `@score-loaded` | `() => void` | Score loaded |
| `@play` | `() => void` | Playback started |
| `@pause` | `() => void` | Playback paused |
| `@stop` | `() => void` | Playback stopped |
| `@cursor-position` | `(pos: NoteCursorPosition) => void` | Cursor moved |
| `@playback-position` | `(pos: PlaybackPosition) => void` | Playback position changed |
| `@fullscreen` | `(isFullscreen: boolean) => void` | Fullscreen toggled |

[See all events in the docs](https://flat.io/developers/docs/embed/api/events)

#### Slots

| Slot | Description |
|------|-------------|
| `loading` | Custom loading content |

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

### `useFlatEmbed(containerRef, options)`

Returns:

```typescript
{
  embedRef: Ref<HTMLDivElement | null>;
  embed: Ref<Embed | null>;
  isReady: Ref<boolean>;
  isPlaying: Ref<boolean>;
  cursorPosition: Ref<NoteCursorPosition | null>;
  playbackPosition: Ref<PlaybackPosition | null>;
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

```vue
<script setup lang="ts">
import type { FlatEmbedConfig } from '@flat/embed-vue';

const config: FlatEmbedConfig = {
  score: '...',
  embedParams: {
    mode: 'view', // ✓ Autocomplete: 'view' | 'edit'
    locale: 'en', // ✓ Autocomplete: all 30 locales
  },
};
</script>
```

## SSR Support

Safe for Nuxt and other SSR frameworks:

```vue
<script setup>
import { FlatEmbed } from '@flat/embed-vue';

// Component is SSR-safe - no window references during SSR
</script>

<template>
  <FlatEmbed score="..." app-id="..." />
</template>
```

## Examples

- [Simple Player](../../examples/vue-vite)
- [Nuxt App](../../examples/vue-nuxt)
- [Custom Controls](../../examples/vue-custom-controls)
- [Multiple Embeds](../../examples/vue-multi-embed)

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
