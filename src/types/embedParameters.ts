/** Display locale for the Embed */
export type FlatLocale =
  | 'en'
  | 'en-GB'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'ja'
  | 'ja-HIRA'
  | 'ko'
  | 'nl'
  | 'pl'
  | 'pt'
  | 'pt-BR'
  | 'ro'
  | 'ru'
  | 'sv'
  | 'tr'
  | 'zh-Hans';

/**
 * Optional configuration and customization options
 *
 * See https://flat.io/developers/docs/embed/url-parameters for more details
 */
export interface EmbedUrlParameters {
  /** Your application identifier (aka API key) */
  appId?: string;

  /** The score sharing key when the privacy mode is `privateLink` */
  sharingKey?: string;

  /** Embed locale */
  locale?: FlatLocale;

  /** Display the score in responsive, page or track mode */
  layout?: 'responsive' | 'page' | 'track';

  /**
   * Default zoom value
   * `auto` or `0.1` to `3` (default = `auto`)
   */
  zoom?: 'auto' | number;

  /** Specify the parts to display, either list of Part UUIDs or indexes */
  parts?: [string | number];

  /** Only display the first `page` */
  drawOnlyFirstPage?: boolean;

  /** Hide the header of the first page (title, composer, lyricist) */
  noHeader?: boolean;

  /** Only display the tablatures */
  hideNonTab?: boolean;

  /** Display rests in TAB staff */
  showTabRests?: boolean;

  /** Do not display tempo marks (default = false) */
  hideTempo?: boolean;

  /** Highlight notes our of tessitura (default = true) */
  displayOutOfPitch?: boolean;

  /** Hide part names (default = true) */
  displayFirstLinePartsNames?: boolean;

  /** Hide non first line part names (default = false) */
  displayOtherLinesPartsNames?: boolean;

  /** Apply document system breaks in responsive layout (default = false) */
  respectSystemBreaks?: boolean;

  /**
   * Apply a saved layout template from your account
   *
   * Learn more about engraving layout: https://flat.io/developers/docs/embed/url-parameters#saved-engraving-layout-layoutid
   **/
  layoutId?: string;

  /** Theme primary color (e.g. play button) */
  themePrimary?: string;

  /** Theme primary dark color (e.g. used for hover/focus states) */
  themePrimaryDark?: string;

  /** Controls bar background */
  themeControlsBackground?: string;

  /** Playback slider color */
  themeSlider?: string;

  /** Cursor 1st Voice color */
  themeCursorV0?: string;

  /** Cursor 2nd Voice color */
  themeCursorV1?: string;

  /** Selection color */
  themeSelection?: string;

  /** Background of score */
  themeScoreBackground?: 'white' | 'transparent';

  /** Display or hide Flat logo (default = true) */
  branding?: boolean;

  /** Display or hide main controls (default = true) */
  controlsDisplay?: boolean;

  /** Controls position (default = bottom) */
  controlsPosition?: 'bottom' | 'top';

  /** Display or hide the playback controls (default = true) */
  controlsPlay?: boolean;

  /** Completely disable audio capabilities of the embed (default = false) */
  noAudio?: boolean;

  /** Hide Flat playback (default = false) */
  hideFlatPlayback?: boolean;

  /** Display or hide the fullscreen button (default = true) */
  controlsFullscreen?: boolean;

  /** Display or hide the extra controls button (default = true) */
  controlsPanel?: boolean;

  /** Display or hide the zoom control (default = true) */
  controlsZoom?: boolean;

  /** Display or hide the print button (default = true) */
  controlsPrint?: boolean;

  /** Display or hide the parts list (default = false) */
  controlsParts?: boolean;

  /** Audio source to use when loading the embed (default = playback) */
  audioSource?: 'playback' | 'default' | string;

  /** Display position of the video in the embed (default = hidden) */
  videoPosition?: 'top' | 'bottom' | 'left' | 'float' | 'hidden';

  /** Should the video width fit the width of the container (default = false) */
  videoFitWidth?: boolean;

  /** Give a max height for the video (default = none) */
  videoMaxHeight?: string;

  /** Metronome mode (default = inactive) */
  playbackMetronome?: 'count-in' | 'inactive' | 'active';

  /** Master volume (default = 1) */
  playbackVolumeMaster?: number;

  /** Enable MIDI Output Controls (default = false) */
  MIDI?: boolean;

  /**
   * Editor Toolset (default = none)
   *
   * Learn more about toolsets: https://flat.io/developers/docs/embed/url-parameters#editor-toolset
   **/
  toolsetId?: string;

  /** Always enable quarter tone edition (default = false) */
  useQuarterTone?: boolean;
}

/**
 * Embed construction parameters
 */
export interface EmbedParameters {
  /** Unique identifier of the Flat score to load **/
  score?: string;

  /** Width of the created iframe (default 100% of container) */
  width?: string;

  /** Height of the created iframe (default 100% of container) */
  height?: string;

  /** Base URL for the embed */
  baseUrl?: string;

  /**
   * Optional configuration and customization options
   * See https://flat.io/developers/docs/embed/url-parameters for more details
   */
  embedParams?: EmbedUrlParameters;
}
