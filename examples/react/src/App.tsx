import {
	FlatEmbed,
	type FlatEmbedHandle,
	useFlatEmbed,
} from "@flat/embed-react";
import { useRef, useState } from "react";

function App() {
	return (
		<div>
			<h1>Flat Embed React Examples</h1>

			<BasicExample />
			<HookExample />
		</div>
	);
}

// Example 1: Basic component usage
function BasicExample() {
	const embedRef = useRef<FlatEmbedHandle>(null);
	const [status, setStatus] = useState("Not loaded");

	const handlePlay = async () => {
		await embedRef.current?.play();
		setStatus("Playing");
	};

	const handlePause = async () => {
		await embedRef.current?.pause();
		setStatus("Paused");
	};

	return (
		<div className="example-section">
			<h2>1. Basic Component Usage</h2>
			<div className="controls">
				<button type="button" onClick={handlePlay}>
					Play
				</button>
				<button type="button" onClick={handlePause}>
					Pause
				</button>
			</div>
			<div className="status">
				<strong>Status:</strong> {status}
			</div>
			<FlatEmbed
				ref={embedRef}
				score="56ae21579a127715a02901a6"
				appId="your-app-id"
				width="100%"
				height="450px"
				onScoreLoaded={() => setStatus("Score loaded")}
				onPlay={() => setStatus("Playing")}
				onPause={() => setStatus("Paused")}
			/>
		</div>
	);
}

// Example 2: Using the hook for custom UI
function HookExample() {
	const containerRef = useRef<HTMLDivElement>(null);
	const {
		isReady,
		isPlaying,
		cursorPosition,
		playbackPosition,
		play,
		pause,
		stop,
		loadScore,
	} = useFlatEmbed(containerRef, {
		score: "56ae21579a127715a02901a6",
		embedParams: { appId: "your-app-id" },
	});

	const handleLoadNewScore = async () => {
		await loadScore("5bac04bf5a50cd288c95048e");
	};

	return (
		<div className="example-section">
			<h2>2. Using useFlatEmbed Hook</h2>
			<div className="controls">
				<button type="button" onClick={play} disabled={!isReady}>
					Play
				</button>
				<button type="button" onClick={pause} disabled={!isReady}>
					Pause
				</button>
				<button type="button" onClick={stop} disabled={!isReady}>
					Stop
				</button>
				<button type="button" onClick={handleLoadNewScore} disabled={!isReady}>
					Load New Score
				</button>
			</div>
			<div className="status">
				<div>
					<strong>Ready:</strong> {isReady ? "Yes" : "No"}
				</div>
				<div>
					<strong>Playing:</strong> {isPlaying ? "Yes" : "No"}
				</div>
				{cursorPosition && (
					<div>
						<strong>Cursor Position:</strong> Measure{" "}
						{cursorPosition.measure + 1}, Staff {cursorPosition.staff + 1}
					</div>
				)}
				{playbackPosition && (
					<div>
						<strong>Playback Position:</strong>{" "}
						{playbackPosition.position.toFixed(2)}s
					</div>
				)}
			</div>
			<div ref={containerRef} style={{ width: "100%", height: "450px" }} />
		</div>
	);
}

export default App;
