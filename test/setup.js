const loadScript = src =>
  new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });

window.__TEST_ENV__ = __TEST_ENV__;

await loadScript('/test/integration/lib/assert.js');
await loadScript('/dist/flat-embed.umd.js');
