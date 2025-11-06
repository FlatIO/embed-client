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
		const embedRef = useRef<Embed | null>(null);
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

		// Subscribe to events
		useEffect(() => {
			const embed = embedRef.current;
			if (!embed || !isReady) return;

			// Note: Using 'as any' cast due to event handler signature mismatch in flat-embed types
			// The actual event data types are correct (NoteCursorPosition, PlaybackPosition, etc.)
			if (onScoreLoaded) embed.on("scoreLoaded", onScoreLoaded);
			if (onCursorPosition) embed.on("cursorPosition", onCursorPosition as any);
			if (onCursorContext) embed.on("cursorContext", onCursorContext as any);
			if (onMeasureDetails) embed.on("measureDetails", onMeasureDetails as any);
			if (onNoteDetails) embed.on("noteDetails", onNoteDetails as any);
			if (onRangeSelection) embed.on("rangeSelection", onRangeSelection as any);
			if (onFullscreen) embed.on("fullscreen", onFullscreen as any);
			if (onPlay) embed.on("play", onPlay);
			if (onPause) embed.on("pause", onPause);
			if (onStop) embed.on("stop", onStop);
			if (onPlaybackPosition)
				embed.on("playbackPosition", onPlaybackPosition as any);
			if (onRestrictedFeatureAttempt)
				embed.on("restrictedFeatureAttempt", onRestrictedFeatureAttempt as any);

			return () => {
				if (onScoreLoaded) embed.off("scoreLoaded", onScoreLoaded);
				if (onCursorPosition)
					embed.off("cursorPosition", onCursorPosition as any);
				if (onCursorContext) embed.off("cursorContext", onCursorContext as any);
				if (onMeasureDetails)
					embed.off("measureDetails", onMeasureDetails as any);
				if (onNoteDetails) embed.off("noteDetails", onNoteDetails as any);
				if (onRangeSelection)
					embed.off("rangeSelection", onRangeSelection as any);
				if (onFullscreen) embed.off("fullscreen", onFullscreen as any);
				if (onPlay) embed.off("play", onPlay);
				if (onPause) embed.off("pause", onPause);
				if (onStop) embed.off("stop", onStop);
				if (onPlaybackPosition)
					embed.off("playbackPosition", onPlaybackPosition as any);
				if (onRestrictedFeatureAttempt)
					embed.off(
						"restrictedFeatureAttempt",
						onRestrictedFeatureAttempt as any,
					);
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

		// Expose embed instance via ref
		useImperativeHandle(ref, () => embedRef.current as Embed, []);

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
