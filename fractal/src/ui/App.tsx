import { useEffect, useState } from 'react';

type Preset = {
	id: string;
	name: string;
	gradient: string;
	palette: { r: number; g: number; b: number; a?: number }[];
};

type Status = { type: 'error' | 'success'; message: string } | null;

const PRESETS: Preset[] = [
	{
		id: 'purple-dream',
		name: 'Purple Dream',
		gradient: 'linear-gradient(90deg, #667eea, #f093fb)',
		palette: [
			{ r: 0.4, g: 0.3, b: 0.9, a: 1 },
			{ r: 0.94, g: 0.57, b: 0.95, a: 1 },
		],
	},
	{
		id: 'ocean-breeze',
		name: 'Ocean Breeze',
		gradient: 'linear-gradient(90deg, #4facfe, #00f2fe)',
		palette: [
			{ r: 0.2, g: 0.6, b: 1, a: 1 },
			{ r: 0, g: 0.95, b: 1, a: 1 },
		],
	},
	{
		id: 'emerald-glow',
		name: 'Emerald Glow',
		gradient: 'linear-gradient(90deg, #43e97b, #38f9d7)',
		palette: [
			{ r: 0, g: 0.8, b: 0.6, a: 1 },
			{ r: 0.14, g: 0.98, b: 0.84, a: 1 },
		],
	},
	{
		id: 'sunset-blaze',
		name: 'Sunset Blaze',
		gradient: 'linear-gradient(90deg, #fa709a, #fee140)',
		palette: [
			{ r: 1, g: 0.44, b: 0.6, a: 1 },
			{ r: 1, g: 0.88, b: 0.25, a: 1 },
		],
	},
];

