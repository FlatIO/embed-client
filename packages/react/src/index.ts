/**
 * @flat/embed-react
 *
 * React components and hooks for Flat's Sheet Music Embed
 * https://flat.io/developers/docs/embed/
 */

// Main component
export { FlatEmbed } from './FlatEmbed';

// Hooks
export { useFlatEmbed } from './useFlatEmbed';

// Provider and context
export { FlatEmbedProvider, useFlatEmbedContext } from './FlatEmbedProvider';

// Types
export type {
  FlatEmbedConfig,
  FlatEmbedProps,
  FlatEmbedHandle,
  FlatEmbedEventHandlers,
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
