// Get available parts first
const parts = await embed.getParts();
console.log('Available parts:', parts);

// Example 1: Display specific parts by UUID
const partUuids = parts.slice(0, 2).map(p => p.uuid);
await embed.setDisplayedParts(partUuids);

// Example 2: Display parts by name
await embed.setDisplayedParts(['Violin 1', 'Violin 2']);

// Example 3: Display all parts
const allPartUuids = parts.map(p => p.uuid);
await embed.setDisplayedParts(allPartUuids);
