// Get the current cursor position
const position = await embed.getCursorPosition();
console.log("Current cursor position:", {
	part: position.partIdx,
	staff: position.staffIdx,
	measure: position.measureIdx,
	note: position.noteIdx,
});

// Use cursor position to get note details
if (position.noteIdx >= 0) {
	const parts = await embed.getPartsUuids();
	const measures = await embed.getMeasuresUuids();
	const voices = await embed.getMeasureVoicesUuids({
		partUuid: parts[position.partIdx],
		measureUuid: measures[position.measureIdx],
	});

	if (voices.length > 0) {
		const noteData = await embed.getNoteData({
			partUuid: parts[position.partIdx],
			measureUuid: measures[position.measureIdx],
			voiceUuid: voices[0],
			noteIdx: position.noteIdx,
		});
		console.log("Note at cursor:", noteData);
	}
}
