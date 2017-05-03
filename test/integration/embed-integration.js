var APP_ID = '58fa312bea9bbd061b0ea8f3',
  BASE_URL = 'https://flat.io/embed',
  PUBLIC_SCORE = '56ae21579a127715a02901a6';

// APP_ID = '58e90082688f3e99d1244f58';
// BASE_URL = 'http://flat.dev:3000/embed';
// PUBLIC_SCORE = '58f93f70874b3f526d3d45e0';

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
      iframe.setAttribute('src', BASE_URL + '/' + PUBLIC_SCORE + '?jsapi=true&appId=' + APP_ID);
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
      }).
      then((zoom) => {
        assert.ok(Number.isFinite(zoom));
        assert.ok(zoom >= 0.5);
        assert.ok(zoom < 3);
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
        assert.equal(zoo, 2);
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
        assert.equal(pos.beat, 4);
        assert.equal(pos.beatType, 4);
        assert.ok(pos.tempo >= 60);
        assert.ok(pos.timePerMeasure >= 1);
        assert.ok(pos.currentMeasure >= 1); // 1 or 2? Event should be sent for first measure?
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

  describe('Editor config', () => {
    it('should fetch the viewer config', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          controlsFloating: false,
          branding: false
        }
      });

      embed.getEmbedConfig().then((config) => {
        assert.equal(config.branding, false);
        assert.equal(config.controlsPlay, true);
        assert.equal(config.controlsFloating, false);
        container.parentNode.removeChild(container);
        done();
      });
    });

    it('should use the edit mode and set a tools config', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          mode: 'edit',
          controlsFloating: false,
          branding: false
        }
      });

      embed.setEditorConfig({
        noteMode: {
          durations: true,
          tuplet: false
        },
        articulationMode: false
      }).then((config) => {
        assert.ok(config.global);
        assert.equal(config.articulationMode, false);
        assert.equal(config.noteMode.durations, true);
        assert.equal(config.noteMode.tuplet, false);
        container.parentNode.removeChild(container);
        done();
      }).catch(done);
    });
  });

  describe('Editor modifications', () => {
    it('should make a modification, get the event and get the document updated', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          mode: 'edit'
        }
      });

      embed.on('edit', (operations) => {
        assert.equal(operations.length, 1);
        assert.equal(operations[0].name, 'action.SetTempo');
        assert.equal(operations[0].opts.startMeasureIdx, 0);
        assert.equal(operations[0].opts.stopMeasureIdx, 1);
        assert.deepEqual(operations[0].opts.tempo, {
          bpm: 142,
          qpm: 142,
          durationType: 3,
          nbDots: 0
        });
      });

      embed.edit([
        {
          name: 'action.SetTempo',
          opts: {
            startMeasureIdx: 0,
            stopMeasureIdx: 1,
            tempo: {
              bpm: 142,
              qpm: 142,
              durationType: 3,
              nbDots: 0
            }
          }
        }
      ]).then(() => {
        return embed.getJSON();
      }).then((json) => {
        assert.equal(json['score-partwise'].part[0].measure[0].sound.$tempo, 142);
        container.parentNode.removeChild(container);
        done();
      }).catch(done);
    });

    it('should fail to edit with bad ops arguments (edit error)', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          mode: 'edit'
        }
      });

      embed.edit([
        {
          name: 'action.SetTempo',
          opts: {
            startMeasureIdx: 0,
            stopMeasureIdx: 1000000,
            tempo: {
              bpm: 142,
              qpm: 142,
              durationType: 3,
              nbDots: 0
            }
          }
        }
      ]).then(() => {
        return done('Should have fail');
      }).catch((error) => {
        assert.equal(error.code, 'BadMeasureIdxError');
        assert.equal(error.message, 'There is no measure at the index [1000000<number>].');
        container.parentNode.removeChild(container);
        done();
      })
    });

    it('should fail to edit with bad ops arguments (bad ops format)', (done) => {
      var container = document.createElement('div');
      document.body.appendChild(container);

      var embed = new Flat.Embed(container, {
        score: PUBLIC_SCORE,
        baseUrl: BASE_URL,
        embedParams: {
          appId: APP_ID,
          mode: 'edit'
        }
      });

      embed.edit({
        name: 'action.SetTempo',
        opts: {
          startMeasureIdx: 0,
          stopMeasureIdx: 1000000,
          tempo: {
            bpm: 142,
            qpm: 142,
            durationType: 3,
            nbDots: 0
          }
        }
      }).then(() => {
        return done('Should have fail');
      }).catch((error) => {
        assert.equal(error.code, 'TypeError');
        assert.equal(error.message, 'Operations must be an array of operations');
        container.parentNode.removeChild(container);
        done();
      })
    });
  });
});
