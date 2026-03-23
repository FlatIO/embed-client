import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { h, nextTick, ref } from 'vue';
import FlatEmbed from '../src/FlatEmbed.vue';

declare const __TEST_ENV__: {
  FLAT_EMBED_APP_ID?: string;
  FLAT_EMBED_BASE_URL?: string;
  FLAT_EMBED_PUBLIC_SCORE?: string;
  FLAT_EMBED_QUARTET_SCORE?: string;
  FLAT_EMBED_PRIVATE_LINK_SCORE?: string;
  FLAT_EMBED_PRIVATE_LINK_SHARING_KEY?: string;
};

const APP_ID = __TEST_ENV__.FLAT_EMBED_APP_ID || '58fa312bea9bbd061b0ea8f3';
const BASE_URL = __TEST_ENV__.FLAT_EMBED_BASE_URL || 'https://flat-embed.com';
const PUBLIC_SCORE = __TEST_ENV__.FLAT_EMBED_PUBLIC_SCORE || '56ae21579a127715a02901a6';
const QUARTET_SCORE = __TEST_ENV__.FLAT_EMBED_QUARTET_SCORE || '5e1348dd6d09386a2b178b58';

/**
 * Poll for a condition with timeout
 */
function waitFor(fn: () => boolean, timeoutMs = 15000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (fn()) {
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        reject(new Error('waitFor timed out'));
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

describe('Integration - FlatEmbed Vue Component', () => {
  const wrappers: ReturnType<typeof mount>[] = [];

  afterEach(async () => {
    // Unmount wrappers before removing DOM elements to avoid contentWindow errors
    for (const w of wrappers) {
      try {
        w.unmount();
      } catch (_e) {
        // ignore
      }
    }
    wrappers.length = 0;

    // Small delay to let pending postMessage calls settle
    await new Promise(r => setTimeout(r, 500));

    try {
      for (const el of document.querySelectorAll('div,iframe')) {
        el.remove();
      }
    } catch (_err) {
      // ignore cleanup errors
    }
  });

  function getBaseUrl(score: string) {
    const isCustomUrl = BASE_URL.includes('blank');
    return isCustomUrl ? BASE_URL.replace('blank', score) : BASE_URL;
  }

  function mountEmbed(
    props: Record<string, any> = {},
    attrs: Record<string, any> = {},
  ) {
    const score = props.score || PUBLIC_SCORE;
    const wrapper = mount(FlatEmbed, {
      props: {
        score,
        baseUrl: getBaseUrl(score),
        embedParams: {
          appId: APP_ID,
          controlsFloating: false,
          ...(props.embedParams || {}),
        },
        ...props,
      },
      attrs,
      attachTo: document.body,
    });
    wrappers.push(wrapper);
    return wrapper;
  }

  describe('Mounting and embed creation', () => {
    it('should render a container div and create an iframe', async () => {
      const wrapper = mountEmbed();

      await wrapper.vm.embed!.ready();

      expect(wrapper.find('div').exists()).toBe(true);
      const iframe = wrapper.find('iframe');
      expect(iframe.exists()).toBe(true);
    });

    it('should expose embed instance after mount', async () => {
      const wrapper = mountEmbed();
      expect(wrapper.vm.embed).toBeTruthy();
      await wrapper.vm.embed!.ready();
    });

    it('should set isReady to true when embed fires ready event', async () => {
      const wrapper = mountEmbed();
      await wrapper.vm.embed!.ready();
      await waitFor(() => wrapper.vm.isReady);
      expect(wrapper.vm.isReady).toBe(true);
    });
  });

  describe('Score loading', () => {
    it('should set scoreLoaded to true when a score is loaded', async () => {
      const wrapper = mountEmbed();
      expect(wrapper.vm.scoreLoaded).toBe(false);

      await wrapper.vm.embed!.ready();
      await waitFor(() => wrapper.vm.scoreLoaded);
      expect(wrapper.vm.scoreLoaded).toBe(true);
    });

    it('should reload score when score prop changes', async () => {
      const score = ref(PUBLIC_SCORE);

      // Use render function to avoid runtime template compilation
      const wrapper = mount(
        {
          setup() {
            const flatEmbed = ref<InstanceType<typeof FlatEmbed>>();
            return { score, flatEmbed };
          },
          render() {
            return h(FlatEmbed, {
              ref: 'flatEmbed',
              score: this.score,
              baseUrl: getBaseUrl(PUBLIC_SCORE),
              embedParams: { appId: APP_ID, controlsFloating: false },
            });
          },
        },
        { attachTo: document.body },
      );
      wrappers.push(wrapper);

      const flatEmbed = () => wrapper.vm.flatEmbed as InstanceType<typeof FlatEmbed> | undefined;

      // Wait for initial load
      await waitFor(() => !!flatEmbed()?.embed);
      await flatEmbed()!.embed!.ready();
      await waitFor(() => flatEmbed()!.scoreLoaded);
      expect(flatEmbed()!.scoreLoaded).toBe(true);

      // Change score
      score.value = QUARTET_SCORE;
      await nextTick();

      // scoreLoaded should reset to false
      await waitFor(() => !flatEmbed()!.scoreLoaded);
      expect(flatEmbed()!.scoreLoaded).toBe(false);

      // Wait for new score to load
      await waitFor(() => flatEmbed()!.scoreLoaded);
      expect(flatEmbed()!.scoreLoaded).toBe(true);
    });
  });

  describe('Event emission', () => {
    it('should emit embed-size event and update embedSize state', async () => {
      const sizes: any[] = [];
      const wrapper = mountEmbed({}, {
        onEmbedSize: (size: any) => sizes.push(size),
      });

      await wrapper.vm.embed!.ready();
      await waitFor(() => wrapper.vm.scoreLoaded);
      await waitFor(() => !!wrapper.vm.embedSize);

      expect(wrapper.vm.embedSize).toBeTruthy();
      expect(wrapper.vm.embedSize!.width).toBeGreaterThan(0);
      expect(wrapper.vm.embedSize!.height).toBeGreaterThan(0);
      expect(sizes.length).toBeGreaterThan(0);
    });
  });

  describe('Playback state', () => {
    it('should update playbackState when playback is started and stopped', async () => {
      const wrapper = mountEmbed({
        embedParams: {
          appId: APP_ID,
          controlsFloating: false,
          controlsPlay: true,
        },
      });

      await wrapper.vm.embed!.ready();
      await waitFor(() => wrapper.vm.scoreLoaded);

      expect(wrapper.vm.playbackState).toBe('idle');

      // Start playback
      await wrapper.vm.embed!.play();
      await waitFor(() => wrapper.vm.playbackState === 'playing');
      expect(wrapper.vm.playbackState).toBe('playing');

      // Pause playback
      await wrapper.vm.embed!.pause();
      await waitFor(() => wrapper.vm.playbackState === 'paused');
      expect(wrapper.vm.playbackState).toBe('paused');

      // Stop playback
      await wrapper.vm.embed!.stop();
      await waitFor(() => wrapper.vm.playbackState === 'idle');
      expect(wrapper.vm.playbackState).toBe('idle');
    });
  });

  describe('Cleanup', () => {
    it('should clean up when unmounted', async () => {
      const wrapper = mountEmbed();
      await wrapper.vm.embed!.ready();

      const embed = wrapper.vm.embed;
      expect(embed).toBeTruthy();

      // Unmount should not throw
      wrapper.unmount();
      // Remove from tracked wrappers since already unmounted
      const idx = wrappers.indexOf(wrapper);
      if (idx >= 0) wrappers.splice(idx, 1);
    });
  });
});
