import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';

type Status = { type: 'error' | 'success'; message: string } | null;

const App = () => {
	// Glass Settings State
	const [stripeDensity, setStripeDensity] = useState(80);
	const [widthVariation, setWidthVariation] = useState(30);
	const [frosting, setFrosting] = useState(50);
	const [clarity, setClarity] = useState(70);
	const [refractionIntensity, setRefractionIntensity] = useState(30);
	const [quality, setQuality] = useState<'draft' | 'standard' | 'high'>('standard');

	// UI State
	const [hasSelection, setHasSelection] = useState(false);
	const [status, setStatus] = useState<Status>(null);

	useEffect(() => {
		const handler = (event: MessageEvent) => {
			const msg = event.data.pluginMessage ?? event.data;
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

	const applyEffect = () => {
		const settings = {
			stripeDensity,
			widthVariation,
			frosting,
			clarity,
			refractionIntensity,
			blurZoneCount: 5,
			quality,
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
		const style = {
			padding: '8px',
			borderRadius: '4px',
			fontSize: '11px',
			marginBottom: '12px',
			backgroundColor: status.type === 'error' ? '#fed7d7' : '#c6f6d5',
			color: status.type === 'error' ? '#c53030' : '#22543d',
		};
		return <div style={style}>{status.message}</div>;
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', height: '100%' }}>
			<header>
				<div style={{ fontSize: '16px', fontWeight: 600, color: '#667eea', marginBottom: '4px' }}>
					Fractal Glass
				</div>
				<div style={{ fontSize: '11px', color: '#718096' }}>
					Procedural glass overlay effect
				</div>
			</header>

			{renderStatus()}

			<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflowY: 'auto' }}>
				{/* Stripe Density */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718096', marginBottom: '6px' }}>
						<span>Stripe Density</span>
						<span>{stripeDensity}</span>
					</div>
					<input
						type="range"
						min={20}
						max={200}
						value={stripeDensity}
						onChange={(e) => setStripeDensity(Number((e.target as HTMLInputElement).value))}
						style={{ width: '100%' }}
					/>
				</div>

				{/* Width Variation */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718096', marginBottom: '6px' }}>
						<span>Width Variation</span>
						<span>{widthVariation}%</span>
					</div>
					<input
						type="range"
						min={0}
						max={100}
						value={widthVariation}
						onChange={(e) => setWidthVariation(Number((e.target as HTMLInputElement).value))}
						style={{ width: '100%' }}
					/>
				</div>

				{/* Frosting */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718096', marginBottom: '6px' }}>
						<span>Frosting</span>
						<span>{frosting}%</span>
					</div>
					<input
						type="range"
						min={0}
						max={100}
						value={frosting}
						onChange={(e) => setFrosting(Number((e.target as HTMLInputElement).value))}
						style={{ width: '100%' }}
					/>
				</div>

				{/* Clarity */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718096', marginBottom: '6px' }}>
						<span>Clarity</span>
						<span>{clarity}%</span>
					</div>
					<input
						type="range"
						min={0}
						max={100}
						value={clarity}
						onChange={(e) => setClarity(Number((e.target as HTMLInputElement).value))}
						style={{ width: '100%' }}
					/>
				</div>

				{/* Refraction Intensity */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718096', marginBottom: '6px' }}>
						<span>Refraction</span>
						<span>{refractionIntensity}%</span>
					</div>
					<input
						type="range"
						min={0}
						max={100}
						value={refractionIntensity}
						onChange={(e) => setRefractionIntensity(Number((e.target as HTMLInputElement).value))}
						style={{ width: '100%' }}
					/>
				</div>

				{/* Quality */}
				<div>
					<div style={{ fontSize: '11px', color: '#718096', marginBottom: '6px' }}>Quality</div>
					<select
						value={quality}
						onChange={(e) => setQuality((e.target as HTMLSelectElement).value as typeof quality)}
						style={{ width: '100%', fontSize: '11px', padding: '6px' }}
					>
						<option value="draft">Draft (fast)</option>
						<option value="standard">Standard</option>
						<option value="high">High quality</option>
					</select>
				</div>
			</div>

			<button
				type="button"
				onClick={applyEffect}
				disabled={!hasSelection}
				style={{
					width: '100%',
					padding: '12px',
					borderRadius: '4px',
					border: 'none',
					fontSize: '12px',
					fontWeight: 600,
					cursor: hasSelection ? 'pointer' : 'not-allowed',
					background: hasSelection ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#a0aec0',
					color: '#ffffff',
				}}
			>
				{hasSelection ? 'Apply Glass Effect' : 'Select a frame or group'}
			</button>

			<div style={{ fontSize: '10px', color: '#a0aec0', textAlign: 'center' }}>
				Effect is non-destructive. Use Cmd/Ctrl+Z to undo.
			</div>
		</div>
	);
};

export default App;
