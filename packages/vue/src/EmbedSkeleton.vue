<script setup lang="ts">
import type { EmbedSkeletonProps } from './types';

/**
 * Loading skeleton component for Flat Embed
 *
 * @example
 * ```vue
 * <FlatEmbed score="..." app-id="...">
 *   <template #loading>
 *     <EmbedSkeleton animated />
 *   </template>
 * </FlatEmbed>
 * ```
 *
 * @example Standalone usage
 * ```vue
 * <EmbedSkeleton v-if="!isReady" height="600px" pulse />
 * ```
 */

const props = withDefaults(defineProps<EmbedSkeletonProps>(), {
  width: '100%',
  height: '600px',
  animated: true,
  pulse: false,
});
</script>

<template>
  <div
    class="embed-skeleton"
    :class="{
      'embed-skeleton--animated': props.animated && !props.pulse,
      'embed-skeleton--pulse': props.animated && props.pulse,
    }"
    :style="{
      width: props.width,
      height: props.height,
    }"
    aria-label="Loading sheet music embed"
  >
    <!-- Header skeleton -->
    <div class="embed-skeleton__header">
      <div class="embed-skeleton__bar" style="width: 40%; height: 20px" />
      <div class="embed-skeleton__bar" style="width: 30%; height: 16px; margin-top: 8px" />
    </div>

    <!-- Staff lines skeleton -->
    <div class="embed-skeleton__staff">
      <div v-for="i in 5" :key="i" class="embed-skeleton__staff-line" />
    </div>

    <!-- Controls skeleton -->
    <div class="embed-skeleton__controls">
      <div class="embed-skeleton__button" style="width: 40px; height: 40px; border-radius: 50%" />
      <div class="embed-skeleton__bar" style="flex: 1; height: 4px; margin: 0 16px" />
      <div class="embed-skeleton__button" style="width: 32px; height: 32px" />
      <div class="embed-skeleton__button" style="width: 32px; height: 32px" />
    </div>

    <!-- Shimmer effect -->
    <div v-if="props.animated && !props.pulse" class="embed-skeleton__shimmer">
      <div class="embed-skeleton__shimmer-gradient" />
    </div>
  </div>
</template>

<style scoped>
.embed-skeleton {
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.embed-skeleton__header {
  padding: 24px;
}

.embed-skeleton__bar {
  background-color: #e0e0e0;
  border-radius: 4px;
}

.embed-skeleton__staff {
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.embed-skeleton__staff-line {
  height: 1px;
  background-color: #d0d0d0;
}

.embed-skeleton__controls {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fafafa;
  border-top: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
}

.embed-skeleton__button {
  background-color: #e0e0e0;
  border-radius: 4px;
}

.embed-skeleton--pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.embed-skeleton__shimmer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.embed-skeleton__shimmer-gradient {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shimmer 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes shimmer {
  0% { transform: translateX(0); }
  100% { transform: translateX(200%); }
}
</style>
