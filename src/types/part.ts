interface FlatInstrumentTemplate {
  // The group of the instrument
  group: string;
  // The name of the instrument
  instrument: string;
}

export interface PartConfiguration {
  // The index of the part
  idx: number;
  // The UUID of the part
  uuid: string;

  // The name of the part
  name: string;
  // The abbreviated name of the part
  abbreviation: string;

  // The instrument template for the part
  instrumentTemplate: FlatInstrumentTemplate;

  // Whether the part is transposing
  isTransposing: boolean;
}
