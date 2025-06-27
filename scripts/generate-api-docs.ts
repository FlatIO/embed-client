#!/usr/bin/env ts-node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

interface MethodInfo {
  name: string;
  signature: string;
  parameters: ParameterInfo[];
  returnType: string;
  description?: string;
  category?: string;
}

interface ParameterInfo {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

// Method categories
const METHOD_CATEGORIES: Record<string, string[]> = {
  events: ['on', 'off'],
  core: ['ready', 'getEmbedConfig', 'setEditorConfig'],
  'score-management': [
    'loadFlatScore',
    'loadMusicXML',
    'loadMIDI',
    'loadJSON',
    'getMusicXML',
    'getJSON',
    'getPNG',
    'getMIDI',
    'getFlatScoreMetadata',
  ],
  playback: [
    'play',
    'pause',
    'stop',
    'mute',
    'getMasterVolume',
    'setMasterVolume',
    'getPlaybackSpeed',
    'setPlaybackSpeed',
    'getMetronomeMode',
    'setMetronomeMode',
  ],
  parts: [
    'getParts',
    'getDisplayedParts',
    'setDisplayedParts',
    'getPartVolume',
    'setPartVolume',
    'mutePart',
    'unmutePart',
    'setPartSoloMode',
    'unsetPartSoloMode',
    'getPartSoloMode',
    'getPartReverb',
    'setPartReverb',
  ],
  navigation: [
    'getCursorPosition',
    'setCursorPosition',
    'goLeft',
    'goRight',
    'scrollToCursor',
    'focusScore',
  ],
  display: ['fullscreen', 'getZoom', 'setZoom', 'getAutoZoom', 'setAutoZoom', 'print'],
  analysis: [
    'getMeasureDetails',
    'getNoteDetails',
    'getNbMeasures',
    'getMeasuresUuids',
    'getNbParts',
    'getPartsUuids',
    'getMeasureVoicesUuids',
    'getMeasureNbNotes',
    'getNoteData',
    'playbackPositionToNoteIdx',
  ],
  tracks: ['setTrack', 'useTrack', 'seekTrackTo'],
};

const CATEGORY_INFO: Record<string, { title: string; description: string }> = {
  'score-management': {
    title: 'Score Management',
    description: 'Methods for loading and exporting scores in various formats',
  },
  playback: {
    title: 'Playback Control',
    description: 'Control playback, volume, speed, and metronome settings',
  },
  parts: {
    title: 'Parts & Instruments',
    description: 'Manage individual parts, instruments, and their audio settings',
  },
  navigation: {
    title: 'Navigation & Cursor',
    description: 'Navigate through the score and control cursor position',
  },
  display: {
    title: 'Display & View',
    description: 'Control the visual presentation of the score',
  },
  analysis: {
    title: 'Score Data & Structure',
    description: 'Access and query score structure, measures, notes, and metadata',
  },
  tracks: {
    title: 'Audio/Video Tracks',
    description: 'Synchronize external audio or video with the score',
  },
  core: {
    title: 'Core Methods',
    description: 'Essential methods for embed initialization and configuration',
  },
  events: {
    title: 'Event System',
    description: 'Subscribe to and handle embed events',
  },
};

function parseTypeDefinitions(filePath: string): MethodInfo[] {
  const content = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  const methods: MethodInfo[] = [];

  function extractJSDoc(node: ts.Node): string | undefined {
    const fullText = node.getFullText();
    const commentRanges = ts.getLeadingCommentRanges(fullText, 0);

    if (commentRanges && commentRanges.length > 0) {
      const comment = fullText.substring(commentRanges[0].pos, commentRanges[0].end);
      // Extract description from JSDoc
      const lines = comment.split('\n');
      const descLines: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        // Skip JSDoc markers and param/return tags
        if (
          trimmed === '/**' ||
          trimmed === '*/' ||
          trimmed.includes('@param') ||
          trimmed.includes('@return') ||
          trimmed.includes('@reject') ||
          trimmed.includes('@fulfill') ||
          trimmed.includes('@fullfill') ||
          trimmed.includes('TODO:')
        ) {
          continue;
        }
        // Remove leading asterisk and whitespace
        const cleaned = line.replace(/^\s*\*\s?/, '').trim();
        if (cleaned && !cleaned.includes('{object}') && !cleaned.includes('{array}')) {
          descLines.push(cleaned);
        }
      }

      return descLines.join(' ').trim();
    }
    return undefined;
  }

