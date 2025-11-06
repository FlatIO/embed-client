import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ["src/**/*"],
			exclude: ["**/*.test.ts", "**/*.test.tsx"],
			rollupTypes: true,
		}),
	],
	build: {
		lib: {
			entry: {
				index: resolve(__dirname, "src/index.ts"),
				testing: resolve(__dirname, "src/testing.tsx"),
			},
			formats: ["es"],
		},
		rollupOptions: {
			external: ["react", "react-dom", "react/jsx-runtime", "flat-embed"],
			output: {
				preserveModules: false,
			},
		},
	},
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: [],
	},
});
