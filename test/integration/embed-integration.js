let APP_ID = '58fa312bea9bbd061b0ea8f3';
let BASE_URL = 'https://flat-embed.com';
let PUBLIC_SCORE = '56ae21579a127715a02901a6';
let QUARTET_SCORE = '5e1348dd6d09386a2b178b58';
let PRIVATE_LINK_SCORE = '5ce56f7c019fd41f5b17b72d';
let PRIVATE_LINK_SHARING_KEY =
  '3f70cc5ecf5e4248055bbe7502a9514cfe619c53b4e248144e470bb5f08c5ecf880cf3eda5679c6b19f646a98ec0bd06d892ee1fd6896e20de0365ed0a42fc00';

// APP_ID = '58e90082688f3e99d1244f58';
// BASE_URL = 'http://vincent.ovh:3000/embed';
// PUBLIC_SCORE = '5bcc8e5b32023d903fb5fb26';

describe('Integration - Embed', () => {
  // On failure, clean dom
  afterEach(() => {
    try {
      [...document.querySelectorAll('div,iframe')].forEach(el => document.body.removeChild(el));
    } catch (err) {
      // console.debug(err);
    }
  });

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
          assert.equal(meta.title, 'House of the Rising Sun');
          container.parentNode.removeChild(container);
          done();
        });
    });
  });

  describe('JSON import/export', () => {
    it('should import a Flat JSON file then export it', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
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

  describe('PNG export', () => {
    it('should export in PNG (no options)', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page',
        },
      });

      embed.getPNG().then(png => {
        assert.ok(png instanceof Uint8Array);
        assert.ok(png.length > 0);
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should export in PNG (data Url)', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page',
        },
      });

      embed.getPNG({ result: 'dataURL' }).then(png => {
        assert.equal(typeof png, 'string');
        assert.equal(png.indexOf('data:image/png;base64,'), 0);
        container.parentNode.removeChild(container);
        done();
      });
    });
  });

  describe('MIDI export', () => {
    it('should export in MIDI', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page',
        },
      });

      embed.getMIDI().then(midi => {
        assert.ok(midi instanceof Uint8Array);
        assert.ok(midi.length > 0);
        container.parentNode.removeChild(container);
        done();
      });
    });
  });

  describe('Cursor position', () => {
    it('should get the cursor position (default: 0)', done => {
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
          container.parentNode.removeChild(container);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('should set the cursor position then get it', done => {
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
          container.parentNode.removeChild(container);
          done();
        })
        .catch(error => {
          assert.ifError(error);
        });
    });

    it('should fail to set cursor with missing param', done => {
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
        .setCursorPosition({
          noteIdx: 1,
        })
        .catch(error => {
          assert.equal(error.code, 'BadPartIdxError');
          assert.equal(error.message, 'There is no part at the index [undefined<undefined>].');
          container.parentNode.removeChild(container);
          done();
        });
    });

    it('should set fail to set cursor with bad param value', done => {
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
        .setCursorPosition({
          partIdx: 0,
          staffIdx: 0,
          measureIdx: true,
          noteIdx: 0,
          voiceIdxInStaff: 0,
        })
        .catch(error => {
          assert.equal(error.message, 'Parameter measureIdx should be a number, not boolean');
          container.parentNode.removeChild(container);
          done();
        });
    });
  });

  describe('Focus score', () => {
    it('should focus the score', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page',
        },
      });

      embed
        .ready()
        .then(() => {
          assert.equal(document.activeElement.nodeName, 'BODY');
          return embed.focusScore();
        })
        .then(() => {
          assert.equal(document.activeElement.nodeName, 'IFRAME');
          container.parentNode.removeChild(container);
          done();
        });
    });
  });

  describe('Zoom', () => {
    it('should load an embed in page mode and have the zoom auto set', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page',
        },
      });

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
          container.parentNode.removeChild(container);
          done();
        });
    });

    it('should set a new zoom value & disable auto-zoom', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page',
        },
      });

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
          container.parentNode.removeChild(container);
          done();
        });
    });
  });

  describe('Playback', () => {
    it('should play get `play` event', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
        },
      });

      embed.on('play', () => {
        container.parentNode.removeChild(container);
        done();
      });

      embed.play();
    });

    it('should play get `playbackPosition` event', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
        },
      });

      embed.on('playbackPosition', pos => {
        assert.ok(pos.currentMeasure >= 0, 'currentMeasure');
        if (container) {
          container.parentNode.removeChild(container);
          container = null;
          done();
        }
      });

      embed.play();
    });

    it('should play then pause and get `pause` event', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
        },
      });

      embed.on('pause', () => {
        container.parentNode.removeChild(container);
        done();
      });

      embed.play().then(() => {
        embed.pause();
      });
    });

    it('should play then stop and get `stop` event', done => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
        },
      });

      embed.on('stop', () => {
        container.parentNode.removeChild(container);
        done();
      });

      embed.play().then(() => {
        embed.stop();
      });
    });
  });

  describe('Parts display', () => {
    it('should get all the parts by default', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

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
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
          parts: 'Viola,Cello',
        },
      });

      const allParts = await embed.getParts();
      assert.equal(allParts.length, 4);

      const parts = await embed.getDisplayedParts();
      assert.equal(parts.length, 2);
      assert.equal(parts[0].idx, 1);
      assert.equal(parts[0].name, 'Viola');
      assert.equal(parts[1].idx, 2);
      assert.equal(parts[1].name, 'Cello');
    });

    it('should only display the parts from qs ?parts (idx)', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
          parts: '0,2',
        },
      });

      const allParts = await embed.getParts();
      assert.equal(allParts.length, 4);

      const parts = await embed.getDisplayedParts();
      assert.equal(parts.length, 2);
      assert.equal(parts[0].idx, 0);
      assert.equal(parts[0].name, 'Violin');
      assert.equal(parts[1].idx, 2);
      assert.equal(parts[1].name, 'Cello');
    });

    it('should update the displayed part using setDisplayedParts()', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
          parts: '0,2',
        },
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

  describe('getNbMeasures', () => {
    it('basic', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

      // When
      const result = await embed.getNbMeasures();

      // Then
      assert.strictEqual(result, 1);
    });
  });

  describe('getMeasuresUuids', () => {
    it('basic', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

      // When
      const result = await embed.getMeasuresUuids();

      // Then
      assert.deepEqual(result, ['32511d58-cc7e-e7ba-399e-3b8f186b4ddb']);
    });
  });

  describe('getNbParts', () => {
    it('basic', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

      // When
      const result = await embed.getNbParts();

      // Then
      assert.strictEqual(result, 4);
    });
  });

  describe('getPartsUuids', () => {
    it('basic', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

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

  describe('getMeasureVoicesUuids', () => {
    it('basic', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

      // When
      const result = await embed.getMeasureVoicesUuids({
        partUuid: '1f4ab07d-d27a-99aa-2304-f3dc10bb27c3',
        measureUuid: '32511d58-cc7e-e7ba-399e-3b8f186b4ddb',
      });

      // Then
      assert.deepEqual(result, ['17099aa2-e0dd-dbc3-2d45-b9b574e89572']);
    });
  });

  describe('getMeasureNbNotes', () => {
    it('basic', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

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

  describe('getNoteData', () => {
    it('basic', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

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

  describe('playbackPositionToNoteIdx', () => {
    it('basic', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

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

  describe('go', () => {
    it('goLeft', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

      // When
      await embed.goRight();

      // Then
      const pos = await embed.getCursorPosition();
      assert.strictEqual(pos.noteIdx, 1);
    });
    it('goRight', async () => {
      // Giv3n
      const container = document.createElement('div');
      document.body.appendChild(container);

      const embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });
      await embed.goRight();

      // When
      await embed.goLeft();

      // Then
      const pos = await embed.getCursorPosition();
      assert.strictEqual(pos.noteIdx, 0);
    });
  });

  describe('Metronome mode', () => {
    it('should change between metronome modes', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

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

  describe('Playback speed', () => {
    it('should change between different playback speeds', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

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

  describe('Volume', () => {
    it('should set & get the mast volume', async () => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: QUARTET_SCORE,
        embedParams: {
          appId: APP_ID,
        },
      });

      // default volume
      assert.strictEqual(await embed.getMasterVolume(), 100);

      // set & get volume
      await embed.setMasterVolume({ volume: 50 });
      assert.strictEqual(await embed.getMasterVolume(), 50);

      await embed.setMasterVolume({ volume: 0 });
      assert.strictEqual(await embed.getMasterVolume(), 0);

      await embed.setMasterVolume({ volume: 100 });
      console.log(await embed.getMasterVolume());
      assert.strictEqual(await embed.getMasterVolume(), 100);
    });
  });

  // describe('Editor config', () => {
  //   it('should fetch the viewer config', (done) => {
  //     var container = document.createElement('div');
  //     document.body.appendChild(container);

  //     var embed = new Flat.Embed(container, {
  //       score: PUBLIC_SCORE,
  //       baseUrl: BASE_URL,
  //       embedParams: {
  //         appId: APP_ID,
  //         controlsFloating: false,
  //         branding: false
  //       }
  //     });

  //     embed.getEmbedConfig().then((config) => {
  //       assert.equal(config.branding, false);
  //       assert.equal(config.controlsPlay, true);
  //       assert.equal(config.controlsFloating, false);
  //       container.parentNode.removeChild(container);
  //       done();
  //     });
  //   });

  //   it('should use the edit mode and set a tools config', (done) => {
  //     var container = document.createElement('div');
  //     document.body.appendChild(container);

  //     var embed = new Flat.Embed(container, {
  //       baseUrl: BASE_URL,
  //       embedParams: {
  //         appId: APP_ID,
  //         mode: 'edit',
  //         controlsFloating: false,
  //         branding: false
  //       }
  //     });

  //     embed.setEditorConfig({
  //       noteMode: {
  //         durations: true,
  //         tuplet: false
  //       },
  //       articulationMode: false
  //     }).then((config) => {
  //       assert.ok(config.global);
  //       assert.equal(config.articulationMode, false);
  //       assert.equal(config.noteMode.durations, true);
  //       assert.equal(config.noteMode.tuplet, false);
  //       container.parentNode.removeChild(container);
  //       done();
  //     }).catch(done);
  //   });
  // });
});
