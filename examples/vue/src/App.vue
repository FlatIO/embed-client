<template>
  <header>
    <h1>@flat/embed-vue</h1>
    <p>Vue 3 SDK for Flat's interactive sheet music embed</p>
  </header>

  <nav class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="{ active: activeTab === tab.id }"
      @click="activeTab = tab.id"
    >
      {{ tab.label }}
    </button>
  </nav>

  <ScoreViewer v-if="activeTab === 'viewer'" />
  <ScoreEditor v-else-if="activeTab === 'editor'" />
  <PlaybackControls v-else-if="activeTab === 'playback'" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PlaybackControls from './components/PlaybackControls.vue';
import ScoreEditor from './components/ScoreEditor.vue';
import ScoreViewer from './components/ScoreViewer.vue';

const tabs = [
  { id: 'viewer', label: 'Score Viewer' },
  { id: 'editor', label: 'Score Editor' },
  { id: 'playback', label: 'Playback Controls' },
];

const activeTab = ref('viewer');
</script>
