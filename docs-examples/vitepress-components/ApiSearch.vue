<template>
  <div class="api-search">
    <div class="search-controls">
      <div class="search-input-wrapper">
        <svg
          class="search-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clip-rule="evenodd"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search methods..."
          class="search-input"
          @input="handleSearch"
        />
        <kbd
          v-if="!searchQuery"
          class="search-hint"
          >Ctrl+K</kbd
        >
      </div>

      <div class="filters">
        <select
          v-model="selectedCategory"
          class="category-filter"
        >
          <option value="">All Categories</option>
          <option value="score-management">Score Management</option>
          <option value="playback">Playback Control</option>
          <option value="parts">Parts & Instruments</option>
          <option value="navigation">Navigation</option>
          <option value="display">Display</option>
          <option value="analysis">Analysis</option>
          <option value="events">Events</option>
        </select>

        <select
          v-model="returnTypeFilter"
          class="type-filter"
        >
          <option value="">All Return Types</option>
          <option value="void">void</option>
          <option value="Promise<void>">Promise&lt;void&gt;</option>
          <option value="Promise<string>">Promise&lt;string&gt;</option>
          <option value="Promise<number>">Promise&lt;number&gt;</option>
          <option value="Promise<Array>">Promise&lt;Array&gt;</option>
        </select>
      </div>
    </div>

    <div
      v-if="searchQuery || selectedCategory || returnTypeFilter"
      class="results-summary"
    >
      Found {{ filteredMethods.length }} methods
      <button
        @click="clearFilters"
        class="clear-filters"
      >
        Clear filters
      </button>
    </div>

    <div class="search-results">
      <TransitionGroup name="list">
        <div
          v-for="method in paginatedMethods"
          :key="method.name"
          class="method-card"
          @click="showMethodDetails(method)"
        >
          <div class="method-header">
            <h3 class="method-name">{{ method.name }}()</h3>
            <span class="method-category">{{ formatCategory(method.category) }}</span>
          </div>

          <code class="method-signature">{{ method.signature }}</code>

          <p
            v-if="method.description"
            class="method-description"
          >
            {{ truncateDescription(method.description) }}
          </p>

          <div class="method-footer">
            <span class="return-type">Returns: {{ method.returns || 'void' }}</span>
            <a
              :href="`./${method.category}.html#${method.name.toLowerCase()}`"
              class="method-link"
              @click.stop
            >
              View docs →
            </a>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <div
      v-if="totalPages > 1"
      class="pagination"
    >
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        Previous
      </button>
      <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        Next
      </button>
    </div>

    <!-- Method Detail Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedMethod"
          class="modal-backdrop"
          @click="selectedMethod = null"
        >
          <div
            class="modal-content"
            @click.stop
          >
            <button
              class="modal-close"
              @click="selectedMethod = null"
            >
              ×
            </button>

            <h2>{{ selectedMethod.name }}()</h2>

            <div class="modal-section">
              <h3>Signature</h3>
              <pre><code>{{ selectedMethod.signature }}</code></pre>
            </div>

            <div
              v-if="selectedMethod.description"
              class="modal-section"
            >
              <h3>Description</h3>
              <p>{{ selectedMethod.description }}</p>
            </div>

            <div
              v-if="selectedMethod.parameters?.length"
              class="modal-section"
            >
              <h3>Parameters</h3>
              <ul>
                <li
                  v-for="param in selectedMethod.parameters"
                  :key="param.name"
                >
                  <code>{{ param.name }}</code>
                  <span
                    v-if="param.optional"
                    class="optional"
                    >(optional)</span
                  >
                  : <code>{{ param.type }}</code>
                </li>
              </ul>
            </div>

            <div class="modal-section">
              <h3>Example</h3>
              <pre><code>{{ getMethodExample(selectedMethod) }}</code></pre>
            </div>

            <div class="modal-actions">
              <a
                :href="`./${selectedMethod.category}.html#${selectedMethod.name.toLowerCase()}`"
                class="btn-primary"
              >
                View Full Documentation
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Method {
  name: string;
  signature: string;
  category: string;
  description?: string;
  returns?: string;
  parameters?: Array<{
    name: string;
    type: string;
    optional?: boolean;
  }>;
}

