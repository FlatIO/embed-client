// Example 1: Export as SVG string (default track layout)
const svgString = await embed.getSVG();
// svgString contains the SVG markup
// Can be inserted directly into the DOM
document.getElementById('preview').innerHTML = svgString;

// Example 2: Export with page layout
const svgPage = await embed.getSVG({ layout: 'page' });
// Save as file
const blob = new Blob([svgPage], { type: 'image/svg+xml' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'score.svg';
a.click();
