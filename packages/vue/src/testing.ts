import type Embed from 'flat-embed';

// Mock function factory that works with both Jest and Vitest
const createMockFn = () => {
  // Check if we're in a test environment with vi (Vitest) or jest
  if (typeof vi !== 'undefined') {
    return vi.fn();
  }
  if (typeof jest !== 'undefined') {
    return jest.fn();
  }
  // Fallback for non-test environments (shouldn't happen)
  return () => {};
};

/**
 * Creates a mock Embed instance for testing
 *
 * @example
 * ```ts
 * import { createMockEmbed } from '@flat/embed-vue/testing';
 * import { mount } from '@vue/test-utils';
 *
 * test('should play on button click', async () => {
 *   const mockEmbed = createMockEmbed();
 *
 *   const wrapper = mount(MyComponent, {
 *     props: { embed: mockEmbed }
 *   });
 *
 *   await wrapper.find('button').trigger('click');
 *   expect(mockEmbed.play).toHaveBeenCalled();
 * });
 * ```
 */
export function createMockEmbed(options?: {
  initialState?: {
    isPlaying?: boolean;
    isReady?: boolean;
  };
}): Partial<Embed> {
  const { initialState = {} } = options || {};

  const fn = createMockFn;
  const mockFn = () => {
    const mock = fn();
    return typeof mock === 'function' && 'mockResolvedValue' in mock
      ? mock
      : Object.assign(mock, { mockResolvedValue: (val: any) => mock });
  };

  const mockEmbed: Partial<Embed> = {
    ready: mockFn().mockResolvedValue(undefined),
    play: mockFn().mockResolvedValue(undefined),
    pause: mockFn().mockResolvedValue(undefined),
    stop: mockFn().mockResolvedValue(undefined),
    mute: mockFn().mockResolvedValue(undefined),
    getMasterVolume: mockFn().mockResolvedValue(100),
    setMasterVolume: mockFn().mockResolvedValue(undefined),
    getZoom: mockFn().mockResolvedValue(1),
    setZoom: mockFn().mockResolvedValue(1),
    getAutoZoom: mockFn().mockResolvedValue(false),
    setAutoZoom: mockFn().mockResolvedValue(false),
    loadFlatScore: mockFn().mockResolvedValue(undefined),
    loadMusicXML: mockFn().mockResolvedValue(undefined),
    loadMIDI: mockFn().mockResolvedValue(undefined),
    loadJSON: mockFn().mockResolvedValue(undefined),
    getJSON: mockFn().mockResolvedValue({}),
    getMusicXML: mockFn().mockResolvedValue('<xml></xml>'),
    getPNG: mockFn().mockResolvedValue(new Uint8Array()),
    getMIDI: mockFn().mockResolvedValue(new Uint8Array()),
    getFlatScoreMetadata: mockFn().mockResolvedValue({}),
    getEmbedConfig: mockFn().mockResolvedValue({}),
    setEditorConfig: mockFn().mockResolvedValue(undefined),
    fullscreen: mockFn().mockResolvedValue(undefined),
    print: mockFn().mockResolvedValue(undefined),
    focusScore: mockFn().mockResolvedValue(undefined),
    getCursorPosition: mockFn().mockResolvedValue({
      partIdx: 0,
      measureIdx: 0,
      voiceIdx: 0,
      noteIdx: 0,
    }),
    setCursorPosition: mockFn().mockResolvedValue(undefined),
    getParts: mockFn().mockResolvedValue([]),
    getDisplayedParts: mockFn().mockResolvedValue([]),
    setDisplayedParts: mockFn().mockResolvedValue(undefined),
    getNbMeasures: mockFn().mockResolvedValue(0),
    getMeasuresUuids: mockFn().mockResolvedValue([]),
    getMeasureDetails: mockFn().mockResolvedValue({}),
    getNbParts: mockFn().mockResolvedValue(0),
    getPartsUuids: mockFn().mockResolvedValue([]),
    getMeasureVoicesUuids: mockFn().mockResolvedValue([]),
    getMeasureNbNotes: mockFn().mockResolvedValue(0),
    getNoteData: mockFn().mockResolvedValue({}),
    getNoteDetails: mockFn().mockResolvedValue({}),
    goLeft: mockFn().mockResolvedValue(undefined),
    goRight: mockFn().mockResolvedValue(undefined),
    getMetronomeMode: mockFn().mockResolvedValue(0),
    setMetronomeMode: mockFn().mockResolvedValue(undefined),
    getPlaybackSpeed: mockFn().mockResolvedValue(1),
    setPlaybackSpeed: mockFn().mockResolvedValue(undefined),
    scrollToCursor: mockFn().mockResolvedValue(undefined),
    getPartVolume: mockFn().mockResolvedValue(100),
    setPartVolume: mockFn().mockResolvedValue(undefined),
    mutePart: mockFn().mockResolvedValue(undefined),
    unmutePart: mockFn().mockResolvedValue(undefined),
    setPartSoloMode: mockFn().mockResolvedValue(undefined),
    unsetPartSoloMode: mockFn().mockResolvedValue(undefined),
    getPartSoloMode: mockFn().mockResolvedValue(false),
    getPartReverb: mockFn().mockResolvedValue(0),
    setPartReverb: mockFn().mockResolvedValue(undefined),
    setTrack: mockFn().mockResolvedValue(undefined),
    useTrack: mockFn().mockResolvedValue(undefined),
    seekTrackTo: mockFn().mockResolvedValue(undefined),
    playbackPositionToNoteIdx: mockFn().mockResolvedValue(0),
    on: fn(),
    off: fn(),
    call: mockFn().mockResolvedValue(undefined),
  };

  return mockEmbed as Partial<Embed>;
}
