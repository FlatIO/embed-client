/**
 * @flat/embed-react
 *
 * React components and hooks for Flat's Sheet Music Embed
 * https://flat.io/developers/docs/embed/
 */

// Re-export useful types from flat-embed
export type {
	EmbedEventName,
	EmbedParameters,
	EmbedUrlParameters,
	MeasureDetails,
	MetronomeMode,
	NoteCursorPosition,
	NoteDetails,
	PartConfiguration,
	PlaybackPosition,
	ScoreTrackConfiguration,
} from "flat-embed";
// Main component
export { FlatEmbed } from "./FlatEmbed";

// Provider and context
export { FlatEmbedProvider, useFlatEmbedContext } from "./FlatEmbedProvider";

// Types
export type {
	FlatEmbedConfig,
	FlatEmbedContextValue,
	FlatEmbedEventHandlers,
	FlatEmbedHandle,
	FlatEmbedProps,
	FlatEmbedProviderProps,
	UseFlatEmbedOptions,
	UseFlatEmbedReturn,
} from "./types";
// Hooks
export { useFlatEmbed } from "./useFlatEmbed";
