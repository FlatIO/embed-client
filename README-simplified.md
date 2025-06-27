# Flat Sheet Music Embed Client

[![Build Status](https://github.com/FlatIO/embed-client/actions/workflows/tests.yml/badge.svg)](https://github.com/FlatIO/embed-client/actions)
[![NPM Version](https://img.shields.io/npm/v/flat-embed.svg?style=flat)](https://www.npmjs.org/package/flat-embed)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

[![Flat's Sheet Music Embed](https://user-images.githubusercontent.com/396537/156041576-a5f68279-c291-49db-87e9-f8c9105c08a7.png)](https://flat.io/embed)

JavaScript/TypeScript SDK for embedding interactive sheet music powered by Flat.

## Installation

```bash
npm install flat-embed
# or
yarn add flat-embed
# or
pnpm add flat-embed
```

## Quick Start

```typescript
import Embed from 'flat-embed';

// Create embed
const embed = new Embed('container', {
  score: 'YOUR_SCORE_ID',
  embedParams: {
    appId: 'YOUR_APP_ID',
    mode: 'view', // or 'edit'
  },
});

// Wait for ready and play
await embed.ready();
await embed.play();
```

## Basic Usage

```typescript
// Load different formats
await embed.loadFlatScore('SCORE_ID');
await embed.loadMusicXML(xmlContent);
await embed.loadMIDI(midiArrayBuffer);

// Control playback
await embed.play();
await embed.pause();
await embed.setMasterVolume(75);

// Export scores
const xml = await embed.getMusicXML();
const png = await embed.getPNG({ dpi: 300 });
const midi = await embed.getMIDI();

// Navigate
await embed.setCursorPosition({ measureIdx: 4 });
await embed.goRight();

// Listen to events
embed.on('playbackPosition', position => {
  console.log(`Measure ${position.currentMeasure}`);
});
```

## Documentation

- 📚 **[Full API Reference](https://flat.io/developers/docs/embed/api/)** - Searchable reference for all 60+ methods
- 🚀 **[Getting Started Guide](https://flat.io/developers/docs/embed/getting-started)**
- 📖 **[TypeScript Guide](https://flat.io/developers/docs/embed/guides/typescript)**
- 🎯 **[Interactive Examples](https://github.com/FlatIO/embed-examples)**
- 🔧 **[URL Parameters](https://flat.io/developers/docs/embed/url-parameters)**

## App ID

Get your App ID:

- **Development**: Works on `localhost` without configuration
- **Production**: [Create an app](https://flat.io/developers/apps) and add your domains

## Support

- 📧 [Contact our developers' support](mailto:developers@flat.io)
- 🐛 [Report issues on GitHub](https://github.com/FlatIO/embed-client/issues)
- 💬 [Join our Discord](https://discord.gg/flat)

## License

Apache-2.0 - see [LICENSE](LICENSE) for details.
