export type ScoreTrackType = 'youtube' | 'soundcloud' | 'vimeo' | 'audio' | 'external';

export interface ScoreTrackSynchronizationPoint {
  // The type of synchronization point
  type: 'measure' | 'end';
  // The time in seconds of the synchronization point
  time: number;
  // The location of the synchronization point
  location?: {
    // The index of the measure where the synchronization point is located
    measureIdx: number;
  };
}

export interface ScoreTrackConfiguration {
  // Unique identifier for the configuration
  id: string;
  // The type of track to configure
  type: ScoreTrackType;
  // The URL of the Soundcloud or audio file to load (required for 'soundcloud' and 'audio' types)
  url?: string;
  // The video identifier to embed (required for 'youtube' and 'vimeo' types)
  mediaId?: string;
  // The total time of the media played (required for 'external' type)
  totalTime?: number;
  // The list of synchronization points to use
  synchronizationPoints: ScoreTrackSynchronizationPoint[];
}
