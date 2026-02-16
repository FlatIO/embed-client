describe('Unit - Embed tests', () => {
  beforeEach(() => {
    const container = document.createElement('div');
    container.setAttribute('id', 'container');
    document.body.appendChild(container);
  });
  afterEach(() => {
    try {
      [...document.querySelectorAll('div,iframe')].forEach(el => document.body.removeChild(el));
    } catch (err) {
      // console.debug(err);
    }
  });

  describe('DOM', () => {
    it('should instance an Embed using a container', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container);
      assert.equal(embed.element.getAttribute('src'), 'https://flat-embed.com/blank?jsapi=true');
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);
      container.removeChild(embed.element);
    });

    it('should instance an Embed using an id', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed('container');
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);
      container.removeChild(embed.element);
    });

    it('should return the same instance when passing the same container', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container);
      const embed2 = new Flat.Embed(container);
      assert.equal(embed, embed2);
      container.removeChild(embed.element);
    });

    it('should create a single container when passing the same container', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container);
      const embed2 = new Flat.Embed(container);
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);
      container.removeChild(embed.element);
    });

    it('should create a single container when passing the iframe', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container);
      const embed2 = new Flat.Embed(embed.element);
      assert.equal(embed, embed2);
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);
      container.removeChild(embed.element);
    });

    it('should pass an existing iframe', () => {
      const container = document.getElementById('container');
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', 'https://flat-embed.com/1234');
      container.appendChild(iframe);

      const embed = new Flat.Embed(iframe);

      // Has a single node
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);

      const embed2 = new Flat.Embed(iframe);

      // Single instance
      assert.equal(embed, embed2);
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);

      container.removeChild(embed.element);
    });

    it('should throw with a non existing DOM element (string)', () => {
      assert.throws(() => {
        new Flat.Embed('container-not-found');
      }, TypeError);
    });

    it('should throw with a non existing DOM element (null)', () => {
      assert.throws(() => {
        new Flat.Embed(null);
      }, TypeError);
    });

    it('should throw with a non existing DOM element (object)', () => {
      assert.throws(() => {
        new Flat.Embed({});
      }, TypeError);
    });
  });

  describe('iframe URLs and Embed options', () => {
    it('should pass a score id', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, {
        score: '1234',
      });
      assert.equal(embed.element.getAttribute('src'), 'https://flat-embed.com/1234?jsapi=true');
      container.removeChild(embed.element);
    });

    it('should pass some embed options', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, {
        score: '1234',
        embedParams: {
          controlsFloating: false,
          foo: 42,
        },
      });
      assert.equal(
        embed.element.getAttribute('src'),
        'https://flat-embed.com/1234?jsapi=true&controlsFloating=false&foo=42',
      );
      container.removeChild(embed.element);
    });

    it('should pass userId & appId', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, {
        score: '1234',
        embedParams: {
          appId: '123456abcdef',
          userId: '| 42',
          themePrimary: '#E53935',
        },
      });
      assert.equal(
        embed.element.getAttribute('src'),
        'https://flat-embed.com/1234?jsapi=true&appId=123456abcdef&userId=%7C%2042&themePrimary=%23E53935',
      );
      container.removeChild(embed.element);
    });

    it('should use custom iframe size & correct default attributes', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, {
        score: '1234',
        width: '800',
        height: '450',
        embedParams: {
          controlsFloating: false,
        },
      });
      assert.equal(
        embed.element.getAttribute('src'),
        'https://flat-embed.com/1234?jsapi=true&controlsFloating=false',
      );
      assert.equal(embed.element.getAttribute('width'), '800');
      assert.equal(embed.element.getAttribute('height'), '450');
      assert.equal(embed.element.getAttribute('allowfullscreen'), 'true');
      assert.equal(embed.element.getAttribute('frameborder'), '0');
      container.removeChild(embed.element);
    });

    it('should use the lazy loading attribute', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, {
        score: '1234',
        lazy: true,
      });
      assert.equal(embed.element.getAttribute('src'), 'https://flat-embed.com/1234?jsapi=true');
      assert.equal(embed.element.getAttribute('loading'), 'lazy');
      container.removeChild(embed.element);
    });
  });

  describe('getPDF method', () => {
    it('should have getPDF method available', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, { score: '1234' });
      assert.equal(typeof embed.getPDF, 'function');
      container.removeChild(embed.element);
    });

    it('should reject when options is not an object', async () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, { score: '1234' });
      try {
        await embed.getPDF('invalid');
        assert.fail('Expected getPDF to reject');
      } catch (err) {
        assert.ok(err instanceof TypeError);
        assert.equal(err.message, 'Options must be an object');
      } finally {
        container.removeChild(embed.element);
      }
    });

    it('should accept valid options object', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, { score: '1234' });
      // This should not throw - the actual call will fail since no score is loaded,
      // but the options validation should pass
      const promise = embed.getPDF({
        result: 'Uint8Array',
        parts: ['uuid-1', 'uuid-2'],
        isConcertPitch: true,
        multiMeasuresRests: true,
        outlineColoredNotes: true,
      });
      assert.ok(promise instanceof Promise);
      container.removeChild(embed.element);
    });

    it('should accept empty options object', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, { score: '1234' });
      const promise = embed.getPDF({});
      assert.ok(promise instanceof Promise);
      container.removeChild(embed.element);
    });

    it('should accept undefined options', () => {
      const container = document.getElementById('container');
      const embed = new Flat.Embed(container, { score: '1234' });
      const promise = embed.getPDF();
      assert.ok(promise instanceof Promise);
      container.removeChild(embed.element);
    });
  });
});