  function visit(node: ts.Node) {
    if (ts.isMethodSignature(node) || ts.isMethodDeclaration(node)) {
      const name = node.name?.getText() || '';
      if (!name || name === 'constructor' || name === 'call') return;

      const parameters: ParameterInfo[] = node.parameters.map(param => ({
        name: param.name.getText(),
        type: param.type?.getText() || 'any',
        optional: !!param.questionToken,
        description: extractJSDoc(param),
      }));

      const returnType = node.type?.getText() || 'void';
      const description = extractJSDoc(node);

      // Find category
      let category = 'uncategorized';
      for (const [cat, methodNames] of Object.entries(METHOD_CATEGORIES)) {
        if (methodNames.includes(name)) {
          category = cat;
          break;
        }
      }

      // Build signature with better formatting
      let signature: string;
      if (parameters.length === 0) {
        signature = `${name}(): ${returnType}`;
      } else if (parameters.length === 1 && parameters[0].type.includes('{')) {
        // Format object parameters on multiple lines
        const param = parameters[0];
        const cleanType = param.type.replace(/\s+/g, ' ').trim();
        signature = `${name}(${param.name}${param.optional ? '?' : ''}: ${cleanType}): ${returnType}`;
      } else {
        const paramStrs = parameters.map(p => {
          const cleanType = p.type.replace(/\s+/g, ' ').trim();
          return `${p.name}${p.optional ? '?' : ''}: ${cleanType}`;
        });
        signature = `${name}(${paramStrs.join(', ')}): ${returnType}`;
      }

      methods.push({
        name,
        signature,
        parameters,
        returnType,
        description,
        category,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return methods;
}

function generateMethodMarkdown(method: MethodInfo): string {
  let md = `### ${method.name}() {#${method.name.toLowerCase()}}

${method.description || 'No description available.'}

\`\`\`typescript
${method.signature}
\`\`\`

`;

  if (method.parameters.length > 0) {
    md += '**Parameters:**\n\n';
    method.parameters.forEach(param => {
      // Check if parameter is an object with properties
      if (param.type.includes('{') && param.type.includes('}')) {
        // Extract object properties
        const objMatch = param.type.match(/\{([^}]+)\}/);
        if (objMatch) {
          const props = objMatch[1]
            .split(';')
            .map(p => p.trim())
            .filter(p => p);
          props.forEach(prop => {
            const [propName, propType] = prop.split(':').map(s => s.trim());
            if (propName && propType) {
              md += `- \`${param.name}.${propName}\` - \`${propType}\`\n`;
            }
          });
        }
      } else {
        md += `- \`${param.name}\``;
        if (param.optional) md += ' *(optional)*';
        md += ` - \`${param.type}\``;
        if (param.description) md += `: ${param.description}`;
        md += '\n';
      }
    });
    md += '\n';
  }

  md += `**Returns:** \`${method.returnType}\`\n\n`;

  // Generate better examples
  let exampleCall = '';
  let exampleSetup = '';

  if (method.parameters.length === 0) {
    exampleCall = `embed.${method.name}()`;
  } else {
    const exampleParams = method.parameters.map(p => {
      // Handle object parameters
      if (p.type.includes('{') && p.type.includes('}')) {
        const objMatch = p.type.match(/\{([^}]+)\}/);
        if (objMatch) {
          const props = objMatch[1]
            .split(';')
            .map(prop => prop.trim())
            .filter(prop => prop);
          const objLines: string[] = [];

          props.forEach(prop => {
            const [propNameRaw, propType] = prop.split(':').map(s => s.trim());
            if (propNameRaw && propType) {
              // Remove optional marker from property name
              const isOptional = propNameRaw.endsWith('?');
              const propName = propNameRaw.replace('?', '');

              let value = '';
              if (propType.includes('string')) {
                if (propName === 'partUuid') {
                  value = "'part-123-uuid'";
                } else if (propName === 'measureUuid') {
                  value = "'measure-456-uuid'";
                } else if (propName === 'voiceUuid') {
                  value = "'voice-789-uuid'";
                } else if (propName === 'id') {
                  value = "'track-id'";
                } else if (propName === 'score') {
                  value = "'5ce6a27f052b2a74a91f4a6d'";
                } else if (propName === 'sharingKey') {
                  value = "'sharing-key-123'";
                } else {
                  value = `'${propName}-value'`;
                }
              } else if (propType.includes('number')) {
                if (propName === 'volume') value = '75';
                else if (propName === 'reverberation') value = '50';
                else if (propName === 'noteIdx') value = '0';
                else if (propName === 'time') value = '10.5';
                else if (propName === 'dpi') value = '150';
                else value = '1';
              } else if (propType.includes('boolean')) {
                value = 'true';
              }

              // Only include optional properties sometimes for better examples
              if (!isOptional || propName === 'sharingKey') {
                objLines.push(`  ${propName}: ${value}`);
              }
            }
          });

          if (objLines.length === 1) {
            return `{ ${objLines[0].trim()} }`;
          }
          return `{\n${objLines.join(',\n')}\n}`;
        }
      }

      // Handle simple types
      if (p.type.includes('string[]')) {
        if (p.name === 'parts') {
          exampleSetup = `// Get available parts first\nconst parts = await embed.getParts();\nconst partUuids = parts.map(p => p.uuid);\n\n`;
          return 'partUuids.slice(0, 2)';
        }
        return `['item1', 'item2']`;
      }
      if (p.type.includes('string')) {
        if (p.name === 'score') return `'5ce6a27f052b2a74a91f4a6d'`;
        if (p.name === 'event') return `'play'`;
        if (p.name === 'partUuid') return `'part-123-uuid'`;
        if (p.name === 'mode') return `'edit'`;
        return `'value'`;
      }
      if (p.type.includes('number')) {
        if (p.name === 'volume') return `75`;
        if (p.name === 'zoom') return `1.5`;
        if (p.name === 'speed') return `0.75`;
        return `1`;
      }
      if (p.type.includes('boolean')) {
        if (p.name === 'active') return 'true';
        if (p.name === 'state') return 'true';
        if (p.name === 'mute') return 'false';
        return `true`;
      }
      if (p.type.includes('Uint8Array')) {
        exampleSetup = `// Load a file first\nconst fileBuffer = await fetch('/path/to/score.mid').then(r => r.arrayBuffer());\nconst uint8Array = new Uint8Array(fileBuffer);\n\n`;
        return `uint8Array`;
      }
      if (p.type === 'MetronomeMode') return `1`; // CONTINUOUS
      if (p.type === 'NoteCursorPositionOptional') {
        return `{\n  partIdx: 0,\n  measureIdx: 2,\n  noteIdx: 1\n}`;
      }
      if (p.type === 'ScoreTrackConfiguration') {
        return `{\n  id: 'backing-track',\n  type: 'audio',\n  url: 'https://example.com/track.mp3',\n  synchronizationPoints: [\n    { type: 'measure', measure: 0, time: 0 }\n  ]\n}`;
      }
      return `{}`;
    });

    // Format the call based on parameter complexity
    const hasComplexParams = exampleParams.some(p => p.includes('\n'));
    if (hasComplexParams && method.parameters.length === 1) {
      exampleCall = `embed.${method.name}(${exampleParams[0]})`;
    } else if (hasComplexParams) {
      exampleCall = `embed.${method.name}(\n  ${exampleParams.join(',\n  ')}\n)`;
    } else {
      exampleCall = `embed.${method.name}(${exampleParams.join(', ')})`;
    }
  }

  // Add result handling for certain methods
  let resultHandling = '';
  if (method.returnType.includes('Promise')) {
    if (method.name.startsWith('get') || method.name === 'ready') {
      const resultVar =
        method.name.replace(/^get/, '').charAt(0).toLowerCase() + method.name.slice(4);
      resultHandling = `const ${resultVar} = await ${exampleCall};\nconsole.log(${resultVar});`;
      exampleCall = resultHandling;
    } else {
      exampleCall = `await ${exampleCall};`;
    }
  } else {
    exampleCall = `${exampleCall};`;
  }

  md += `**Example:**

\`\`\`typescript
const embed = new Embed('container', config);
${exampleSetup}${exampleCall}
\`\`\`

---

`;

  return md;
}

function generateCategoryPage(category: string, methods: MethodInfo[]): string {
  const info = CATEGORY_INFO[category];

  // Special handling for events page - don't overwrite it
  if (category === 'events') {
    return ''; // Skip generating events page as it has custom content
  }

  return `---
title: ${info.title}
description: ${info.description}
outline: deep
---

# ${info.title}

${info.description}

## Methods

${methods.map(method => generateMethodMarkdown(method)).join('\n')}

`;
}

function generateIndexPage(allMethods: MethodInfo[]): string {
  const methodsByCategory = new Map<string, MethodInfo[]>();

  allMethods.forEach(method => {
    const category = method.category || 'uncategorized';
    if (!methodsByCategory.has(category)) {
      methodsByCategory.set(category, []);
    }
    methodsByCategory.get(category)!.push(method);
  });

  // Create a simple method list for searching (no Vue component)
  const methodsTable = allMethods
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(m => {
      const desc = m.description?.split('.')[0] || '-';
      return `| [\`${m.name}()\`](./${m.category}.md#${m.name.toLowerCase()}) | ${desc} |`;
    })
    .join('\n');

  return `---
title: API Reference
description: Complete reference for the Flat Embed JavaScript SDK
---

# API Reference

The Flat Embed SDK provides ${allMethods.length} methods to control and interact with embedded sheet music.

## Quick Navigation

Press \`⌘ + K\` (Mac) or \`Ctrl + K\` (Windows/Linux) to search for specific methods.

## Browse by Category

${Array.from(methodsByCategory.entries())
  .map(([category, methods]) => {
    const info = CATEGORY_INFO[category] || { title: category, description: 'Methods' };
    const categoryMethodsTable = methods
      .map(m => {
        const desc = m.description?.split('.')[0] || '';
        return `| [\`${m.name}()\`](./${category}.md#${m.name.toLowerCase()}) | ${desc} |`;
      })
      .join('\n');

    return `
### [${info.title}](./${category}.md)
${info.description} (${methods.length} methods)

| Method | Description |
|--------|-------------|
${categoryMethodsTable}
`;
  })
  .join('\n')}

