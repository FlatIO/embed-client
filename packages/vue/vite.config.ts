import { resolve } from "node:path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		vue(),
		dts({
			include: ["src/**/*.ts", "src/**/*.vue"],
			exclude: ["**/*.test.ts", "src/testing.ts"],
			rollupTypes: true,
		}),
	],
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, "src/index.ts"),
				testing: resolve(__dirname, "src/testing.ts"),
			},
			formats: ["es"],
		},
		rollupOptions: {
			external: ["vue", "flat-embed"],
			output: {
				preserveModules: false,
				assetFileNames: (assetInfo) => {
					if (assetInfo.name === "style.css") return "index.css";
					return assetInfo.name || "";
				},
				globals: {
					vue: "Vue",
				},
			},
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: [],
	},
});
