/**
 * Example implementation for automated TypeScript to Documentation sync
 * This would run during the build process to keep docs in sync with types
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import * as ts from 'typescript';

interface MethodInfo {
  name: string;
  signature: string;
  parameters: ParameterInfo[];
  returnType: string;
  description?: string;
  examples?: string[];
  category?: string;
}

interface ParameterInfo {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
  defaultValue?: string;
}

// Method categories mapping
const METHOD_CATEGORIES = {
  'score-management': [
    'loadFlatScore',
    'loadMusicXML',
    'loadMIDI',
    'loadJSON',
    'getMusicXML',
    'getJSON',
    'getPNG',
    'getMIDI',
    'getScoreMeta',
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
  events: ['on', 'off', 'ready'],
};

/**
 * Parse TypeScript definitions and extract method information
 */
export function parseTypeScriptDefinitions(filePath: string): MethodInfo[] {
  const sourceCode = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);

  const methods: MethodInfo[] = [];
  const typeChecker = ts.createProgram([filePath], {}).getTypeChecker();

  function visit(node: ts.Node) {
    if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node)) {
      const method = extractMethodInfo(node, typeChecker);
      if (method) {
        // Assign category
        for (const [category, methodNames] of Object.entries(METHOD_CATEGORIES)) {
          if (methodNames.includes(method.name)) {
            method.category = category;
            break;
          }
        }
        methods.push(method);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return methods;
}

/**
 * Extract method information from a TypeScript node
 */
function extractMethodInfo(
  node: ts.MethodDeclaration | ts.MethodSignature,
  typeChecker: ts.TypeChecker,
): MethodInfo | null {
  const name = node.name?.getText() || '';
  if (!name) return null;

  const signature = typeChecker.getSignatureFromDeclaration(node);
  if (!signature) return null;

  const returnType = typeChecker.typeToString(signature.getReturnType());

  const parameters: ParameterInfo[] = node.parameters.map(param => {
    const paramType = param.type ? param.type.getText() : 'any';

    return {
      name: param.name.getText(),
      type: cleanType(paramType),
      optional: !!param.questionToken,
      defaultValue: param.initializer?.getText(),
    };
  });

  // Build method signature
  const paramStrings = parameters.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`);
  const methodSignature = `${name}(${paramStrings.join(', ')}): ${cleanType(returnType)}`;

  // Extract JSDoc
  const jsDoc = extractJSDoc(node);

  return {
    name,
    signature: methodSignature,
    parameters,
    returnType: cleanType(returnType),
    description: jsDoc.description,
    examples: jsDoc.examples,
  };
}

/**
 * Clean up TypeScript type strings for documentation
 */
function cleanType(type: string): string {
  return type
    .replace(/Promise<(.+)>/, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract JSDoc comments
 */
function extractJSDoc(node: ts.Node): { description?: string; examples?: string[] } {
  const jsDocComments = ts.getJSDocCommentsAndTags(node);
  let description = '';
  const examples: string[] = [];

  jsDocComments.forEach(jsDoc => {
    if (ts.isJSDoc(jsDoc) && jsDoc.comment) {
      description =
        typeof jsDoc.comment === 'string' ? jsDoc.comment : jsDoc.comment.map(c => c.text).join('');
    }
  });

  return { description, examples };
}

/**
 * Generate markdown documentation for a category
 */
export function generateCategoryMarkdown(category: string, methods: MethodInfo[]): string {
  const categoryTitles: Record<string, string> = {
    'score-management': 'Score Management',
    playback: 'Playback Control',
    parts: 'Parts & Instruments',
    navigation: 'Navigation & Cursor',
    display: 'Display & View',
    analysis: 'Score Analysis',
    tracks: 'Audio/Video Tracks',
    events: 'Events System',
  };

  const title = categoryTitles[category] || category;

  let markdown = `---
title: ${title}
description: ${methods.length} methods for ${title.toLowerCase()}
---

# ${title}

<script setup>
import MethodSignature from '../../.vitepress/components/MethodSignature.vue'
import ApiPlayground from '../../.vitepress/components/ApiPlayground.vue'
</script>

## Overview

This section contains ${methods.length} methods related to ${title.toLowerCase()}.

`;

  // Add method documentation
  methods.forEach(method => {
    markdown += generateMethodMarkdown(method);
  });

  // Add related links
  markdown += `
## Related Sections

`;

  Object.entries(categoryTitles).forEach(([cat, title]) => {
    if (cat !== category) {
      markdown += `- [${title}](./${cat}.md)\n`;
    }
  });

  return markdown;
}

/**
 * Generate markdown for a single method
 */
function generateMethodMarkdown(method: MethodInfo): string {
  let markdown = `
## ${method.name}()

<MethodSignature 
  method="${method.name}"
  signature="${method.signature}"
  returns="${method.returnType}"
/>

${method.description || 'No description available.'}

`;

  if (method.parameters.length > 0) {
    markdown += `### Parameters\n\n`;
    method.parameters.forEach(param => {
      markdown += `- **${param.name}** `;
      if (param.optional) markdown += '*(optional)* ';
      markdown += `\`${param.type}\``;
      if (param.defaultValue) markdown += ` = \`${param.defaultValue}\``;
      if (param.description) markdown += `: ${param.description}`;
      markdown += '\n';
    });
    markdown += '\n';
  }

  markdown += `### Returns

\`${method.returnType}\`

### Example

\`\`\`typescript
// Example usage of ${method.name}
await embed.${method.name}(${method.parameters
    .filter(p => !p.optional)
    .map(p => `/* ${p.name} */`)
    .join(', ')});
\`\`\`

<ApiPlayground 
  method="${method.name}"
  interactive="true"
/>

---

`;

  return markdown;
}

