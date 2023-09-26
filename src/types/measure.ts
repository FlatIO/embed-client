/**
 * NOTE(Vincent): We should re-use internal types with documented properties
 */

interface Clef {
  'clef-octave-change': number;
  line: number;
  sign: string;
}

interface DisplayedTime {
  'beat-type': number;
  beats: number;
}

interface Key {
  fifths: number;
}

interface Tempo {
  bpm: number;
  'duration-type': string;
  'nb-dots': number;
  qpm: number;
}

interface Time {
  'beat-type': number;
  beats: number;
}

interface Transpose {
  chromatic: string;
}

export interface MeasureDetails {
  clef: Clef;
  'displayed-time': DisplayedTime;
  key: Key;
  tempo: Tempo;
  time: Time;
  transpose: Transpose;
}
