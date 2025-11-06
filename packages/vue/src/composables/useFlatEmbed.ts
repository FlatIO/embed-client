import Embed from "flat-embed";
import { onMounted, onUnmounted, type Ref, ref } from "vue";
import type {
	NoteCursorPosition,
	PlaybackPosition,
	UseFlatEmbedOptions,
	UseFlatEmbedReturn,
} from "../types";

/**
 * Composable for headless Flat Embed usage
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFlatEmbed } from '@flat/embed-vue';
 * import { ref } from 'vue';
 *
 * const containerRef = ref();
 *
 * const {
 *   embed,
 *   isReady,
 *   isPlaying,
 *   play,
 *   pause,
 * } = useFlatEmbed(containerRef, {
 *   score: '56ae21579a127715a02901a6',
 *   embedParams: {
 *     appId: 'your-app-id',
 *   },
 *   onPlay: () => console.log('Playing'),
 * });
 * </script>
 *
 * <template>
 *   <div>
 *     <div ref="containerRef" style="height: 600px" />
 *     <button @click="play" :disabled="!isReady || isPlaying">
 *       Play
 *     </button>
 *   </div>
 * </template>
 * ```
 */
export function useFlatEmbed(
	containerRef: Ref<HTMLDivElement | null>,
	options: UseFlatEmbedOptions,
): UseFlatEmbedReturn {
	const {
		// Config
		score,
		width,
		height,
		embedParams,
		lazy,
		// Event handlers
		onReady,
		onScoreLoaded,
		onCursorPosition,
		onCursorContext,
		onMeasureDetails,
		onNoteDetails,
		onRangeSelection,
		onFullscreen,
		onPlay,
		onPause,
		onStop,
		onPlaybackPosition,
		onRestrictedFeatureAttempt,
	} = options;

	const embed = ref<Embed | null>(null);
	const isReady = ref(false);
	const isPlaying = ref(false);
	const cursorPosition = ref<NoteCursorPosition | null>(null);
	const playbackPosition = ref<PlaybackPosition | null>(null);

	// Dev mode warnings (check for development environment - works with any bundler)
	if (
		typeof process !== "undefined" &&
		process.env &&
		process.env.NODE_ENV === "development"
	) {
		if (!embedParams?.appId) {
			console.warn(
				"[@flat/embed-vue] Missing appId in embedParams.\n" +
					"This works on localhost but will fail in production.\n" +
					"Get your appId at: https://flat.io/developers/apps",
			);
		}
	}

	// Initialize embed
	onMounted(() => {
		if (!containerRef.value) return;

		const embedInstance = new Embed(containerRef.value, {
			score,
			width,
			height,
			embedParams,
			lazy,
		});

		embed.value = embedInstance;

		embedInstance.ready().then(() => {
			isReady.value = true;
			onReady?.();
		});

		// Subscribe to events
		const handlePlay = () => {
			isPlaying.value = true;
			onPlay?.();
		};

		const handlePause = () => {
			isPlaying.value = false;
			onPause?.();
		};

		const handleStop = () => {
			isPlaying.value = false;
			onStop?.();
		};

		const handleCursorPosition = (pos: NoteCursorPosition) => {
			cursorPosition.value = pos;
			onCursorPosition?.(pos);
		};

		const handlePlaybackPosition = (pos: PlaybackPosition) => {
			playbackPosition.value = pos;
			onPlaybackPosition?.(pos);
		};

		embedInstance.on("play", handlePlay);
		embedInstance.on("pause", handlePause);
		embedInstance.on("stop", handleStop);
		// Note: Using 'as any' cast due to event handler signature mismatch in flat-embed types
		embedInstance.on("cursorPosition", handleCursorPosition as any);
		embedInstance.on("playbackPosition", handlePlaybackPosition as any);

		if (onScoreLoaded) embedInstance.on("scoreLoaded", onScoreLoaded);
		if (onCursorContext)
			embedInstance.on("cursorContext", onCursorContext as any);
		if (onMeasureDetails)
			embedInstance.on("measureDetails", onMeasureDetails as any);
		if (onNoteDetails) embedInstance.on("noteDetails", onNoteDetails as any);
		if (onRangeSelection)
			embedInstance.on("rangeSelection", onRangeSelection as any);
		if (onFullscreen) embedInstance.on("fullscreen", onFullscreen as any);
		if (onRestrictedFeatureAttempt)
			embedInstance.on(
				"restrictedFeatureAttempt",
				onRestrictedFeatureAttempt as any,
			);
	});

	// Cleanup
	onUnmounted(() => {
		embed.value = null;
		isReady.value = false;
		isPlaying.value = false;
		cursorPosition.value = null;
		playbackPosition.value = null;
	});

	// Convenience methods
	const play = async () => {
		if (!embed.value) return;
		await embed.value.play();
	};

	const pause = async () => {
		if (!embed.value) return;
		await embed.value.pause();
	};

	const stop = async () => {
		if (!embed.value) return;
		await embed.value.stop();
	};

	const loadScore = async (scoreId: string) => {
		if (!embed.value) return;
		await embed.value.loadFlatScore(scoreId);
	};

	const setZoom = async (zoom: number) => {
		if (!embed.value) return 1;
		return await embed.value.setZoom(zoom);
	};

	const getZoom = async () => {
		if (!embed.value) return 1;
		return await embed.value.getZoom();
	};

	return {
		embedRef: containerRef,
		embed,
		isReady,
		isPlaying,
		cursorPosition,
		playbackPosition,
		play,
		pause,
		stop,
		loadScore,
		setZoom,
		getZoom,
	};
}
