// Example: Load from Flat API
const response = await fetch(
  'https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/json',
);
const jsonData = await response.json();
await embed.loadJSON(jsonData);