/**
 * Main function to generate all documentation
 */
export async function generateApiDocs() {
  console.log('🔄 Parsing TypeScript definitions...');
  const methods = parseTypeScriptDefinitions('./dist/embed.d.ts');

  console.log(`✅ Found ${methods.length} methods`);

  // Group methods by category
  const methodsByCategory = new Map<string, MethodInfo[]>();

  methods.forEach(method => {
    const category = method.category || 'uncategorized';
    if (!methodsByCategory.has(category)) {
      methodsByCategory.set(category, []);
    }
    methodsByCategory.get(category)!.push(method);
  });

  // Generate markdown for each category
  console.log('📝 Generating documentation...');

  methodsByCategory.forEach((categoryMethods, category) => {
    const markdown = generateCategoryMarkdown(category, categoryMethods);
    const outputPath = `./docs/embed/api/${category}.md`;
    writeFileSync(outputPath, markdown);
    console.log(`  ✓ Generated ${outputPath}`);
  });

  // Generate index with all methods
  generateApiIndex(methods);

  console.log('✨ Documentation generation complete!');
}

/**
 * Generate the API index page
 */
function generateApiIndex(methods: MethodInfo[]) {
  const indexMarkdown = `---
title: API Reference
description: Complete reference for all ${methods.length} Embed SDK methods
---

# API Reference

<script setup>
import ApiSearch from '../../.vitepress/components/ApiSearch.vue'
import CategoryCard from '../../.vitepress/components/CategoryCard.vue'
</script>

<ApiSearch :methods='${JSON.stringify(
    methods.map(m => ({
      name: m.name,
      signature: m.signature,
      category: m.category,
      description: m.description,
    })),
  )}' />

## Browse by Category

<div class="category-grid">
${Object.entries(METHOD_CATEGORIES)
  .map(
    ([category, methodNames]) => `
  <CategoryCard
    category="${category}"
    :methods='${JSON.stringify(methodNames)}'
    link="./${category}.html"
  />
`,
  )
  .join('')}
</div>

## All Methods

| Method | Category | Description |
|--------|----------|-------------|
${methods
  .map(
    m =>
      `| [\`${m.name}()\`](./${m.category}.html#${m.name.toLowerCase()}) | ${m.category} | ${m.description?.split('.')[0] || '-'} |`,
  )
  .join('\n')}
`;

  writeFileSync('./docs/embed/api/index.md', indexMarkdown);
}

// Run if called directly
if (require.main === module) {
  generateApiDocs().catch(console.error);
}
