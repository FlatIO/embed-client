// Example 1: Export as Uint8Array (default)
const _pngData = await embed.getPNG({
	dpi: 150,
	layout: "page",
});
// pngData is a Uint8Array that can be saved or processed

// Example 2: Export as data URL
const _pngDataUrl = await embed.getPNG({
	result: "dataURL",
	dpi: 300,
	layout: "track",
});
// pngDataUrl is a string like "data:image/png;base64,..."
// Can be used directly in an img tag: <img src={pngDataUrl} />
