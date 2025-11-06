/**
 * Complete cursor position information within a score
 */
export interface NoteCursorPosition {
	/** Zero-based index of the part */
	partIdx: number;
	/** Unique identifier of the part */
	partUuid: string;

	/** Zero-based index of the staff within the part */
	staffIdx: number;
	/** Unique identifier of the staff */
	staffUuid: string;

	/** Zero-based index of the voice within the staff */
	voiceIdxInStaff: number;
	/** Unique identifier of the voice */
	voiceUuid: string;

	/** Zero-based index of the measure */
	measureIdx: number;
	/** Unique identifier of the measure */
	measureUuid: string;

	/** Zero-based index of the note within the voice */
	noteIdx: number;
	/** Staff line number (0 = bottom line) */
	line: number;
	/** Divisions per quarter note (timing resolution) */
	dpq: number;
	/** Absolute time position in seconds from the beginning */
	timePos: number;
}

/**
 * Partial cursor position for setting cursor location
 * All fields are optional - unspecified fields remain unchanged
 */
export type NoteCursorPositionOptional = Partial<NoteCursorPosition>;
