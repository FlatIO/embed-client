import { useEffect, useRef, useState, useCallback } from 'react';
import Embed from 'flat-embed';
import type {
  UseFlatEmbedOptions,
  UseFlatEmbedReturn,
  NoteCursorPosition,
  PlaybackPosition,
} from './types';

/**
 * Hook for headless Flat Embed usage
 *
 * @example
 * ```tsx
 * function CustomPlayer() {
 *   const {
 *     embedRef,
 *     embed,
 *     isReady,
 *     isPlaying,
 *     play,
 *     pause,
 *   } = useFlatEmbed({
 *     score: '56ae21579a127715a02901a6',
 *     embedParams: {
 *       appId: 'your-app-id',
 *     },
 *     onPlay: () => console.log('Playing'),
 *   });
 *
 *   return (
 *     <div>
 *       <div ref={embedRef} style={{ height: 600 }} />
 *       <button onClick={play} disabled={!isReady || isPlaying}>
 *         Play
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFlatEmbed(options: UseFlatEmbedOptions): UseFlatEmbedReturn {
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

  const embedRef = useRef<HTMLDivElement>(null);
  const [embed, setEmbed] = useState<Embed | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cursorPosition, setCursorPosition] = useState<NoteCursorPosition | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState<PlaybackPosition | null>(null);

  // Dev mode warnings
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (!embedParams?.appId) {
        console.warn(
          '[@flat/embed-react] Missing appId in embedParams.\n' +
          'This works on localhost but will fail in production.\n' +
          'Get your appId at: https://flat.io/developers/apps'
        );
      }
    }
  }, [embedParams?.appId]);

  // Initialize embed
  useEffect(() => {
    if (!embedRef.current) return;

    const embedInstance = new Embed(embedRef.current, {
      score,
      width,
      height,
      embedParams,
      lazy,
    });

    setEmbed(embedInstance);

    embedInstance.ready().then(() => {
      setIsReady(true);
      onReady?.();
    });

    return () => {
      setEmbed(null);
      setIsReady(false);
      setIsPlaying(false);
      setCursorPosition(null);
      setPlaybackPosition(null);
    };
  }, []); // Only initialize once

  // Subscribe to events
  useEffect(() => {
    if (!embed || !isReady) return;

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleStop = () => {
      setIsPlaying(false);
      onStop?.();
    };

    const handleCursorPosition = (pos: NoteCursorPosition) => {
      setCursorPosition(pos);
      onCursorPosition?.(pos);
    };

    const handlePlaybackPosition = (pos: PlaybackPosition) => {
      setPlaybackPosition(pos);
      onPlaybackPosition?.(pos);
    };

    // Subscribe to events
    embed.on('play', handlePlay);
    embed.on('pause', handlePause);
    embed.on('stop', handleStop);
    embed.on('cursorPosition', handleCursorPosition as any);
    embed.on('playbackPosition', handlePlaybackPosition as any);

    if (onScoreLoaded) embed.on('scoreLoaded', onScoreLoaded);
    if (onCursorContext) embed.on('cursorContext', onCursorContext as any);
    if (onMeasureDetails) embed.on('measureDetails', onMeasureDetails as any);
    if (onNoteDetails) embed.on('noteDetails', onNoteDetails as any);
    if (onRangeSelection) embed.on('rangeSelection', onRangeSelection as any);
    if (onFullscreen) embed.on('fullscreen', onFullscreen as any);
    if (onRestrictedFeatureAttempt) embed.on('restrictedFeatureAttempt', onRestrictedFeatureAttempt as any);

    return () => {
      embed.off('play', handlePlay);
      embed.off('pause', handlePause);
      embed.off('stop', handleStop);
      embed.off('cursorPosition', handleCursorPosition as any);
      embed.off('playbackPosition', handlePlaybackPosition as any);

      if (onScoreLoaded) embed.off('scoreLoaded', onScoreLoaded);
      if (onCursorContext) embed.off('cursorContext', onCursorContext as any);
      if (onMeasureDetails) embed.off('measureDetails', onMeasureDetails as any);
      if (onNoteDetails) embed.off('noteDetails', onNoteDetails as any);
      if (onRangeSelection) embed.off('rangeSelection', onRangeSelection as any);
      if (onFullscreen) embed.off('fullscreen', onFullscreen as any);
      if (onRestrictedFeatureAttempt) embed.off('restrictedFeatureAttempt', onRestrictedFeatureAttempt as any);
    };
  }, [
    embed,
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

  // Convenience methods
  const play = useCallback(async () => {
    if (!embed) return;
    await embed.play();
  }, [embed]);

  const pause = useCallback(async () => {
    if (!embed) return;
    await embed.pause();
  }, [embed]);

  const stop = useCallback(async () => {
    if (!embed) return;
    await embed.stop();
  }, [embed]);

  const loadScore = useCallback(async (scoreId: string) => {
    if (!embed) return;
    await embed.loadFlatScore(scoreId);
  }, [embed]);

  const setZoom = useCallback(async (zoom: number) => {
    if (!embed) return 1;
    return await embed.setZoom(zoom);
  }, [embed]);

  const getZoom = useCallback(async () => {
    if (!embed) return 1;
    return await embed.getZoom();
  }, [embed]);

  return {
    embedRef,
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
