# Changelog

## v0.11.0

* Add `getMIDI` update
* Update `getMusicXML` to support new returned Uint8Array format (no more `.data`, response is at top level)
* Update cursor: `voiceIdx` is now `voiceIdxInStaff`

## v0.10.0

* Update for the embed release
* Use new CDN endpoint `flat-embed.com` by default
* Remove deprecated `edit` action & event
* Remove `setNoteColor` method

## v0.9.0

* Add method: `mute`

## v0.8.0

* Switch from babel-preset-es2015 to babel-preset-env
* Remove rollup-plugin-hypothetical and babel-plugin-transform-runtime

## v0.7.0

* Add method: `setNoteColor`

## v0.6.0

* Add methods: `getCursorPosition` and `setCursorPosition`

## v0.5.0

* Add method: `focusScore`
* New property `defaultMode` in editor config

## v0.4.0

* Add method: `getPNG`

## v0.3.0

* Add methods: `getEmbedConfig`, `setEditorConfig`, `edit`
* Add events: `edit`

## v0.2.0

* Add methods: `getAutoZoom`, `setAutoZoom`, `loadMusicXML`, `getMusicXML`
* Add events: `scoreLoaded`, `cursorPosition`, `rangeSelection`, `pause`, `stop`, `fullscreen`, `print`
* Add integration tests

## v0.1.0

* Initial release
