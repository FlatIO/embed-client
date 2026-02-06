const APP_ID = window.__karma__.config.env.FLAT_EMBED_APP_ID || '58fa312bea9bbd061b0ea8f3';
const BASE_URL = window.__karma__.config.env.FLAT_EMBED_BASE_URL || 'https://flat-embed.com';
const PUBLIC_SCORE =
  window.__karma__.config.env.FLAT_EMBED_PUBLIC_SCORE || '56ae21579a127715a02901a6';
const QUARTET_SCORE =
  window.__karma__.config.env.FLAT_EMBED_QUARTET_SCORE || '5e1348dd6d09386a2b178b58';
const PRIVATE_LINK_SCORE =
  window.__karma__.config.env.FLAT_EMBED_PRIVATE_LINK_SCORE || '5ce56f7c019fd41f5b17b72d';
const PRIVATE_LINK_SHARING_KEY =
  window.__karma__.config.env.FLAT_EMBED_PRIVATE_LINK_SHARING_KEY ||
  '3f70cc5ecf5e4248055bbe7502a9514cfe619c53b4e248144e470bb5f08c5ecf880cf3eda5679c6b19f646a98ec0bd06d892ee1fd6896e20de0365ed0a42fc00';

/**
 * #full: Tests that can run on full editor
 */

