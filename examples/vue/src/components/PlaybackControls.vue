<template>
  <div>
    <div class="demo-layout">
      <div class="embed-panel">
        <div class="embed-container">
          <FlatEmbed
            ref="flatEmbed"
            :score="scoreId"
            :embed-params="embedParams"
            @play="onPlay"
            @pause="onPause"
            @stop="onStop"
            @playback-position="onPlaybackPosition"
          />
        </div>
        <div class="controls">
          <button class="primary" @click="togglePlayback">
            {{ flatEmbed?.playbackState === 'playing' ? 'Pause' : 'Play' }}
          </button>
          <button @click="flatEmbed?.embed?.stop()">Stop</button>
          <div class="volume-control">
            <label>Vol</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="volume"
              @input="onVolumeChange"
            />
          </div>
        </div>
      </div>

      <div class="info-panel">
        <div class="card">
          <h3>Playback State</h3>
          <div style="margin-bottom: 0.75rem">
            <span :class="['badge', `badge--${flatEmbed?.playbackState ?? 'idle'}`]">
              <span class="badge-dot" />
              {{ flatEmbed?.playbackState ?? 'idle' }}
            </span>
          </div>
          <dl class="state-grid">
            <dt>Measure</dt>
            <dd>{{ flatEmbed?.playbackPosition?.currentMeasure ?? '-' }}</dd>
            <dt>Quarter from start</dt>
            <dd>{{ flatEmbed?.playbackPosition?.quarterFromMeasureStart?.toFixed(2) ?? '-' }}</dd>
            <dt>Volume</dt>
            <dd>{{ Math.round(volume * 100) }}%</dd>
          </dl>
        </div>

        <div class="card">
          <h3>Code</h3>
          <div class="code-block">
            <pre>{{ playbackCode }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FlatEmbed, PlaybackPosition } from '@flat/embed-vue';
import { ref } from 'vue';

const scoreId = '56ae21579a127715a02901a6';
const flatEmbed = ref<InstanceType<typeof FlatEmbed>>();
const volume = ref(1);

const embedParams = {
  appId: '63e5a04e09e7b2001d40c0f5',
  controlsPlay: true,
};

const onPlay = () => {};
const onPause = () => {};
const onStop = () => {};
const onPlaybackPosition = (_pos: PlaybackPosition) => {};

function togglePlayback() {
  if (!flatEmbed.value?.embed) return;
  if (flatEmbed.value.playbackState === 'playing') {
    flatEmbed.value.embed.pause();
  } else {
    flatEmbed.value.embed.play();
  }
}

function onVolumeChange(e: Event) {
  const val = Number.parseFloat((e.target as HTMLInputElement).value);
  volume.value = val;
  flatEmbed.value?.embed?.setMasterVolume({ volume: val });
}

const playbackCode = `<FlatEmbed
  ref="flatEmbed"
  score="56ae21579a127715a02901a6"
  :embed-params="{ appId: '...', controlsPlay: true }"
  @play="onPlay"
  @pause="onPause"
  @stop="onStop"
  @playback-position="onPosition"
/>

<!-- Custom controls -->
<button @click="flatEmbed?.embed?.play()">Play</button>
<button @click="flatEmbed?.embed?.pause()">Pause</button>

<!-- Reactive playback state -->
<p>{{ flatEmbed?.playbackState }}</p>
<p>Measure: {{ flatEmbed?.playbackPosition?.currentMeasure }}</p>`;
</script>
