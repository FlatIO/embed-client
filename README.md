# Flat Sheet Music Embed Client

[![Build Status](https://github.com/FlatIO/embed-client/actions/workflows/tests.yml/badge.svg)](https://github.com/FlatIO/embed-client/actions)
[![NPM Version](https://img.shields.io/npm/v/flat-embed.svg?style=flat)](https://www.npmjs.org/package/flat-embed)

[![Flat's Sheet Music Embed](https://user-images.githubusercontent.com/396537/156041576-a5f68279-c291-49db-87e9-f8c9105c08a7.png)](https://flat.io/embed)

Use this JavaScript Client to interact and receive events from our [Sheet Music Embed](https://flat.io/embed).

If you have any feedback or questions regarding this product, [please feel free to contact our developers' support](mailto:developers@flat.io).

## Installation

You can install our ES/TypeScript Embed Client using [npm](https://www.npmjs.com/package/flat-embed), pnpm, or [yarn](https://yarnpkg.com/en/package/flat-embed):

```bash
npm install flat-embed
pnpm add flat-embed
yarn add flat-embed
```

Or use the latest UMD version hosted on our CDN:

```html
<script src="https://prod.flat-cdn.com/embed-js/v2.1.0/embed.min.js"></script>
```

## Getting Started

The simplest way to get started is to pass a DOM element to our embed that will be used as container. By default, this one will completely fit its container:

```html
<div id="embed-container"></div>
<script src="https://prod.flat-cdn.com/embed-js/v2.1.0/embed.min.js"></script>
<script>
  var container = document.getElementById('embed-container');
  var embed = new Flat.Embed(container, {
    score: '<score-id-you-want-to-load>',
    embedParams: {
      appId: '<your-app-id>',
      controlsPosition: 'bottom',
    },
  });
</script>
```

Otherwise, if you are using our embed in an ES6 project:

```js
import Embed from 'flat-embed';

const container = document.getElementById('embed-container');
const embed = new Embed(container, {
  score: '<score-id-you-want-to-load>',
  embedParams: {
    appId: '<your-app-id>',
    controlsPosition: 'bottom',
  },
});
```

_[>> Open this demo in JSFiddle](https://jsfiddle.net/gierschv/jr91116y/)_

### ✨ Demos

**Some demos of this Embed API are available in a dedicated repository: [https://github.com/FlatIO/embed-examples](https://github.com/FlatIO/embed-examples).**

### App ID

Our Embed JS API requires an App ID (`appId`) to use it:

- In development, you can try and use this client without limits on `localhost`/`*.localhost`.
- To use it in production or with a custom domain, [create a new app on our website](https://flat.io/developers/apps), then go to the _Embed > Settings_ and add your domains to the whitelist. Your app ID will also be displayed on this page.

## Embed construction

### DOM element or existing iframe

When instantiating `Flat.Embed`, the first argument will always refer to a DOM element. It can take:

- A DOM element (e.g. selected using `document.getElementById('embed-container')`).
- The string identifier of the element (e.g. `"embed-container"`).
- An existing embed iframe element. In this case, this one will need to have our JS API loaded using the query string [`jsapi=true`](https://flat.io/developers/docs/embed/url-parameters.html).

If you instance a different `Flat.Embed` for the same element, you will always get the same instance of the object.

### Options and URL parameters

When instantiating `Flat.Embed`, you can pass options in the second parameter. To use the different methods available and events subscriptions, you will need to pass at least `embedParams.appId`.

| Option        | Description                                         | Values                                                                          | Default |
| :------------ | :-------------------------------------------------- | :------------------------------------------------------------------------------ | :------ |
| `score`       | The score identifier that will load initially       | Unique score id                                                                 | `blank` |
| `width`       | The width of your embed                             | A width of the embed                                                            | `100%`  |
| `height`      | The height of your embed                            | A height of the embed                                                           | `100%`  |
| `embedParams` | Object containing the loading options for the embed | [Any URL parameters](https://flat.io/developers/docs/embed/url-parameters.html) | `{}`    |

## JavaScript API

- [Viewer API](#viewer-api)
  - [`ready`](#ready-promisevoid-error): Wait until the JavaScript is ready
  - [`on`](#onevent-string-callback-function-void): Subscribe to events
  - [`off`](#offevent-string-callback-function-void): Unsubscribe from events
  - [`getEmbedConfig`](#getembedconfig-promiseobject-error): Get the global config of the embed
  - [`loadFlatScore`](#loadflatscorescore-mixed-promisevoid-apierror): Load a score hosted on Flat
  - [`loadMusicXML`](#loadmusicxmlscore-mixed-promisevoid-error): Load MusicXML file (compressed or not)
  - [`loadJSON`](#loadjsonscore-object-promisevoid-error): Load Flat JSON file
  - [`getMusicXML`](#getmusicxmloptions-object-promisestringuint8array-error): Get the score in MusicXML (compressed or not)
  - [`getJSON`](#getjson-object): Get the score data in Flat JSON format
  - [`getPNG`](#getpngoptions-object-promisestringuint8array-error): Get the score as a PNG file
  - [`getMIDI`](#getmidi-promiseuint8array-error): Get the score as a MIDI file
  - [`getScoreMeta`](#getscoremeta-object): Get the metadata from the current score (for hosted scores)
  - [`fullscreen`](#fullscreenstate-bool-promisevoid-error): Toggle fullscreen mode
  - [`play`](#play-promisevoid-error): Start playback
  - [`pause`](#pause-promisevoid-error): Pause playback
  - [`stop`](#stop-promisevoid-error): Stop playback
  - [`mute`](#mute-promisevoid-error): Mute playback
  - [`getMasterVolume`](#getmastervolume-promisenumber-error): Get the master volume
  - [`setMasterVolume`](#setmastervolume-volume-number--promisevoid-error): Set the master volume
  - [`getPartVolume`](#getpartvolume-partuuid-string--promisenumber-error): Get a part volume
  - [`setPartVolume`](#setpartvolume-partuuid-string-volume-number--promisevoid-error): Set a part volume
  - [`mutePart`](#mutepart-partuuid-string--promisevoid-error): Mute a part
  - [`unmutePart`](#unmutepart-partuuid-string--promisevoid-error): Unmute a part
  - [`setPartSoloMode`](#setpartsolomode-partuuid-string--promisevoid-error): Enable the solo mode for a part
  - [`unsetPartSoloMode`](#unsetpartsolomode-partuuid-string--promisevoid-error): Disable the solo mode for a part
  - [`getPartSoloMode`](#getpartsolomode-partuuid-string--promiseboolean-error): Get the state of the solo mode of a part
  - [`getPartReverb`](#getpartreverb-partuuid-string--promisenumber-error): Get a part reverberation
  - [`setPartReverb`](#setpartreverb-partuuid-string-reverberation-number--promisevoid-error): Set a part reverberation
  - [`getMetronomeMode`](#getMetronomeMode-promisenumber-error): Get the mode of the metronome counting
  - [`setMetronomeMode`](#setMetronomeMode-number--promisevoid-error): Set the mode of the metronome counting
  - [`getPlaybackSpeed`](#getPlaybackSpeed-promisenumber-error): Get the playback speed
  - [`setPlaybackSpeed`](#setPlaybackSpeed-number--promisevoid-error): Set the playback speed
  - [`scrollToCursor`](#scrollToCursor-promisevoid-error): Scroll to the cursor position in the score
  - [`setTrack`](#settrackobject-promisevoid-error): Configure an new audio track to use
  - [`useTrack`](#usetrack-id--promisevoid-error): Use a configured audio track
  - [`seekTrackTo`](#seektrackto-time--promisevoid-error): Seek the audio track to a specified duration
  - [`print`](#print-promisevoid-error): Print the score
  - [`getZoom`](#getzoom-promisenumber-error): Get the current display zoom ratio
  - [`setZoom`](#setzoomnumber-promisenumber-error): Change the display zoom ratio
  - [`getAutoZoom`](#getautozoom-promiseboolean-error): Get the state of the auto-zoom mode
  - [`setAutoZoom`](#setautozoomboolean-promiseboolean-error): Enable or disable the auto-zoom mode
  - [`focusScore`](#focusscore-promisevoid-error): Set the focus to the score
  - [`getCursorPosition`](#getcursorposition-promiseobject-error): Get the current cursor position of the score
  - [`setCursorPosition`](#setcursorpositionposition-object-promiseobject-error): Set a new position for the cursor
  - [`getParts`](#getparts-promisearray-error): Get the list of all the parts
  - [`getDisplayedParts`](#getdisplayedparts-promisearray-error): Get the displayed parts
  - [`setDisplayedParts`](#setdisplayedpartsparts-promisevoid-error): Choose the parts to display
  - [`getMeasureDetails`](#getmeasuredetails-promiseobject-error): Get details about the current measure
  - [`getNoteDetails`](#getnotedetails-promiseobject-error): Get details about the current note
  - [`getNbMeasures`](#getnbmeasures-promisenumber-error): Get the number of measures in the score
  - [`getMeasuresUuids`](#getmeasuresuuids-promisearray-error): Get the list of measures uuids of the score
  - [`getNbParts`](#getnbparts-promisenumber-error): Get the number of parts in the score
  - [`getPartsUuids`](#getpartsuuids-promisearray-error): Get the list of parts uuids of the score
  - [`getMeasureVoicesUuids`](#getmeasurevoicesuuids-promisearray-error): Get the list of voices uuids for a given measure
  - [`getMeasureNbNotes`](#getmeasurenbnotes-promisenumber-error): Get the number of notes for a given meaasure/voice.
  - [`getNoteData`](#getnotedata-promiseobject-error): Get information about a specific note
  - [`playbackPositionToNoteIdx`](#playbackpositiontonoteidx-promisenumber-error): Convert a playback position into a note index.
  - [`goLeft`](#play-promisevoid-error): Move the cursor the previous note/rest
  - [`goRight`](#play-promisevoid-error): Move the cursor the next note/rest
- [Editor API](#editor-api)
- [Events API](#events-api)
  - [`scoreLoaded`](#event-scoreLoaded): A new score has been loaded
  - [`cursorPosition`](#event-cursorposition): The cursor position changed
  - [`cursorContext`](#event-cursorcontext): Additional context about current cursor
  - [`measureDetails`](#event-measuredetails): Details about current measure changed
  - [`noteDetails`](#event-notedetails): Details about current note changed
  - [`rangeSelection`](#event-rangeSelection): The range selected changed
  - [`fullscreen`](#event-fullscreen): The fullscreen state changed
  - [`play`](#event-play): The score playback started
  - [`pause`](#event-pause): The score playback paused
  - [`stop`](#event-stop): The score playback stopped
  - [`playbackPosition`](#event-playbackposition): The playback slider position changed

## Viewer API

You can call the methods using any `Flat.Embed` object. By default, the methods (except `on` and `off`) return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that will be resolved once the method is called, the value is set or get:

```js
var embed = new Flat.Embed('container');
embed
  .loadFlatScore('12234')
  .then(function () {
    console.log('Score loaded');
  })
  .catch(function (err) {
    console.log('Error', err);
  });
```

### `ready(): Promise<void, Error>`

Promises resolved when the embed is loaded and the JavaScript API is ready to use. All the methods will implicitly use this method, so you don't have to worry about waiting for the loading before calling the different methods.

```js
embed.ready().then(function () {
  // You can use the embed
});
```

### `on(event: string, callback: function): void`

Add an event listener for the specified event. When receiving the event, the client will call the specified function with zero or one parameter depending on the [event received](#events-api).

```js
embed.on('playbackPosition', function (position) {
  console.log(position);
});
```

### `off(event: string, callback?: function): void`

Remove an event listener for the specified event. If no `callback` is specified, all the listeners for the event will be removed.

```js
function positionChanged(position) {
  // Print position
  console.log(position);

  // You can remove the listener later (e.g. here, once the first event is received)
  embed.off('play', positionChanged);

  // Alternatively, you can remove all the listeners for the event:
  embed.off('play');
}

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

### `loadFlatScore(score: mixed): Promise<void, ApiError>`

Load a score hosted on Flat using its identifier. For example to load `https://flat.io/score/56ae21579a127715a02901a6-house-of-the-rising-sun`, you can call:

```js
embed
  .loadFlatScore('56ae21579a127715a02901a6')
  .then(function () {
    // Score loaded in the embed
  })
  .catch(function (error) {
    // Unable to load the score
  });
```

If the score has a private sharing link ([`privateLink`](https://flat.io/developers/api/reference/#operation/editScore)), you can pass an object with the `sharingKey` property:

```js
embed
  .loadFlatScore({
    score: '5ce56f7c019fd41f5b17b72d',
    sharingKey:
      '3f70cc5ecf5e4248055bbe7502a9514cfe619c53b4e248144e470bb5f08c5ecf880cf3eda5679c6b19f646a98ec0bd06d892ee1fd6896e20de0365ed0a42fc00',
  })
  .then(function () {
    // Score loaded in the embed
  })
  .catch(function (error) {
    // Unable to load the score
  });
```

### `loadMusicXML(score: mixed): Promise<void, Error>`

Load a MusicXML score, compressed (MXL) or not (plain XML). The compressed files (.mxl) must be passed as `ArrayBuffer`, and the plain XML (.xml/.musicxml) as `String`.

Example to load a compressed MXL file:

```js
// Loading any MXL file here, for example a file from a public Flat score
fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/mxl')
  .then(function (response) {
    return response.arrayBuffer();
  })
  .then(function (mxl) {
    // Got the compressed score as an `ArrayBuffer`, load it in the embed
    return embed.loadMusicXML(mxl);
  })
  .then(function () {
    // Score loaded in the embed
  })
  .catch(function (error) {
    // Unable to load the score
  });
```

Example to load a plain XML file:

```js
// Loading any plain XML file here, for a file example from a public Flat score
fetch('https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/xml')
  .then(function (response) {
    return response.text();
  })
  .then(function (mxl) {
    // Got the plain XML score as an `String`, load it in the embed
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

Convert the currently displayed score into a MusicXML file, compressed (`.mxl`) or not (`.xml`).

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
  var blobUrl = window.URL.createObjectURL(
    new Blob([buffer], {
      type: 'application/vnd.recordare.musicxml+xml',
    }),
  );

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
embed
  .getJSON()
  .then(function (data) {
    console.log(data);
  })
  .catch(function (error) {
    // Unable to get the data
  });
```

### `getPNG(options?: object): Promise<string|Uint8Array, Error>`

Get the currently displayed score as a PNG file. This API method accepts the following options:

- `result`: Choose how the PNG file is returned, either `dataURL` or `Uint8Array`. Default value is `Uint8Array`.
- `layout`: The score can either exported as one horizontal system (`track`), or the first page (`page`). Default value is `track`
- `dpi`: The dpi used to export the PNG, between `50` and `300`. Default value is `150`.

```js
// PNG
embed.getPNG().then(function (png) {
  // PNG file as a Uint8Array
  console.log(png);
});
```

```js
// PNG
embed
  .getPNG({
    result: 'dataURL',
    layout: 'layout',
    dpi: 300,
  })
  .then(function (png) {
    // 300 DPI PNG with the score as a page, returned as a DataURL
    console.log(png);
  });
```

### `getMIDI(): Promise<Uint8Array, Error>`

Get the currently displayed score as a MIDI file

```js
embed.getMIDI().then(function (midi) {
  // MIDI file as a Uint8Array
  console.log(midi);
});
```

### `getScoreMeta(): object`

Get the score metadata of the hosted score. The object will have the same format that the one returned [by our API `GET /v2/scores/{score}`](https://flat.io/developers/api/reference/#operation/getScore).

```js
embed
  .getScoreMeta()
  .then(function (metadata) {
    console.log(metadata);
  })
  .catch(function (error) {
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

### `getMasterVolume(): Promise<Number, Error>`

Get the master volume

```js
embed.getMasterVolume().then(function (volume) {
  // The volume value
  console.log(volume);
});
```

### `setMasterVolume({ volume: number }): Promise<void, Error>`

Set the master volume (`volume` between 0 and 100)

```js
embed.setMasterVolume({ volume: 50 }).then(function () {
  // The volume is set
});
```

### `getPartVolume({ partUuid: string }): Promise<Number, Error>`

Get a part volume (`partUuid` can be retrieved with `getParts`)

```js
embed.getPartVolume({ partUuid: 'c86be847-a7a1-54fb-44fc-a6564d7eb75c' }).then(function (volume) {
  // The volume value
  console.log(volume);
});
```

### `setPartVolume({ partUuid: string, volume: number }): Promise<void, Error>`

Set a part volume (`volume` between 0 and 100, `partUuid` can be retrieved with `getParts`)

```js
embed
  .getPartVolume({
    partUuid: 'c86be847-a7a1-54fb-44fc-a6564d7eb75c',
    volume: 50,
  })
  .then(function () {
    // The volume is set
  });
```

## `mutePart({ partUuid: string }): Promise<void, Error>`

Mute a part

```js
embed.mutePart({ partUuid: 'c86be847-a7a1-54fb-44fc-a6564d7eb75c' }).then(function () {
  // The part is muted
});
```

## `unmutePart({ partUuid: string }): Promise<void, Error>`

Unmute a part

```js
embed.unmutePart({ partUuid: 'c86be847-a7a1-54fb-44fc-a6564d7eb75c' }).then(function () {
  // The part is unmuted
});
```

## `setPartSoloMode({ partUuid: string }): Promise<void, Error>`

Enable the solo mode for a part

```js
embed.setPartSoloMode({ partUuid: 'c86be847-a7a1-54fb-44fc-a6564d7eb75c' }).then(function () {
  // The part is now playing solo
});
```

## `unsetPartSoloMode({ partUuid: string }): Promise<void, Error>`

Disable the solo mode for a part

```js
embed.unsetPartSoloMode({ partUuid: 'c86be847-a7a1-54fb-44fc-a6564d7eb75c' }).then(function () {
  // All the parts are now playing
});
```

### `getPartSoloMode({ partUuid: string }): Promise<Boolean, Error>`

Get the state of the solo mode of a part (`partUuid` can be retrieved with `getParts`)

```js
embed.getPartSoloMode({ partUuid: 'c86be847-a7a1-54fb-44fc-a6564d7eb75c' }).then(function (isSolo) {
  // The solo state
  console.log(isSolo);
});
```

### `getPartReverb({ partUuid: string }): Promise<Number, Error>`

Get a part reverberation (`partUuid` can be retrieved with `getParts`)

```js
embed.getPartReverb({ partUuid: 'c86be847-a7a1-54fb-44fc-a6564d7eb75c' }).then(function (reverb) {
  // The reverberation value
  console.log(reverb);
});
```

### `setPartReverb({ partUuid: string, reverberation: number }): Promise<void, Error>`

Set a part reverberation (`reverberation` between 0 and 100, `partUuid` can be retrieved with `getParts`)

```js
embed
  .setPartReverb({
    partUuid: 'c86be847-a7a1-54fb-44fc-a6564d7eb75c',
    reverberation: 50,
  })
  .then(function () {
    // The reverberation is set
  });
```

### `getMetronomeMode(): Promise<Number, Error>`

Get the value of the metronome count-in mode.

Mode is defined as:

```js
const METRONOME_MODES = {
  COUNT_IN: 0, // Count in at the beginning of the playback
  CONTINUOUS: 1, // Always on
  DISABLED: 2,
};
```

```js
embed.getMetronomeMode().then(function (metronomeMode) {
  assert.strictEqual(metronomeMode, METRONOME_MODES.COUNT_IN);
  assert.strictEqual(metronomeMode, 0);
});
```

### `setMetronomeMode(number): Promise<void, Error>`

Set the metronome count-in mode.

```js
embed.setMetronomeMode(1).then(function () {
  // The metronome mode is set
});
```

### `getPlaybackSpeed(): Promise<Number, Error>`

Get the playback speed.

```js
embed.getPlaybackSpeed().then(function (playbackSpeed) {
  assert.strictEqual(playbackSpeed, 1);
});
```

### `setPlaybackSpeed(number): Promise<void, Error>`

Set the playback speed. Normal value is 1. The value can be between 0.2 and 2.

```js
embed.setPlaybackSpeed(1.5).then(function () {
  // The playback speed is set
});
```

### `scrollToCursor(): Promise<void, Error>`

For the display to scroll at the position of the cursor in the score

```js
embed.scrollToCursor().then(function () {
  // The scrolling is done asynchronously, it is not guarenteed that it will be completed here.
});
```

### `setTrack(object): Promise<void, Error>`

Configure a new video or audio track for the current embedded score. This method uses the same system as [our audio tracks manager in our editor app](https://flat.io/help/en/music-notation-software/synchronize-external-recording.html), but allows you to dynamically configure any track or connect an external player to an embedded score.

This method takes the following options:

- `id` **(required)**: An unique identifier for the configuration, that can be used later for the method [`useTrack`](#usetrack-id--promisevoid-error).
- `type` **(required)**: The type of track to configure, using one of the following types: `youtube`, `soundcloud`, `vimeo`, `audio`, `external`
- `url` **(required for `soundcloud` and `audio`)**: the URL of the Souncloud or the audio file to load
- `mediaId` **(required for `youtube`, `vimeo`)**: the video identifier to embed
- `totalTime` **(required for `external`)**: the total time of the media played
- `synchronizationPoints` **(required)**: the list of synchronization points to use. Each point can have the following information:
  - `type`: `measure` or `end` of the score
  - `time` in seconds, the position of the synchronization point
  - `location.measureIdx`: for `measure` point, the index of the score where the point is located.

Once a track is configured, you must call the method [`useTrack`](#usetrack-id--promisevoid-error) to enable it.

Two implementation examples are available in our example repository:

- [📺 YouTube synced player with a MusicXML loaded locally](https://github.com/FlatIO/embed-examples#-youtube-synced-player-with-a-musicxml-loaded-locally)
- [🎧 External player with a MusicXML loaded locally](https://github.com/FlatIO/embed-examples#-external-player-with-a-musicxml-loaded-locally)

The `synchronizationPoints` also use the same formats as our REST API. If you previously configured some tracks using our web editor, [you can fetch their configuration using our REST API](https://flat.io/developers/api/reference/#operation/getScoreTrack).

```js
embed
  .setTrack({
    id: 'yt-cucaracha',
    type: 'youtube',
    mediaId: 'jp9vFhyhNd8',
    synchronizationPoints: [
      { type: 'measure', time: 0, location: { measureIdx: 0 } },
      { type: 'end', time: 19 },
    ],
  })
  .then(function () {
    // The track is configured
  });
```

### `useTrack({ id }): Promise<void, Error>`

Enable a previously configured audio or video track. The `id` can be an identifier chosen from a track configured using [`setTrack`](#settrackobject-promisevoid-error) or from [Flat's REST API](https://flat.io/developers/api/reference/#operation/getScoreTrack).

```js
embed
  .useTrack({
    id: 'yt-cucaracha',
  })
  .then(function () {
    // The track is enabled
  });
```

### `seekTrackTo({ time }): Promise<void, Error>`

Seek the current played track to a provided `time`, in seconds.

```js
embed.useTrack({
  time: 5,
});
```

### `print(): Promise<void, Error>`

Print the score

```js
embed
  .print()
  .then(function () {
    // The score is being printed (the browser opens the print prompt)
  })
  .catch(function (error) {
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

Unlike the web version on <https://flat.io>, the embed doesn't catch the focus. This avoids to mess with the parent window, and avoid the browser to do a forced scrolling to the embed iframe.

If the end-users' goal is the usage of the embed to play or write notation, you can use this method to set the focus on the score and allowing them to use the keyboard bindings.

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
embed
  .setCursorPosition({
    partIdx: 0,
    staffIdx: 1,
    voiceIdx: 0,
    measureIdx: 2,
    noteIdx: 1,
  })
  .then(function (position) {
    // position: {
    //     "partIdx": 0,
    //     "staffIdx": 1,
    //     "voiceIdxInStaff": 0,
    //     "measureIdx": 2,
    //     "noteIdx": 1
    // }
  });
```

### `getParts(): Promise(<Array, Error>)`

Get the list of all the parts of the current score.

```js
embed.getParts().then(function (parts) {
  // parts: [
  //  {
  //    idx: 0
  //    uuid: "ff78f481-2658-a94e-b3b2-c81f6d83bff0"
  //    name: "Grand Piano"
  //    abbreviation: "Pno."
  //    isTransposing: false
  //  },
  //  {
  //    idx: 1
  //    uuid: "ab0ec60f-13ca-765d-34c6-0f181e58a672"
  //    name: "Drum Set"
  //    abbreviation: "Drs."
  //    isTransposing: false
  //  }
  //]
});
```

### `getDisplayedParts(): Promise(<Array, Error>)`

Get the list of the displayed parts. You can update the displayed parts with [`setDisplayedParts()`](#setdisplayedpartsparts-promisevoid-error).

```js
embed.getDisplayedParts().then(function (parts) {
  // parts: [
  //  {
  //    idx: 0
  //    uuid: "ff78f481-2658-a94e-b3b2-c81f6d83bff0"
  //    name: "Grand Piano"
  //    abbreviation: "Pno."
  //    isTransposing: false
  //  }
  //]
});
```

### `setDisplayedParts(parts): Promise(<void, Error>)`

Set the list of the parts to display. This list (array) can either contain the UUIDs of the parts to display, their indexes (idx) starting from 0, the names of the parts or their abbreviations.

```js
embed.setDisplayedParts(['Violin', 'Viola']).then(function () {
  // display update queued
});
```

### `getMeasureDetails(): Promise(<object, Error>)`

Retrieve details about the current measure. You can listen to the [`measureDetails`](#event-measuredetails) event to get the same details returned every time the cursor is moved or the measure is modified.

```js
embed.getMeasureDetails().then(function (measure) {
  // {
  //     "clef": {
  //         "sign": "G",
  //         "line": 2,
  //         "clef-octave-change": -1
  //     },
  //     "key": {
  //         "fifths": 0
  //     },
  //     "time": {
  //         "beats": 4,
  //         "beat-type": 4
  //     },
  //     "displayedTime": {
  //         "beats": 4,
  //         "beat-type": 4
  //     },
  //     "tempo": {
  //         "qpm": 80,
  //         "bpm": 80,
  //         "durationType": "quarter",
  //         "nbDots": 0
  //     },
  //     "transpose": {
  //         "chromatic": "0"
  //     },
  //     "voicesData": {
  //         "voices": [
  //             0
  //         ],
  //         "mainVoiceIdx": 0
  //     }
  // }
});
```

### `getNoteDetails(): Promise(<object, Error>)`

Retrieve details about the current note. You can listen to the [`noteDetails`](#event-notedetails) event to get the same details returned every time the cursor is moved or the note is modified.

```js
embed.getNoteDetails().then(function (measure) {
  // {
  //     "articulations": [],
  //     "classicHarmony": null,
  //     "dynamicStyle": null,
  //     "ghostNotes": [
  //         false
  //     ],
  //     "hammerOnPullOffs": [
  //         false
  //     ],
  //     "harmony": null,
  //     "hasArpeggio": false,
  //     "hasGlissando": false,
  //     "isChord": false,
  //     "isInSlur": false,
  //     "isRest": false,
  //     "isTied": false,
  //     "lines": [
  //         -2.5
  //     ],
  //     "lyrics": [],
  //     "nbDots": 0,
  //     "nbGraces": 0,
  //     "ornaments": [],
  //     "pitches": [
  //         {
  //             "step": "E",
  //             "octave": 2,
  //             "alter": 0
  //         }
  //     ],
  //     "technical": [],
  //     "tupletType": null,
  //     "wedgeType": null,
  //     "durationType": "eighth"
  // }
});
```

### `getNbMeasures(): Promise(<number, Error>)`

Get the number of measures within the score

```js
embed.getNoteDetails().then(function (nbMeasures) {
  assert.strictEqual(nbMeasures, 5);
});
```

### `getMeasuresUuids(): Promise(<array, Error>)`

Get the number of measures within the score

```js
embed.getMeasuresUuids().then(function (measuresUuids) {
  assert.strictEqual(measuresUuids, [
    '05a4daec-bc78-5987-81e4-2467e234dfb2',
    '08b9110b-82bb-11e5-f57c-7b0f47a6a69a',
    '3c176017-31ff-cc91-7ad6-a2ea4a510200',
    '833ca409-04e9-0b76-52db-105777bd7a56',
  ]);
});
```

### `getNbParts(): Promise(<number, Error>)`

Get the number of parts within the score

```js
embed.getNbParts().then(function (nbParts) {
  assert.strictEqual(nbParts, 3);
});
```

### `getPartsUuids(): Promise(<array, Error>)`

Get the number of parts within the score

```js
embed.getPartsUuids().then(function (partsUuids) {
  assert.deepStrictEqual(partsUuids, [
    '05a4daec-bc78-5987-81e4-2467e234dfb2',
    '08b9110b-82bb-11e5-f57c-7b0f47a6a69a',
    '833ca409-04e9-0b76-52db-105777bd7a56',
  ]);
});
```

### `getMeasureVoicesUuids(): Promise(<array, Error>)`

Get the list of voice uuids present in a given measure

```js
embed
  .getMeasureVoicesUuids({
    partUuid: '05a4daec-bc78-5987-81e4-2467e234dfb2',
    measureUuid: '08b9110b-82bb-11e5-f57c-7b0f47a6a69a',
  })
  .then(function (voicesUuids) {
    assert.deepStrictEqual(voicesUuids, [
      '3c176017-31ff-cc91-7ad6-a2ea4a510200',
      '833ca409-04e9-0b76-52db-105777bd7a56',
    ]);
  });
```

### `getMeasureNbNotes(): Promise(<number, Error>)`

Get the number of notes in the voice of a specific measure.

```js
embed
  .getMeasureNbNotes({
    partUuid: '05a4daec-bc78-5987-81e4-2467e234dfb2',
    measureUuid: '08b9110b-82bb-11e5-f57c-7b0f47a6a69a',
    voiceUuid: '3c176017-31ff-cc91-7ad6-a2ea4a510200',
  })
  .then(function (nbNotes) {
    assert.strictEqual(nbNotes, 4);
  });
```

### `getNoteData(): Promise(<object, Error>)`

Get information on a specific note.

```js
embed
  .getNoteData({
    partUuid: '05a4daec-bc78-5987-81e4-2467e234dfb2',
    measureUuid: '08b9110b-82bb-11e5-f57c-7b0f47a6a69a',
    voiceUuid: '3c176017-31ff-cc91-7ad6-a2ea4a510200',
    noteIdx: 2,
  })
  .then(function (noteData) {
    assert.deepStrictEqual(noteData, {
      articulations: [],
      classicHarmony: null,
      durationType: 'quarter',
      dynamicStyle: null,
      ghostNotes: undefined,
      hammerOnPullOffs: undefined,
      harmony: null,
      hasArpeggio: undefined,
      hasGlissando: undefined,
      isChord: undefined,
      isInSlur: false,
      isRest: true,
      isTied: undefined,
      lines: undefined,
      lyrics: [],
      nbDots: 0,
      nbGraces: 0,
      ornaments: [],
      pitches: undefined,
      technical: [],
      tupletType: null,
      wedgeType: null,
    });
  });
```

### `playbackPositionToNoteIdx(): Promise(<number, Error>)`

Convert the data given by the [`playbackPosition` event](#event-playbackposition) into a note index.

```js
embed
  .playbackPositionToNoteIdx({
    partUuid: '1f4ab07d-d27a-99aa-2304-f3dc10bb27c3',
    voiceUuid: '17099aa2-e0dd-dbc3-2d45-b9b574e89572',
    playbackPosition: {
      currentMeasure: 0,
      quarterFromMeasureStart: 1.1,
    },
  })
  .then(function (noteIdx) {
    assert.strictEqual(noteIdx, 1);
  });
```

### `goLeft(): Promise(<void, Error>)`

Get the number of measures within the score

```js
embed.goLeft().then(function () {
  // The cursor is moved to the previous item on the left
});
```

### `goRight(): Promise(<void, Error>)`

Get the number of measures within the score

```js
embed.goRight().then(function () {
  // The cursor is moved to the next item on the right
});
```

## Editor API

You can enable the editor mode by setting the `mode` to `edit` when creating the embed:

```js
var embed = new Flat.Embed(container, {
  embedParams: {
    appId: '<your-app-id>',
    mode: 'edit',
  },
});
```

[Check out an implementation example of the editor](https://flat.io/developers/docs/embed/javascript-editor.html).

## Events API

Events are broadcasted following actions made by the end-user or you with the JavaScript API. You can subscribe to an event using the method [`on`](#onevent-string-callback-function-void), and unsubscribe using [`off`](#onevent-string-callback-function-void). When an event includes some data, this data will be available in the first parameter of the listener callback.

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

### Event: `cursorContext`

This event is triggered when the position or context of the user's cursor changes.

```json
{
  "isRest": false,
  "isGrace": false,
  "isUnpitchedPart": false,
  "isPitchedPart": true,
  "isPitched": true,
  "isChord": true,
  "isTab": false,
  "hasTab": true,
  "hasTabFrame": false,
  "isEndOfScore": false,
  "isSameLineThanNextNote": false,
  "hasSlashInConnection": false,
  "canTieWithNextNote": false,
  "canSwitchEnharmonic": false,
  "isNextRest": false,
  "hasTie": false,
  "isHeadTied": false
}
```

### Event: `measureDetails`

This event is triggered when the position or context of the user's cursor changes.
The payload of this event is the same as the returned value from [`getMeasureDetails`](#getmeasuredetails-promiseobject-error).

```json
{
  "clef": {
    "sign": "G",
    "line": 2,
    "clef-octave-change": -1
  },
  "key": {
    "fifths": 0
  },
  "time": {
    "beats": 4,
    "beat-type": 4
  },
  "displayedTime": {
    "beats": 4,
    "beat-type": 4
  },
  "tempo": {
    "qpm": 80,
    "bpm": 80,
    "durationType": "quarter",
    "nbDots": 0
  },
  "transpose": {
    "chromatic": "0"
  },
  "voicesData": {
    "voices": [0],
    "mainVoiceIdx": 0
  }
}
```

### Event: `noteDetails`

This event is triggered when the position or context of the user's cursor changes.
The payload of this event is the same as the returned value from [`getNoteDetails`](#getnotedetails-promiseobject-error).

```json
{
  "articulations": [],
  "classicHarmony": null,
  "dynamicStyle": null,
  "ghostNotes": [false],
  "hammerOnPullOffs": [false],
  "harmony": null,
  "hasArpeggio": false,
  "hasGlissando": false,
  "isChord": false,
  "isInSlur": false,
  "isRest": false,
  "isTied": false,
  "lines": [-2.5],
  "lyrics": [],
  "nbDots": 0,
  "nbGraces": 0,
  "ornaments": [],
  "pitches": [
    {
      "step": "E",
      "octave": 2,
      "alter": 0
    }
  ],
  "technical": [],
  "tupletType": null,
  "wedgeType": null,
  "durationType": "eighth"
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

This event is triggered when the playback slider moves. It is constantly triggered,
as it is the event that also serve internally to animate the vertical line.
It contains an object with information regarding the position of the playback in the score:

```js
{
  currentMeasure: 3,// Index of the meaasure in the score
  quarterFromMeasureStart: 2.2341,// Position from the beginning of the measure, expressed in quarter notes
}
```

Here is how you can get information on the note currently played.
We will check for a note in the part/voice where the user cursor is currently located.

```js
const cursorPosition = await embed.getCursorPosition();
const { partUuid, voiceUuid } = cursorPosition;
const measuresUuids = await embed.getMeasuresUuids();

embed.on('playbackPosition', async playbackPosition => {
  const { currentMeasure } = playbackPosition;
  const measureUuid = measuresUuids[currentMeasure];
  const voicesUuids = await embed.getMeasureVoicesUuids({
    partUuid,
    measureUuid,
  });
  if (voicesUuids.includes(voiceUuid)) {
    // The voice is not present in the measure currently being played..
    return;
  }

  const noteIdx = await embed.playbackPositionToNoteIdx({
    partUuid,
    voiceUuid,
    playbackPosition,
  });
  const noteData = await embed.getNoteData({
    partUuid,
    measureUuid,
    voiceUuid,
    noteIdx,
  });
  assert.strictEqual(noteData.isRest, true);
});
```
