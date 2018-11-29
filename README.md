# Flat Sheet Music Embed Client

[![Build Status](https://travis-ci.org/FlatIO/embed-client.svg?branch=master)](https://travis-ci.org/FlatIO/embed-client)
[![Greenkeeper badge](https://badges.greenkeeper.io/FlatIO/embed-client.svg?token=cd336afca22e743db5a44a2820f0e220d5e54a95530d1f03cc417ea5f0fbf8f0)](https://greenkeeper.io/)
[![NPM Version](https://img.shields.io/npm/v/flat-embed.svg?style=flat)](https://www.npmjs.org/package/flat-embed)

[![Flat's Sheet Music Embed](https://user-images.githubusercontent.com/396537/47357635-99aeb600-d6c7-11e8-9ea0-441eaa2d4908.png)](https://flat.io/developers/embed)

Use this JavaScript Client to interact and receive events from our [Sheet Music Embed](https://flat.io/developers/embed).

If you have any feedback or questions regarding this product, [please feel free to contact our developers support](mailto:developers@flat.io).

## Installation

You can install our Embed Client using [npm](https://www.npmjs.com/package/flat-embed) or [yarn](https://yarnpkg.com/en/package/flat-embed):

```bash
npm install flat-embed
yarn add flat-embed
```

or use the latest version hosted on jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/flat-embed@v0.11.0/dist/embed.min.js"></script>
```

## Getting Started

The simplest way to get started is to pass a DOM element to our embed that will be used as container. By default, this one will completely fit its container:

```html
<div id="embed-container"></div>
<script src="https://cdn.jsdelivr.net/npm/flat-embed@v0.11.0/dist/embed.min.js"></script>
<script>
  var container = document.getElementById('embed-container');
  var embed = new Flat.Embed(container, {
    score: '<score-id-you-want-to-load>',
    embedParams: {
      appId: '<your-app-id>',
      controlsFloating: false
    }
  });
</script>
```
*[>> Open this demo in JSFiddle](https://jsfiddle.net/gierschv/jr91116y/)*

### App ID

Our Embed JS API requires an App ID (`appId`) to use it:
* In development, you can try and use this client without limits on `localhost`/`*.localhost`.
* To use it in production or with a custom domain, [create a new app on our website](https://flat.io/developers/apps), then go to the *Embed > Settings* and add your domains to the whitelist. Your app ID will also be displayed on this page.

## Embed construction

### DOM element or existing iframe

When instantiating `Flat.Embed`, the first argument will always refer to a DOM element. It can take:

* A DOM element (e.g. selected using `document.getElementById('embed-container')`).
* The string identifier of the element (e.g. `"embed-container"`).
* A jQuery element (e.g. selected using `$('#embed-container')`). If multiple elements match the selection, the client will take the first one selected.
* An existing embed iframe element. In this case, this one will need to have our JS API loaded using the query string [`jsapi=true`](https://flat.io/developers/docs/embed/url-parameters.html).

If you instance different `Flat.Embed` for the same element, you will always get the same instance of the object.

### Options and URL parameters

When instantiating `Flat.Embed`, you can pass options in the second parameter. In order to use the different methods available and events subscriptions, you will need to pass at least `embedParams.appId`.

| Option | Description | Values | Default |
|:-------|:------------|:-------|:-------|
| `score` | The score identifier that will load initially | Unique score id | `blank` |
| `width` | The width of your embed | A width of the embed | `100%` |
| `height` | The height of your embed | A height of the embed | `100%` |
| `embedParams` | Object containing the loading options for the embed | [Any URL parameters](https://flat.io/developers/docs/embed/url-parameters.html) | `{}`

## JavaScript API

* [Viewer Methods](#viewer-methods)
  * [`ready`](#ready-promisevoid-error): Wait until the JavaScript is ready
  * [`on`](#onevent-string-callback-function-void): Subscribe to events
  * [`off`](#offevent-string-callback-function-void): Unsubscribe from events
  * [`getEmbedConfig`](#getembedconfig-promiseobject-error): Get the global config of the embed
  * [`loadFlatScore`](#loadflatscoreid-string-promisevoid-apierror): Load a score hosted on Flat
  * [`loadMusicXML`](#loadmusicxmlscore-mixed-promisevoid-error): Load MusicXML file (compressed or not)
  * [`loadJSON`](#loadjsonscore-object-promisevoid-error): Load Flat JSON file
  * [`getMusicXML`](#getmusicxmloptions-object-promisestringuint8array-error): Get the score in MusicXML (compressed or not)
  * [`getJSON`](#getjson-object): Get the score data in Flat JSON format
  * [`getPNG`](#getpngoptions-object-promisestringuint8array-error): Get the score as a PNG file
  * [`getMIDI`](#getmidi-promiseuint8array-error): Get the score as a MIDI file
  * [`getScoreMeta`](#getscoremeta-object): Get the metadata from the current score (for hosted scores)
  * [`fullscreen`](#fullscreenstate-bool-promisevoid-error): Toggle fullscreen mode
  * [`play`](#play-promisevoid-error): Start playback
  * [`pause`](#pause-promisevoid-error): Pause playback
  * [`stop`](#stop-promisevoid-error): Stop playback
  * [`mute`](#mute-promisevoid-error): Mute playback
  * [`print`](#print-promisevoid-error): Print the score
  * [`getZoom`](#getzoom-promisenumber-error): Get the current display zoom ratio
  * [`setZoom`](#setzoomnumber-promisenumber-error): Change the display zoom ratio
  * [`getAutoZoom`](#getautozoom-promiseboolean-error): Get the state of the auto-zoom mode
  * [`setAutoZoom`](#setautozoomboolean-promiseboolean-error): Enable or disable the auto-zoom mode
  * [`focusScore`](#focusscore-promisevoid-error): Set the focus to the score
  * [`getCursorPosition`](#getcursorposition-promiseobject-error): Get the current cursor position of the score
  * [`setCursorPosition`](#setcursorpositionposition-object-promiseobject-error): Set a new position for the cursor
* [Editor Methods](#editor-methods)
  * [`setEditorConfig`](#seteditorconfigconfig-object-promiseobject-error): Set the config of the editor
* [Events API](#events-api)
  * [`scoreLoaded`](#event-scoreLoaded): A new score has been loaded
  * [`cursorPosition`](#event-cursorposition): The cursor position changed
  * [`rangeSelection`](#event-rangeSelection): The range selected changed
  * [`fullscreen`](#event-fullscreen): The fullscreen state changed
  * [`play`](#event-play): The score playback started
  * [`pause`](#event-pause): The score playback paused
  * [`stop`](#event-stop): The score playback stopped
  * [`playbackPosition`](#event-playbackposition): The playback slider position changed

## Viewer Methods

You can call the methods using any `Flat.Embed` object. By default, the methods (except `on` and `off`) return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that will be resolved once the method is called, the value is set or get:

```js
var embed = new Flat.Embed('container');
embed.loadFlatScore('12234').then(function () {
  console.log('Score loaded');
}).catch(function (err) {
  console.log('Error', err);
});
```

### `ready(): Promise<void, Error>`

Promises resolved when the embed is loaded and the JavaScript API is ready to use. All the methods will implicitly use this method, so you don't have to worry about waiting the loading before calling the different methods.

```js
embed.ready().then(function() {
 // You can use the embed
});
```

### `on(event: string, callback: function): void`

Add an event listener for the specified event. When receiving the event, the client will call the specified function with zero or one parameters depending of the [event received](#events-api).

```js
embed.on('playbackPosition', function (position) {
  console.log(position);
});
```

### `off(event: string, callback?: function): void`

Remove an event listener for the specified event. If no `callback` is specified, all the listener for the event will be removed.

```js
function positionChanged(position) {
  // Print position
  console.log(position);

  // You can remove the listener later (e.g. here, once the first event is received)
  embed.off('play', positionChanged);

  // Alternatively, you can remove all the listeners for the event:
  embed.off('play');
};

// Subscribe to the event
embed.on('positionChanged', positionChanged);
```

### `getEmbedConfig(): Promise<object, Error>`

Fetch the global config of the embed. This will include the [URL parameters](https://flat.io/developers/docs/embed/url-parameters.html), the editor config and the default config set by the embed.

```js
embed.getEmbedConfig().then(function (config) {
  // The config of the embed
  console.log(config);
});
```

### `loadFlatScore(id: string): Promise<void, ApiError>`

Load a score hosted on Flat using its identifier. For example to load `https://flat.io/score/56ae21579a127715a02901a6-house-of-the-rising-sun`, you can call:

```js
embed.loadFlatScore('56ae21579a127715a02901a6').then(function () {
  // Score loaded in the embed
}).catch(function (error) {
  // Unable to load the score
});
```

### `loadMusicXML(score: mixed): Promise<void, Error>`

Load a MusicXML score, compressed (MXL) or not (plain XML):

```js
fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/mxl')
.then(function (response) {
  return response.arrayBuffer();
})
.then(function (mxl) {
  return embed.loadMusicXML(mxl);
})
.then(function () {
  // Score loaded in the embed
})
.catch(function (error) {
  // Unable to load the score
});
```

### `loadJSON(score: object): Promise<void, Error>`

Load a score using Flat's JSON Format

```js
fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/json')
.then(function (response) {
  return response.json();
})
.then(function (json) {
  return embed.loadJSON(json);
})
.then(function () {
  // Score loaded in the embed
})
.catch(function (error) {
  // Unable to load the score
});
```

### `getMusicXML(options?: object): Promise<string|Uint8Array, Error>`

Convert the current displayed score into a MusicXML file, compressed (`.mxl`) or not (`.xml`).

```js
// Uncompressed MusicXML
embed.getMusicXML().then(function (xml) {
  // Plain XML file (string)
  console.log(xml);
});
```

Example: Retrieve the score as a compressed MusicXML, then convert it to a Blob and download it:

```js
// Uncompressed MusicXML
embed.getMusicXML({ compressed: true }).then(function (buffer) {
  // Create a Blob from a compressed MusicXML file (Uint8Array)
  var blobUrl = window.URL.createObjectURL(new Blob([buffer], {
    type: 'application/vnd.recordare.musicxml+xml'
  }));

  // Create a hidden link to download the blob
  var a = document.createElement('a');
  a.href = blobUrl;
  a.download = 'My Music Score.mxl';
  document.body.appendChild(a);
  a.style = 'display: none';
  a.click();
  a.remove();
});
```

### `getJSON(): object`

Get the data of the score in the "Flat JSON" format (a MusicXML-like as a JavaScript object).

```js
embed.getJSON().then(function (data) {
  console.log(data);
}).catch(function (error) {
  // Unable to get the data
});
```

### `getPNG(options?: object): Promise<string|Uint8Array, Error>`

Get the current displayed score as a PNG file

```js
// PNG
embed.getPNG().then(function (png) {
  // PNG file as a Uint8Array
  console.log(png);
});
```

```js
// PNG
embed.getPNG({result: 'dataURL'}).then(function (png) {
  // PNG file as a DataURL
  console.log(png);
});
```

### `getMIDI(): Promise<Uint8Array, Error>`

Get the current displayed score as a MIDI file

```js
embed.getMIDI().then(function (midi) {
  // MIDI file as a Uint8Array
  console.log(midi);
});
```

### `getScoreMeta(): object`

Get the score metadata of the hosted score. The object will have the same format that the one returned [by our API `GET /v2/scores/{score}`](https://flat.io/developers/api/reference/#operation/getScore).

```js
embed.getScoreMeta().then(function (metadata) {
  console.log(metadata);
}).catch(function (error) {
  // Unable to get the metadata
});
```

### `fullscreen(state: bool): Promise<void, Error>`

Display the embed in fullscreen (`state = true`) or return to the regular display (`state = false`).

```js
embed.fullscreen(true).then(function () {
  // The score is now displayed in fullscreen
});
```

### `play(): Promise<void, Error>`

Load the playback and play the score.

```js
embed.play().then(function () {
  // The score is playing
});
```

### `pause(): Promise<void, Error>`

Pause the playback

```js
embed.pause().then(function () {
  // The playback is paused
});
```

### `stop(): Promise<void, Error>`

Stop the playback

```js
embed.stop().then(function () {
  // The playback is stopped
});
```

### `mute(): Promise<void, Error>`

Mute the playback

```js
embed.mute().then(function () {
  // The playback is muted
});
```

### `print(): Promise<void, Error>`

Print the score

```js
embed.print().then(function () {
  // The score is being printed (the browser opens the print prompt)
}).catch(function (error) {
  // Error when printing
});
```

### `getZoom(): Promise<number, Error>`

Get the current zoom ration applied for the score (between 0.5 and 3).

```js
embed.getZoom().then(function (zoom) {
  // The zoom value
  console.log(zoom);
});
```

### `setZoom(number): Promise<number, Error>`

Set a new zoom ration for the display (between 0.5 and 3).

```js
embed.setZoom(2).then(function (zoom) {
  // The zoom value applied
  console.log(zoom);
});
```

### `getAutoZoom(): Promise(<boolean, Error>)`

Get the state of the auto-zoom mode. Auto-zoom is enabled by default for page mode or when the [URL parameter `zoom`](https://flat.io/developers/docs/embed/url-parameters.html) is set to `auto`.

This getter will return `true` if the auto-zoom is enabled, and `false` when disabled. Setting a zoom value with [`setZoom`](#setzoomnumber-promisenumber-error) will disable this mode.

```js
embed.getAutoZoom().then(function (state) {
  // The auto-zoom state
  console.log(state);
});
```

### `setAutoZoom(boolean): Promise(<boolean, Error>)`

Enable (`true`) or disable (`false`) the auto-zoom. Auto-zoom is enabled by default for page mode or when the [URL parameter `zoom`](https://flat.io/developers/docs/embed/url-parameters.html) is set to `auto`. Setting a zoom value with [`setZoom`](#setzoomnumber-promisenumber-error) will disable this mode.

```js
embed.setAutoZoom(false).then(function (state) {
  // Auto-zoom mode is disabled
  console.log(state);
});
```

### `focusScore(): Promise(<void, Error>)`

Unlike the web version on <https://flat.io>, the embed does't catch the focus. This avoids to mess with the parent window, and avoid the browser to do a forced scrolling to the embed iframe.

If the end-user's goal is the usage of the embed to play or write notation, you can use this method to set the focus on the score and allowing they to use the keyboard bindings.

```js
embed.focusScore().then(function () {
  // Focus is now on the score
});
```

### `getCursorPosition(): Promise(<object, Error>)`

Return the current position of the cursor (on a specific note).

```js
embed.getCursorPosition().then(function (position) {
  // position: {
  //     "partIdx": 0,
  //     "staffIdx": 1,
  //     "voiceIdxInStaff": 0,
  //     "measureIdx": 2,
  //     "noteIdx": 1
  // }
});
```

### `setCursorPosition(position: object): Promise(<object, Error>)`

Set the current position of the cursor (on a specific note).

```js
embed.setCursorPosition({
  partIdx: 0,
  staffIdx: 1,
  voiceIdx: 0,
  measureIdx: 2,
  noteIdx: 1
}).then(function (position) {
  // position: {
  //     "partIdx": 0,
  //     "staffIdx": 1,
  //     "voiceIdxInStaff": 0,
  //     "measureIdx": 2,
  //     "noteIdx": 1
  // }
});
```

## Editor Methods

You can enable the editor mode by setting the `mode` to `edit` when creating the embed:

```js
var embed = new Flat.Embed(container, {
  embedParams: {
    appId: '<your-app-id>',
    mode: 'edit'
  }
});
```

### `setEditorConfig(config: object): Promise<object, Error>`

**NOTE: "Modes" are now deprecated and new options will be available for this method in the upcoming weeks. [Please contact our team](mailto:developers@flat.io) if you are interested in customizing the embed editor.**

Set a new config for the editor (e.g. the different tools available in the embed). This one will be used at the next loading score.

```js
embed.setEditorConfig({}).then(function (config) {
  // The config of the embed
  console.log(config);
});
```

## Events API

Events are broadcasted following actions made by the end user or you with the JavaScript API. You can subscribe to an event using the method [`on`](#onevent-string-callback-function-void), and unsubscribe using [`off`](#onevent-string-callback-function-void). When an event includes some data, this data will be available in the first parameter of the listener callback.

### Event: `scoreLoaded`

This event is triggered once a new score has been loaded. This event doesn't include any data.

### Event: `cursorPosition`

This event is triggered when the position of the user's cursor changes.

```json
{
    "partIdx": 0,
    "staffIdx": 1,
    "voiceIdx": 0,
    "measureIdx": 2,
    "noteIdx": 1
}
```

### Event: `rangeSelection`

This event is triggered when a range of notes is selected or the selection changed.

```json
{
    "from": {
        "partIdx": 0,
        "measureIdx": 1,
        "staffIdx": 0,
        "voiceIdx": 0,
        "noteIdx": 2
    },
    "to": {
        "partIdx": 0,
        "measureIdx": 3,
        "staffIdx": 0,
        "voiceIdx": 0,
        "noteIdx": 5
    }
}
```

### Event: `fullscreen`

This event is triggered when the state of the fullscreen changed. The callback will take a boolean as the first parameter that will be `true` if the fullscreen mode is enabled, and `false` is the display is back to normal (fullscreen exited).

### Event: `play`

This event is triggered when you or the end-user starts the playback. This event doesn't include any data.

### Event: `pause`

This event is triggered when you or the end-user pauses the playback. This event doesn't include any data.

### Event: `stop`

This event is triggered when you or the end-user stops the playback. This event doesn't include any data.

### Event: `playbackPosition`

This event is triggered when the playback slider moves. It is usually triggered at the beginning of every measure and will contain an object with information regarding the position of the playback in the score:

```json
{
    "beat": "4",
    "beatType": "4",
    "tempo": 120,
    "currentMeasure": 1,
    "timePerMeasure": 2
}
```
