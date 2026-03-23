<template>
  <div ref="containerRef" style="width: 100%; height: 100%" />
</template>

<script setup lang="ts">
import type { EmbedEventName } from 'flat-embed';
import Embed from 'flat-embed';
import { getCurrentInstance, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import type { FlatEmbedProps } from './types';

const props = defineProps<FlatEmbedProps>();

const emit = defineEmits<{
  ready: [];
  'score-loaded': [];
  'cursor-position': [position: import('flat-embed').NoteCursorPosition];
  'cursor-context': [context: any];
  'measure-details': [details: import('flat-embed').MeasureDetails];
  'note-details': [details: import('flat-embed').NoteDetails];
  'range-selection': [selection: any];
  fullscreen: [isFullscreen: boolean];
  play: [];
  pause: [];
  stop: [];
  'playback-position': [position: import('flat-embed').PlaybackPosition];
  'restricted-feature-attempt': [feature: any];
  'embed-size': [size: import('flat-embed').EmbedSize];
  'export-progress': [progress: any];
}>();

const containerRef = ref<HTMLDivElement>();
const embed = shallowRef<Embed | null>(null);
const isReady = ref(false);
const scoreLoaded = ref(false);
const cursorPosition = shallowRef<import('flat-embed').NoteCursorPosition | null>(null);
const playbackState = ref<'idle' | 'playing' | 'paused'>('idle');
const playbackPosition = shallowRef<import('flat-embed').PlaybackPosition | null>(null);
const embedSize = shallowRef<import('flat-embed').EmbedSize | null>(null);
const measureDetails = shallowRef<import('flat-embed').MeasureDetails | null>(null);
const noteDetails = shallowRef<import('flat-embed').NoteDetails | null>(null);

defineExpose({
  embed,
  isReady,
  scoreLoaded,
  cursorPosition,
  playbackState,
  playbackPosition,
  embedSize,
  measureDetails,
  noteDetails,
});

/**
 * Mapping from Vue kebab-case event names to Embed camelCase event names.
 * Note: 'ready' is not included here — it is handled via embed.ready() promise
 * because the Embed SDK intercepts the ready event internally.
 */
const EVENT_MAP: Record<string, EmbedEventName> = {
  'score-loaded': 'scoreLoaded',
  'cursor-position': 'cursorPosition',
  'cursor-context': 'cursorContext',
  'measure-details': 'measureDetails',
  'note-details': 'noteDetails',
  'range-selection': 'rangeSelection',
  fullscreen: 'fullscreen',
  play: 'play',
  pause: 'pause',
  stop: 'stop',
  'playback-position': 'playbackPosition',
  'restricted-feature-attempt': 'restrictedFeatureAttempt',
  'embed-size': 'embedSize',
  'export-progress': 'exportProgress',
};

/**
 * Handlers that update exposed reactive state in addition to emitting Vue events
 */
const STATE_HANDLERS: Record<string, (data: any) => void> = {
  'score-loaded': () => {
    scoreLoaded.value = true;
    emit('score-loaded');
  },
  'cursor-position': (data: any) => {
    cursorPosition.value = data;
    emit('cursor-position', data);
  },
  'measure-details': (data: any) => {
    measureDetails.value = data;
    emit('measure-details', data);
  },
  'note-details': (data: any) => {
    noteDetails.value = data;
    emit('note-details', data);
  },
  play: () => {
    playbackState.value = 'playing';
    emit('play');
  },
  pause: () => {
    playbackState.value = 'paused';
    emit('pause');
  },
  stop: () => {
    playbackState.value = 'idle';
    emit('stop');
  },
  'playback-position': (data: any) => {
    playbackPosition.value = data;
    emit('playback-position', data);
  },
  'embed-size': (data: any) => {
    embedSize.value = data;
    emit('embed-size', data);
  },
};

// Track active subscriptions for cleanup
const activeSubscriptions = new Map<EmbedEventName, (data: any) => void>();

/**
 * Detect which events have bound listeners and subscribe only to those
 */
function setupEventSubscriptions(embedInstance: Embed) {
  const instance = getCurrentInstance();
  const vnode = instance?.vnode;
  const vnodeProps = vnode?.props || {};

  for (const [vueEvent, embedEvent] of Object.entries(EVENT_MAP)) {
    // Vue 3 normalizes @some-event to onSomeEvent in vnode props
    const onKey = `on${vueEvent
      .split('-')
      .map(s => s[0].toUpperCase() + s.slice(1))
      .join('')}`;

    const hasListener = onKey in vnodeProps;

    if (hasListener || STATE_HANDLERS[vueEvent]) {
      const handler =
        STATE_HANDLERS[vueEvent] ||
        ((data: any) => {
          (emit as any)(vueEvent, data);
        });

      embedInstance.on(embedEvent, handler as () => void);
      activeSubscriptions.set(embedEvent, handler);
    }
  }
}

function cleanupSubscriptions(embedInstance: Embed) {
  for (const [event, handler] of activeSubscriptions) {
    embedInstance.off(event, handler as () => void);
  }
  activeSubscriptions.clear();
}

onMounted(() => {
  if (!containerRef.value) return;

  const embedInstance = new Embed(containerRef.value, {
    score: props.score,
    embedParams: props.embedParams,
    baseUrl: props.baseUrl,
    lazy: props.lazy,
  });

  embed.value = embedInstance;
  setupEventSubscriptions(embedInstance);

  // The 'ready' event is handled internally by Embed (not dispatched to listeners),
  // so we use the ready() promise to set isReady and emit the Vue event.
  embedInstance.ready().then(() => {
    isReady.value = true;
    emit('ready');
  });
});

onBeforeUnmount(() => {
  if (embed.value) {
    cleanupSubscriptions(embed.value);
  }
});

// Watch score prop for changes — reload when it changes
let initialScore = props.score;
watch(
  () => props.score,
  newScore => {
    // Skip the initial value since the constructor handles it
    if (newScore === initialScore) {
      initialScore = undefined;
      return;
    }
    initialScore = undefined;

    if (embed.value && newScore) {
      scoreLoaded.value = false;
      embed.value.loadFlatScore(newScore);
    }
  },
);
</script>