## All Methods

| Method | Description |
|--------|-------------|
${methodsTable}
`;
}

async function main() {
  console.log('🔄 Parsing TypeScript definitions...');

  const typeDefsPath = join(__dirname, '../dist/embed.d.ts');
  if (!existsSync(typeDefsPath)) {
    console.error('❌ TypeScript definitions not found. Run `npm run build` first.');
    process.exit(1);
  }

  const methods = parseTypeDefinitions(typeDefsPath);
  console.log(`✅ Found ${methods.length} methods`);

  // Group by category
  const methodsByCategory = new Map<string, MethodInfo[]>();
  methods.forEach(method => {
    const category = method.category || 'uncategorized';
    if (!methodsByCategory.has(category)) {
      methodsByCategory.set(category, []);
    }
    methodsByCategory.get(category)!.push(method);
  });

  // Generate documentation
  const outputDir = join(__dirname, '../../dev-docs/docs/embed/api');

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  // Generate category pages
  console.log('📝 Generating category pages...');
  methodsByCategory.forEach((categoryMethods, category) => {
    // Skip events page entirely - it has custom content
    if (category === 'events') {
      console.log(`  ⏭  Skipped ${category}.md (custom content preserved)`);
      return;
    }

    const content = generateCategoryPage(category, categoryMethods);
    const outputPath = join(outputDir, `${category}.md`);
    writeFileSync(outputPath, content);
    console.log(`  ✓ ${category}.md (${categoryMethods.length} methods)`);
  });

  // Generate index
  console.log('📝 Generating API index...');
  const indexContent = generateIndexPage(methods);
  writeFileSync(join(outputDir, 'index.md'), indexContent);
  console.log('  ✓ index.md');

  console.log('\n✨ Documentation generation complete!');
}

main().catch(console.error);
