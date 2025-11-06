/**
 * @flat/embed-vue
 *
 * Vue components and composables for Flat's Sheet Music Embed
 * https://flat.io/developers/docs/embed/
 */

// Main component
export { default as FlatEmbed } from './FlatEmbed.vue';

// Composables
export { useFlatEmbed } from './composables/useFlatEmbed';
export { useFlatEmbedContext } from './composables/useFlatEmbedContext';

// Provider
export { default as FlatEmbedProvider } from './FlatEmbedProvider.vue';

// Types
export type {
  FlatEmbedConfig,
  FlatEmbedProps,
  FlatEmbedEmits,
  FlatEmbedHandle,
  UseFlatEmbedOptions,
  UseFlatEmbedReturn,
  FlatEmbedContextValue,
  FlatEmbedProviderProps,
} from './types';

// Re-export useful types from flat-embed
export type {
  EmbedParameters,
  EmbedUrlParameters,
  EmbedEventName,
  NoteCursorPosition,
  PlaybackPosition,
  MeasureDetails,
  NoteDetails,
  PartConfiguration,
  ScoreTrackConfiguration,
  MetronomeMode,
} from 'flat-embed';
