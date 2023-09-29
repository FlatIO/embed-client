export interface PlaybackPosition {
  // playing: boolean,
  // pausing: boolean,
  // playbackSpeed: number,
  currentMeasure: number; // The index of the measure being played
  quarterFromMeasureStart: number; // The time from the beginning of the meaasure, expressed as quarter notes
}
