require("dotenv").config();

module.exports = (config) => {
	// Mocha configuration
	const mocha = {
		timeout: "30000ms",
	};

	// If a test grep is provided, only run the tests that match the grep.
	if (process.env.TEST_GREP) {
		mocha.grep = process.env.TEST_GREP;
	}

	var configuration = {
		frameworks: ["mocha"],
		client: {
			mocha,
			env: {
				FLAT_EMBED_APP_ID: process.env.FLAT_EMBED_APP_ID,
				FLAT_EMBED_BASE_URL: process.env.FLAT_EMBED_BASE_URL,
				FLAT_EMBED_PUBLIC_SCORE: process.env.FLAT_EMBED_PUBLIC_SCORE,
				FLAT_EMBED_QUARTET_SCORE: process.env.FLAT_EMBED_QUARTET_SCORE,
				FLAT_EMBED_PRIVATE_LINK_SCORE:
					process.env.FLAT_EMBED_PRIVATE_LINK_SCORE,
				FLAT_EMBED_PRIVATE_LINK_SHARING_KEY:
					process.env.FLAT_EMBED_PRIVATE_LINK_SHARING_KEY,
			},
		},
		reporters: ["mocha"],
		// Make Karma work with pnpm.
		// See: https://github.com/pnpm/pnpm/issues/720#issuecomment-954120387
		plugins: Object.keys(require("./package").devDependencies).flatMap(
			(packageName) => {
				if (!packageName.startsWith("karma-")) return [];
				return [require(packageName)];
			},
		),
		files: [
			"dist/flat-embed.umd.js",
			"test/unit/*.js",
			"test/integration/lib/*.js",
			"test/integration/*.js",
			{
				pattern: "test/integration/fixtures/*",
				watched: false,
				served: true,
				included: false,
			},
		],
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: true,
		browsers: ["ChromeCustom"],
		customLaunchers: {
			ChromeCustom: {
				base: "ChromeHeadless",
				// base: 'Chrome',
				flags: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"],
			},
		},
		singleRun: false,
		concurrency: Infinity,
		browserNoActivityTimeout: 60000,
	};

	config.set(configuration);
};
