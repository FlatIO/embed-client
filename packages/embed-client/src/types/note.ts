/**
 * Musical pitch representation
 */
export interface Pitch {
  /** Chromatic alteration (-2 to +2: double flat to double sharp) */
  alter: number;
  /** Octave number (0-9, with 4 being middle C octave) */
  octave: number;
  /** Note name (A-G) */
  step: string;
}

/**
 * Lyric line information attached to a note
 */
export interface LyricLine {
  /** Whether the lyric has a right connection (-) */
  hasRightConnection: boolean | undefined;
  /** Whether the lyric has a right melisma (_) */
  hasRightMelisma: boolean | undefined;
  /** Whether this is a melisma continuation */
  isMelisma: boolean | undefined;
  /** The verse/level number */
  level: number;
  /** The lyric text */
  text: string;
}

/**
 * Ornament information for a note
 */
export interface OrnamentObject {
  /** Tremolo information */
  tremolo:
    | undefined
    | {
        /** Number of tremolo beams */
        nbBeam: number;
        /** Tremolo type */
        type: undefined | 'start' | 'stop';
      };
  /** Trill mark */
  'trill-mark': undefined | any;
  /** Turn ornament */
  turn: undefined | any;
  /** Inverted turn ornament */
  'inverted-turn': undefined | any;
  /** Mordent ornament */
  mordent:
    | undefined
    | {
        /** Whether it's a long mordent */
        long: undefined | 'yes';
        /** Approach direction */
        approach: undefined | 'below' | 'above';
        /** Departure direction */
        departure: undefined | 'below' | 'above';
      };
  /** Inverted mordent ornament */
  'inverted-mordent':
    | undefined
    | {
        /** Whether it's a long inverted mordent */
        long: undefined | 'yes';
        /** Approach direction */
        approach: undefined | 'below' | 'above';
        /** Departure direction */
        departure: undefined | 'below' | 'above';
      };
}

/**
 * Jazz chord symbol data
 */
export interface JazzChordData {
  /** Index in the measure */
  idx: number;
  /** Unique identifier */
  uuid: string;
  /** Chord kind (e.g., 'major', 'minor', 'dominant') */
  kind: string;
  /** Chord type */
  type: string;
  /** Root note information */
  root: {
    /** Root alteration */
    'root-alter': string;
    /** Root step (A-G) */
    'root-step': string;
  };
  /** Bass note information (if different from root) */
  bass: null | {
    /** Bass alteration */
    'bass-alter': string;
    /** Bass step (A-G) */
    'bass-step': string;
  };
  /** Suspension type */
  suspension: null | string;
  /** Chord degree alterations */
  degrees: Array<{
    /** Degree alteration amount */
    'degree-alter': number;
    /** Degree modification type */
    'degree-type': 'add' | 'subtract' | 'alter';
    /** Scale degree number */
    'degree-value': number;
  }>;
}

/**
 * Roman numeral analysis data
 */
export interface RomanNumeralData {
  /** Index in the measure */
  idx: number;
  /** Unique identifier */
  uuid: string;
  /** Chord function (e.g., 'I', 'V', 'ii') */
  chordFunction: string;
  /** Chromatic alteration */
  alter: number;
  /** Chord quality */
  kind: string;
  /** Inversion number */
  inversion: number;
  /** Secondary function (for secondary dominants, etc.) */
  secondaryFunction: string;
  /** Secondary alteration */
  secondaryAlter: number;
  /** Secondary chord quality */
  secondaryKind: string;
  /** Secondary inversion */
  secondaryInversion: number;
}

/**
 * Tuplet type enumeration
 */
export type TupletType =
  | 'duplet'
  | 'triplet'
  | 'quadruplet'
  | 'quintuplet'
  | 'quintuplet_compound'
  | 'sextuplet'
  | 'septuplet'
  | 'septuplet_compound'
  | 'nonuplet'
  | 'tuplet_11';

/**
 * Wedge (hairpin) type for dynamics
 */
export type WedgeType = null | 'crescendo' | 'diminuendo';

/**
 * Detailed information about a note or rest
 * Note: The actual structure of complex fields (articulations, harmony, etc.)
 * depends on the score content and Flat's internal representation
 */
export interface NoteDetails {
  /** List of articulation markings (e.g., 'accent', 'staccato', 'tenuto') */
  articulations: string[];
  /** Classical harmony notation (Roman numerals, etc.) */
  classicHarmony: null | RomanNumeralData;
  /** Duration type in MusicXML format (e.g., 'quarter', 'eighth', 'half', 'whole') */
  durationType: string;
  /** Dynamic marking style (e.g., 'p', 'f', 'mf', 'crescendo') */
  dynamicStyle: null | string;
  /** Ghost note status for each pitch in chord (for guitar/drums) */
  ghostNotes: boolean[];
  /** Hammer-on/pull-off status for each pitch (for guitar) */
  hammerOnPullOffs: boolean[];
  /** Jazz/pop chord symbol */
  harmony: null | JazzChordData;
  /** Whether this note/chord has an arpeggio marking */
  hasArpeggio: boolean;
  /** Whether this note starts a glissando */
  hasGlissando: boolean;
  /** Whether this is a chord (multiple pitches) */
  isChord: boolean;
  /** Whether this note is part of a slur */
  isInSlur: boolean;
  /** Whether this is a rest (no pitches) */
  isRest: boolean;
  /** Whether this note is tied to the next */
  isTied: boolean;
  /** Staff line positions for each pitch */
  lines: number[];
  /** Lyrics attached to this note */
  lyrics: LyricLine[];
  /** Number of augmentation dots */
  nbDots: number;
  /** Number of grace notes attached */
  nbGraces: number;
  /** Ornaments on the note */
  ornaments: OrnamentObject;
  /** Array of pitches (empty for rests) */
  pitches: Pitch[];
  /** Technical markings (for strings/guitar, e.g., 'up-bow', 'down-bow', 'harmonic') */
  technical: string[];
  /** Tuplet information if part of irregular grouping */
  tupletType: null | TupletType;
  /** Wedge (hairpin) type if present */
  wedgeType: WedgeType;
}
