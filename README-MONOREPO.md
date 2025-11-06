# Flat Sheet Music Embed - Monorepo

[![Build Status](https://github.com/FlatIO/embed-client/actions/workflows/tests.yml/badge.svg)](https://github.com/FlatIO/embed-client/actions)

JavaScript/TypeScript SDK to interact and receive events from our [Sheet Music Embed](https://flat.io/embed), with official React and Vue components.

[![Flat's Sheet Music Embed](https://user-images.githubusercontent.com/396537/156041576-a5f68279-c291-49db-87e9-f8c9105c08a7.png)](https://flat.io/embed)

If you have any feedback or questions regarding this product, [please feel free to contact our developers' support](mailto:developers@flat.io).

## 📦 Packages

This monorepo contains three packages:

| Package | Version | Description |
|---------|---------|-------------|
| **[flat-embed](./packages/core)** | [![NPM](https://img.shields.io/npm/v/flat-embed.svg?style=flat)](https://www.npmjs.org/package/flat-embed) | Core JavaScript/TypeScript SDK |
| **[@flat/embed-react](./packages/react)** | Coming soon | React components and hooks |
| **[@flat/embed-vue](./packages/vue)** | Coming soon | Vue 3 components and composables |

## 🚀 Quick Start

### Vanilla JavaScript

```bash
npm install flat-embed
```

```js
import Embed from 'flat-embed';

const embed = new Embed('container', {
  score: '56ae21579a127715a02901a6',
  embedParams: {
    appId: 'your-app-id',
  },
});
```

[→ Full documentation](./packages/core/README.md)

### React

```bash
npm install @flat/embed-react
```

```tsx
import { FlatEmbed } from '@flat/embed-react';

<FlatEmbed
  score="56ae21579a127715a02901a6"
  appId="your-app-id"
  height="600px"
  onPlay={() => console.log('Playing')}
/>
```

[→ Full documentation](./packages/react/README.md)

### Vue

```bash
npm install @flat/embed-vue
```

```vue
<script setup>
import { FlatEmbed } from '@flat/embed-vue';
</script>

<template>
  <FlatEmbed
    score="56ae21579a127715a02901a6"
    app-id="your-app-id"
    height="600px"
    @play="() => console.log('Playing')"
  />
</template>
```

[→ Full documentation](./packages/vue/README.md)

## 📚 Documentation

- **[Embed API Documentation](https://flat.io/developers/docs/embed/)** - Complete API reference
- **[URL Parameters](https://flat.io/developers/docs/embed/url-parameters)** - All configuration options
- **[Events Reference](https://flat.io/developers/docs/embed/api/events)** - Available events
- **[Examples Repository](https://github.com/FlatIO/embed-examples)** - Live code examples

## ✨ Features

### Core SDK
- 60+ methods to control the embed
- 18 events for real-time updates
- Load scores from Flat, MusicXML, MIDI, or JSON
- Export to PNG, MusicXML, MIDI
- Full playback control with metronome
- Part management (mute, solo, volume)
- Cursor navigation and zoom control
- TypeScript support with full type definitions

### React Package
- Declarative `<FlatEmbed>` component
- `useFlatEmbed` hook for headless usage
- Context provider for multiple embeds
- Built-in loading skeletons
- Testing utilities with mocks
- Full TypeScript support
- React 18 ready

### Vue Package
- `<FlatEmbed>` component with slots
- `useFlatEmbed` composable
- Provider for multiple embeds
- Reactive state management
- Testing utilities
- Full TypeScript support
- Vue 3 Composition API

## 🛠️ Development

### Prerequisites

- Node.js >=22.0.0
- pnpm >=10.0.0

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint
pnpm biome:check
```

### Package Structure

```
embed-client/
├── packages/
│   ├── core/          # flat-embed (vanilla JS/TS)
│   ├── react/         # @flat/embed-react
│   └── vue/           # @flat/embed-vue
├── examples/          # Example applications
└── pnpm-workspace.yaml
```

### Building Individual Packages

```bash
# Build core only
cd packages/core && pnpm build

# Build React only
cd packages/react && pnpm build

# Build Vue only
cd packages/vue && pnpm build
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

### Making Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`pnpm test && pnpm biome:check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

Apache-2.0 - see [LICENSE](LICENSE) for details.

## 🔗 Links

- [Flat.io Website](https://flat.io)
- [Developer Portal](https://flat.io/developers)
- [API Documentation](https://flat.io/developers/docs/embed/)
- [Create an App](https://flat.io/developers/apps)
- [Examples Repository](https://github.com/FlatIO/embed-examples)
- [Support](mailto:developers@flat.io)

## 💬 Support

- 📧 Email: [developers@flat.io](mailto:developers@flat.io)
- 🐛 Issues: [GitHub Issues](https://github.com/FlatIO/embed-client/issues)
- 📖 Docs: [flat.io/developers/docs](https://flat.io/developers/docs/embed/)
