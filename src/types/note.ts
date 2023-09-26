/**
 * NOTE(Vincent): We should re-use internal types with documented properties
 */

interface Pitch {
  alter: number;
  octave: number;
  step: string;
}

export interface NoteDetails {
  articulations: unknown[];
  classicHarmony: null | unknown;
  durationType: string;
  dynamicStyle: null | unknown;
  ghostNotes: boolean[];
  hammerOnPullOffs: boolean[];
  harmony: null | unknown;
  hasArpeggio: boolean;
  hasGlissando: boolean;
  isChord: boolean;
  isInSlur: boolean;
  isRest: boolean;
  isTied: boolean;
  lines: number[];
  lyrics: unknown[];
  nbDots: number;
  nbGraces: number;
  ornaments: unknown[];
  pitches: Pitch[];
  technical: unknown[];
  tupletType: null | unknown;
  wedgeType: null | unknown;
}
