#!/usr/bin/env ts-node

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import * as ts from 'typescript';

// Map to store complex type definitions
const complexTypes = new Map<string, string>();

interface MethodInfo {
  name: string;
  signature: string;
  parameters: ParameterInfo[];
  returnType: string;
  description?: string;
  category?: string;
  examples?: string[];
  see?: string[];
  note?: string;
  throws?: string[];
}

interface ParameterInfo {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
  properties?: PropertyInfo[];
}

interface PropertyInfo {
  name: string;
  type: string;
  optional: boolean;
  description?: string;
}

// Method categories
function extractJSDoc(node: ts.Node): {
  description?: string;
  examples?: string[];
  see?: string[];
  note?: string;
  throws?: string[];
  hasParams?: boolean;
} {
  const fullText = node.getFullText();
  const commentRanges = ts.getLeadingCommentRanges(fullText, 0);

  if (commentRanges && commentRanges.length > 0) {
    const comment = fullText.substring(commentRanges[0].pos, commentRanges[0].end);
    // Extract all JSDoc content
    const lines = comment.split('\n');
    const descLines: string[] = [];
    const examples: string[] = [];
    const see: string[] = [];
    const throws: string[] = [];
    let note: string | undefined;
    let currentTag = 'description';
    let currentContent: string[] = [];
    let hasParams = false;
    const paramNames: string[] = [];
    let inParamBlock = false;

    for (const line of lines) {
      const trimmed = line.trim();
      // Skip JSDoc markers
      if (trimmed === '/**' || trimmed === '*/') {
        continue;
      }

      // Check if we're entering a @param block
      if (trimmed.includes('@param')) {
        hasParams = true;
        inParamBlock = true;
        // Extract parameter name from @param tag
        // Handle both "@param {type} name" and "@param name"
        const paramMatch = trimmed.match(/@param\s+(?:\{[^}]+\}\s+)?(\w+(?:\.\w+)?)/);
        if (paramMatch) {
          paramNames.push(paramMatch[1]);
        }
        continue;
      }

      // Skip other tags that are handled separately
      if (
        trimmed.includes('@return') ||
        trimmed.includes('@reject') ||
        trimmed.includes('@fulfill') ||
        trimmed.includes('@fullfill') ||
        trimmed.includes('TODO:')
      ) {
        inParamBlock = false;
        continue;
      }

      // If we're in a param block and this line is indented (part of param description), skip it
      if (inParamBlock && trimmed && !trimmed.startsWith('* @') && !trimmed.startsWith('*@')) {
        // This is a continuation of the @param description
        continue;
      } else if (trimmed.startsWith('* @') || trimmed.startsWith('*@')) {
        // We've hit another tag, so we're no longer in a param block
        inParamBlock = false;
      }

      // Remove leading asterisk and whitespace
      const cleaned = line.replace(/^\s*\*\s?/, '');

      // Check for tag changes
      if (trimmed.startsWith('* @example') || trimmed.startsWith('*@example')) {
        // Save previous example if any
        if (currentTag === 'example' && currentContent.length > 0) {
          examples.push(currentContent.join('\n').trim());
        }
        currentTag = 'example';
        currentContent = [];
        // Extract inline example if present
        const inlineExample = cleaned.replace('@example', '').trim();
        if (inlineExample) {
          currentContent.push(inlineExample);
        }
      } else if (trimmed.startsWith('* @see') || trimmed.startsWith('*@see')) {
        currentTag = 'see';
        const seeContent = cleaned.replace('@see', '').trim();
        if (seeContent) {
          see.push(seeContent);
        }
      } else if (trimmed.startsWith('* @note') || trimmed.startsWith('*@note')) {
        currentTag = 'note';
        const noteContent = cleaned.replace('@note', '').trim();
        if (noteContent) {
          note = noteContent;
        }
      } else if (trimmed.startsWith('* @throws') || trimmed.startsWith('*@throws')) {
        currentTag = 'throws';
        const throwsContent = cleaned.replace('@throws', '').trim();
        if (throwsContent) {
          throws.push(throwsContent);
        }
      } else {
        // Continue with current tag
        if (
          currentTag === 'description' &&
          cleaned.trim() &&
          !cleaned.includes('{object}') &&
          !cleaned.includes('{array}')
        ) {
          // Preserve list items that start with "- " by adding them on new lines
          if (cleaned.trim().match(/^-\s+/)) {
            // This is a list item - format it nicely
            let listItem = cleaned.trim();

            // Format numbered enum values (e.g., "- 0: COUNT_IN - Description")
            const enumMatch = listItem.match(/^-\s+(\d+):\s+([A-Z_]+)\s*-?\s*(.*)$/);
            if (enumMatch) {
              const [, num, constant, desc] = enumMatch;
              listItem = `- \`${num}\`: **${constant}** - ${desc}`;
            }
            // Format numeric values with descriptions (e.g., "- 0.2: 20% speed (very slow)")
            else if (listItem.match(/^-\s+[\d.]+:\s+/)) {
              const numericMatch = listItem.match(/^-\s+([\d.]+):\s+(.*)$/);
              if (numericMatch) {
                const [, num, desc] = numericMatch;
                listItem = `- \`${num}\`: ${desc}`;
              }
            }
            // Format parameter descriptions (e.g., "- partUuid: The unique identifier")
            else {
              const paramMatch = listItem.match(/^-\s+`?(\w+)`?:\s+(.*)$/);
              if (paramMatch) {
                const [, param, desc] = paramMatch;
                // Add backticks to quoted values in the description
                let formattedDesc = desc;
                // Replace 'value' patterns with `value`
                formattedDesc = formattedDesc.replace(/'([^']+)'/g, '`$1`');
                listItem = `- \`${param}\`: ${formattedDesc}`;
              } else {
                // Handle list items without parameter names (just descriptions)
                // Replace 'value' patterns with `value`
                listItem = listItem.replace(/'([^']+)'/g, '`$1`');
              }
            }

            descLines.push(`\n${listItem}`);
          } else {
            descLines.push(cleaned.trim());
          }
        } else if (currentTag === 'example') {
          currentContent.push(cleaned);
        } else if (currentTag === 'note' && cleaned.trim()) {
          note = (note ? `${note} ` : '') + cleaned.trim();
        }
      }
    }

    // Add the last example if any
    if (currentTag === 'example' && currentContent.length > 0) {
      examples.push(currentContent.join('\n').trim());
    }

    // Join description lines, preserving newlines for list items
    let description: string | undefined;
    if (descLines.length > 0) {
      const parts: string[] = [];
      let currentPart = '';

      for (const line of descLines) {
        if (line.startsWith('\n')) {
          // This is a list item, add current part and start new
          if (currentPart) {
            parts.push(currentPart);
          }

          const lineContent = line.trim();

          // Filter out parameter descriptions if we have @param tags
          if (hasParams && lineContent.startsWith('-')) {
            // Check if this list item is describing a parameter
            const isParamDesc = paramNames.some(paramName => {
              // Check for patterns like "- paramName:" or "- `paramName`:"
              return lineContent.match(new RegExp(`^-\\s+\`?${paramName}\`?:`));
            });

            if (isParamDesc) {
              // Skip this line as it's a parameter description that will be in Parameters section
              currentPart = '';
              continue;
            }
          }

          parts.push(lineContent);
          currentPart = '';
        } else {
          // Regular text, accumulate with space
          currentPart = currentPart ? `${currentPart} ${line}` : line;
        }
      }

      // Add any remaining text
      if (currentPart) {
        parts.push(currentPart);
      }

      description = parts.join('\n').trim();
    }

    return {
      description: description,
      examples: examples.length > 0 ? examples : undefined,
      see: see.length > 0 ? see : undefined,
      note: note,
      throws: throws.length > 0 ? throws : undefined,
      hasParams: hasParams,
    };
  }
  return {};
}

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
    'getPDF',
    'getMIDI',
    'getMP3',
    'getWAV',
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
  data: [
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
  data: {
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

function parseTypeFile(filePath: string) {
  const content = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function visit(node: ts.Node) {
    // Collect interface definitions
    if (ts.isInterfaceDeclaration(node)) {
      const name = node.name.getText();
      let typeDoc = `**${name}**\n\n`;

      // Extract JSDoc if present
      const jsDoc = extractJSDoc(node);
      if (jsDoc.description) {
        typeDoc += `${jsDoc.description}\n\n`;
      }

      // Add properties
      if (node.members.length > 0) {
        typeDoc += 'Properties:\n';
        node.members.forEach(member => {
          if (ts.isPropertySignature(member) && member.name) {
            const propName = member.name.getText();
            const propType = member.type?.getText() || 'any';
            const optional = member.questionToken ? ' *(optional)*' : '';

            // Get JSDoc comment text directly
            let desc = '';
            const jsDocComment = (member as any).jsDoc?.[0]?.comment;
            if (jsDocComment) {
              // Extract text from JSDoc comment, removing /** and */ markers
              desc = jsDocComment.replace(/^\/\*\*\s*|\s*\*\/$/g, '').trim();
              desc = desc ? ` - ${desc}` : '';
            }

            typeDoc += `- \`${propName}\`${optional}: \`${propType}\`${desc}\n`;
          }
        });
      }

      complexTypes.set(name, typeDoc);
    }

    // Collect type aliases
    if (ts.isTypeAliasDeclaration(node)) {
      const name = node.name.getText();
      const type = node.type.getText();

      // For union types, format them nicely
      if (type.includes('|')) {
        const values = type.split('|').map(v => v.trim().replace(/['"]/g, ''));
        const typeDoc = `**${name}**\n\nPossible values: ${values.map(v => `\`${v}\``).join(', ')}`;
        complexTypes.set(name, typeDoc);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

function parseTypeDefinitions(filePath: string): MethodInfo[] {
  const content = readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  const methods: MethodInfo[] = [];

  function visit(node: ts.Node) {
    if (ts.isMethodSignature(node) || ts.isMethodDeclaration(node)) {
      const name = node.name?.getText() || '';
      if (!name || name === 'constructor' || name === 'call') return;

      const parameters: ParameterInfo[] = node.parameters.map(param => {
        let typeText = param.type?.getText() || 'any';
        const properties: PropertyInfo[] = [];

        // Extract property information from object types
        if (param.type && ts.isTypeLiteralNode(param.type)) {
          param.type.members.forEach(member => {
            if (ts.isPropertySignature(member) && member.name) {
              const propName = member.name.getText();
              const propType = member.type?.getText() || 'any';
              const propOptional = !!member.questionToken;
              const propJSDoc = extractJSDoc(member);

              properties.push({
                name: propName,
                type: propType,
                optional: propOptional,
                description: propJSDoc.description,
              });
            }
          });

          // Keep the original type text but clean it up
          // Don't simplify to 'object' - we want to preserve the type information
        }

        // Clean up type text that contains JSDoc comments
        if (typeText.includes('/**') && typeText.includes('*/')) {
          // Remove JSDoc comments from within the type definition
          typeText = typeText.replace(/\/\*\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '').trim();
          // Clean up extra whitespace
          typeText = typeText.replace(/\s+/g, ' ');
        }

        const paramJSDoc = extractJSDoc(param);
        return {
          name: param.name.getText(),
          type: typeText,
          optional: !!param.questionToken,
          description: paramJSDoc.description,
          properties,
        };
      });

      const returnType = node.type?.getText() || 'void';
      const jsDoc = extractJSDoc(node);

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
        description: jsDoc.description,
        category,
        examples: jsDoc.examples,
        see: jsDoc.see,
        note: jsDoc.note,
        throws: jsDoc.throws,
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return methods;
}

function loadMethodExample(methodName: string): string | null {
  const examplePath = join(__dirname, 'method-examples', `${methodName}.ts`);
  if (existsSync(examplePath)) {
    const content = readFileSync(examplePath, 'utf-8');
    // Remove any lines that are just comments at the start
    return content.trim();
  }
  return null;
}

function generateMethodMarkdown(method: MethodInfo): string {
  // Title
  let md = `### ${method.name}() {#${method.name.toLowerCase()}}\n\n`;

  // Description
  md += `${method.description || 'No description available.'}\n\n`;

  // Prototype
  md += `\`\`\`typescript\n${method.signature}\n\`\`\`\n\n`;

  // Parameters
  if (method.parameters.length > 0) {
    md += '**Parameters:**\n\n';
    method.parameters.forEach(param => {
      // Check if this is a complex type we have documentation for
      const cleanType = param.type.replace(/[\s\n]+/g, ' ').trim();
      const isComplexType = complexTypes.has(cleanType);

      // Use extracted properties if available
      if (param.properties && param.properties.length > 0) {
        param.properties.forEach(prop => {
          md += `- \`${param.name}.${prop.name}\``;
          if (prop.optional) md += ' *(optional)*';
          md += ` - \`${prop.type}\``;
          if (prop.description) {
            // Remove JSDoc comment markers from descriptions
            const cleanDesc = prop.description.replace(/\/\*\*\s*|\s*\*\//g, '').trim();
            md += `: ${cleanDesc}`;
          }
          md += '\n';
        });
      } else if (param.type.includes('{') && param.type.includes('}')) {
        // Fallback to regex extraction for object properties
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

        // If this is a complex type, add its documentation below
        if (isComplexType) {
          md += `\n<details>\n<summary>View <code>${cleanType}</code> type definition</summary>\n\n`;
          md += `${complexTypes.get(cleanType)}\n`;
          md += '</details>\n';
        }
      }
    });
    md += '\n';
  }

  // Returns
  md += `**Returns:** \`${method.returnType}\`\n`;

  // Check if return type is a complex type we have documentation for
  const cleanReturnType = method.returnType.replace(/[\s\n]+/g, ' ').trim();
  // Handle Promise<Type> by extracting the inner type
  const promiseMatch = cleanReturnType.match(/^Promise<(.+)>$/);
  const innerType = promiseMatch ? promiseMatch[1] : cleanReturnType;

  if (complexTypes.has(innerType)) {
    md += `\n<details>\n<summary>View <code>${innerType}</code> type definition</summary>\n\n`;
    md += `${complexTypes.get(innerType)}\n`;
    md += '</details>\n';
  }

  md += '\n';

  // Throws
  if (method.throws && method.throws.length > 0) {
    md += '**Throws:**\n\n';
    method.throws.forEach(t => {
      // Format error types in throws descriptions
      // e.g., "{TypeError} If the score format is invalid" -> "`TypeError` - If the score format is invalid"
      const throwsMatch = t.match(/^\{([^}]+)\}\s*(.*)$/);
      if (throwsMatch) {
        const [, errorType, description] = throwsMatch;
        md += `- \`${errorType}\` - ${description}\n`;
      } else {
        md += `- ${t}\n`;
      }
    });
    md += '\n';
  }

  // Examples
  if (method.examples && method.examples.length > 0) {
    md += '**Examples:**\n\n';
    method.examples.forEach((example, _idx) => {
      md += `\`\`\`typescript\n${example}\n\`\`\`\n\n`;
    });
  } else {
    // Check for custom example file
    const customExample = loadMethodExample(method.name);
    if (customExample) {
      md += `**Example:**

\`\`\`typescript
const embed = new Embed('container', config);

${customExample}
\`\`\`

`;
    } else {
      // Generate default example
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
                      value = "'00000000-0000-0000-0000-000000000001'";
                    } else if (propName === 'measureUuid') {
                      value = "'00000000-0000-0000-0000-000000000002'";
                    } else if (propName === 'voiceUuid') {
                      value = "'00000000-0000-0000-0000-000000000003'";
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
          if (p.type.includes('string | Uint8Array')) {
            // This will be handled by the custom example file if it exists
            return `data`;
          }
          if (p.type.includes('string')) {
            if (p.name === 'score' && method.name !== 'loadMusicXML')
              return `'5ce6a27f052b2a74a91f4a6d'`;
            if (p.name === 'event') return `'play'`;
            if (p.name === 'partUuid') return `'00000000-0000-0000-0000-000000000001'`;
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
            if (method.name === 'loadMIDI') {
              exampleSetup = `// Load a MIDI file\nconst fileBuffer = await fetch('/path/to/score.mid').then(r => r.arrayBuffer());\nconst uint8Array = new Uint8Array(fileBuffer);\n\n`;
            } else {
              exampleSetup = `// Load a file first\nconst fileBuffer = await fetch('/path/to/file').then(r => r.arrayBuffer());\nconst uint8Array = new Uint8Array(fileBuffer);\n\n`;
            }
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

`;
    }
  }

  // Note
  if (method.note) {
    md += `**Note:** ${method.note}\n\n`;
  }

  // See also
  if (method.see && method.see.length > 0) {
    md += '**See also:**\n\n';
    method.see.forEach(s => {
      // Parse @see references that might be {@link methodName} or {@link URL} format
      const linkMatch = s.match(/\{@link\s+([^}]+)\}/);
      if (linkMatch) {
        const linkedTarget = linkMatch[1].trim();

        // Check if it's a URL
        if (linkedTarget.startsWith('http://') || linkedTarget.startsWith('https://')) {
          // Create clean text for common Flat API URLs
          let linkText = linkedTarget;
          if (linkedTarget.includes('flat.io/developers/api/reference/#operation/')) {
            const operationName = linkedTarget.split('#operation/')[1];
            linkText = `Flat API Reference - ${operationName}`;
          } else if (linkedTarget.includes('flat.io/developers/')) {
            linkText = 'Flat Developers Documentation';
          }
          md += `- [${linkText}](${linkedTarget})\n`;
        } else {
          // It's a method reference
          md += `- [\`${linkedTarget}()\`](#${linkedTarget.toLowerCase()})`;
          const remaining = s.replace(linkMatch[0], '').trim();
          if (remaining) md += ` ${remaining}`;
          md += '\n';
        }
      } else {
        md += `- ${s}\n`;
      }
    });
    md += '\n';
  }

  md += '---\n\n';

  return md;
}

function generateCategoryPage(category: string, methods: MethodInfo[]): string {
  const info = CATEGORY_INFO[category];

  // Special handling for events page - don't overwrite it
  if (category === 'events') {
    return ''; // Skip generating events page as it has custom content
  }

  if (!info) {
    console.warn(
      `  ⚠ Skipping unknown category: ${category} (methods: ${methods.map(m => m.name).join(', ')})`,
    );
    return '';
  }

  return `---
title: ${info.title}
description: ${info.description}
outline: deep
---

<!-- This file is automatically generated by embed-client pnpm generate:docs. DO NOT manually update this file. -->

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

<!-- This file is automatically generated by embed-client pnpm generate:docs. DO NOT manually update this file. -->

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

  // Parse type files first to collect complex type definitions
  const typesDir = join(__dirname, '../dist/types');
  if (existsSync(typesDir)) {
    const typeFiles = readdirSync(typesDir).filter(file => file.endsWith('.d.ts'));

    typeFiles.forEach(file => {
      const filePath = join(typesDir, file);
      parseTypeFile(filePath);
    });
    console.log(`✅ Loaded ${complexTypes.size} type definitions`);
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
    if (!content) return;
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
