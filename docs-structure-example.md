# Proposed VitePress Documentation Structure

## docs/embed/

├── javascript.md # Overview & Getting Started
├── api-reference.md # Complete API Reference  
├── playback.md # Playback & Audio Methods
├── score-management.md # Loading & Exporting
├── navigation.md # Cursor & Navigation
├── events.md # Event System
├── typescript.md # TypeScript Usage
└── examples.md # Interactive Examples

## Example: api-reference.md with VitePress Features

````markdown
---
outline: deep
---

# API Reference

<ApiSearch />

## Score Management {#score-management}

### loadFlatScore() {#loadFlatScore}

<MethodSignature 
  method="loadFlatScore" 
  params="score: string | { score: string, sharingKey: string }"
  returns="Promise<void>"
/>

Load a score hosted on Flat using its identifier.

::: code-group

```ts [TypeScript]
// Simple load
await embed.loadFlatScore('56ae21579a127715a02901a6');

// With private sharing
await embed.loadFlatScore({
  score: '5ce56f7c019fd41f5b17b72d',
  sharingKey: 'YOUR_KEY',
});
```
````

```js [JavaScript]
// Simple load
await embed.loadFlatScore('56ae21579a127715a02901a6');
```

:::

<ApiPlayground method="loadFlatScore" />
```

## VitePress-Specific Features to Use:

### 1. **Code Groups** for Language Variants

````markdown
::: code-group

```ts [TypeScript]
const embed: Embed = new Embed(container, config);
```
````

```js [JavaScript]
const embed = new Embed(container, config);
```

:::

````

### 2. **Custom Containers** for Better Organization
```markdown
::: tip Performance
For better performance, batch your API calls when possible.
:::

::: warning
This method requires the score to be publicly accessible.
:::
````

### 3. **Sidebar Navigation** in `.vitepress/config.js`

```js
export default {
  themeConfig: {
    sidebar: {
      '/developers/docs/embed/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/javascript#installation' },
            { text: 'Quick Start', link: '/javascript#quick-start' },
          ],
        },
        {
          text: 'API Reference',
          collapsed: true,
          items: [
            { text: 'Score Management', link: '/api/score-management' },
            { text: 'Playback Control', link: '/api/playback' },
            { text: 'Navigation', link: '/api/navigation' },
          ],
        },
      ],
    },
  },
};
```

### 4. **Interactive Method Explorer Component**

```vue
<!-- .vitepress/components/MethodExplorer.vue -->
<template>
  <div class="method-explorer">
    <tabs>
      <tab title="Try It">
        <div class="playground">
          <select v-model="selectedMethod">
            <option>play()</option>
            <option>pause()</option>
            <option>setMasterVolume()</option>
          </select>
          <button @click="execute">Run</button>
        </div>
      </tab>
      <tab title="Example">
        <pre><code>{{ examples[selectedMethod] }}</code></pre>
      </tab>
      <tab title="Response">
        <pre>{{ response }}</pre>
      </tab>
    </tabs>
  </div>
</template>
```

## My Recommendation:

1. **Keep README focused** - Installation, quick start, and link to full docs
2. **Use VitePress for rich documentation** with:
   - Categorized method pages
   - Interactive components
   - Search functionality
   - Code examples with syntax highlighting
3. **Create a method index page** with filtering/search
4. **Use Vue components** for interactive demos where it makes sense

Would you like me to create example implementations for any of these approaches?
