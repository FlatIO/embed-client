/**
 * Supported track types for synchronized media playback
 */
export type ScoreTrackType = 'youtube' | 'soundcloud' | 'vimeo' | 'audio' | 'external';

/**
 * Synchronization point between score and media track
 */
export interface ScoreTrackSynchronizationPoint {
  /** Type of synchronization point */
  type: 'measure' | 'end';
  /** Time in seconds in the media track */
  time: number;
  /** Location in the score (required for 'measure' type) */
  location?: {
    /** Zero-based index of the measure */
    measureIdx: number;
  };
}

/**
 * Configuration for audio/video track synchronization with score
 */
export interface ScoreTrackConfiguration {
  /** Unique identifier for this track configuration */
  id: string;
  /** The type of media track */
  type: ScoreTrackType;
  /** URL of the media file (required for 'soundcloud' and 'audio' types) */
  url?: string;
  /** Video/media identifier (required for 'youtube' and 'vimeo' types) */
  mediaId?: string;
  /** Total duration in seconds (required for 'external' type) */
  totalTime?: number;
  /** List of synchronization points between score and media */
  synchronizationPoints: ScoreTrackSynchronizationPoint[];
}
