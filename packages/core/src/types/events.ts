/**
 * Available embed events that can be subscribed to
 */
export const EVENTS_NAMES = [
  'ready',
  'scoreLoaded',
  'cursorPosition',
  'cursorContext',
  'measureDetails',
  'noteDetails',
  'rangeSelection',
  'fullscreen',
  'play',
  'pause',
  'stop',
  'playbackPosition',
  'restrictedFeatureAttempt',
] as const;

/**
 * Embed event name type
 */
export type EmbedEventName = (typeof EVENTS_NAMES)[number];
