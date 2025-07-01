/**
 * Instrument template information
 */
interface FlatInstrumentTemplate {
  /** The group/family of the instrument (e.g., 'strings', 'woodwinds', 'brass') */
  group: string;
  /** The specific instrument name (e.g., 'violin', 'flute', 'trumpet') */
  instrument: string;
  /** The listed group category for the instrument */
  listedGroup: string;
}

/**
 * Configuration and information for a musical part/instrument
 */
export interface PartConfiguration {
  /** The zero-based index of the part in the score */
  idx: number;
  /** The unique identifier (UUID) of the part */
  uuid: string;

  /** The full display name of the part (e.g., "Violin 1") */
  name: string;
  /** The abbreviated name of the part (e.g., "Vln. 1") */
  abbreviation: string;

  /** The instrument template information for this part */
  instrumentTemplate: FlatInstrumentTemplate;

  /** Whether this is a transposing instrument (e.g., clarinet, trumpet) */
  isTransposing: boolean;
}
