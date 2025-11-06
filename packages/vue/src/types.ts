import type Embed from 'flat-embed';
import type {
  EmbedParameters,
  EmbedEventName,
  NoteCursorPosition,
  PlaybackPosition,
  MeasureDetails,
  NoteDetails,
  ScoreDetails,
  PartConfiguration,
  ScoreTrackConfiguration,
  MetronomeMode,
} from 'flat-embed';

// Re-export types from flat-embed for convenience
export type {
  NoteCursorPosition,
  PlaybackPosition,
  MeasureDetails,
  NoteDetails,
  ScoreDetails,
  PartConfiguration,
  ScoreTrackConfiguration,
  MetronomeMode,
};

/**
 * Configuration object for FlatEmbed component
 * Matches the EmbedParameters interface from flat-embed
 */
export type FlatEmbedConfig = EmbedParameters;

/**
 * Props for the FlatEmbed component
 */
export interface FlatEmbedProps {
  /**
   * Configuration object for the embed
   * Can include score, embedParams, width, height, etc.
   */
  config?: FlatEmbedConfig;

  /**
   * Score ID (shorthand for config.score)
   */
  score?: string;

  /**
   * App ID (shorthand for config.embedParams.appId)
   */
  appId?: string;

  /**
   * Width of the embed container
   * Default: '100%'
   */
  width?: string;

  /**
   * Height of the embed container
   * Default: '600px'
   */
  height?: string;

  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;

  /**
   * ARIA description for accessibility
   */
  ariaDescription?: string;

  /**
   * Announce state changes to screen readers
   * Default: false
   */
  announceStateChanges?: boolean;

  /**
   * Unique ID for this embed (used with FlatEmbedProvider)
   */
  id?: string;
}

/**
 * Events emitted by the FlatEmbed component
 */
export interface FlatEmbedEmits {
  /** Called when the embed is ready and fully loaded */
  (e: 'ready'): void;

  /** Called when a score is loaded */
  (e: 'scoreLoaded'): void;

  /** Called when the cursor position changes */
  (e: 'cursorPosition', position: NoteCursorPosition): void;

  /** Called when cursor context changes */
  (e: 'cursorContext', context: unknown): void;

  /** Called when measure details change */
  (e: 'measureDetails', details: MeasureDetails): void;

  /** Called when note details change */
  (e: 'noteDetails', details: NoteDetails): void;

  /** Called when range selection changes */
  (e: 'rangeSelection', range: unknown): void;

  /** Called when fullscreen state changes */
  (e: 'fullscreen', isFullscreen: boolean): void;

  /** Called when playback starts */
  (e: 'play'): void;

  /** Called when playback pauses */
  (e: 'pause'): void;

  /** Called when playback stops */
  (e: 'stop'): void;

  /** Called when playback position changes */
  (e: 'playbackPosition', position: PlaybackPosition): void;

  /** Called when a restricted feature is attempted */
  (e: 'restrictedFeatureAttempt', feature: string): void;
}

/**
 * Imperative handle for FlatEmbed component
 * Exposes all methods from the Embed class
 */
export type FlatEmbedHandle = Embed;

/**
 * Options for useFlatEmbed composable
 */
export interface UseFlatEmbedOptions extends FlatEmbedConfig {
  /** Event handler for ready */
  onReady?: () => void;

  /** Event handler for score loaded */
  onScoreLoaded?: () => void;

  /** Event handler for cursor position changes */
  onCursorPosition?: (position: NoteCursorPosition) => void;

  /** Event handler for cursor context changes */
  onCursorContext?: (context: unknown) => void;

  /** Event handler for measure details */
  onMeasureDetails?: (details: MeasureDetails) => void;

  /** Event handler for note details */
  onNoteDetails?: (details: NoteDetails) => void;

  /** Event handler for range selection */
  onRangeSelection?: (range: unknown) => void;

  /** Event handler for fullscreen changes */
  onFullscreen?: (isFullscreen: boolean) => void;

  /** Event handler for play */
  onPlay?: () => void;

  /** Event handler for pause */
  onPause?: () => void;

  /** Event handler for stop */
  onStop?: () => void;

  /** Event handler for playback position */
  onPlaybackPosition?: (position: PlaybackPosition) => void;

  /** Event handler for restricted feature attempts */
  onRestrictedFeatureAttempt?: (feature: string) => void;
}

/**
 * Return type for useFlatEmbed composable
 */
export interface UseFlatEmbedReturn {
  /** Ref to attach to the container element */
  embedRef: import('vue').Ref<HTMLDivElement | null>;

  /** The embed instance (null until ready) */
  embed: import('vue').Ref<Embed | null>;

  /** Whether the embed is ready */
  isReady: import('vue').Ref<boolean>;

  /** Whether playback is currently playing */
  isPlaying: import('vue').Ref<boolean>;

  /** Current cursor position */
  cursorPosition: import('vue').Ref<NoteCursorPosition | null>;

  /** Current playback position */
  playbackPosition: import('vue').Ref<PlaybackPosition | null>;

  /** Start playback */
  play: () => Promise<void>;

  /** Pause playback */
  pause: () => Promise<void>;

  /** Stop playback */
  stop: () => Promise<void>;

  /** Load a score */
  loadScore: (scoreId: string) => Promise<void>;

  /** Set zoom level */
  setZoom: (zoom: number) => Promise<number>;

  /** Get zoom level */
  getZoom: () => Promise<number>;
}

/**
 * Context value for FlatEmbedProvider
 */
export interface FlatEmbedContextValue {
  /** Map of embed ID to embed instance */
  embeds: import('vue').Ref<Record<string, Embed | null>>;

  /** Get a specific embed by ID */
  getEmbed: (id: string) => Embed | null;

  /** Register a new embed */
  registerEmbed: (id: string, embed: Embed) => void;

  /** Unregister an embed */
  unregisterEmbed: (id: string) => void;

  /** Shared app ID for all embeds */
  appId?: string;
}

/**
 * Props for FlatEmbedProvider
 */
export interface FlatEmbedProviderProps {
  /** Shared app ID for all embeds in this provider */
  appId?: string;

  /** Shared locale for all embeds */
  locale?: string;
}

/**
 * Props for EmbedSkeleton component
 */
export interface EmbedSkeletonProps {
  /** Width of the skeleton */
  width?: string;

  /** Height of the skeleton */
  height?: string;

  /** Whether to show animation */
  animated?: boolean;

  /** Use pulse animation instead of shimmer */
  pulse?: boolean;
}
