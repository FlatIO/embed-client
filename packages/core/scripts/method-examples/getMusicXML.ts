// Example 1: Get uncompressed MusicXML (as string)
const xmlString = await embed.getMusicXML();
console.log(xmlString);

// Example 2: Get compressed MusicXML (as Uint8Array)
const compressedBuffer = await embed.getMusicXML({ compressed: true });

// Create a downloadable blob URL
const blobUrl = window.URL.createObjectURL(
	new Blob([compressedBuffer], {
		type: "application/vnd.recordare.musicxml+xml",
	}),
);

// Create download link
const link = document.createElement("a");
link.href = blobUrl;
link.download = "score.mxl";
link.click();
