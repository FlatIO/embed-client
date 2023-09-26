export interface NoteCursorPosition {
  // Index of the part
  partIdx: number;
  // UUID of the part
  partUuid: string;

  // Index of the staff
  staffIdx: number;
  // UUID of the staff
  staffUuid: string;

  // Index of the voice in the staff
  voiceIdxInStaff: number;
  // UUID of the voice
  voiceUuid: string;

  // Index of the measure
  measureIdx: number;
  // UUID of the measure
  measureUuid: string;

  // Index of the note
  noteIdx: number;
  // Line number
  line: number;
  // Divisions per quarter
  dpq: number;
  // Time position in seconds
  timePos: number;
}

export interface NoteCursorPositionOptional {
  // Index of the part
  partIdx?: number;
  // UUID of the part
  partUuid?: string;

  // Index of the staff
  staffIdx?: number;
  // UUID of the staff
  staffUuid?: string;

  // Index of the voice in the staff
  voiceIdxInStaff?: number;
  // UUID of the voice
  voiceUuid?: string;

  // Index of the measure
  measureIdx?: number;
  // UUID of the measure
  measureUuid?: string;

  // Index of the note
  noteIdx?: number;
  // Line number
  line?: number;
  // Divisions per quarter
  dpq?: number;
  // Time position in seconds
  timePos?: number;
}
