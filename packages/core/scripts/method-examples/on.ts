// Example 1: Listen to playback position changes
embed.on('playbackPosition', position => {
  console.log('Current position:', position);
});

// Example 2: Listen to score loaded events
embed.on('scoreLoaded', () => {
  console.log('Score has been loaded');
});

// Example 3: Advanced playback tracking
embed.on('playbackPosition', async playbackPosition => {
  const cursorPosition = await embed.getCursorPosition();
  const { partUuid, voiceUuid } = cursorPosition;

  // Track which measure is currently playing
  const measureDetails = await embed.getMeasureDetails();
  console.log('Currently playing:', {
    position: playbackPosition,
    cursor: cursorPosition,
    measure: measureDetails,
  });
});

// Example 4: Listen to cursor position changes
embed.on('cursorPosition', position => {
  console.log('Cursor moved to:', position);
});
