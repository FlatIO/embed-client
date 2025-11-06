/**
 * @flat/embed-vue
 *
 * Vue components and composables for Flat's Sheet Music Embed
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

// Composables
export { useFlatEmbed } from "./composables/useFlatEmbed";
export { useFlatEmbedContext } from "./composables/useFlatEmbedContext";
// Main component
export { default as FlatEmbed } from "./FlatEmbed.vue";
// Provider
export { default as FlatEmbedProvider } from "./FlatEmbedProvider.vue";
// Types
export type {
	FlatEmbedConfig,
	FlatEmbedContextValue,
	FlatEmbedEmits,
	FlatEmbedHandle,
	FlatEmbedProps,
	FlatEmbedProviderProps,
	UseFlatEmbedOptions,
	UseFlatEmbedReturn,
} from "./types";
