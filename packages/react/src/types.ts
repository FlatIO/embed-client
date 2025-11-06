import type Embed from "flat-embed";
import type {
	EmbedParameters,
	MeasureDetails,
	MetronomeMode,
	NoteCursorPosition,
	NoteDetails,
	PartConfiguration,
	PlaybackPosition,
	ScoreDetails,
	ScoreTrackConfiguration,
} from "flat-embed";

// Re-export types from flat-embed for convenience
export type {
	NoteCursorPosition,
	PlaybackPosition,
	MeasureDetails,
	NoteDetails,
	ScoreDetails,
	PartConfiguration,
	ScoreTrackConfiguration,
	MetronomeMode,
};

/**
 * Configuration object for FlatEmbed component
 * Matches the EmbedParameters interface from flat-embed
 */
export type FlatEmbedConfig = EmbedParameters;

/**
 * Event handler types for all embed events
 */
export interface FlatEmbedEventHandlers {
	/** Called when the embed is ready and fully loaded */
	onReady?: () => void;

	/** Called when a score is loaded */
	onScoreLoaded?: () => void;

	/** Called when the cursor position changes */
	onCursorPosition?: (position: NoteCursorPosition) => void;

	/** Called when cursor context changes */
	onCursorContext?: (context: unknown) => void;

	/** Called when measure details change */
	onMeasureDetails?: (details: MeasureDetails) => void;

	/** Called when note details change */
	onNoteDetails?: (details: NoteDetails) => void;

	/** Called when range selection changes */
	onRangeSelection?: (range: unknown) => void;

	/** Called when fullscreen state changes */
	onFullscreen?: (isFullscreen: boolean) => void;

	/** Called when playback starts */
	onPlay?: () => void;

	/** Called when playback pauses */
	onPause?: () => void;

	/** Called when playback stops */
	onStop?: () => void;

	/** Called when playback position changes */
	onPlaybackPosition?: (position: PlaybackPosition) => void;

	/** Called when a restricted feature is attempted */
	onRestrictedFeatureAttempt?: (feature: string) => void;
}

/**
 * Props for the FlatEmbed component
 */
export interface FlatEmbedProps extends FlatEmbedEventHandlers {
	/**
	 * Configuration object for the embed
	 * Can include score, embedParams, width, height, etc.
	 */
	config?: FlatEmbedConfig;

	/**
	 * Score ID (shorthand for config.score)
	 * If both config.score and score are provided, score takes precedence
	 */
	score?: string;

	/**
	 * App ID (shorthand for config.embedParams.appId)
	 * If both config.embedParams.appId and appId are provided, appId takes precedence
	 */
	appId?: string;

	/**
	 * Width of the embed container
	 * Default: '100%'
	 */
	width?: string;

	/**
	 * Height of the embed container
	 * Default: '600px'
	 */
	height?: string;

	/**
	 * Custom loading component to show while embed is loading
	 */
	loading?: React.ReactNode;

	/**
	 * ARIA label for accessibility
	 */
	ariaLabel?: string;

	/**
	 * ARIA description for accessibility
	 */
	ariaDescription?: string;

	/**
	 * Announce state changes to screen readers
	 * Default: false
	 */
	announceStateChanges?: boolean;

	/**
	 * Additional className for the container
	 */
	className?: string;

	/**
	 * Additional inline styles for the container
	 */
	style?: React.CSSProperties;

	/**
	 * Unique ID for this embed (used with FlatEmbedProvider)
	 */
	id?: string;
}

/**
 * Imperative handle for FlatEmbed component
 * Exposes all methods from the Embed class
 */
export type FlatEmbedHandle = Embed;

/**
 * Options for useFlatEmbed hook
 */
export interface UseFlatEmbedOptions
	extends FlatEmbedConfig,
		FlatEmbedEventHandlers {}

/**
 * Return type for useFlatEmbed hook
 */
export interface UseFlatEmbedReturn {
	/** Ref to attach to the container element */
	embedRef: React.RefObject<HTMLDivElement>;

	/** The embed instance (null until ready) */
	embed: Embed | null;

	/** Whether the embed is ready */
	isReady: boolean;

	/** Whether playback is currently playing */
	isPlaying: boolean;

	/** Current cursor position */
	cursorPosition: NoteCursorPosition | null;

	/** Current playback position */
	playbackPosition: PlaybackPosition | null;

	/** Start playback */
	play: () => Promise<void>;

	/** Pause playback */
	pause: () => Promise<void>;

	/** Stop playback */
	stop: () => Promise<void>;

	/** Load a score */
	loadScore: (scoreId: string) => Promise<void>;

	/** Set zoom level */
	setZoom: (zoom: number) => Promise<number>;

	/** Get zoom level */
	getZoom: () => Promise<number>;
}

/**
 * Context value for FlatEmbedProvider
 */
export interface FlatEmbedContextValue {
	/** Map of embed ID to embed instance */
	embeds: Record<string, Embed | null>;

	/** Get a specific embed by ID */
	getEmbed: (id: string) => Embed | null;

	/** Register a new embed */
	registerEmbed: (id: string, embed: Embed) => void;

	/** Unregister an embed */
	unregisterEmbed: (id: string) => void;

	/** Shared app ID for all embeds */
	appId?: string;
}

/**
 * Props for FlatEmbedProvider
 */
export interface FlatEmbedProviderProps {
	/** Child components */
	children: React.ReactNode;

	/** Shared app ID for all embeds in this provider */
	appId?: string;

	/** Shared locale for all embeds */
	locale?: string;
}
