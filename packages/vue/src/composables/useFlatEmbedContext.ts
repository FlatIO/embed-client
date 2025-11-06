import { type InjectionKey, inject } from "vue";
import type { FlatEmbedContextValue } from "../types";

export const FlatEmbedContextKey: InjectionKey<FlatEmbedContextValue> =
	Symbol("FlatEmbedContext");

/**
 * Hook to access the FlatEmbedContext
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFlatEmbedContext } from '@flat/embed-vue';
 *
 * const { embeds, getEmbed } = useFlatEmbedContext();
 *
 * const mainEmbed = getEmbed('main');
 * const handlePlay = () => mainEmbed?.play();
 * </script>
 * ```
 */
export function useFlatEmbedContext(): FlatEmbedContextValue | null {
	return inject(FlatEmbedContextKey, null);
}
