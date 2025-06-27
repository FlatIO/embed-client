#!/usr/bin/env node

/**
 * Build script to generate API documentation from TypeScript definitions
 * This would be integrated into the package.json scripts
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  typeDefsPath: './dist/embed.d.ts',
  outputDir: './dev-docs/docs/embed/api',
  vitepressDir: './dev-docs',
  componentsDir: './dev-docs/docs/.vitepress/components',
};

/**
 * Ensure all required directories exist
 */
function ensureDirectories() {
  const dirs = [
    CONFIG.outputDir,
    CONFIG.componentsDir,
    path.join(CONFIG.outputDir, '../guides'),
    path.join(CONFIG.outputDir, '../examples'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

/**
 * Copy Vue components to VitePress components directory
 */
function copyComponents() {
  const components = [
    'ApiSearch.vue',
    'MethodSignature.vue',
    'CategoryCard.vue',
    'ApiPlayground.vue',
  ];

  components.forEach(component => {
    const src = path.join('./docs-examples/vitepress-components', component);
    const dest = path.join(CONFIG.componentsDir, component);

    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`📋 Copied component: ${component}`);
    }
  });
}

/**
 * Update VitePress config to include new routes
 */
function updateVitePressConfig() {
  const configPath = path.join(CONFIG.vitepressDir, 'docs/.vitepress/config.ts');
  const config = fs.readFileSync(configPath, 'utf-8');

  // Check if API section already exists
  if (!config.includes('/embed/api/')) {
    console.log('📝 Updating VitePress config...');

    // Add API section to sidebar
    const updatedConfig = config.replace(
      "{ text: 'JavaScript SDK', link: '/embed/javascript' },",
      `{ text: 'JavaScript SDK', link: '/embed/javascript' },
            {
              text: 'API Reference',
              collapsed: false,
              items: [
                { text: 'Overview', link: '/embed/api/' },
                { text: 'Score Management', link: '/embed/api/score-management' },
                { text: 'Playback Control', link: '/embed/api/playback' },
                { text: 'Parts & Instruments', link: '/embed/api/parts' },
                { text: 'Navigation', link: '/embed/api/navigation' },
                { text: 'Display & View', link: '/embed/api/display' },
                { text: 'Score Analysis', link: '/embed/api/analysis' },
                { text: 'Events System', link: '/embed/api/events' }
              ]
            },`,
    );

    fs.writeFileSync(configPath, updatedConfig);
    console.log('✅ VitePress config updated');
  }
}

/**
 * Generate TypeScript API documentation
 */
function generateApiDocs() {
  console.log('🔨 Building TypeScript definitions...');

  // Build the embed client if needed
  if (!fs.existsSync(CONFIG.typeDefsPath)) {
    console.log('Building embed client...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  // Run the documentation generator
  console.log('📚 Generating API documentation...');
  execSync('npx ts-node ./docs-examples/api-sync-implementation.ts', {
    stdio: 'inherit',
  });
}

/**
 * Create example guide pages
 */
function createGuidePages() {
  const guides = [
    {
      name: 'typescript.md',
      title: 'TypeScript Guide',
      content: `---
title: Using Flat Embed with TypeScript
description: Complete guide for TypeScript integration
---

# Using Flat Embed with TypeScript

The Flat Embed SDK includes comprehensive TypeScript definitions for a type-safe development experience.

## Installation

\`\`\`bash
npm install flat-embed
# or
yarn add flat-embed
\`\`\`

## Basic Usage

\`\`\`typescript
import Embed, { 
  EmbedParameters, 
  PartInfo, 
  NoteCursorPosition,
  PlaybackEvent 
} from 'flat-embed';

const config: EmbedParameters = {
  score: 'YOUR_SCORE_ID',
  embedParams: {
    appId: 'YOUR_APP_ID',
    mode: 'view'
  }
};

const embed = new Embed('container', config);
\`\`\`

## Type Definitions

### Core Types

#### EmbedParameters
Configuration options for initializing the embed:

\`\`\`typescript
interface EmbedParameters {
  score?: string;
  width?: string | number;
  height?: string | number;
  embedParams?: {
    appId: string;
    mode?: 'view' | 'edit';
    controlsPosition?: 'top' | 'bottom' | 'hidden';
    // ... more options
  };
}
\`\`\`

### Working with Events

\`\`\`typescript
// Type-safe event handling
embed.on('playbackPosition', (position: PlaybackPosition) => {
  console.log('Measure:', position.currentMeasure);
  console.log('Quarter:', position.quarterFromMeasureStart);
});

embed.on('cursorPosition', (position: NoteCursorPosition) => {
  console.log('Part:', position.partIdx);
  console.log('Note:', position.noteIdx);
});
\`\`\`

### Method Return Types

All async methods return properly typed Promises:

\`\`\`typescript
// Loading scores
const loadResult: Promise<void> = embed.loadFlatScore('SCORE_ID');

// Getting parts information
const parts: Promise<PartInfo[]> = embed.getParts();

// Exporting scores
const musicXml: Promise<string | Uint8Array> = embed.getMusicXML({ 
  compressed: true 
});
\`\`\`

## Advanced Patterns

### Custom Type Guards

\`\`\`typescript
function isCompressedMusicXML(
  result: string | Uint8Array
): result is Uint8Array {
  return result instanceof Uint8Array;
}

const xml = await embed.getMusicXML({ compressed: true });
if (isCompressedMusicXML(xml)) {
  // Handle compressed MXL file
  const blob = new Blob([xml], { 
    type: 'application/vnd.recordare.musicxml+xml' 
  });
}
\`\`\`

### Error Handling

\`\`\`typescript
try {
  await embed.loadFlatScore('SCORE_ID');
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to load score:', error.message);
  }
}
\`\`\`
`,
    },
    {
      name: 'react.md',
      title: 'React Integration',
      content: `---
title: Using Flat Embed with React
description: Integration guide for React applications
---

# Using Flat Embed with React

## Installation

\`\`\`bash
npm install flat-embed react react-dom
\`\`\`

## Basic React Component

\`\`\`typescript
import React, { useEffect, useRef } from 'react';
import Embed from 'flat-embed';

interface FlatEmbedProps {
  scoreId: string;
  appId: string;
  width?: string;
  height?: string;
  onReady?: (embed: Embed) => void;
}

export const FlatEmbed: React.FC<FlatEmbedProps> = ({
  scoreId,
  appId,
  width = '100%',
  height = '400px',
  onReady
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<Embed | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const embed = new Embed(containerRef.current, {
      score: scoreId,
      width,
      height,
      embedParams: { appId }
    });

    embedRef.current = embed;

    embed.ready().then(() => {
      onReady?.(embed);
    });

    return () => {
      // Cleanup if needed
    };
  }, [scoreId, appId]);

  return <div ref={containerRef} />;
};
\`\`\`

## Custom Hook

\`\`\`typescript
import { useEffect, useRef, useState } from 'react';
import Embed from 'flat-embed';

export function useFlatEmbed(
  containerId: string,
  config: EmbedParameters
) {
  const embedRef = useRef<Embed | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const embed = new Embed(container, config);
    embedRef.current = embed;

    embed.ready().then(() => setIsReady(true));

    return () => {
      embedRef.current = null;
      setIsReady(false);
    };
  }, [containerId]);

  return {
    embed: embedRef.current,
    isReady
  };
}
\`\`\`

## Complete Example

\`\`\`typescript
import React, { useState } from 'react';
import { FlatEmbed } from './FlatEmbed';

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [embed, setEmbed] = useState<Embed | null>(null);

  const handleReady = (embedInstance: Embed) => {
    setEmbed(embedInstance);
    
    // Set up event listeners
    embedInstance.on('play', () => setIsPlaying(true));
    embedInstance.on('pause', () => setIsPlaying(false));
    embedInstance.on('stop', () => setIsPlaying(false));
  };

  const togglePlayback = async () => {
    if (!embed) return;
    
    if (isPlaying) {
      await embed.pause();
    } else {
      await embed.play();
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    if (!embed) return;
    
    setVolume(newVolume);
    await embed.setMasterVolume(newVolume);
  };

  return (
    <div>
      <FlatEmbed
        scoreId="YOUR_SCORE_ID"
        appId="YOUR_APP_ID"
        onReady={handleReady}
      />
      
      <div className="controls">
        <button onClick={togglePlayback}>
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
\`\`\`
`,
    },
  ];

  guides.forEach(guide => {
    const filePath = path.join(CONFIG.outputDir, '../guides', guide.name);
    fs.writeFileSync(filePath, guide.content);
    console.log(`📄 Created guide: ${guide.name}`);
  });
}

/**
 * Main build function
 */
async function build() {
  console.log('🚀 Starting documentation build...\n');

  try {
    // Step 1: Ensure directories
    ensureDirectories();

    // Step 2: Copy components
    copyComponents();

    // Step 3: Update VitePress config
    updateVitePressConfig();

    // Step 4: Generate API docs from TypeScript
    generateApiDocs();

    // Step 5: Create guide pages
    createGuidePages();

    console.log('\n✨ Documentation build complete!');
    console.log('\nNext steps:');
    console.log('1. cd dev-docs');
    console.log('2. npm run dev');
    console.log('3. Open http://localhost:5173/developers/docs/embed/api/');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build
build();
