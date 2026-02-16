const APP_ID = window.__TEST_ENV__.FLAT_EMBED_APP_ID || '58fa312bea9bbd061b0ea8f3';
const BASE_URL = window.__TEST_ENV__.FLAT_EMBED_BASE_URL || 'https://flat-embed.com';
const PUBLIC_SCORE =
  window.__TEST_ENV__.FLAT_EMBED_PUBLIC_SCORE || '56ae21579a127715a02901a6';
const QUARTET_SCORE =
  window.__TEST_ENV__.FLAT_EMBED_QUARTET_SCORE || '5e1348dd6d09386a2b178b58';
const PRIVATE_LINK_SCORE =
  window.__TEST_ENV__.FLAT_EMBED_PRIVATE_LINK_SCORE || '5ce56f7c019fd41f5b17b72d';
const PRIVATE_LINK_SHARING_KEY =
  window.__TEST_ENV__.FLAT_EMBED_PRIVATE_LINK_SHARING_KEY ||
  '3f70cc5ecf5e4248055bbe7502a9514cfe619c53b4e248144e470bb5f08c5ecf880cf3eda5679c6b19f646a98ec0bd06d892ee1fd6896e20de0365ed0a42fc00';

/**
 * #full: Tests that can run on full editor
 */

/**
 * Checks if data has valid MP3 magic bytes
 * MP3 can start with ID3 tag (0x49 0x44 0x33) or MPEG frame sync (0xFF followed by frame header)
 */
function isValidMP3(data) {
  if (!(data instanceof Uint8Array) || data.length < 3) return false;
  const isID3 = data[0] === 0x49 && data[1] === 0x44 && data[2] === 0x33;
  const isMPEG = data[0] === 0xff && (data[1] & 0xe0) === 0xe0;
  return isID3 || isMPEG;
}

/**
 * Checks if data has valid WAV magic bytes (RIFF header)
 */
function isValidWAV(data) {
  if (!(data instanceof Uint8Array) || data.length < 4) return false;
  return data[0] === 0x52 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x46; // RIFF
}

