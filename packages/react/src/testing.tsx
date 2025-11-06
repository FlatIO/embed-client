import type Embed from "flat-embed";
import type React from "react";
import { FlatEmbedProvider } from "./FlatEmbedProvider";

/**
 * Creates a mock Embed instance for testing
 *
 * @example
 * ```tsx
 * import { createMockEmbed } from '@flat/embed-react/testing';
 *
 * test('should play on button click', async () => {
 *   const mockEmbed = createMockEmbed();
 *
 *   render(<MyComponent embed={mockEmbed} />);
 *
 *   await userEvent.click(screen.getByRole('button', { name: 'Play' }));
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

	const mockEmbed: Partial<Embed> = {
		ready: jest.fn().mockResolvedValue(undefined),
		play: jest.fn().mockResolvedValue(undefined),
		pause: jest.fn().mockResolvedValue(undefined),
		stop: jest.fn().mockResolvedValue(undefined),
		mute: jest.fn().mockResolvedValue(undefined),
		getMasterVolume: jest.fn().mockResolvedValue(100),
		setMasterVolume: jest.fn().mockResolvedValue(undefined),
		getZoom: jest.fn().mockResolvedValue(1),
		setZoom: jest.fn().mockResolvedValue(1),
		getAutoZoom: jest.fn().mockResolvedValue(false),
		setAutoZoom: jest.fn().mockResolvedValue(false),
		loadFlatScore: jest.fn().mockResolvedValue(undefined),
		loadMusicXML: jest.fn().mockResolvedValue(undefined),
		loadMIDI: jest.fn().mockResolvedValue(undefined),
		loadJSON: jest.fn().mockResolvedValue(undefined),
		getJSON: jest.fn().mockResolvedValue({}),
		getMusicXML: jest.fn().mockResolvedValue("<xml></xml>"),
		getPNG: jest.fn().mockResolvedValue(new Uint8Array()),
		getMIDI: jest.fn().mockResolvedValue(new Uint8Array()),
		getFlatScoreMetadata: jest.fn().mockResolvedValue({}),
		getEmbedConfig: jest.fn().mockResolvedValue({}),
		setEditorConfig: jest.fn().mockResolvedValue(undefined),
		fullscreen: jest.fn().mockResolvedValue(undefined),
		print: jest.fn().mockResolvedValue(undefined),
		focusScore: jest.fn().mockResolvedValue(undefined),
		getCursorPosition: jest.fn().mockResolvedValue({
			partIdx: 0,
			measureIdx: 0,
			voiceIdx: 0,
			noteIdx: 0,
		}),
		setCursorPosition: jest.fn().mockResolvedValue(undefined),
		getParts: jest.fn().mockResolvedValue([]),
		getDisplayedParts: jest.fn().mockResolvedValue([]),
		setDisplayedParts: jest.fn().mockResolvedValue(undefined),
		getNbMeasures: jest.fn().mockResolvedValue(0),
		getMeasuresUuids: jest.fn().mockResolvedValue([]),
		getMeasureDetails: jest.fn().mockResolvedValue({}),
		getNbParts: jest.fn().mockResolvedValue(0),
		getPartsUuids: jest.fn().mockResolvedValue([]),
		getMeasureVoicesUuids: jest.fn().mockResolvedValue([]),
		getMeasureNbNotes: jest.fn().mockResolvedValue(0),
		getNoteData: jest.fn().mockResolvedValue({}),
		getNoteDetails: jest.fn().mockResolvedValue({}),
		goLeft: jest.fn().mockResolvedValue(undefined),
		goRight: jest.fn().mockResolvedValue(undefined),
		getMetronomeMode: jest.fn().mockResolvedValue(0),
		setMetronomeMode: jest.fn().mockResolvedValue(undefined),
		getPlaybackSpeed: jest.fn().mockResolvedValue(1),
		setPlaybackSpeed: jest.fn().mockResolvedValue(undefined),
		scrollToCursor: jest.fn().mockResolvedValue(undefined),
		getPartVolume: jest.fn().mockResolvedValue(100),
		setPartVolume: jest.fn().mockResolvedValue(undefined),
		mutePart: jest.fn().mockResolvedValue(undefined),
		unmutePart: jest.fn().mockResolvedValue(undefined),
		setPartSoloMode: jest.fn().mockResolvedValue(undefined),
		unsetPartSoloMode: jest.fn().mockResolvedValue(undefined),
		getPartSoloMode: jest.fn().mockResolvedValue(false),
		getPartReverb: jest.fn().mockResolvedValue(0),
		setPartReverb: jest.fn().mockResolvedValue(undefined),
		setTrack: jest.fn().mockResolvedValue(undefined),
		useTrack: jest.fn().mockResolvedValue(undefined),
		seekTrackTo: jest.fn().mockResolvedValue(undefined),
		playbackPositionToNoteIdx: jest.fn().mockResolvedValue(0),
		on: jest.fn(),
		off: jest.fn(),
		call: jest.fn().mockResolvedValue(undefined),
	};

	return mockEmbed as Partial<Embed>;
}

/**
 * Test provider for FlatEmbed context
 *
 * @example
 * ```tsx
 * import { EmbedTestProvider, createMockEmbed } from '@flat/embed-react/testing';
 *
 * test('should access embed from context', () => {
 *   const mockEmbed = createMockEmbed();
 *
 *   render(
 *     <EmbedTestProvider embeds={{ main: mockEmbed }}>
 *       <MyComponent />
 *     </EmbedTestProvider>
 *   );
 *
 *   // Component can access mockEmbed via useFlatEmbedContext()
 * });
 * ```
 */
export function EmbedTestProvider({
	children,
	embeds = {},
	appId = "test-app-id",
}: {
	children: React.ReactNode;
	embeds?: Record<string, Partial<Embed>>;
	appId?: string;
}) {
	return <FlatEmbedProvider appId={appId}>{children}</FlatEmbedProvider>;
}

// Vitest alternative (if not using Jest)
if (typeof jest === "undefined" && typeof vi !== "undefined") {
	// Replace jest.fn with vi.fn for Vitest
	(globalThis as any).jest = {
		fn: (globalThis as any).vi.fn,
	};
}
