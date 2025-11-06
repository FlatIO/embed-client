// Example 1: Set cursor to a specific position
await embed.setCursorPosition({
	partIdx: 0,
	staffIdx: 1,
	measureIdx: 2,
	noteIdx: 1,
});

// Example 2: Move cursor to the beginning
await embed.setCursorPosition({
	partIdx: 0,
	staffIdx: 0,
	measureIdx: 0,
	noteIdx: 0,
});

// Example 3: Navigate to a specific measure
const measureIdx = 10; // 11th measure (0-indexed)
await embed.setCursorPosition({
	partIdx: 0,
	measureIdx: measureIdx,
	noteIdx: 0,
});