const App = () => {
	const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
	const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
	const [intensity, setIntensity] = useState(70);
	const [hasSelection, setHasSelection] = useState(false);
	const [status, setStatus] = useState<Status>(null);

	useEffect(() => {
		const handler = (event: MessageEvent) => {
			// Plugma / Figma plugin messages arrive under pluginMessage
			const msg = (event.data as any).pluginMessage ?? event.data;
			if (!msg || typeof msg !== 'object') return;

			if (msg.type === 'selection-changed' || msg.type === 'init') {
				setHasSelection(!!msg.hasSelection);
			}

			if (msg.type === 'error') {
				setStatus({ type: 'error', message: msg.message ?? 'Something went wrong.' });
			}

			if (msg.type === 'success') {
				setStatus({ type: 'success', message: msg.message ?? 'Effect applied.' });
			}
		};

		window.addEventListener('message', handler);
		return () => window.removeEventListener('message', handler);
	}, []);

	const selectedPreset = PRESETS.find((p) => p.id === selectedPresetId) ?? null;

	const canApply = hasSelection && !!selectedPreset;

	const applyEffect = () => {
		if (!selectedPreset) return;

		const settings = {
			stripeCount: 80,
			stripeWidthMode: 'uniform',
			widthVariation: 20,
			gradientOffset: 0,
			palette: selectedPreset.palette,
			blurLayers: [
				{ radius: 20, opacity: 80 },
				{ radius: 40, opacity: 40 },
			],
			blendMode: 'OVERLAY',
			opacity: intensity,
			randomSeed: Date.now(),
		};

		parent.postMessage(
			{
				pluginMessage: {
					type: 'apply-effect',
					settings,
				},
			},
			'*',
		);
	};

	const renderStatus = () => {
		if (!status) return null;
		const style: React.CSSProperties = {
			padding: 8,
			borderRadius: 4,
			fontSize: 11,
			marginBottom: 8,
			backgroundColor: status.type === 'error' ? '#fed7d7' : '#c6f6d5',
			color: status.type === 'error' ? '#c53030' : '#22543d',
		};
		return <div style={style}>{status.message}</div>;
	};

	const container: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'column',
		gap: 12,
		padding: 12,
		height: '100%',
	};

	const header: React.CSSProperties = {
		display: 'flex',
		flexDirection: 'column',
		gap: 2,
		marginBottom: 4,
	};

	const title: React.CSSProperties = {
		fontSize: 14,
		fontWeight: 600,
		color: '#667eea',
	};

	const subtitle: React.CSSProperties = {
		fontSize: 11,
		color: '#718096',
	};

	const modeBar: React.CSSProperties = {
		display: 'flex',
		gap: 6,
	};

	const modeButton = (value: 'quick' | 'advanced'): React.CSSProperties => ({
		flex: 1,
		padding: '6px 8px',
		borderRadius: 4,
		fontSize: 11,
		fontWeight: 500,
		textAlign: 'center',
		cursor: 'pointer',
		border: '1px solid ' + (mode === value ? '#667eea' : '#e2e8f0'),
		background: mode === value ? '#667eea' : '#ffffff',
		color: mode === value ? '#ffffff' : '#2d3748',
	});

	const gallery: React.CSSProperties = {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
		gap: 8,
	};

	const card = (id: string): React.CSSProperties => ({
		position: 'relative',
		borderRadius: 8,
		overflow: 'hidden',
		border: `2px solid ${selectedPresetId === id ? '#667eea' : '#e2e8f0'}`,
		height: 72,
		cursor: 'pointer',
		boxShadow:
			selectedPresetId === id ? '0 4px 12px rgba(102, 126, 234, 0.35)' : 'none',
		transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
	});

	const intensityLabel: React.CSSProperties = {
		display: 'flex',
		justifyContent: 'space-between',
		fontSize: 10,
		color: '#718096',
		marginBottom: 4,
	};

	const slider: React.CSSProperties = {
		width: '100%',
	};

	const applyButton: React.CSSProperties = {
		width: '100%',
		padding: '10px 8px',
		borderRadius: 4,
		border: 'none',
		fontSize: 12,
		fontWeight: 600,
		cursor: canApply ? 'pointer' : 'not-allowed',
		background: canApply ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#a0aec0',
		color: '#ffffff',
		textAlign: 'center',
	};

	const helperText: React.CSSProperties = {
		fontSize: 10,
		color: '#a0aec0',
	};

	return (
		<div style={container}>
			<header style={header}>
				<div style={title}>Fractal Glass</div>
				<div style={subtitle}>One click for magic, infinite clicks for mastery</div>
			</header>

			<div style={modeBar}>
				<button
					type="button"
					style={modeButton('quick')}
					onClick={() => setMode('quick')}
				>
					Quick Apply
				</button>
				<button
					type="button"
					style={modeButton('advanced')}
					onClick={() => setMode('advanced')}
					disabled
				>
					Advanced (soon)
				</button>
			</div>

			{renderStatus()}

			{mode === 'quick' && (
				<>
					<div style={gallery}>
						{PRESETS.map((preset) => (
							<button
								type="button"
								key={preset.id}
								style={card(preset.id)}
								onClick={() => setSelectedPresetId(preset.id)}
							>
								<div
									style={{
										position: 'absolute',
										inset: 0,
										background: preset.gradient,
									}}
								/>
							</button>
						))}
					</div>

					<div>
						<div style={intensityLabel}>
							<span>Subtle</span>
							<span>Intense</span>
						</div>
						<input
							type="range"
							min={10}
							max={100}
							value={intensity}
							onChange={(e) => setIntensity(Number(e.target.value))}
							style={slider}
						/>
					</div>
				</>
			)}

			<button type="button" style={applyButton} onClick={applyEffect} disabled={!canApply}>
				{!hasSelection
					? 'Select a frame or group'
					: !selectedPreset
					? 'Select a preset'
					: 'Apply Effect'}
			</button>

			<div style={helperText}>
				Effects are non-destructive. Use Cmd/Ctrl+Z to undo.
			</div>
		</div>
	);
};

export default App;
