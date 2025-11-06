<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Embed from 'flat-embed';
import type {
  NoteCursorPosition,
  PlaybackPosition,
  MeasureDetails,
  NoteDetails,
} from 'flat-embed';
import type { FlatEmbedProps, FlatEmbedEmits } from './types';
import { useFlatEmbedContext } from './composables/useFlatEmbedContext';

/**
 * Vue component for Flat's Sheet Music Embed
 *
 * @example
 * ```vue
 * <FlatEmbed
 *   score="56ae21579a127715a02901a6"
 *   app-id="your-app-id"
 *   height="600px"
 *   @ready="() => console.log('Ready!')"
 *   @play="() => console.log('Playing')"
 * />
 * ```
 *
 * @example With config object - see README for full example
 */

const props = withDefaults(defineProps<FlatEmbedProps>(), {
  width: '100%',
  height: '600px',
  announceStateChanges: false,
});

const emit = defineEmits<FlatEmbedEmits>();

const containerRef = ref<HTMLDivElement | null>(null);
const embedRef = ref<Embed | null>(null);
const isReady = ref(false);
const context = useFlatEmbedContext();

// Merge config from props
const getConfig = () => {
  return {
    ...props.config,
    ...(props.score && { score: props.score }),
    width: props.width,
    height: props.height,
    embedParams: {
      ...props.config?.embedParams,
      ...(props.appId && { appId: props.appId }),
      ...(context?.appId && !props.appId && !props.config?.embedParams?.appId && { appId: context.appId }),
    },
  };
};

// Dev mode warnings (check for development environment - works with any bundler)
if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
  const config = getConfig();
  if (!config.embedParams?.appId) {
    console.warn(
      '[@flat/embed-vue] Missing appId in embedParams.\n' +
      'This works on localhost but will fail in production.\n' +
      'Get your appId at: https://flat.io/developers/apps'
    );
  }
}

// Store event handlers for cleanup
const eventHandlers = {
  scoreLoaded: () => emit('scoreLoaded'),
  // Note: Using 'as any' cast due to event handler signature mismatch in flat-embed types
  // The actual event data types are correct (NoteCursorPosition, PlaybackPosition, etc.)
  cursorPosition: ((pos: NoteCursorPosition) => emit('cursorPosition', pos)) as any,
  cursorContext: ((ctx: unknown) => emit('cursorContext', ctx)) as any,
  measureDetails: ((details: MeasureDetails) => emit('measureDetails', details)) as any,
  noteDetails: ((details: NoteDetails) => emit('noteDetails', details)) as any,
  rangeSelection: ((range: unknown) => emit('rangeSelection', range)) as any,
  fullscreen: ((isFs: boolean) => emit('fullscreen', isFs)) as any,
  play: () => emit('play'),
  pause: () => emit('pause'),
  stop: () => emit('stop'),
  playbackPosition: ((pos: PlaybackPosition) => emit('playbackPosition', pos)) as any,
  restrictedFeatureAttempt: ((feature: string) => emit('restrictedFeatureAttempt', feature)) as any,
};

// Initialize embed
onMounted(() => {
  if (!containerRef.value) return;

  const config = getConfig();
  const embed = new Embed(containerRef.value, config);
  embedRef.value = embed;

  // Wait for ready
  embed.ready().then(() => {
    isReady.value = true;
    emit('ready');
  });

  // Subscribe to events
  embed.on('scoreLoaded', eventHandlers.scoreLoaded);
  embed.on('cursorPosition', eventHandlers.cursorPosition);
  embed.on('cursorContext', eventHandlers.cursorContext);
  embed.on('measureDetails', eventHandlers.measureDetails);
  embed.on('noteDetails', eventHandlers.noteDetails);
  embed.on('rangeSelection', eventHandlers.rangeSelection);
  embed.on('fullscreen', eventHandlers.fullscreen);
  embed.on('play', eventHandlers.play);
  embed.on('pause', eventHandlers.pause);
  embed.on('stop', eventHandlers.stop);
  embed.on('playbackPosition', eventHandlers.playbackPosition);
  embed.on('restrictedFeatureAttempt', eventHandlers.restrictedFeatureAttempt);

  // Register with context if available
  if (context && props.id) {
    context.registerEmbed(props.id, embed);
  }
});

// Cleanup
onUnmounted(() => {
  const embed = embedRef.value;

  // Unsubscribe from all events to prevent memory leaks
  if (embed) {
    embed.off('scoreLoaded', eventHandlers.scoreLoaded);
    embed.off('cursorPosition', eventHandlers.cursorPosition);
    embed.off('cursorContext', eventHandlers.cursorContext);
    embed.off('measureDetails', eventHandlers.measureDetails);
    embed.off('noteDetails', eventHandlers.noteDetails);
    embed.off('rangeSelection', eventHandlers.rangeSelection);
    embed.off('fullscreen', eventHandlers.fullscreen);
    embed.off('play', eventHandlers.play);
    embed.off('pause', eventHandlers.pause);
    embed.off('stop', eventHandlers.stop);
    embed.off('playbackPosition', eventHandlers.playbackPosition);
    embed.off('restrictedFeatureAttempt', eventHandlers.restrictedFeatureAttempt);
  }

  if (context && props.id) {
    context.unregisterEmbed(props.id);
  }
  embedRef.value = null;
  isReady.value = false;
});

// Expose embed instance so users can call methods via ref
// Users access methods like: embedRef.value.play()
defineExpose({
  embedRef,
});
</script>

<template>
  <div
    ref="containerRef"
    :style="{
      width: props.width,
      height: props.height,
      position: 'relative',
    }"
    role="application"
    :aria-label="props.ariaLabel"
    :aria-description="props.ariaDescription"
    :aria-live="props.announceStateChanges ? 'polite' : undefined"
  >
    <slot v-if="!isReady" name="loading">
      <!-- Default loading slot - user can override -->
    </slot>
  </div>
</template>
