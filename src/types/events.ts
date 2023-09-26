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
] as const;

export type EmbedEventName = (typeof EVENTS_NAMES)[number];
