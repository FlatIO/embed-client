// Example 1: Load from ABC string
await embed.loadABC('X:1\nT:Example\nM:4/4\nK:C\nCDEF|');

// Example 2: Load from fetched ABC file
const response = await fetch('/path/to/tune.abc');
const abc = await response.text();
await embed.loadABC(abc);
