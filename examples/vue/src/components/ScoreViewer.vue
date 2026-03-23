<template>
  <div>
    <div class="score-select">
      <button
        v-for="s in scores"
        :key="s.id"
        :class="{ active: scoreId === s.id }"
        @click="scoreId = s.id"
      >
        {{ s.label }}
      </button>
    </div>

    <div class="demo-layout">
      <div class="embed-panel">
        <div class="embed-container">
          <FlatEmbed
            ref="flatEmbed"
            :score="scoreId"
            :embed-params="embedParams"
            @cursor-position="onCursorPosition"
            @embed-size="onEmbedSize"
            @score-loaded="onScoreLoaded"
          />
        </div>
      </div>

      <div class="info-panel">
        <div class="card">
          <h3>Reactive State</h3>
          <dl class="state-grid">
            <dt>Ready</dt>
            <dd>{{ flatEmbed?.isReady ?? false }}</dd>
            <dt>Score loaded</dt>
            <dd>{{ flatEmbed?.scoreLoaded ?? false }}</dd>
            <dt>Embed size</dt>
            <dd>{{ flatEmbed?.embedSize ? `${flatEmbed.embedSize.width} x ${flatEmbed.embedSize.height}` : '-' }}</dd>
          </dl>
        </div>

        <div class="card">
          <h3>Cursor Position</h3>
          <dl class="state-grid">
            <dt>Part</dt>
            <dd>{{ flatEmbed?.cursorPosition?.partIdx ?? '-' }}</dd>
            <dt>Measure</dt>
            <dd>{{ flatEmbed?.cursorPosition?.measureIdx ?? '-' }}</dd>
            <dt>Note</dt>
            <dd>{{ flatEmbed?.cursorPosition?.noteIdx ?? '-' }}</dd>
            <dt>Staff</dt>
            <dd>{{ flatEmbed?.cursorPosition?.staffIdx ?? '-' }}</dd>
          </dl>
        </div>

        <div class="card">
          <h3>Code</h3>
          <div class="code-block">
            <pre>{{ viewerCode }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EmbedSize, FlatEmbed, NoteCursorPosition } from '@flat/embed-vue';
import { ref } from 'vue';

const scores = [
  { id: '56ae21579a127715a02901a6', label: 'Fur Elise' },
  { id: '56ae21579a127715a02901a8', label: 'Moonlight Sonata' },
];

const scoreId = ref(scores[0].id);
const flatEmbed = ref<InstanceType<typeof FlatEmbed>>();

const embedParams = {
  appId: '63e5a04e09e7b2001d40c0f5',
  layout: 'responsive' as const,
  branding: false,
};

const onCursorPosition = (_pos: NoteCursorPosition) => {};
const onEmbedSize = (_size: EmbedSize) => {};
const onScoreLoaded = () => {};

const viewerCode = `<FlatEmbed
  ref="flatEmbed"
  :score="scoreId"
  :embed-params="{ appId: '...', layout: 'responsive' }"
  @cursor-position="onCursor"
  @embed-size="onSize"
/>

<!-- Reactive state -->
<p>{{ flatEmbed?.cursorPosition?.measureIdx }}</p>
<p>{{ flatEmbed?.embedSize?.width }}</p>

<!-- Switch scores reactively -->
<button @click="scoreId = 'another-id'">
  Load Score
</button>`;
</script>
