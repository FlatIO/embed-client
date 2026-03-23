import type Embed from 'flat-embed';
import type {
  EmbedSize,
  EmbedUrlParameters,
  MeasureDetails,
  NoteCursorPosition,
  NoteDetails,
  PlaybackPosition,
} from 'flat-embed';

/**
 * Props for the FlatEmbed component
 */
export interface FlatEmbedProps {
  /** Unique identifier of the Flat score to load */
  score?: string;
  /** Optional configuration and customization options */
  embedParams?: EmbedUrlParameters;
  /** Base URL for the embed (defaults to Flat's production embed) */
  baseUrl?: string;
  /** Lazy loading of the iframe */
  lazy?: boolean;
}

/**
 * Exposed state and methods from the FlatEmbed component
 */
export interface FlatEmbedExpose {
  /** Raw Embed instance for calling any of the 60+ methods */
  embed: Embed | null;
  /** Whether the embed is ready */
  isReady: boolean;
  /** Whether a score has been loaded */
  scoreLoaded: boolean;
  /** Current cursor position */
  cursorPosition: NoteCursorPosition | null;
  /** Current playback state */
  playbackState: 'idle' | 'playing' | 'paused';
  /** Current playback position */
  playbackPosition: PlaybackPosition | null;
  /** Current embed size */
  embedSize: EmbedSize | null;
  /** Current measure details */
  measureDetails: MeasureDetails | null;
  /** Current note details */
  noteDetails: NoteDetails | null;
}
