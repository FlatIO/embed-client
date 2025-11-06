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

// Dev mode warnings
if (import.meta.env.DEV) {
  const config = getConfig();
  if (!config.embedParams?.appId) {
    console.warn(
      '[@flat/embed-vue] Missing appId in embedParams.\n' +
      'This works on localhost but will fail in production.\n' +
      'Get your appId at: https://flat.io/developers/apps'
    );
  }
}

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

  // Subscribe to events with proper types
  embed.on('scoreLoaded', () => emit('scoreLoaded'));
  embed.on('cursorPosition', ((pos: NoteCursorPosition) => emit('cursorPosition', pos)) as any);
  embed.on('cursorContext', ((ctx: unknown) => emit('cursorContext', ctx)) as any);
  embed.on('measureDetails', ((details: MeasureDetails) => emit('measureDetails', details)) as any);
  embed.on('noteDetails', ((details: NoteDetails) => emit('noteDetails', details)) as any);
  embed.on('rangeSelection', ((range: unknown) => emit('rangeSelection', range)) as any);
  embed.on('fullscreen', ((isFs: boolean) => emit('fullscreen', isFs)) as any);
  embed.on('play', () => emit('play'));
  embed.on('pause', () => emit('pause'));
  embed.on('stop', () => emit('stop'));
  embed.on('playbackPosition', ((pos: PlaybackPosition) => emit('playbackPosition', pos)) as any);
  embed.on('restrictedFeatureAttempt', ((feature: string) => emit('restrictedFeatureAttempt', feature)) as any);

  // Register with context if available
  if (context && props.id) {
    context.registerEmbed(props.id, embed);
  }
});

// Cleanup
onUnmounted(() => {
  if (context && props.id) {
    context.unregisterEmbed(props.id);
  }
  embedRef.value = null;
  isReady.value = false;
});

// Expose embed instance for template refs
defineExpose({
  embed: embedRef,
  ...embedRef.value,
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
