// Example 1: Loading MusicXML string content
const xmlResponse = await fetch(
  'https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/xml',
);
const xmlContent = await xmlResponse.text();
await embed.loadMusicXML(xmlContent);

// Example 2: Loading compressed MXL (binary) file
const mxlResponse = await fetch(
  'https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/mxl',
);
const mxlBuffer = await mxlResponse.arrayBuffer();
const mxlContent = new Uint8Array(mxlBuffer);
await embed.loadMusicXML(mxlContent);
