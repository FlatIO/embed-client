// Wait for the embed to be ready before using it
await embed.ready();
console.log('Embed is ready!');

// Now you can safely use all embed methods
await embed.loadFlatScore('56ae21579a127715a02901a6');
await embed.play();
