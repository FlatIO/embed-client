<script setup lang="ts">
import type {
	MeasureDetails,
	NoteCursorPosition,
	NoteDetails,
	PlaybackPosition,
} from "flat-embed";
import Embed from "flat-embed";
import { onMounted, onUnmounted, ref, useAttrs } from "vue";
import { useFlatEmbedContext } from "./composables/useFlatEmbedContext";
import type { FlatEmbedEmits, FlatEmbedProps } from "./types";

// Extended Embed type with subscribedEvents for cleanup tracking
interface EmbedWithSubscriptions extends Embed {
	subscribedEvents?: string[];
}

/**
 * Vue component for Flat's Sheet Music Embed
 *
 * @example
 * ```vue
 * <FlatEmbed
 *   score="56ae21579a127715a02901a6"
 *   app-id="your-app-id"
 *   height="600px"
 *   @ready="() => console.log('Ready!')"
 *   @play="() => console.log('Playing')"
 * />
 * ```
 *
 * @example With config object - see README for full example
 */

const props = withDefaults(defineProps<FlatEmbedProps>(), {
	width: "100%",
	height: "600px",
	announceStateChanges: false,
});

const emit = defineEmits<FlatEmbedEmits>();
const attrs = useAttrs();

const containerRef = ref<HTMLDivElement | null>(null);
const embedRef = ref<EmbedWithSubscriptions | null>(null);
const isReady = ref(false);
const context = useFlatEmbedContext();

// Check if user provided a listener for this event
// Event listeners in Vue are passed as onEventName in attrs
const hasEvent = (eventName: keyof typeof eventHandlers): boolean => {
	const attrName = `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`;
	return attrName in attrs;
};

// Merge config from props
const getConfig = () => {
	return {
		...props.config,
		...(props.score && { score: props.score }),
		width: props.width,
		height: props.height,
		embedParams: {
			...props.config?.embedParams,
			...(props.appId && { appId: props.appId }),
			...(context?.appId &&
				!props.appId &&
				!props.config?.embedParams?.appId && { appId: context.appId }),
		},
	};
};

// Dev mode warnings (check for development environment - works with any bundler)
if (
	typeof process !== "undefined" &&
	process.env &&
	process.env.NODE_ENV === "development"
) {
	const config = getConfig();
	if (!config.embedParams?.appId) {
		console.warn(
			"[@flat/embed-vue] Missing appId in embedParams.\n" +
				"This works on localhost but will fail in production.\n" +
				"Get your appId at: https://flat.io/developers/apps",
		);
	}
}

// Store event handlers for cleanup
const eventHandlers = {
	scoreLoaded: () => emit("scoreLoaded"),
	// Note: Using 'as any' cast due to event handler signature mismatch in flat-embed types
	// The actual event data types are correct (NoteCursorPosition, PlaybackPosition, etc.)
	cursorPosition: ((pos: NoteCursorPosition) =>
		emit("cursorPosition", pos)) as any,
	cursorContext: ((ctx: unknown) => emit("cursorContext", ctx)) as any,
	measureDetails: ((details: MeasureDetails) =>
		emit("measureDetails", details)) as any,
	noteDetails: ((details: NoteDetails) => emit("noteDetails", details)) as any,
	rangeSelection: ((range: unknown) => emit("rangeSelection", range)) as any,
	fullscreen: ((isFs: boolean) => emit("fullscreen", isFs)) as any,
	play: () => emit("play"),
	pause: () => emit("pause"),
	stop: () => emit("stop"),
	playbackPosition: ((pos: PlaybackPosition) =>
		emit("playbackPosition", pos)) as any,
	restrictedFeatureAttempt: ((feature: string) =>
		emit("restrictedFeatureAttempt", feature)) as any,
};

// Initialize embed
onMounted(() => {
	if (!containerRef.value) return;

	const config = getConfig();
	const embed = new Embed(containerRef.value, config);
	embedRef.value = embed;

	// Wait for ready
	embed.ready().then(() => {
		isReady.value = true;
		emit("ready");
	});

	// Subscribe to events - only if the user provided handlers
	const subscribedEvents: string[] = [];

	for (const [eventName, handler] of Object.entries(eventHandlers)) {
		if (hasEvent(eventName as keyof typeof eventHandlers)) {
			embed.on(eventName as any, handler);
			subscribedEvents.push(eventName);
		}
	}

	// Store subscribed events for cleanup
	embedRef.value.subscribedEvents = subscribedEvents;

	// Register with context if available
	if (context && props.id) {
		context.registerEmbed(props.id, embed);
	}
});

// Cleanup
onUnmounted(() => {
	const embed = embedRef.value;

	// Unsubscribe from all events to prevent memory leaks
	if (embed?.subscribedEvents) {
		for (const eventName of embed.subscribedEvents) {
			embed.off(
				eventName as any,
				eventHandlers[eventName as keyof typeof eventHandlers],
			);
		}
	}

	if (context && props.id) {
		context.unregisterEmbed(props.id);
	}
	embedRef.value = null;
	isReady.value = false;
});

// Expose ALL embed methods automatically using a Proxy
// This ensures new methods added to Embed are automatically available
// without manual maintenance of this wrapper
defineExpose(
	new Proxy(
		{},
		{
			get(_target, prop) {
				const embed = embedRef.value;
				if (!embed) return undefined;

				// Special case: expose the raw embed instance
				if (prop === "embed") {
					return embed;
				}

				// Forward all property/method accesses to the embed instance
				const value = embed[prop as keyof Embed];

				// If it's a function, bind it to the embed instance
				if (typeof value === "function") {
					// biome-ignore lint/suspicious/noExplicitAny: Type signature from flat-embed requires any
					return (value as any).bind(embed);
				}

				return value;
			},
		},
	) as Embed & { embed: Embed },
);
</script>

<template>
  <div
    ref="containerRef"
    :style="{
      width: props.width,
      height: props.height,
      position: 'relative',
    }"
    role="application"
    :aria-label="props.ariaLabel"
    :aria-description="props.ariaDescription"
    :aria-live="props.announceStateChanges ? 'polite' : undefined"
  >
    <slot v-if="!isReady" name="loading">
      <!-- Default loading slot - user can override -->
    </slot>
  </div>
</template>
