<template>
  <div>
    <div class="demo-layout">
      <div class="embed-panel">
        <div class="embed-container">
          <FlatEmbed
            ref="flatEmbed"
            :score="scoreId"
            :embed-params="embedParams"
            @cursor-position="onCursorPosition"
            @note-details="onNoteDetails"
            @measure-details="onMeasureDetails"
          />
        </div>
      </div>

      <div class="info-panel">
        <div class="card">
          <h3>Cursor Position</h3>
          <dl class="state-grid">
            <dt>Part</dt>
            <dd>{{ flatEmbed?.cursorPosition?.partIdx ?? '-' }}</dd>
            <dt>Measure</dt>
            <dd>{{ flatEmbed?.cursorPosition?.measureIdx ?? '-' }}</dd>
            <dt>Note</dt>
            <dd>{{ flatEmbed?.cursorPosition?.noteIdx ?? '-' }}</dd>
            <dt>Voice</dt>
            <dd>{{ flatEmbed?.cursorPosition?.voiceIdxInStaff ?? '-' }}</dd>
          </dl>
        </div>

        <div class="card">
          <h3>Note Details</h3>
          <dl class="state-grid" v-if="flatEmbed?.noteDetails">
            <dt>Duration</dt>
            <dd>{{ flatEmbed.noteDetails.durationType }}{{ flatEmbed.noteDetails.nbDots > 0 ? ` (${'.' .repeat(flatEmbed.noteDetails.nbDots)})` : '' }}</dd>
            <dt>Rest</dt>
            <dd>{{ flatEmbed.noteDetails.isRest }}</dd>
            <dt>Pitches</dt>
            <dd>{{ flatEmbed.noteDetails.pitches.map(p => `${p.step}${p.octave}`).join(', ') || '-' }}</dd>
            <dt>Articulations</dt>
            <dd>{{ flatEmbed.noteDetails.articulations.join(', ') || 'none' }}</dd>
            <dt>Tied</dt>
            <dd>{{ flatEmbed.noteDetails.isTied }}</dd>
          </dl>
          <p v-else style="font-size: 0.8125rem; color: var(--color-text-secondary)">
            Click a note to see details
          </p>
        </div>

        <div class="card">
          <h3>Measure Details</h3>
          <dl class="state-grid" v-if="flatEmbed?.measureDetails">
            <dt>Time</dt>
            <dd>{{ flatEmbed.measureDetails.time.beats }}/{{ flatEmbed.measureDetails.time['beat-type'] }}</dd>
            <dt>Key</dt>
            <dd>{{ flatEmbed.measureDetails.key.fifths }} fifths</dd>
            <dt>Tempo</dt>
            <dd>{{ flatEmbed.measureDetails.tempo.bpm }} BPM</dd>
            <dt>Clef</dt>
            <dd>{{ flatEmbed.measureDetails.clef.sign }}</dd>
          </dl>
        </div>

        <div class="card">
          <h3>Code</h3>
          <div class="code-block">
            <pre>{{ editorCode }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FlatEmbed, MeasureDetails, NoteCursorPosition, NoteDetails } from '@flat/embed-vue';
import { ref } from 'vue';

const scoreId = '56ae21579a127715a02901a6';
const flatEmbed = ref<InstanceType<typeof FlatEmbed>>();

const embedParams = {
  appId: '63e5a04e09e7b2001d40c0f5',
  mode: 'edit' as const,
  controlsPlay: true,
};

const onCursorPosition = (_pos: NoteCursorPosition) => {};
const onNoteDetails = (_details: NoteDetails) => {};
const onMeasureDetails = (_details: MeasureDetails) => {};

const editorCode = `<FlatEmbed
  ref="flatEmbed"
  score="56ae21579a127715a02901a6"
  :embed-params="{ appId: '...', mode: 'edit' }"
  @cursor-position="onCursor"
  @note-details="onNote"
  @measure-details="onMeasure"
/>

<!-- Real-time note info -->
<p>{{ flatEmbed?.noteDetails?.durationType }}</p>
<p>{{ flatEmbed?.measureDetails?.tempo.bpm }}</p>`;
</script>
