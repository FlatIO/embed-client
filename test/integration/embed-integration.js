var APP_ID = '58fa312bea9bbd061b0ea8f3',
  BASE_URL = 'https://flat-embed.com',
  PUBLIC_SCORE = '56ae21579a127715a02901a6';

// APP_ID = '58e90082688f3e99d1244f58';
// BASE_URL = 'http://vincent.ovh:3000/embed';
// PUBLIC_SCORE = '5bcc8e5b32023d903fb5fb26';

describe('Integration - Embed', () => {
  describe('Loading embed', () => {
    it('should instance an Embed using a container', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false
        }
      });

      embed.ready().then(() => {
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should instance an Embed using a jQuery element', (done) => {
      var container = document.createElement('div');
      container.setAttribute('id', 'container');
      document.body.appendChild(container);

      var embed = new Flat.Embed($('#container'), {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false
        }
      });

      embed.ready().then(() => {
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should instance an Embed using a string id', (done) => {
      var container = document.createElement('div');
      container.setAttribute('id', 'container');
      document.body.appendChild(container);

      var embed = new Flat.Embed('container', {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false
        }
      });

      embed.ready().then(() => {
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should create two object with the same embed', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false
        }
      });

      var embed2 = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false
        }
      });

      embed.ready().then(() => {
        container.parentNode.removeChild(container);
        assert.equal(embed2, embed);
        done();
      });
    });

    it('should create an embed with a blank document', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      embed.ready().then(() => {
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should plug into an existing iframe', (done) => {
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
    it('should load a Flat Platform score by id', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: PUBLIC_SCORE,
        embedParams: {
          appId: APP_ID
        }
      });

      embed.getJSON().then((json) => {
        assert.ok(json['score-partwise']);
        return embed.getFlatScoreMetadata();
      })
      .then((meta) => {
        assert.equal(meta.title, 'House of the Rising Sun');
        container.parentNode.removeChild(container);
        done();
      });
    });
  });

  describe('JSON import/export', () => {
    it('should import a Flat JSON file then export it', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/json')
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return embed.loadJSON(json);
      })
      .then(() => {
        return embed.getJSON();
      })
      .then((json) => {
        assert.ok(json['score-partwise']);
        assert.deepEqual(json['score-partwise'].credit, [
          {
            'credit-type': 'title',
            'credit-words': 'House of the Rising Sun'
          }
        ]);
        container.parentNode.removeChild(container);
        done();
      })
      .catch((error) => {
        assert.ifError(error);
      });
    });

    it('should fail to import a non json', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      embed
      .loadJSON('42}')
      .then(() => {
        assert.notOk(true);
      })
      .catch((error) => {
        assert.equal(error.message, 'Invalid score JSON');
        container.parentNode.removeChild(container);
        done();
      });
    });
  });

  describe('MusicXML import/export', () => {
    it('shoud load a MusicXML (plain) in a blank embed', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/xml')
      .then((response) => {
        return response.text();
      })
      .then((xml) => {
        return embed.loadMusicXML(xml);
      })
      .then(() => {
        return embed.getJSON();
      })
      .then((json) => {
        assert.ok(json['score-partwise']);
        assert.deepEqual(json['score-partwise'].credit, [
          {
            'credit-type': 'title',
            'credit-words': 'House of the Rising Sun'
          }
        ]);
        container.parentNode.removeChild(container);
        done();
      })
      .catch((error) => {
        assert.ifError(error);
      });
    });

    it('shoud load a MusicXML (compressed) in a blank embed', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/mxl')
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((mxl) => {
        return embed.loadMusicXML(mxl);
      })
      .then(() => {
        return embed.getJSON();
      })
      .then((json) => {
        assert.ok(json['score-partwise']);
        assert.deepEqual(json['score-partwise'].credit, [
          {
            'credit-type': 'title',
            'credit-words': 'House of the Rising Sun'
          }
        ]);
        container.parentNode.removeChild(container);
        done();
      })
      .catch((error) => {
        assert.ifError(error);
      });
    });

    it('shoud export a score into a plain MusicXML', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/mxl')
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((mxl) => {
        return embed.loadMusicXML(mxl);
      })
      .then(() => {
        return embed.getMusicXML();
      })
      .then((xml) => {
        assert.ok(xml.includes('<work><work-title>House of the Rising Sun</work-title></work>'));
        container.parentNode.removeChild(container);
        done();
      })
      .catch((error) => {
        assert.ifError(error);
      });
    });

    it('shoud export a score into a compressed MusicXML and re-import it', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/mxl')
      .then((response) => {
        return response.arrayBuffer();
      })
      .then((mxl) => {
        return embed.loadMusicXML(mxl);
      })
      .then(() => {
        return embed.getMusicXML({ compressed: true });
      })
      .then((mxl) => {
        return embed.loadMusicXML(mxl);
      })
      .then(() => {
        return embed.getJSON();
      })
      .then((json) => {
        assert.ok(json['score-partwise']);
        assert.deepEqual(json['score-partwise'].credit, [
          {
            'credit-type': 'title',
            'credit-words': 'House of the Rising Sun'
          }
        ]);
        container.parentNode.removeChild(container);
        done();
      })
      .catch((error) => {
        assert.ifError(error);
      });
    });

    it('should fail to import an invalid MusicXML', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      embed
      .loadMusicXML('<?xml version="1.0" encoding="UTF-8"?><bad></bad>')
      .then(() => {
        assert.notOk(true);
      })
      .catch((error) => {
        assert.equal(error.message, 'Invalid MusicXML file format.');
        container.parentNode.removeChild(container);
        done();
      });
    });
  });

  describe('PNG export', () => {
    it('should export in PNG (no options)', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page'
        }
      });

      embed.getPNG()
      .then((png) => {
        assert.ok(png instanceof Uint8Array);
        assert.ok(png.length > 0);
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should export in PNG (data Url)', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page'
        }
      });

      embed.getPNG({result: 'dataURL'})
      .then((png) => {
        assert.equal(typeof png, 'string');
        assert.equal(png.indexOf('data:image/png;base64,'), 0);
        container.parentNode.removeChild(container);
        done();
      });
    });
  });

  describe('MIDI export', () => {
    it('should export in MIDI', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page'
        }
      });

      embed.getMIDI()
      .then((midi) => {
        assert.ok(midi instanceof Uint8Array);
        assert.ok(midi.length > 0);
        container.parentNode.removeChild(container);
        done();
      });
    });
  });

  describe('Cursor position', () => {
    it('should get the cursor position (default: 0)', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: PUBLIC_SCORE,
        embedParams: {
          appId: APP_ID
        }
      });
      embed.getCursorPosition().then((position) => {
        assert.equal(position.partIdx, 0);
        assert.equal(position.staffIdx, 0);
        assert.equal(position.voiceIdx, 0);
        assert.equal(position.measureIdx, 0);
        assert.equal(position.noteIdx, 0);
        assert.ok(position.partUuid);
        assert.ok(position.staffUuid);
        assert.ok(position.measureUuid);
        assert.ok(position.voiceUuid);
        container.parentNode.removeChild(container);
        done();
      })
      .catch((error) => {
        assert.ifError(error);
      });
    });

    it('should set the cursor position then get it', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: PUBLIC_SCORE,
        embedParams: {
          appId: APP_ID
        }
      });

      embed.setCursorPosition({
        partIdx: 0,
        staffIdx: 0,
        voiceIdx: 0,
        measureIdx: 2,
        noteIdx: 1,
        extra: 'skip'
      })
      .then((position) => {
        assert.equal(position.partIdx, 0);
        assert.equal(position.staffIdx, 0);
        assert.equal(position.voiceIdx, 0);
        assert.equal(position.measureIdx, 2);
        assert.equal(position.noteIdx, 1);
        return embed.getCursorPosition();
      })
      .then((position) => {
        assert.equal(position.partIdx, 0);
        assert.equal(position.staffIdx, 0);
        assert.equal(position.voiceIdx, 0);
        assert.equal(position.measureIdx, 2);
        assert.equal(position.noteIdx, 1);
        container.parentNode.removeChild(container);
        done();
      })
      .catch((error) => {
        assert.ifError(error);
      });
    });

    it('should fail to set cursor with missing param', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: PUBLIC_SCORE,
        embedParams: {
          appId: APP_ID
        }
      });

      embed.setCursorPosition({
        noteIdx: 1
      })
      .catch((error) => {
        assert.equal(error.code, 'BadPartIdxError');
        assert.equal(error.message, 'There is no part at the index [undefined<undefined>].');
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should set fail to set cursor with bad param value', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        score: PUBLIC_SCORE,
        embedParams: {
          appId: APP_ID
        }
      });

      embed.setCursorPosition({
        partIdx: 0,
        staffIdx: 0,
        measureIdx: true,
        noteIdx: 0,
        voiceIdx: 0
      })
      .catch((error) => {
        assert.equal(error.message, 'Parameter measureIdx should be a number, not boolean');
        container.parentNode.removeChild(container);
        done();
      });
    });
  });

  describe('Focus score', () => {
    it('should focus the score', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page'
        }
      });

      embed.ready()
      .then(() => {
        assert.equal(document.activeElement.nodeName, 'BODY');
        return embed.focusScore();
      })
      .then(() => {
        assert.equal(document.activeElement.nodeName, 'IFRAME');
        container.parentNode.removeChild(container);
        done();
      })
    });
  });

  describe('Zoom', () => {
    it('should load an embed in page mode and have the zoom auto set', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page'
        }
      });

      embed.getAutoZoom((state) => {
        assert.equal(state, 'true');
        done();
      })
      .then(() => {
        return embed.getZoom();
      })
      .then((zoom) => {
        assert.ok(Number.isFinite(zoom));
        assert.ok(zoom >= 0.5);
        assert.ok(zoom < 3);
        return embed.getAutoZoom();
      })
      .then((autoZoom) => {
        assert.ok(autoZoom);
        return embed.setAutoZoom(false);
      })
      .then((autoZoom) => {
        assert.ok(!autoZoom);
        return embed.getAutoZoom();
      })
      .then((autoZoom) => {
        assert.ok(!autoZoom);
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should set a new zoom value & disable auto-zoom', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          layout: 'page'
        }
      });

      embed.setZoom(2, (zoom) => {
        assert.equal(zoom, 2);
        done();
      })
      .then(() => {
        return embed.getZoom();
      }).
      then((zoom) => {
        assert.equal(zoom, 2);
        return embed.getAutoZoom();
      }).
      then((state) => {
        assert.equal(state, false);
        container.parentNode.removeChild(container);
        done();
      });
    });
  });

  describe('Playback', () => {
    it('should play get `play` event', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      embed.on('play', () => {
        container.parentNode.removeChild(container);
        done();
      });

      embed.play();
    });

    it('should play get `playbackPosition` event', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      embed.on('playbackPosition', (pos) => {
        assert.ok(pos.currentMeasure >= 0, 'currentMeasure');
        container.parentNode.removeChild(container);
        done();
      });

      embed.play();
    });

    it('should play then pause and get `pause` event', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
      });

      embed.on('pause', () => {
        container.parentNode.removeChild(container);
        done();
      });

      embed.play().then(() => {
        embed.pause();
      });
    });

    it('should play then stop and get `stop` event', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID
        }
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
