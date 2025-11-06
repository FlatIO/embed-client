import { mount } from "@vue/test-utils";
import Embed from "flat-embed";
import { beforeEach, describe, expect, it, vi } from "vitest";
import FlatEmbed from "./FlatEmbed.vue";

// Mock flat-embed - must inline the mock to avoid hoisting issues
vi.mock("flat-embed", () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			ready: vi.fn().mockResolvedValue(undefined),
			on: vi.fn(),
			off: vi.fn(),
			call: vi.fn().mockResolvedValue(undefined),
			loadFlatScore: vi.fn().mockResolvedValue(undefined),
			loadMusicXML: vi.fn().mockResolvedValue(undefined),
			loadMIDI: vi.fn().mockResolvedValue(undefined),
			loadJSON: vi.fn().mockResolvedValue(undefined),
			getJSON: vi.fn().mockResolvedValue({}),
			getMusicXML: vi.fn().mockResolvedValue(""),
			getPNG: vi.fn().mockResolvedValue(new Uint8Array()),
			getMIDI: vi.fn().mockResolvedValue(new Uint8Array()),
			getFlatScoreMetadata: vi.fn().mockResolvedValue({}),
			getEmbedConfig: vi.fn().mockResolvedValue({}),
			setEditorConfig: vi.fn().mockResolvedValue(undefined),
			fullscreen: vi.fn().mockResolvedValue(undefined),
			play: vi.fn().mockResolvedValue(undefined),
			pause: vi.fn().mockResolvedValue(undefined),
			stop: vi.fn().mockResolvedValue(undefined),
			mute: vi.fn().mockResolvedValue(undefined),
			getMasterVolume: vi.fn().mockResolvedValue(1),
			setMasterVolume: vi.fn().mockResolvedValue(undefined),
			getZoom: vi.fn().mockResolvedValue(1),
			setZoom: vi.fn().mockResolvedValue(undefined),
			getCursorPosition: vi.fn().mockResolvedValue({}),
			setCursorPosition: vi.fn().mockResolvedValue(undefined),
			getParts: vi.fn().mockResolvedValue([]),
			getDisplayedParts: vi.fn().mockResolvedValue([]),
			setDisplayedParts: vi.fn().mockResolvedValue(undefined),
			getNbMeasures: vi.fn().mockResolvedValue(0),
			getMeasuresUuids: vi.fn().mockResolvedValue([]),
			getMeasureDetails: vi.fn().mockResolvedValue({}),
			getNbParts: vi.fn().mockResolvedValue(0),
			getPartsUuids: vi.fn().mockResolvedValue([]),
			goLeft: vi.fn().mockResolvedValue(undefined),
			goRight: vi.fn().mockResolvedValue(undefined),
			getMetronomeMode: vi.fn().mockResolvedValue(0),
			setMetronomeMode: vi.fn().mockResolvedValue(undefined),
			getPlaybackSpeed: vi.fn().mockResolvedValue(1),
			setPlaybackSpeed: vi.fn().mockResolvedValue(undefined),
			scrollToCursor: vi.fn().mockResolvedValue(undefined),
			print: vi.fn().mockResolvedValue(undefined),
			destroy: vi.fn(),
		})),
	};
});

// List of all method names from the mock (for testing)
const mockMethodNames = [
	"ready",
	"on",
	"off",
	"call",
	"loadFlatScore",
	"loadMusicXML",
	"loadMIDI",
	"loadJSON",
	"getJSON",
	"getMusicXML",
	"getPNG",
	"getMIDI",
	"getFlatScoreMetadata",
	"getEmbedConfig",
	"setEditorConfig",
	"fullscreen",
	"play",
	"pause",
	"stop",
	"mute",
	"getMasterVolume",
	"setMasterVolume",
	"getZoom",
	"setZoom",
	"getCursorPosition",
	"setCursorPosition",
	"getParts",
	"getDisplayedParts",
	"setDisplayedParts",
	"getNbMeasures",
	"getMeasuresUuids",
	"getMeasureDetails",
	"getNbParts",
	"getPartsUuids",
	"goLeft",
	"goRight",
	"getMetronomeMode",
	"setMetronomeMode",
	"getPlaybackSpeed",
	"setPlaybackSpeed",
	"scrollToCursor",
	"print",
	"destroy",
];

describe("FlatEmbed", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders a container div", () => {
		const wrapper = mount(FlatEmbed, {
			props: {
				score: "test-score",
				appId: "test",
			},
		});

		expect(wrapper.find("div").exists()).toBe(true);
	});

	it("accepts config prop", () => {
		const wrapper = mount(FlatEmbed, {
			props: {
				config: {
					score: "test-score",
					embedParams: { appId: "test-app-id" },
				},
			},
		});

		expect(wrapper.find("div").exists()).toBe(true);
	});

	it("applies width and height styles", () => {
		const wrapper = mount(FlatEmbed, {
			props: {
				score: "test-score",
				appId: "test",
				width: "800px",
				height: "600px",
			},
		});

		const div = wrapper.find("div");
		expect(div.attributes("style")).toContain("width: 800px");
		expect(div.attributes("style")).toContain("height: 600px");
	});

	it("exposes all Embed methods through component ref", async () => {
		const wrapper = mount(FlatEmbed, {
			props: {
				score: "test-score",
				appId: "test",
			},
		});

		// Wait for component to mount and embed to initialize
		await wrapper.vm.$nextTick();
		await new Promise((resolve) => setTimeout(resolve, 0));

		// Access exposed properties via the wrapper
		const componentRef = wrapper.vm.$ as any;

		// Verify each method is accessible through the component ref
		for (const methodName of mockMethodNames) {
			expect(
				componentRef.exposed?.[methodName],
				`Method ${methodName} should be exposed`,
			).toBeDefined();
			expect(
				typeof componentRef.exposed?.[methodName],
				`${methodName} should be a function`,
			).toBe("function");
		}

		// Verify methods can be called
		await componentRef.exposed.play();
		await componentRef.exposed.pause();
		await componentRef.exposed.loadFlatScore("test");

		// Verify embed getter exists
		expect(componentRef.exposed.embed).toBeDefined();
	});
});
