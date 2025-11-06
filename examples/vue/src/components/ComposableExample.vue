<template>
  <div class="example-section">
    <h2>2. Using useFlatEmbed Composable</h2>
    <div class="controls">
      <button @click="play" :disabled="!isReady">Play</button>
      <button @click="pause" :disabled="!isReady">Pause</button>
      <button @click="stop" :disabled="!isReady">Stop</button>
      <button @click="handleLoadNewScore" :disabled="!isReady">Load New Score</button>
    </div>
    <div class="status">
      <div>
        <strong>Ready:</strong> {{ isReady ? 'Yes' : 'No' }}
      </div>
      <div>
        <strong>Playing:</strong> {{ isPlaying ? 'Yes' : 'No' }}
      </div>
      <div v-if="cursorPosition">
        <strong>Cursor Position:</strong> Measure {{ cursorPosition.measure + 1 }}, Staff
        {{ cursorPosition.staff + 1 }}
      </div>
      <div v-if="playbackPosition">
        <strong>Playback Position:</strong> {{ playbackPosition.position.toFixed(2) }}s
      </div>
    </div>
    <div ref="containerRef" style="width: 100%; height: 450px" />
  </div>
</template>

<script setup lang="ts">
import { useFlatEmbed } from "@flat/embed-vue";
import { ref } from "vue";

const containerRef = ref<HTMLDivElement>();

const {
	isReady,
	isPlaying,
	cursorPosition,
	playbackPosition,
	play,
	pause,
	stop,
	loadScore,
} = useFlatEmbed(containerRef, {
	score: "56ae21579a127715a02901a6",
	embedParams: { appId: "your-app-id" },
});

const handleLoadNewScore = async () => {
	await loadScore("5bac04bf5a50cd288c95048e");
};
</script>
