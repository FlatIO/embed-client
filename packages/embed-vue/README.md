# @flat/embed-vue

Vue 3 component for [Flat's interactive sheet music embed](https://flat.io/embed).

Wraps the [`flat-embed`](https://www.npmjs.com/package/flat-embed) SDK as a reactive Vue component with typed props, events, and exposed state.

## Install

```bash
npm install @flat/embed-vue
# or
pnpm add @flat/embed-vue
```

**Peer dependency:** Vue 3.3+

## Quick Start

```vue
<template>
  <FlatEmbed
    ref="flatEmbed"
    :score="scoreId"
    :embed-params="{ appId: 'your-app-id', controlsPlay: true }"
    @cursor-position="onCursor"
    @play="onPlay"
  />

  <button @click="flatEmbed?.embed?.play()">Play</button>
  <button @click="flatEmbed?.embed?.pause()">Pause</button>
  <p>{{ flatEmbed?.playbackState }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FlatEmbed } from '@flat/embed-vue'

const scoreId = ref('56ae21579a127715a02901a6')
const flatEmbed = ref<InstanceType<typeof FlatEmbed>>()

const onCursor = (pos) => console.log('cursor:', pos.measureIdx)
const onPlay = () => console.log('playing')
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `score` | `string` | Score ID to load. Changing this reactively reloads the score. |
| `embed-params` | `EmbedUrlParameters` | Embed configuration ([docs](https://flat.io/developers/docs/embed/url-parameters)) |
| `base-url` | `string` | Custom base URL for the embed |
| `lazy` | `boolean` | Lazy load the iframe |

## Events

Subscribe with `@event-name`. **Only events you bind are subscribed** to on the embed — no unnecessary postMessage traffic.

| Vue Event | Embed Event | Payload |
|-----------|-------------|---------|
| `ready` | — | — |
| `score-loaded` | `scoreLoaded` | — |
| `cursor-position` | `cursorPosition` | `NoteCursorPosition` |
| `cursor-context` | `cursorContext` | `object` |
| `measure-details` | `measureDetails` | `MeasureDetails` |
| `note-details` | `noteDetails` | `NoteDetails` |
| `range-selection` | `rangeSelection` | `object` |
| `fullscreen` | `fullscreen` | `boolean` |
| `play` | `play` | — |
| `pause` | `pause` | — |
| `stop` | `stop` | — |
| `playback-position` | `playbackPosition` | `PlaybackPosition` |
| `restricted-feature-attempt` | `restrictedFeatureAttempt` | `object` |
| `embed-size` | `embedSize` | `EmbedSize` |
| `export-progress` | `exportProgress` | `object` |

## Exposed State

Access via template ref. State updates reactively when corresponding events fire.

```ts
const flatEmbed = ref<InstanceType<typeof FlatEmbed>>()

flatEmbed.value?.embed          // Embed | null — raw SDK instance
flatEmbed.value?.isReady        // boolean
flatEmbed.value?.scoreLoaded    // boolean
flatEmbed.value?.cursorPosition // NoteCursorPosition | null
flatEmbed.value?.playbackState  // 'idle' | 'playing' | 'paused'
flatEmbed.value?.playbackPosition // PlaybackPosition | null
flatEmbed.value?.embedSize      // EmbedSize | null
flatEmbed.value?.measureDetails // MeasureDetails | null
flatEmbed.value?.noteDetails    // NoteDetails | null
```

## Full API Access

The exposed `embed` property gives you access to all 60+ methods from the `flat-embed` SDK:

```ts
await flatEmbed.value?.embed?.getPDF()
await flatEmbed.value?.embed?.loadMusicXML(xmlString)
await flatEmbed.value?.embed?.setMasterVolume({ volume: 0.5 })
await flatEmbed.value?.embed?.setCursorPosition({ noteIdx: 0 })
```

See the [flat-embed API documentation](https://flat.io/developers/docs/embed/) for all available methods.

## Reactive Score Loading

Change the `score` prop to load a different score:

```vue
<script setup>
const scoreId = ref('score-1')

// This triggers an automatic reload
scoreId.value = 'score-2'
</script>

<template>
  <FlatEmbed :score="scoreId" :embed-params="{ appId: '...' }" />
</template>
```

## License

Apache-2.0
