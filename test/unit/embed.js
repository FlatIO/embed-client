var assert = require('assert');
var jsdom = require('jsdom');
var document = require('../helpers/node-browser-env');
var Embed = require('../../dist/embed');

describe('Unit - Embed tests', () => {
  describe('DOM', () => {
    it('should instance an Embed using a container', () => {
      const container = document.getElementById('container');
      const embed = new Embed(container);
      assert.equal(embed.element.getAttribute('src'), 'https://flat.io/embed/blank?jsapi=true');
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);
      container.removeChild(embed.element);
    });

    it('should instance an Embed using a jQuery selector', () => {
      const container = $('#container');
      const embed = new Embed(container);
      assert.equal(embed.element.getAttribute('src'), 'https://flat.io/embed/blank?jsapi=true');
      assert.equal(container[0].childNodes.length, 1);
      assert.equal(container[0].childNodes[0], embed.element);
      container[0].removeChild(embed.element);
    });

    it('should instance an Embed using an id', () => {
      const container = document.getElementById('container');
      const embed = new Embed('container');
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);
      container.removeChild(embed.element);
    });

    it('should return the same instance when passing the same container', () => {
      const container = document.getElementById('container');
      const embed = new Embed(container);
      const embed2 = new Embed(container);
      assert.equal(embed, embed2);
      container.removeChild(embed.element);
    });

    it('should create a single container when passing the same container', () => {
      const container = document.getElementById('container');
      const embed = new Embed(container);
      const embed2 = new Embed(container);
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);
      container.removeChild(embed.element);
    });

    it('should create a single container when passing the iframe', () => {
      const container = document.getElementById('container');
      const embed = new Embed(container);
      const embed2 = new Embed(embed.element);
      assert.equal(embed, embed2);
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);
      container.removeChild(embed.element);
    });

    it('should pass an existing iframe', () => {
      const container = document.getElementById('container');
      const iframe = document.createElement('iframe');
      iframe.setAttribute('src', 'https://flat.io/embed/1234');
      container.appendChild(iframe);

      const embed = new Embed(iframe);

      // Has a single node
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);

      const embed2 = new Embed(iframe);

      // Single instance
      assert.equal(embed, embed2);
      assert.equal(container.childNodes.length, 1);
      assert.equal(container.childNodes[0], embed.element);

      container.removeChild(embed.element);
    });

    it('should throw with a non existing DOM element (string)', () => {
      assert.throws(
        () => {
          new Embed('container-not-found');
        },
        TypeError
      );
    });

    it('should throw with a non existing DOM element (null)', () => {
      assert.throws(
        () => {
          new Embed(null);
        },
        TypeError
      );
    });

    it('should throw with a non existing DOM element (object)', () => {
      assert.throws(
        () => {
          new Embed({});
        },
        TypeError
      );
    });
  });

  describe('iframe URLs and Embed options', () => {
    it('should pass a score id', () => {
      const container = document.getElementById('container');
      const embed = new Embed(container, {
        score: '1234'
      });
      assert.equal(embed.element.getAttribute('src'), 'https://flat.io/embed/1234?jsapi=true');
      container.removeChild(embed.element);
    });

    it('should pass some embed options', () => {
      const container = document.getElementById('container');
      const embed = new Embed(container, {
        score: '1234',
        embedParams: {
          controlsFloating: false,
          foo: 42
        }
      });
      assert.equal(embed.element.getAttribute('src'), 'https://flat.io/embed/1234?jsapi=true&controlsFloating=false&foo=42');
      container.removeChild(embed.element);
    });

    it('should correctly encode the options', () => {
      const container = document.getElementById('container');
      const embed = new Embed(container, {
        score: '1234',
        embedParams: {
          controlsFloating: false,
          themeIconsPrimary: '#E53935',
          themeCursorV0: '#E53935'
        }
      });
      assert.equal(embed.element.getAttribute('src'), 'https://flat.io/embed/1234?jsapi=true&controlsFloating=false&themeIconsPrimary=%23E53935&themeCursorV0=%23E53935');
      assert.equal(embed.element.getAttribute('width'), '100%');
      assert.equal(embed.element.getAttribute('height'), '100%');
      container.removeChild(embed.element);
    });

    it('should use custom iframe size & correct default attributes', () => {
      const container = document.getElementById('container');
      const embed = new Embed(container, {
        score: '1234',
        width: '800',
        height: '450',
        embedParams: {
          controlsFloating: false
        }
      });
      assert.equal(embed.element.getAttribute('src'), 'https://flat.io/embed/1234?jsapi=true&controlsFloating=false');
      assert.equal(embed.element.getAttribute('width'), '800');
      assert.equal(embed.element.getAttribute('height'), '450');
      assert.equal(embed.element.getAttribute('allowfullscreen'), 'true');
      assert.equal(embed.element.getAttribute('frameborder'), '0');
      container.removeChild(embed.element);
    });
  });
});
