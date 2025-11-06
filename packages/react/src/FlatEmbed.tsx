import Embed from "flat-embed";
import type React from "react";
import {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useMemo,
	useRef,
	useState,
} from "react";
import { useFlatEmbedContext } from "./FlatEmbedProvider";
import type { FlatEmbedConfig, FlatEmbedHandle, FlatEmbedProps } from "./types";

// Extended Embed type with subscribedEvents for cleanup tracking
interface EmbedWithSubscriptions extends Embed {
	subscribedEvents?: string[];
}

/**
 * React component for Flat's Sheet Music Embed
 *
 * @example
 * ```tsx
 * <FlatEmbed
 *   score="56ae21579a127715a02901a6"
 *   appId="your-app-id"
 *   height="600px"
 *   onReady={() => console.log('Ready!')}
 *   onPlay={() => console.log('Playing')}
 * />
 * ```
 *
 * @example With config object
 * ```tsx
 * const config = {
 *   score: '56ae21579a127715a02901a6',
 *   embedParams: {
 *     appId: 'your-app-id',
 *     mode: 'view',
 *     layout: 'responsive',
 *   },
 * };
 *
 * <FlatEmbed config={config} onReady={() => {}} />
 * ```
 *
 * @example With imperative handle
 * ```tsx
 * const embedRef = useRef<FlatEmbedHandle>(null);
 *
 * <FlatEmbed ref={embedRef} score="..." appId="..." />
 * <button onClick={() => embedRef.current?.play()}>Play</button>
 * ```
 */
export const FlatEmbed = forwardRef<FlatEmbedHandle, FlatEmbedProps>(
	(props, ref) => {
		const {
			config: configProp,
			score: scoreProp,
			appId: appIdProp,
			width = "100%",
			height = "600px",
			loading,
			ariaLabel,
			ariaDescription,
			announceStateChanges = false,
			className,
			style,
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
		} = props;

		const containerRef = useRef<HTMLDivElement>(null);
		const embedRef = useRef<EmbedWithSubscriptions | null>(null);
		const [isReady, setIsReady] = useState(false);
		const context = useFlatEmbedContext();

		// Merge config from props - memoized to avoid recreating on every render
		const config: FlatEmbedConfig = useMemo(
			() => ({
				...configProp,
				...(scoreProp && { score: scoreProp }),
				width,
				height,
				embedParams: {
					...configProp?.embedParams,
					...(appIdProp && { appId: appIdProp }),
					...(context?.appId &&
						!appIdProp &&
						!configProp?.embedParams?.appId && { appId: context.appId }),
				},
			}),
			[configProp, scoreProp, width, height, appIdProp, context?.appId],
		);

		// Dev mode warnings
		useEffect(() => {
			if (process.env.NODE_ENV === "development") {
				if (!config.embedParams?.appId) {
					console.warn(
						"[@flat/embed-react] Missing appId in embedParams.\n" +
							"This works on localhost but will fail in production.\n" +
							"Get your appId at: https://flat.io/developers/apps",
					);
				}
			}
		}, [config.embedParams?.appId]);

		// Initialize embed
		useEffect(() => {
			if (!containerRef.current) return;

			const embed = new Embed(containerRef.current, config);
			embedRef.current = embed;

			// Wait for ready
			embed.ready().then(() => {
				setIsReady(true);
				onReady?.();
			});

			// Register with context if available
			if (context && props.id) {
				context.registerEmbed(props.id, embed);
			}

			// Cleanup
			return () => {
				if (context && props.id) {
					context.unregisterEmbed(props.id);
				}
				embedRef.current = null;
				setIsReady(false);
			};
		}, [config, context, onReady, props.id]); // Only run once on mount

		// Subscribe to events - only if handlers are provided
		useEffect(() => {
			const embed = embedRef.current;
			if (!embed || !isReady) return;

			// Note: Using 'as any' cast due to event handler signature mismatch in flat-embed types
			// The actual event data types are correct (NoteCursorPosition, PlaybackPosition, etc.)
			const eventHandlers: Record<
				string,
				(() => void) | ((data: any) => void)
			> = {
				scoreLoaded: onScoreLoaded,
				cursorPosition: onCursorPosition,
				cursorContext: onCursorContext,
				measureDetails: onMeasureDetails,
				noteDetails: onNoteDetails,
				rangeSelection: onRangeSelection,
				fullscreen: onFullscreen,
				play: onPlay,
				pause: onPause,
				stop: onStop,
				playbackPosition: onPlaybackPosition,
				restrictedFeatureAttempt: onRestrictedFeatureAttempt,
			};

			const subscribedEvents: string[] = [];

			for (const [eventName, handler] of Object.entries(eventHandlers)) {
				if (handler) {
					embed.on(eventName as any, handler as any);
					subscribedEvents.push(eventName);
				}
			}

			// Store subscribed events for cleanup
			embed.subscribedEvents = subscribedEvents;

			return () => {
				if (embed.subscribedEvents) {
					for (const eventName of embed.subscribedEvents) {
						const handler = eventHandlers[eventName];
						if (handler) {
							embed.off(eventName as any, handler as any);
						}
					}
				}
			};
		}, [
			isReady,
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
		]);

		// Expose embed instance via ref using a Proxy to always access the latest embedRef value
		useImperativeHandle(
			ref,
			() =>
				new Proxy(
					{},
					{
						get(_target, prop) {
							const embed = embedRef.current;
							if (!embed) return undefined;

							const value = embed[prop as keyof Embed];
							if (typeof value === "function") {
								return (...args: any[]) => value.apply(embed, args);
							}
							return value;
						},
					},
				) as Embed,
			[],
		);

		const containerStyle: React.CSSProperties = {
			width,
			height,
			position: "relative",
			...style,
		};

		return (
			<div
				ref={containerRef}
				className={className}
				style={containerStyle}
				role="application"
				aria-label={ariaLabel}
				aria-description={ariaDescription}
				aria-live={announceStateChanges ? "polite" : undefined}
			>
				{!isReady && loading}
			</div>
		);
	},
);

FlatEmbed.displayName = "FlatEmbed";