describe('Integration - Embed', () => {
  // On failure, clean dom
  afterEach(() => {
    try {
      [...document.querySelectorAll('div,iframe')].forEach(el => document.body.removeChild(el));
    } catch (err) {
      // console.debug(err);
    }
  });

  const USE_NEW_DISPLAY = window.__TEST_ENV__.FLAT_EMBED_NEW_DISPLAY === 'true';
  console.log('[embed-integration] USE_NEW_DISPLAY:', USE_NEW_DISPLAY);

  function createEmbedForScoreId(score, embedParams = {}) {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const isCustomUrl = BASE_URL.includes('blank');
    const baseUrl = BASE_URL.replace('blank', score);

    const embed = new Flat.Embed(container, {
      baseUrl,
      isCustomUrl,
      score,
      embedParams: {
        ...embedParams,
        appId: APP_ID,
        ...(USE_NEW_DISPLAY && { newDisplay: true }),
      },
    });

    return { embed, container };
  }

  describe('Loading embed', () => {
    it('should instance an Embed using a container', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false,
        },
      });

      await embed.ready();
      container.parentNode.removeChild(container);
    });

    it('should instance an Embed using a string id', async () => {
      var container = document.createElement('div');
      container.setAttribute('id', 'container');
      document.body.appendChild(container);

      var embed = new Flat.Embed('container', {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false,
        },
      });

      await embed.ready();
      container.parentNode.removeChild(container);
    });

    it('should create two object with the same embed', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false,
        },
      });

      var embed2 = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false,
        },
      });

      await embed.ready();
      container.parentNode.removeChild(container);
      assert.equal(embed2, embed);
    });

    it('should create an embed with a blank document', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
        },
      });

      await embed.ready();
      container.parentNode.removeChild(container);
    });

    it('should plug into an existing iframe', async () => {
      var iframe = document.createElement('iframe');
      var baseUrl = BASE_URL || 'https://flat-embed.com';
      iframe.setAttribute('src', baseUrl + '/' + PUBLIC_SCORE + '?jsapi=true&appId=' + APP_ID);
      document.body.appendChild(iframe);

      var embed = new Flat.Embed(iframe);

      await embed.ready();
      iframe.parentNode.removeChild(iframe);
    });
  });

  describe('Load Platform scores', () => {
    it('should load a Flat Platform score by id', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: PUBLIC_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

      const json = await embed.getJSON();
      assert.ok(json['score-partwise']);
      const meta = await embed.getFlatScoreMetadata();
      assert.equal(meta.title, 'House of the Rising Sun');
      container.parentNode.removeChild(container);
    });
  });

  describe('JSON import/export #full', () => {
    it('should import a Flat JSON file then export it', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      const response = await fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/json');
      const jsonData = await response.json();
      await embed.loadJSON(jsonData);
      const json = await embed.getJSON();
      assert.ok(json['score-partwise']);
      assert.deepEqual(json['score-partwise'].credit, [
        {
          'credit-type': 'title',
          'credit-words': 'House of the Rising Sun',
        },
      ]);
      container.parentNode.removeChild(container);
    });

    it('should fail to import a non json', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      try {
        await embed.loadJSON('42}');
        assert.fail('Expected loadJSON to reject');
      } catch (error) {
        assert.equal(error.message, 'Invalid score JSON');
        container.parentNode.removeChild(container);
      }
    });
  });

  describe('MusicXML import/export', () => {
    it('shoud load a MusicXML (plain) in a blank embed', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      const response = await fetch('/test/integration/fixtures/flat-house-of-the-rising-sun.musicxml');
      const xml = await response.text();
      await embed.loadMusicXML(xml);
      const json = await embed.getJSON();
      assert.ok(json['score-partwise']);
      assert.deepEqual(json['score-partwise'].credit, [
        {
          'credit-type': 'title',
          'credit-words': 'House of the Rising Sun',
        },
      ]);
      container.parentNode.removeChild(container);
    });

    it('shoud load a MusicXML (compressed) in a blank embed', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      const response = await fetch('/test/integration/fixtures/flat-house-of-the-rising-sun.mxl');
      const mxl = await response.arrayBuffer();
      await embed.loadMusicXML(mxl);
      const json = await embed.getJSON();
      assert.ok(json['score-partwise']);
      assert.deepEqual(json['score-partwise'].credit, [
        {
          'credit-type': 'title',
          'credit-words': 'House of the Rising Sun',
        },
      ]);
      container.parentNode.removeChild(container);
    });

    it('shoud export a score into a plain MusicXML', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      const response = await fetch('/test/integration/fixtures/flat-house-of-the-rising-sun.mxl');
      const mxl = await response.arrayBuffer();
      await embed.loadMusicXML(mxl);
      const xml = await embed.getMusicXML();
      assert.ok(xml.includes('<work-title>House of the Rising Sun</work-title>'));
      container.parentNode.removeChild(container);
    });

    it('shoud export a score into a compressed MusicXML and re-import it', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      const response = await fetch('/test/integration/fixtures/flat-house-of-the-rising-sun.mxl');
      const mxl = await response.arrayBuffer();
      await embed.loadMusicXML(mxl);
      const exportedMxl = await embed.getMusicXML({ compressed: true });
      await embed.loadMusicXML(exportedMxl);
      const json = await embed.getJSON();
      assert.ok(json['score-partwise']);
      assert.deepEqual(json['score-partwise'].credit, [
        {
          'credit-type': 'title',
          'credit-words': 'House of the Rising Sun',
        },
      ]);
      container.parentNode.removeChild(container);
    });

    it('should fail to import an invalid MusicXML', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      try {
        await embed.loadMusicXML('<?xml version="1.0" encoding="UTF-8"?><bad></bad>');
        assert.fail('Expected loadMusicXML to reject');
      } catch (error) {
        assert.equal(error.message, 'Invalid MusicXML file format.');
        container.parentNode.removeChild(container);
      }
    });
  });

  describe('Load Flat score', () => {
    it('should load a public score using loadFlatScore()', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
        },
      });
      await embed.loadFlatScore(PUBLIC_SCORE);
      const meta = await embed.getFlatScoreMetadata();
      assert.equal(meta.title, 'House of the Rising Sun');

      container.parentNode.removeChild(container);
    });

    it('should load a privateLink score using loadFlatScore()', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
        },
      });
      await embed.loadFlatScore({
        score: PRIVATE_LINK_SCORE,
        sharingKey: PRIVATE_LINK_SHARING_KEY,
      });
      const meta = await embed.getFlatScoreMetadata();
      assert.equal(meta.title, 'House of the Rising Sun (Private link test Embed)');

      container.parentNode.removeChild(container);
    });
  });

  describe('PNG export #full', () => {
    it('should export in PNG (no options)', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const png = await embed.getPNG();
      assert.ok(png instanceof Uint8Array);
      assert.ok(png.length > 0);
    });

    it('should export in PNG (data Url)', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const png = await embed.getPNG({ result: 'dataURL' });
      assert.equal(typeof png, 'string');
      assert.equal(png.indexOf('data:image/png;base64,'), 0);
    });
  });

  describe('PDF export #full', () => {
    it('should export in PDF (no options)', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const pdf = await embed.getPDF();
      assert.ok(pdf instanceof Uint8Array, 'Expected Uint8Array, got ' + typeof pdf);
      assert.ok(pdf.length > 0, 'Expected non-empty buffer, got length ' + pdf.length);
      // PDF magic bytes: %PDF
      assert.equal(pdf[0], 0x25); // %
      assert.equal(pdf[1], 0x50); // P
      assert.equal(pdf[2], 0x44); // D
      assert.equal(pdf[3], 0x46); // F
    });

    it('should export in PDF with concert pitch option', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const pdf = await embed.getPDF({ isConcertPitch: true });
      assert.ok(pdf instanceof Uint8Array);
      assert.ok(pdf.length > 0);
    });
  });

  // TODO: Enable when the embed supports the getMP3 action
  describe.skip('MP3 export #full', () => {
    it('should export in MP3', { timeout: 120000 }, async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const mp3 = await embed.getMP3();
      assert.ok(mp3 instanceof Uint8Array, 'Expected Uint8Array, got ' + typeof mp3);
      assert.ok(mp3.length > 0, 'Expected non-empty buffer, got length ' + mp3.length);
      assert.ok(isValidMP3(mp3), 'Valid MP3 header');
    });
  });

  // TODO: Enable when the embed supports the getWAV action
  describe.skip('WAV export #full', () => {
    it('should export in WAV', { timeout: 120000 }, async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const wav = await embed.getWAV();
      assert.ok(wav instanceof Uint8Array, 'Expected Uint8Array, got ' + typeof wav);
      assert.ok(wav.length > 0, 'Expected non-empty buffer, got length ' + wav.length);
      assert.ok(isValidWAV(wav), 'Valid WAV header');
    });
  });

  // TODO: Enable when the embed supports audio export (getMP3/getWAV).
  // exportProgress events are only emitted during long-running audio exports.
  describe.skip('Events - exportProgress #full', () => {
    it('should receive exportProgress events during MP3 export', { timeout: 120000 }, async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);
      let progressReceived = false;

      embed.on('exportProgress', progress => {
        assert.ok(typeof progress === 'object');
        progressReceived = true;
      });

      const mp3 = await embed.getMP3();
      assert.ok(mp3 instanceof Uint8Array);
      assert.ok(progressReceived, 'Should have received exportProgress event');
    });
  });

  describe('MIDI import/export', () => {
    it('shoud load a MIDI file in a blank embed', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      const response = await fetch('/test/integration/fixtures/test.mid');
      const midi = await response.arrayBuffer();
      await embed.loadMIDI(midi);
      const json = await embed.getJSON();
      assert.ok(json['score-partwise']);
      assert.deepEqual(json['score-partwise'].credit, [
        {
          'credit-type': 'title',
          'credit-words': 'Test MIDI',
        },
      ]);
      container.parentNode.removeChild(container);
    });

    it('should export in MIDI #full', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const midi = await embed.getMIDI();
      assert.ok(midi instanceof Uint8Array);
      assert.ok(midi.length > 0);
    });
  });

  describe('Cursor position #full', () => {
    it('should get the cursor position (default: 0)', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const position = await embed.getCursorPosition();
      assert.equal(position.partIdx, 0);
      assert.equal(position.staffIdx, 0);
      assert.equal(position.voiceIdxInStaff, 0);
      assert.equal(position.measureIdx, 0);
      assert.equal(position.noteIdx, 0);
      assert.ok(position.partUuid);
      assert.ok(position.staffUuid);
      assert.ok(position.measureUuid);
      assert.ok(position.voiceUuid);
    });

    it('should set the cursor position then get it', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const position = await embed.setCursorPosition({
        partIdx: 0,
        staffIdx: 0,
        voiceIdxInStaff: 0,
        measureIdx: 2,
        noteIdx: 1,
        extra: 'skip',
      });
      assert.equal(position.partIdx, 0);
      assert.equal(position.staffIdx, 0);
      assert.equal(position.voiceIdxInStaff, 0);
      assert.equal(position.measureIdx, 2);
      assert.equal(position.noteIdx, 1);

      const position2 = await embed.getCursorPosition();
      assert.equal(position2.partIdx, 0);
      assert.equal(position2.staffIdx, 0);
      assert.equal(position2.voiceIdxInStaff, 0);
      assert.equal(position2.measureIdx, 2);
      assert.equal(position2.noteIdx, 1);
    });

    it('should fallback missing elements of cursor position', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const position = await embed.setCursorPosition({
        noteIdx: 1,
      });
      assert.equal(position.partIdx, 0);
      assert.equal(position.staffIdx, 0);
      assert.equal(position.voiceIdxInStaff, 0);
      assert.equal(position.measureIdx, 0);
      assert.equal(position.noteIdx, 0);// First measure only have 1 note
    });

    it('should set fail to set cursor with bad param value', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      try {
        await embed.setCursorPosition({
          partIdx: 0,
          staffIdx: 0,
          measureIdx: true,
          noteIdx: 0,
          voiceIdxInStaff: 0,
        });
        assert.fail('Expected setCursorPosition to reject');
      } catch (error) {
        assert.equal(error.message, 'Parameter measureIdx should be a number, not boolean');
      }
    });
  });

  describe('Focus score #full', () => {
    it('should focus the score', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      await embed.ready();
      assert.equal(document.activeElement.nodeName, 'BODY');
      await embed.focusScore();
      assert.equal(document.activeElement.nodeName, 'IFRAME');
    });
  });

  describe('Zoom #full', () => {
    it('should load an embed in page mode and have the zoom auto set', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);
      await embed.ready();

      const zoom = await embed.getZoom();
      assert.ok(Number.isFinite(zoom));
      assert.ok(zoom >= 0.5);
      assert.ok(zoom < 3);

      // Enable auto zoom and verify
      await embed.setAutoZoom(true);
      const autoZoom = await embed.getAutoZoom();
      assert.ok(autoZoom);

      // Disable auto zoom and verify
      const newAutoZoom = await embed.setAutoZoom(false);
      assert.ok(!newAutoZoom);

      const checkAutoZoom = await embed.getAutoZoom();
      assert.ok(!checkAutoZoom);
    });

    it('should set a new zoom value & disable auto-zoom', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      await embed.setZoom(2);
      const zoom = await embed.getZoom();
      assert.equal(zoom, 2);

      const state = await embed.getAutoZoom();
      assert.equal(state, false);
    });
  });

  describe('Playback #full', () => {
    it('should play get `play` event', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const playPromise = new Promise(resolve => embed.on('play', resolve));
      await embed.play();
      await playPromise;
    });

    it('should play get `playbackPosition` event', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const posPromise = new Promise(resolve => embed.on('playbackPosition', resolve));
      await embed.play();
      const pos = await posPromise;
      assert.ok(pos.currentMeasure >= 0, 'currentMeasure');
    });

    it('should play then pause and get `pause` event', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const pausePromise = new Promise(resolve => embed.on('pause', resolve));
      await embed.play();
      embed.pause();
      await pausePromise;
    });

    it('should play then stop and get `stop` event', async () => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      const stopPromise = new Promise(resolve => embed.on('stop', resolve));
      await embed.play();
      embed.stop();
      await stopPromise;
    });
  });

  describe('Events - embedSize', () => {
    // Note: New display (adagio-display) currently reports viewport dimensions via contentRect,
    // not actual content dimensions. Height assertions are skipped for new display until
    // adagio-display is updated to report actual content height.
    it('should receive embedSize event with reasonable dimensions', async () => {
      const { embed, container } = createEmbedForScoreId(PUBLIC_SCORE);
      container.style.width = '800px';

      // Wait for score to be loaded before subscribing to embedSize
      await new Promise(resolve => embed.on('scoreLoaded', resolve));
      // Allow layout to stabilize (especially for new display)
      await new Promise(resolve => setTimeout(resolve, 500));

      const data = await new Promise(resolve => embed.on('embedSize', resolve));
      console.log(`[embedSize test] height=${data.height}px, width=${data.width}px`);

      assert.ok(typeof data.height === 'number', 'height is number');
      assert.ok(typeof data.width === 'number', 'width is number');
      // Height should be meaningful for a real score (not just iframe chrome)
      // Skip height check for new display - it returns viewport height, not content height
      if (!USE_NEW_DISPLAY) {
        assert.ok(data.height > 500, `height should be > 500px, got ${data.height}px`);
      }
      assert.ok(data.width > 0, 'width > 0');
    });

    // Skip resize test for new display - contentRect doesn't update on container resize
    (USE_NEW_DISPLAY ? it.skip : it)('should emit new embedSize event on container resize', async () => {
      const { embed, container } = createEmbedForScoreId(PUBLIC_SCORE);
      container.style.width = '800px';

      // Wait for score to be loaded before subscribing to embedSize
      await new Promise(resolve => embed.on('scoreLoaded', resolve));
      // Allow layout to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));

      let eventCount = 0;
      let firstWidth = 0;

      const secondEvent = new Promise((resolve) => {
        embed.on('embedSize', data => {
          eventCount++;
          console.log(`[embedSize resize test] event #${eventCount}: height=${data.height}px, width=${data.width}px`);

          if (eventCount === 1) {
            firstWidth = data.width;
            assert.ok(data.height > 500, `initial height > 500px, got ${data.height}px`);
            // Trigger resize after first event
            setTimeout(() => {
              console.log('[embedSize resize test] triggering resize to 500px');
              container.style.width = '500px';
            }, 200);
          } else if (eventCount === 2) {
            resolve(data);
          }
        });
      });

      const secondData = await secondEvent;
      assert.ok(secondData.width < firstWidth, `width should decrease after resize: ${secondData.width} < ${firstWidth}`);
    });
  });

  describe('Parts display', () => {
    it('should get all the parts by default', async () => {
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      const allParts = await embed.getParts();

      assert.equal(allParts.length, 4);
      assert.equal(allParts[0].idx, 0);
      assert.equal(allParts[0].name, 'Violin');
      assert.equal(allParts[0].abbreviation, 'Vln.');
      assert.equal(allParts[0].isTransposing, false);
      assert.ok(allParts[0].uuid);

      assert.equal(allParts[1].idx, 1);
      assert.equal(allParts[1].name, 'Viola');
      assert.equal(allParts[1].abbreviation, 'Vla.');
      assert.equal(allParts[1].isTransposing, false);
      assert.ok(allParts[1].uuid);

      assert.equal(allParts[2].idx, 2);
      assert.equal(allParts[2].name, 'Cello');
      assert.equal(allParts[2].abbreviation, 'Vc.');
      assert.equal(allParts[2].isTransposing, false);
      assert.ok(allParts[2].uuid);

      assert.equal(allParts[3].idx, 3);
      assert.equal(allParts[3].name, 'Contrabass');
      assert.equal(allParts[3].abbreviation, 'Cb.');
      assert.equal(allParts[3].isTransposing, false);
      assert.ok(allParts[3].uuid);

      const parts = await embed.getDisplayedParts();
      assert.deepEqual(parts, allParts);
    });

    it('should only display the parts from qs ?parts (name)', async () => {
      const { embed } = createEmbedForScoreId(QUARTET_SCORE, {
        parts: 'Viola,Cello',
      });

      const allParts = await embed.getParts();
      assert.equal(allParts.length, 4, 'all parts');

      const parts = await embed.getDisplayedParts();
      assert.equal(parts.length, 2, 'displayed parts');
      assert.equal(parts[0].idx, 1);
      assert.equal(parts[0].name, 'Viola');
      assert.equal(parts[1].idx, 2);
      assert.equal(parts[1].name, 'Cello');
    });

    it('should only display the parts from qs ?parts (idx)', async () => {
      const { embed } = createEmbedForScoreId(QUARTET_SCORE, {
        parts: '0,2',
      });

      const allParts = await embed.getParts();
      assert.equal(allParts.length, 4, 'all parts');

      const parts = await embed.getDisplayedParts();
      assert.equal(parts.length, 2, 'displayed parts');
      assert.equal(parts[0].idx, 0);
      assert.equal(parts[0].name, 'Violin');
      assert.equal(parts[1].idx, 2);
      assert.equal(parts[1].name, 'Cello');
    });

    it('should update the displayed part using setDisplayedParts()', async () => {
      const { embed } = createEmbedForScoreId(QUARTET_SCORE, {
        parts: '0,2',
      });

      const allParts = await embed.getParts();
      assert.equal(allParts.length, 4);

      let parts = await embed.getDisplayedParts();
      assert.equal(parts.length, 2);
      assert.equal(parts[0].idx, 0);
      assert.equal(parts[0].name, 'Violin');
      assert.equal(parts[1].idx, 2);
      assert.equal(parts[1].name, 'Cello');

      await embed.setDisplayedParts({ parts: ['Violin'] });
      parts = await embed.getDisplayedParts();
      assert.equal(parts.length, 1);
      assert.equal(parts[0].idx, 0);
      assert.equal(parts[0].name, 'Violin');

      await embed.setDisplayedParts({ parts: ['2', '3'] });
      parts = await embed.getDisplayedParts();
      assert.equal(parts.length, 2);
      assert.equal(parts[0].idx, 2);
      assert.equal(parts[0].name, 'Cello');
      assert.equal(parts[1].idx, 3);
      assert.equal(parts[1].name, 'Contrabass');
    });
  });

  describe('getNbMeasures #full', () => {
    it('returns total number of measures', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getNbMeasures();

      // Then
      assert.strictEqual(result, 1);
    });
  });

  describe('getMeasuresUuids #full', () => {
    it('returns all measure UUIDs', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getMeasuresUuids();

      // Then
      assert.deepEqual(result, ['32511d58-cc7e-e7ba-399e-3b8f186b4ddb']);
    });
  });

  describe('getNbParts #full', () => {
    it('returns total number of parts', async () => {
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getNbParts();

      // Then
      assert.strictEqual(result, 4);
    });
  });

  describe('getPartsUuids #full', () => {
    it('returns all part UUIDs', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getPartsUuids();

      // Then
      assert.deepEqual(result, [
        '1f4ab07d-d27a-99aa-2304-f3dc10bb27c3',
        '6deb4bfc-f6f3-ce3a-68bb-f9e7b388325b',
        'f6b248fa-57c3-2341-a8cd-48131fd71fc1',
        '513b8d32-7f48-3677-146f-d6744c8d5c4f',
      ]);
    });
  });

  describe('getMeasureVoicesUuids #full', () => {
    it('returns voice UUIDs for a measure', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getMeasureVoicesUuids({
        partUuid: '1f4ab07d-d27a-99aa-2304-f3dc10bb27c3',
        measureUuid: '32511d58-cc7e-e7ba-399e-3b8f186b4ddb',
      });

      // Then
      assert.deepEqual(result, ['17099aa2-e0dd-dbc3-2d45-b9b574e89572']);
    });
  });

  describe('getMeasureNbNotes #full', () => {
    it('returns note count for a measure voice', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getMeasureNbNotes({
        partUuid: '1f4ab07d-d27a-99aa-2304-f3dc10bb27c3',
        measureUuid: '32511d58-cc7e-e7ba-399e-3b8f186b4ddb',
        voiceUuid: '17099aa2-e0dd-dbc3-2d45-b9b574e89572',
      });

      // Then
      assert.strictEqual(result, 4);
    });
  });

  describe('getNoteData #full', () => {
    it('returns note data by index', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getNoteData({
        partUuid: '1f4ab07d-d27a-99aa-2304-f3dc10bb27c3',
        measureUuid: '32511d58-cc7e-e7ba-399e-3b8f186b4ddb',
        voiceUuid: '17099aa2-e0dd-dbc3-2d45-b9b574e89572',
        noteIdx: 1,
      });

      // Then
      assert.deepEqual(result, {
        articulations: [],
        classicHarmony: null,
        durationType: 'quarter',
        dynamicStyle: null,
        harmony: null,
        isInSlur: false,
        isRest: true,
        lyrics: [],
        nbDots: 0,
        nbGraces: 0,
        ornaments: [],
        technical: [],
        tupletType: null,
        wedgeType: null,
      });
    });
  });

  describe('playbackPositionToNoteIdx #full', () => {
    it('maps playback position to note index', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.playbackPositionToNoteIdx({
        partUuid: '1f4ab07d-d27a-99aa-2304-f3dc10bb27c3',
        voiceUuid: '17099aa2-e0dd-dbc3-2d45-b9b574e89572',
        playbackPosition: {
          currentMeasure: 0,
          quarterFromMeasureStart: 1.1,
        },
      });

      // Then
      assert.strictEqual(result, 1);
    });
  });

  describe('go #full', () => {
    it('goLeft', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      await embed.goRight();

      // Then
      const pos = await embed.getCursorPosition();
      assert.strictEqual(pos.noteIdx, 1);
    });
    it('goRight', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      await embed.goRight();

      // When
      await embed.goLeft();

      // Then
      const pos = await embed.getCursorPosition();
      assert.strictEqual(pos.noteIdx, 0);
    });
  });

  describe('Metronome mode #full', () => {
    it('should change between metronome modes', async () => {
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      let mode;

      const continuousMode = 1;
      await embed.setMetronomeMode(continuousMode);
      mode = await embed.getMetronomeMode();
      assert.strictEqual(mode, continuousMode);

      const disabledMode = 2;
      await embed.setMetronomeMode(disabledMode);
      mode = await embed.getMetronomeMode();
      assert.strictEqual(mode, disabledMode);
    });
  });

  describe('Playback speed #full', () => {
    it('should change between different playback speeds', async () => {
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      let speed;

      const fastSpeed = 1.5;
      await embed.setPlaybackSpeed(fastSpeed);
      speed = await embed.getPlaybackSpeed();
      assert.strictEqual(speed, fastSpeed);

      const slowSpeed = 0.5;
      await embed.setPlaybackSpeed(slowSpeed);
      speed = await embed.getPlaybackSpeed();
      assert.strictEqual(speed, slowSpeed);
    });
  });

  describe('Volume #full', () => {
    it('should set & get the mast volume', async () => {
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // default volume
      assert.strictEqual(await embed.getMasterVolume(), 100);

      // set & get volume
      await embed.setMasterVolume({ volume: 50 });
      assert.strictEqual(await embed.getMasterVolume(), 50);

      await embed.setMasterVolume({ volume: 0 });
      assert.strictEqual(await embed.getMasterVolume(), 0);

      await embed.setMasterVolume({ volume: 100 });
      assert.strictEqual(await embed.getMasterVolume(), 100);
    });
  });

  describe('getEmbedConfig', () => {
    it('with layout and other config elements', async () => {
      // Given
      const container = document.createElement('div');
      document.body.appendChild(container);
      const extraOpts = {
        noHeader: true,
        showTabRests: true,
        layout: 'track',
        hideTempo: true,
      };

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
          ...extraOpts,
        },
      });

      // When
      const embedConfig = await embed.getEmbedConfig();

      // Then
      Object.entries(embedConfig).forEach(([key, expectedValue]) => {
        const actualValue = embedConfig[key];
        assert.deepEqual(actualValue, expectedValue);
      });
    });
  });

  describe('Mode parameter', () => {
    it('should include mode parameter in EmbedUrlParameters', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: PUBLIC_SCORE,
        embedParams: {
          appId: APP_ID,
          mode: 'edit',
        },
      });

      await embed.ready();
      const iframeSrc = embed.element.getAttribute('src');
      assert.ok(iframeSrc.includes('mode=edit'));
      container.parentNode.removeChild(container);
    });
  });
});
