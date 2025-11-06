// Example 1: Load MIDI from URL
const midiResponse = await fetch("/path/to/score.mid");
const midiBuffer = await midiResponse.arrayBuffer();
const midiData = new Uint8Array(midiBuffer);
await embed.loadMIDI(midiData);

// Example 2: Load MIDI from file input
const fileInput = document.getElementById(
	"midi-file-input",
) as HTMLInputElement;
fileInput.addEventListener("change", async (event) => {
	const file = (event.target as HTMLInputElement).files?.[0];
	if (file && file.type === "audio/midi") {
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);
		await embed.loadMIDI(uint8Array);
	}
});

// Example 3: Load MIDI from Flat API
const response = await fetch(
	"https://api.flat.io/v2/scores/56ae21579a127715a02901a6/revisions/last/midi",
);
const buffer = await response.arrayBuffer();
await embed.loadMIDI(new Uint8Array(buffer));
