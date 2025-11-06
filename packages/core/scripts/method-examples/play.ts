// Example 1: Play with position tracking
embed.on("playbackPosition", (position) => {
	console.log(`Playing at ${position.currentTime}s of ${position.duration}s`);
});
await embed.play();

// Example 2: Play from a specific position
// First set cursor position, then play
await embed.setCursorPosition({
	measureIdx: 5,
	noteIdx: 0,
});
await embed.play();
