/**
 * Musical clef definition
 */
export interface Clef {
  /** Octave change from standard clef position (-1 = 8vb, +1 = 8va) */
  'clef-octave-change': number;
  /** Staff line where clef is positioned (1-5, bottom to top) */
  line: number;
  /** Clef sign type ('G', 'F', 'C', 'percussion', 'TAB') */
  sign: string;
}

/**
 * Time signature as displayed (can differ from actual time)
 */
export interface DisplayedTime {
  /** Bottom number of time signature (note value that gets the beat) */
  'beat-type': number;
  /** Top number of time signature (beats per measure) */
  beats: number;
}

/**
 * Key signature definition
 */
export interface Key {
  /** Number of sharps (positive) or flats (negative) in key signature */
  fifths: number;
}

/**
 * Tempo marking information
 */
export interface Tempo {
  /** Beats per minute */
  bpm: number;
  /** Note value for the tempo marking (internal format) */
  durationType: string;
  /** Number of dots on the tempo note value */
  nbDots: number;
  /** Quarter notes per minute (standardized tempo) */
  qpm: number;
}

/**
 * Actual time signature (as opposed to displayed)
 */
export interface Time {
  /** Bottom number of time signature */
  'beat-type': number;
  /** Top number of time signature */
  beats: number;
}

/**
 * Transposition information
 */
export interface Transpose {
  /** Chromatic transposition in semitones (as string) */
  chromatic: string;
}

/**
 * Comprehensive details about a measure
 */
export interface MeasureDetails {
  /** Current clef in this measure */
  clef: Clef;
  /** Time signature as displayed (can differ for pickup measures, etc.) */
  'displayed-time': DisplayedTime;
  /** Current key signature */
  key: Key;
  /** Tempo marking (always included, populated from current tempo) */
  tempo: Tempo;
  /** Actual time signature */
  time: Time;
  /** Transposition settings for this measure */
  transpose: Transpose;
}