const props = defineProps<{
  methods: Method[];
}>();

const searchQuery = ref('');
const selectedCategory = ref('');
const returnTypeFilter = ref('');
const selectedMethod = ref<Method | null>(null);
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredMethods = computed(() => {
  let results = props.methods;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    results = results.filter(
      method =>
        method.name.toLowerCase().includes(query) ||
        method.description?.toLowerCase().includes(query) ||
        method.signature.toLowerCase().includes(query),
    );
  }

  // Filter by category
  if (selectedCategory.value) {
    results = results.filter(method => method.category === selectedCategory.value);
  }

  // Filter by return type
  if (returnTypeFilter.value) {
    results = results.filter(method => method.returns?.includes(returnTypeFilter.value));
  }

  return results;
});

const totalPages = computed(() => Math.ceil(filteredMethods.value.length / itemsPerPage));

const paginatedMethods = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredMethods.value.slice(start, end);
});

function handleSearch() {
  currentPage.value = 1;
}

function clearFilters() {
  searchQuery.value = '';
  selectedCategory.value = '';
  returnTypeFilter.value = '';
  currentPage.value = 1;
}

function showMethodDetails(method: Method) {
  selectedMethod.value = method;
}

function formatCategory(category: string): string {
  return category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function truncateDescription(description: string, maxLength = 100): string {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength) + '...';
}

function getMethodExample(method: Method): string {
  const params =
    method.parameters
      ?.filter(p => !p.optional)
      .map(p => `/* ${p.name} */`)
      .join(', ') || '';

  return `const embed = new Embed('container', config);
await embed.${method.name}(${params});`;
}

// Keyboard shortcut for search
function handleKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const input = document.querySelector('.search-input') as HTMLInputElement;
    input?.focus();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.api-search {
  margin: 2rem 0;
}

.search-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  width: 20px;
  height: 20px;
  color: var(--vp-c-text-3);
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 40px;
  font-size: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  transition: border-color 0.25s;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.search-hint {
  position: absolute;
  right: 12px;
  padding: 2px 6px;
  font-size: 12px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text-3);
}

.filters {
  display: flex;
  gap: 1rem;
}

.category-filter,
.type-filter {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  font-size: 14px;
}

.results-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: var(--vp-c-text-2);
}

.clear-filters {
  padding: 4px 8px;
  font-size: 12px;
  background: transparent;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s;
}

.clear-filters:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.search-results {
  display: grid;
  gap: 1rem;
}

.method-card {
  padding: 1.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.25s;
}

.method-card:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.method-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.method-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.method-category {
  padding: 4px 8px;
  font-size: 12px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  border-radius: 4px;
}

.method-signature {
  display: block;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: var(--vp-c-bg);
  border-radius: 4px;
  font-size: 14px;
  overflow-x: auto;
}

.method-description {
  margin: 0.5rem 0;
  color: var(--vp-c-text-2);
}

.method-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
}

.return-type {
  font-size: 14px;
  color: var(--vp-c-text-3);
}

.method-link {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
}

.method-link:hover {
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.25s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: var(--vp-c-text-2);
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: var(--vp-c-bg);
  border-radius: 12px;
  padding: 2rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  cursor: pointer;
  color: var(--vp-c-text-2);
}

.modal-close:hover {
  color: var(--vp-c-text-1);
}

.modal-section {
  margin: 1.5rem 0;
}

.modal-section h3 {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: var(--vp-c-text-2);
}

.modal-section pre {
  background: var(--vp-c-bg-soft);
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;
}

.modal-actions {
  margin-top: 2rem;
  text-align: center;
}

.btn-primary {
  display: inline-block;
  padding: 10px 20px;
  background: var(--vp-c-brand);
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: opacity 0.25s;
}

.btn-primary:hover {
  opacity: 0.9;
}

/* Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content {
  transform: scale(0.9);
}

.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>
