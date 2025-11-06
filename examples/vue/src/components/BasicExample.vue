<template>
  <div class="example-section">
    <h2>1. Basic Component Usage</h2>
    <div class="controls">
      <button @click="handlePlay">Play</button>
      <button @click="handlePause">Pause</button>
    </div>
    <div class="status">
      <strong>Status:</strong> {{ status }}
    </div>
    <FlatEmbed
      ref="embedRef"
      score="56ae21579a127715a02901a6"
      app-id="your-app-id"
      width="100%"
      height="450px"
      @scoreLoaded="status = 'Score loaded'"
      @play="status = 'Playing'"
      @pause="status = 'Paused'"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FlatEmbed, type FlatEmbedHandle } from '@flat/embed-vue';

const embedRef = ref<FlatEmbedHandle>();
const status = ref('Not loaded');

const handlePlay = async () => {
  await embedRef.value?.play();
  status.value = 'Playing';
};

const handlePause = async () => {
  await embedRef.value?.pause();
  status.value = 'Paused';
};
</script>
