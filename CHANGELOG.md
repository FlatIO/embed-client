# Changelog

## 2023-05-08: v1.5.0

* Add methods:
  * `getNbMeasures`
  * `getMeasuresUuids`
  * `goLeft`
  * `goRight`
  * `getMetronomeMode`
  * `setMetronomeMode`

## 2022-04-22: v1.4.1

* Fixed compatibility with Vue 3

## 2021-04-28: v1.4.0

* Update `loadFlatScore` to support `sharingKey`
* Add methods to dynamically set audio tracks: `setTrack`, `useTrack` and `seekTrackTo`

## 2020-05-06: Available with all previous SDKs since 0.4.0

* new options for `getPNG`
  * `layout` with `track` or `page` (default: `track`)
  * `dpi`

## 2020-02-24: v1.3.0

* Add methods:
  * `getMasterVolume`
  * `setMasterVolume`
  * `getPartVolume`
  * `setPartVolume`
  * `mutePart`
  * `unmutePart`
  * `setPartSoloMode`
  * `unsetPartSoloMode`
  * `getPartSoloMode`
  * `getPartReverb`
  * `setPartReverb`
  * `getMeasureDetails`
  * `getNoteDetails`
* Add events:
  * `noteDetails`
  * `measureDetails`
  * `cursorContext`

## 2020-01-07: v1.2.0

* Add methods: `getParts`, `getDisplayedParts` and `setDisplayedParts`

## 2019-05-13: v1.1.0

* Support for MIDI Output

## 2019-05-05: v1.0.0

* Host on our CDN (`https://prod.flat-cdn.com/embed-js/${VERSION}/embed.min.js`)

## 2018-11-29: v0.11.0

* Add `getMIDI` update
* Update `getMusicXML` to support new returned Uint8Array format (no more `.data`, response is at top level)
* Update cursor: `voiceIdx` is now `voiceIdxInStaff`

## 2018-11-23: v0.10.0

* Update for the embed release
* Use new CDN endpoint `flat-embed.com` by default
* Remove deprecated `edit` action & event
* Remove `setNoteColor` method

## 2017-11-10: v0.9.0

* Add method: `mute`

## 2017-10-19: v0.8.0

* Switch from babel-preset-es2015 to babel-preset-env
* Remove rollup-plugin-hypothetical and babel-plugin-transform-runtime

## 2017-08-08: v0.7.0

* Add method: `setNoteColor`

## 2017-08-03: v0.6.0

* Add methods: `getCursorPosition` and `setCursorPosition`

## 2017-07-07: v0.5.0

* Add method: `focusScore`
* New property `defaultMode` in editor config

## 2017-07-05: v0.4.0

* Add method: `getPNG`

## 2017-05-03: v0.3.0

* Add methods: `getEmbedConfig`, `setEditorConfig`, `edit`
* Add events: `edit`

## 2017-04-21: v0.2.0

* Add methods: `getAutoZoom`, `setAutoZoom`, `loadMusicXML`, `getMusicXML`
* Add events: `scoreLoaded`, `cursorPosition`, `rangeSelection`, `pause`, `stop`, `fullscreen`, `print`
* Add integration tests

## 2017-04-21: v0.1.0

* Initial release
