<script setup lang="ts">
import { ref, provide } from 'vue';
import type Embed from 'flat-embed';
import type { FlatEmbedContextValue, FlatEmbedProviderProps } from './types';
import { FlatEmbedContextKey } from './composables/useFlatEmbedContext';

/**
 * Provider for managing multiple FlatEmbed instances
 *
 * @example
 * ```vue
 * <FlatEmbedProvider app-id="your-app-id">
 *   <FlatEmbed id="main" score="score-1" />
 *   <FlatEmbed id="reference" score="score-2" />
 *   <GlobalControls />
 * </FlatEmbedProvider>
 *
 * <script setup>
 * import { useFlatEmbedContext } from '@flat/embed-vue';
 *
 * const { embeds } = useFlatEmbedContext();
 *
 * const playAll = async () => {
 *   await Promise.all(
 *     Object.values(embeds.value).map(e => e?.play())
 *   );
 * };
 * ```
 */

const props = defineProps<FlatEmbedProviderProps>();

const embeds = ref<Record<string, Embed | null>>({});

const registerEmbed = (id: string, embed: Embed) => {
  embeds.value = { ...embeds.value, [id]: embed };
};

const unregisterEmbed = (id: string) => {
  const { [id]: _, ...rest } = embeds.value;
  embeds.value = rest;
};

const getEmbed = (id: string) => {
  return embeds.value[id] ?? null;
};

const contextValue: FlatEmbedContextValue = {
  embeds,
  getEmbed,
  registerEmbed,
  unregisterEmbed,
  appId: props.appId,
};

// Provide context
provide(FlatEmbedContextKey, contextValue);
</script>

<template>
  <slot />
</template>
