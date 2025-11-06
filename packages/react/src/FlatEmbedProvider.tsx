import type Embed from "flat-embed";
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type { FlatEmbedContextValue, FlatEmbedProviderProps } from "./types";

const FlatEmbedContext = createContext<FlatEmbedContextValue | null>(null);

/**
 * Provider for managing multiple FlatEmbed instances
 *
 * @example
 * ```tsx
 * <FlatEmbedProvider appId="your-app-id">
 *   <FlatEmbed id="main" score="score-1" />
 *   <FlatEmbed id="reference" score="score-2" />
 *   <GlobalControls />
 * </FlatEmbedProvider>
 *
 * function GlobalControls() {
 *   const { embeds } = useFlatEmbedContext();
 *
 *   const playAll = async () => {
 *     await Promise.all(
 *       Object.values(embeds).map(e => e?.play())
 *     );
 *   };
 *
 *   return <button onClick={playAll}>Play All</button>;
 * }
 * ```
 */
export function FlatEmbedProvider({
	children,
	appId,
	locale,
}: FlatEmbedProviderProps) {
	const [embeds, setEmbeds] = useState<Record<string, Embed | null>>({});

	const registerEmbed = useCallback((id: string, embed: Embed) => {
		setEmbeds((prev) => ({ ...prev, [id]: embed }));
	}, []);

	const unregisterEmbed = useCallback((id: string) => {
		setEmbeds((prev) => {
			const { [id]: _, ...rest } = prev;
			return rest;
		});
	}, []);

	const getEmbed = useCallback(
		(id: string) => {
			return embeds[id] ?? null;
		},
		[embeds],
	);

	const value = useMemo<FlatEmbedContextValue>(
		() => ({
			embeds,
			getEmbed,
			registerEmbed,
			unregisterEmbed,
			appId,
		}),
		[embeds, getEmbed, registerEmbed, unregisterEmbed, appId],
	);

	return (
		<FlatEmbedContext.Provider value={value}>
			{children}
		</FlatEmbedContext.Provider>
	);
}

/**
 * Hook to access the FlatEmbedContext
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { embeds, getEmbed } = useFlatEmbedContext();
 *
 *   const mainEmbed = getEmbed('main');
 *   const handlePlay = () => mainEmbed?.play();
 *
 *   return <button onClick={handlePlay}>Play</button>;
 * }
 * ```
 */
export function useFlatEmbedContext(): FlatEmbedContextValue | null {
	return useContext(FlatEmbedContext);
}
