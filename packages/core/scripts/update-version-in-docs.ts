#!/usr/bin/env ts-node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function updateVersionInFile(filePath: string, currentVersion: string): void {
	const content = readFileSync(filePath, "utf-8");

	// Replace version in CDN URLs
	const versionPattern = /\/v\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?/g;
	const updatedContent = content.replace(versionPattern, `/v${currentVersion}`);

	if (content !== updatedContent) {
		writeFileSync(filePath, updatedContent);
		console.log(`  ✓ Updated version references in ${filePath}`);
	} else {
		console.log(`  - No version references to update in ${filePath}`);
	}
}

async function main() {
	console.log("🔄 Updating version references in documentation...");

	// Read current version from package.json
	const packageJsonPath = join(__dirname, "../package.json");
	const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
	const currentVersion = packageJson.version;

	console.log(`📦 Current version: ${currentVersion}`);

	// Update README.md
	const readmePath = join(__dirname, "../README.md");
	updateVersionInFile(readmePath, currentVersion);

	// Update dev-docs JavaScript documentation
	const devDocsJsPath = join(
		__dirname,
		"../../dev-docs/docs/embed/javascript.md",
	);
	if (existsSync(devDocsJsPath)) {
		updateVersionInFile(devDocsJsPath, currentVersion);
	} else {
		console.log(`  - Dev docs not found at ${devDocsJsPath}`);
	}

	console.log("✨ Version update complete!");
}

main().catch(console.error);
