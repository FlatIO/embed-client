// Example 1: Load a public score
await embed.loadFlatScore('5ce6a27f052b2a74a91f4a6d');

// Example 2: Load a private score with sharing key
await embed.loadFlatScore({
  score: '5ce6a27f052b2a74a91f4a6d',
  sharingKey: 'your-sharing-key-here',
});
