/**
 * Current playback position information
 */
export interface PlaybackPosition {
	/** Zero-based index of the measure being played */
	currentMeasure: number;
	/** Time from the beginning of the measure, expressed in quarter notes */
	quarterFromMeasureStart: number;
}
