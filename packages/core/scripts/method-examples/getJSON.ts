// Get the current score as Flat JSON format
const scoreData = await embed.getJSON();
console.log('Score data:', scoreData);

// Save to file (in browser)
const jsonString = JSON.stringify(scoreData, null, 2);
const blob = new Blob([jsonString], { type: 'application/json' });
const url = URL.createObjectURL(blob);

const link = document.createElement('a');
link.href = url;
link.download = 'score.json';
link.click();
