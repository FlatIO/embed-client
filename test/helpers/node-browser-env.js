var jsdom = require('jsdom');

let document = global.document = jsdom.jsdom('<body><div id="container"></div></body>');
global.window = document.defaultView;
global.window.jQuery = global.jQuery = global.window.$ = global.$ = require('jquery');

module.exports = document;
