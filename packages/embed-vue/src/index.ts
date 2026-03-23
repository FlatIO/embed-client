// Re-export key types from flat-embed for convenience
export type {
  EmbedSize,
  EmbedUrlParameters,
  MeasureDetails,
  NoteCursorPosition,
  NoteDetails,
  PlaybackPosition,
} from 'flat-embed';
export { default as FlatEmbed } from './FlatEmbed.vue';
export type { FlatEmbedExpose, FlatEmbedProps } from './types';
