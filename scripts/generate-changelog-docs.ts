#!/usr/bin/env ts-node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CHANGELOG_PATH = join(__dirname, '../CHANGELOG.md');
const OUTPUT_PATH = join(__dirname, '../../dev-docs/docs/embed/changelog.md');

function main() {
  console.log('📝 Generating embed changelog documentation...');

  if (!existsSync(CHANGELOG_PATH)) {
    console.error('  ✗ CHANGELOG.md not found');
    process.exit(1);
  }

  const changelog = readFileSync(CHANGELOG_PATH, 'utf-8');

  // Strip the top-level "# Changelog" heading and build the doc page
  const content = changelog.replace(/^# Changelog\n*/, '');

  const output = `---
title: Embed SDK Changelog
description: Changelog for Flat's JavaScript/TypeScript Embed SDK (flat-embed)
---

<!-- Auto-generated from CHANGELOG.md by scripts/generate-changelog-docs.ts — do not edit manually -->

# Embed SDK Changelog

${content.trimEnd()}
`;

  writeFileSync(OUTPUT_PATH, output);
  console.log(`  ✓ Generated ${OUTPUT_PATH}`);
}

main();