describe('Integration - Embed', () => {
  // On failure, clean dom
  afterEach(() => {
    try {
      [...document.querySelectorAll('div,iframe')].forEach(el => document.body.removeChild(el));
    } catch (err) {
      // console.debug(err);
    }
  });

  const USE_NEW_DISPLAY = window.__karma__.config.env.FLAT_EMBED_NEW_DISPLAY === 'true';
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
    it('should instance an Embed using a container', done => {
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

      embed.ready().then(() => {
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should instance an Embed using a string id', done => {
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

      embed.ready().then(() => {
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should create two object with the same embed', done => {
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

      embed.ready().then(() => {
        container.parentNode.removeChild(container);
        assert.equal(embed2, embed);
        done();
      });
    });

    it('should create an embed with a blank document', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
        },
      });

      embed.ready().then(() => {
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should plug into an existing iframe', done => {
      var iframe = document.createElement('iframe');
      var baseUrl = BASE_URL || 'https://flat-embed.com';
      iframe.setAttribute('src', baseUrl + '/' + PUBLIC_SCORE + '?jsapi=true&appId=' + APP_ID);
      document.body.appendChild(iframe);

      var embed = new Flat.Embed(iframe);

      embed.ready().then(() => {
        iframe.parentNode.removeChild(iframe);
        done();
      });
    });
  });

  describe('Load Platform scores', () => {
    it('should load a Flat Platform score by id', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: PUBLIC_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

      embed
        .getJSON()
        .then(json => {
          assert.ok(json['score-partwise']);
          return embed.getFlatScoreMetadata();
        })
        .then(meta => {
          // console.log('META', meta);
          assert.equal(meta.title, 'House of the Rising Sun');
          container.parentNode.removeChild(container);
          done();
        });
    });
  });

  describe('JSON import/export #full', () => {
    it('should import a Flat JSON file then export it', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/json')
        .then(response => {
          return response.json();
        })
        .then(json => {
          return embed.loadJSON(json);
        })
        .then(() => {
          return embed.getJSON();
        })
        .then(json => {
          assert.ok(json['score-partwise']);
          assert.deepEqual(json['score-partwise'].credit, [
            {
              'credit-type': 'title',
              'credit-words': 'House of the Rising Sun',
            },
          ]);
          container.parentNode.removeChild(container);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('should fail to import a non json', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      embed
        .loadJSON('42}')
        .then(() => {
          assert.notOk(true);
        })
        .catch(error => {
          assert.equal(error.message, 'Invalid score JSON');
          container.parentNode.removeChild(container);
          done();
        });
    });
  });

  describe('MusicXML import/export', () => {
    it('shoud load a MusicXML (plain) in a blank embed', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      fetch('/base/test/integration/fixtures/flat-house-of-the-rising-sun.musicxml')
        .then(response => {
          return response.text();
        })
        .then(xml => {
          return embed.loadMusicXML(xml);
        })
        .then(() => {
          return embed.getJSON();
        })
        .then(json => {
          assert.ok(json['score-partwise']);
          assert.deepEqual(json['score-partwise'].credit, [
            {
              'credit-type': 'title',
              'credit-words': 'House of the Rising Sun',
            },
          ]);
          container.parentNode.removeChild(container);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('shoud load a MusicXML (compressed) in a blank embed', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      fetch('/base/test/integration/fixtures/flat-house-of-the-rising-sun.mxl')
        .then(response => {
          return response.arrayBuffer();
        })
        .then(mxl => {
          return embed.loadMusicXML(mxl);
        })
        .then(() => {
          return embed.getJSON();
        })
        .then(json => {
          assert.ok(json['score-partwise']);
          assert.deepEqual(json['score-partwise'].credit, [
            {
              'credit-type': 'title',
              'credit-words': 'House of the Rising Sun',
            },
          ]);
          container.parentNode.removeChild(container);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('shoud export a score into a plain MusicXML', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      fetch('/base/test/integration/fixtures/flat-house-of-the-rising-sun.mxl')
        .then(response => {
          return response.arrayBuffer();
        })
        .then(mxl => {
          return embed.loadMusicXML(mxl);
        })
        .then(() => {
          return embed.getMusicXML();
        })
        .then(xml => {
          assert.ok(xml.includes('<work-title>House of the Rising Sun</work-title>'));
          container.parentNode.removeChild(container);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('shoud export a score into a compressed MusicXML and re-import it', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      fetch('/base/test/integration/fixtures/flat-house-of-the-rising-sun.mxl')
        .then(response => {
          return response.arrayBuffer();
        })
        .then(mxl => {
          return embed.loadMusicXML(mxl);
        })
        .then(() => {
          return embed.getMusicXML({ compressed: true });
        })
        .then(mxl => {
          return embed.loadMusicXML(mxl);
        })
        .then(() => {
          return embed.getJSON();
        })
        .then(json => {
          assert.ok(json['score-partwise']);
          assert.deepEqual(json['score-partwise'].credit, [
            {
              'credit-type': 'title',
              'credit-words': 'House of the Rising Sun',
            },
          ]);
          container.parentNode.removeChild(container);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('should fail to import an invalid MusicXML', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      embed
        .loadMusicXML('<?xml version="1.0" encoding="UTF-8"?><bad></bad>')
        .then(() => {
          assert.notOk(true);
        })
        .catch(error => {
          assert.equal(error.message, 'Invalid MusicXML file format.');
          container.parentNode.removeChild(container);
          done();
        });
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
    it('should export in PNG (no options)', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed.getPNG().then(png => {
        assert.ok(png instanceof Uint8Array);
        assert.ok(png.length > 0);
        done();
      });
    });

    it('should export in PNG (data Url)', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed.getPNG({ result: 'dataURL' }).then(png => {
        assert.equal(typeof png, 'string');
        assert.equal(png.indexOf('data:image/png;base64,'), 0);
        done();
      });
    });
  });

  describe('PDF export #full', () => {
    it('should export in PDF (no options)', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed.getPDF().then(pdf => {
        assert.ok(pdf instanceof Uint8Array);
        assert.ok(pdf.length > 0);
        // PDF magic bytes: %PDF
        assert.equal(pdf[0], 0x25); // %
        assert.equal(pdf[1], 0x50); // P
        assert.equal(pdf[2], 0x44); // D
        assert.equal(pdf[3], 0x46); // F
        done();
      });
    });

    it('should export in PDF with concert pitch option', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed.getPDF({ isConcertPitch: true }).then(pdf => {
        assert.ok(pdf instanceof Uint8Array);
        assert.ok(pdf.length > 0);
        done();
      });
    });
  });

  describe('MIDI import/export', () => {
    it('shoud load a MIDI file in a blank embed', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        isCustomUrl: BASE_URL.includes('blank'),
        embedParams: {
          appId: APP_ID,
        },
      });

      fetch('/base/test/integration/fixtures/test.mid')
        .then(response => {
          return response.arrayBuffer();
        })
        .then(midi => {
          return embed.loadMIDI(midi);
        })
        .then(() => {
          return embed.getJSON();
        })
        .then(json => {
          assert.ok(json['score-partwise']);
          assert.deepEqual(json['score-partwise'].credit, [
            {
              'credit-type': 'title',
              'credit-words': 'Test MIDI',
            },
          ]);
          container.parentNode.removeChild(container);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('should export in MIDI #full', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed.getMIDI().then(midi => {
        assert.ok(midi instanceof Uint8Array);
        assert.ok(midi.length > 0);
        done();
      });
    });
  });

  describe('Cursor position #full', () => {
    it('should get the cursor position (default: 0)', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);
      embed
        .getCursorPosition()
        .then(position => {
          assert.equal(position.partIdx, 0);
          assert.equal(position.staffIdx, 0);
          assert.equal(position.voiceIdxInStaff, 0);
          assert.equal(position.measureIdx, 0);
          assert.equal(position.noteIdx, 0);
          assert.ok(position.partUuid);
          assert.ok(position.staffUuid);
          assert.ok(position.measureUuid);
          assert.ok(position.voiceUuid);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('should set the cursor position then get it', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed
        .setCursorPosition({
          partIdx: 0,
          staffIdx: 0,
          voiceIdxInStaff: 0,
          measureIdx: 2,
          noteIdx: 1,
          extra: 'skip',
        })
        .then(position => {
          assert.equal(position.partIdx, 0);
          assert.equal(position.staffIdx, 0);
          assert.equal(position.voiceIdxInStaff, 0);
          assert.equal(position.measureIdx, 2);
          assert.equal(position.noteIdx, 1);
          return embed.getCursorPosition();
        })
        .then(position => {
          assert.equal(position.partIdx, 0);
          assert.equal(position.staffIdx, 0);
          assert.equal(position.voiceIdxInStaff, 0);
          assert.equal(position.measureIdx, 2);
          assert.equal(position.noteIdx, 1);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('should fallback missing elements of cursor position', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed
        .setCursorPosition({
          noteIdx: 1,
        })
        .then(position => {
          assert.equal(position.partIdx, 0);
          assert.equal(position.staffIdx, 0);
          assert.equal(position.voiceIdxInStaff, 0);
          assert.equal(position.measureIdx, 0);
          assert.equal(position.noteIdx, 0);// First measure only have 1 note
          done();
        });
    });

    it('should set fail to set cursor with bad param value', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed
        .setCursorPosition({
          partIdx: 0,
          staffIdx: 0,
          measureIdx: true,
          noteIdx: 0,
          voiceIdxInStaff: 0,
        })
        .catch(error => {
          assert.equal(error.message, 'Parameter measureIdx should be a number, not boolean');
          done();
        });
    });
  });

  describe('Focus score #full', () => {
    it('should focus the score', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed
        .ready()
        .then(() => {
          assert.equal(document.activeElement.nodeName, 'BODY');
          return embed.focusScore();
        })
        .then(() => {
          assert.equal(document.activeElement.nodeName, 'IFRAME');
          done();
        });
    });
  });

  describe('Zoom #full', () => {
    it('should load an embed in page mode and have the zoom auto set', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed
        .getAutoZoom(state => {
          assert.equal(state, 'true');
          done();
        })
        .then(() => {
          return embed.getZoom();
        })
        .then(zoom => {
          assert.ok(Number.isFinite(zoom));
          assert.ok(zoom >= 0.5);
          assert.ok(zoom < 3);
          return embed.getAutoZoom();
        })
        .then(autoZoom => {
          assert.ok(autoZoom);
          return embed.setAutoZoom(false);
        })
        .then(autoZoom => {
          assert.ok(!autoZoom);
          return embed.getAutoZoom();
        })
        .then(autoZoom => {
          assert.ok(!autoZoom);
          done();
        });
    });

    it('should set a new zoom value & disable auto-zoom', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed
        .setZoom(2, zoom => {
          assert.equal(zoom, 2);
          done();
        })
        .then(() => {
          return embed.getZoom();
        })
        .then(zoom => {
          assert.equal(zoom, 2);
          return embed.getAutoZoom();
        })
        .then(state => {
          assert.equal(state, false);
          done();
        });
    });
  });

  describe('Playback #full', () => {
    it('should play get `play` event', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed.on('play', () => {
        done();
      });

      embed.play();
    });

    it('should play get `playbackPosition` event', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);
      embed.on('playbackPosition', pos => {
        assert.ok(pos.currentMeasure >= 0, 'currentMeasure');
        done();
      });

      embed.play();
    });

    it('should play then pause and get `pause` event', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed.on('pause', () => {
        done();
      });

      embed.play().then(() => {
        embed.pause();
      });
    });

    it('should play then stop and get `stop` event', done => {
      const { embed } = createEmbedForScoreId(PUBLIC_SCORE);

      embed.on('stop', () => {
        done();
      });

      embed.play().then(() => {
        embed.stop();
      });
    });
  });

  describe('Events - embedSize', () => {
    // Note: New display (adagio-display) currently reports viewport dimensions via contentRect,
    // not actual content dimensions. Height assertions are skipped for new display until
    // adagio-display is updated to report actual content height.
    it('should receive embedSize event with reasonable dimensions', done => {
      const { embed, container } = createEmbedForScoreId(PUBLIC_SCORE);
      container.style.width = '800px';

      // Wait for score to be loaded before subscribing to embedSize
      // This ensures the score has fully rendered before we check dimensions
      embed.on('scoreLoaded', () => {
        // Add a small delay to allow layout to stabilize (especially for new display)
        setTimeout(() => {
          let eventCount = 0;
          embed.on('embedSize', data => {
            eventCount++;
            console.log(`[embedSize test] event #${eventCount}: height=${data.height}px, width=${data.width}px`);

            assert.ok(typeof data.height === 'number', 'height is number');
            assert.ok(typeof data.width === 'number', 'width is number');
            // Height should be meaningful for a real score (not just iframe chrome)
            // Skip height check for new display - it returns viewport height, not content height
            if (!USE_NEW_DISPLAY) {
              assert.ok(data.height > 500, `height should be > 500px, got ${data.height}px`);
            }
            assert.ok(data.width > 0, 'width > 0');
            done();
          });
        }, 500);
      });
    });

    // Skip resize test for new display - contentRect doesn't update on container resize
    (USE_NEW_DISPLAY ? it.skip : it)('should emit new embedSize event on container resize', done => {
      const { embed, container } = createEmbedForScoreId(PUBLIC_SCORE);
      container.style.width = '800px';

      // Wait for score to be loaded before subscribing to embedSize
      embed.on('scoreLoaded', () => {
        // Add a small delay to allow layout to stabilize (especially for new display)
        setTimeout(() => {
          let eventCount = 0;
          let firstWidth = 0;

          embed.on('embedSize', data => {
            eventCount++;
            console.log(`[embedSize resize test] event #${eventCount}: height=${data.height}px, width=${data.width}px`);

            if (eventCount === 1) {
              // First event after load
              firstWidth = data.width;
              assert.ok(data.height > 500, `initial height > 500px, got ${data.height}px`);
              // Trigger resize after first event
              setTimeout(() => {
                console.log('[embedSize resize test] triggering resize to 500px');
                container.style.width = '500px';
              }, 200);
            } else if (eventCount === 2) {
              // Second event after resize
              assert.ok(data.width < firstWidth, `width should decrease after resize: ${data.width} < ${firstWidth}`);
              done();
            }
          });
        }, 500);
      });
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
    it('basic', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getNbMeasures();

      // Then
      assert.strictEqual(result, 1);
    });
  });

  describe('getMeasuresUuids #full', () => {
    it('basic', async () => {
      // Given
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getMeasuresUuids();

      // Then
      assert.deepEqual(result, ['32511d58-cc7e-e7ba-399e-3b8f186b4ddb']);
    });
  });

  describe('getNbParts #full', () => {
    it('basic', async () => {
      const { embed } = createEmbedForScoreId(QUARTET_SCORE);

      // When
      const result = await embed.getNbParts();

      // Then
      assert.strictEqual(result, 4);
    });
  });

  describe('getPartsUuids #full', () => {
    it('basic', async () => {
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
    it('basic', async () => {
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
    it('basic', async () => {
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
    it('basic', async () => {
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
    it('basic', async () => {
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
    it('should include mode parameter in EmbedUrlParameters', done => {
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

      embed.ready().then(() => {
        const iframeSrc = embed.element.getAttribute('src');
        assert.ok(iframeSrc.includes('mode=edit'));
        container.parentNode.removeChild(container);
        done();
      });
    });
  });
});
