import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';

type Status = { type: 'error' | 'success'; message: string } | null;

const App = () => {
	// Glass Settings State
	const [stripeDensity, setStripeDensity] = useState(80);
	const [widthVariation, setWidthVariation] = useState(30);
	const [frosting, setFrosting] = useState(50);
	const [clarity, setClarity] = useState(70);
	const [refractionIntensity, setRefractionIntensity] = useState(30);
	const [depth, setDepth] = useState(50);
	const [dispersion, setDispersion] = useState(20);
	const [lightIntensity, setLightIntensity] = useState(50);
	const [lightAngle, setLightAngle] = useState(45);
	const [quality, setQuality] = useState<'draft' | 'standard' | 'high'>('standard');

	// UI State
	const [hasSelection, setHasSelection] = useState(false);
	const [status, setStatus] = useState<Status>(null);
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	useEffect(() => {
		const handler = (event: MessageEvent) => {
			const msg = event.data.pluginMessage ?? event.data;
			if (!msg || typeof msg !== 'object') return;

			if (msg.type === 'selection-changed') {
				setHasSelection(!!msg.hasSelection);
				if (!msg.hasSelection) {
					setPreviewImage(null);
				}
			}

			if (msg.type === 'preview-image' && msg.previewImage) {
				setPreviewImage(`data:image/png;base64,${msg.previewImage}`);
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
			depth,
			dispersion,
			lightIntensity,
			lightAngle,
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

			{/* Preview Area */}
			<div style={{
				background: previewImage ? '#f7fafc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				borderRadius: '8px',
				height: '120px',
				position: 'relative',
				overflow: 'hidden',
				border: '1px solid #e2e8f0',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}>
				{previewImage ? (
					<>
						{/* Layer image */}
						<img
							src={previewImage}
							alt="Selected layer"
							style={{
								position: 'absolute',
								inset: 0,
								width: '100%',
								height: '100%',
								objectFit: 'contain'
							}}
						/>
						{/* Glass overlay */}
						<div style={{
							position: 'absolute',
							inset: 0,
							display: 'flex',
							flexDirection: 'row'
						}}>
							{Array.from({ length: Math.min(20, Math.floor(stripeDensity / 4)) }).map((_, i) => {
								const baseWidth = 100 / Math.min(20, Math.floor(stripeDensity / 4));
								const vary = (Math.sin(i * 123.456) * (widthVariation / 100));
								const width = baseWidth * (1 + vary);

								return (
									<div
										key={`stripe-${i}`}
										style={{
											width: `${width}%`,
											height: '100%',
											background: `rgba(255, 255, 255, ${0.1 + (frosting / 100) * 0.2})`,
											backdropFilter: `blur(${(frosting / 100) * 8}px)`,
											borderRight: '1px solid rgba(255, 255, 255, 0.1)',
											opacity: clarity / 100
										}}
									/>
								);
							})}
						</div>
						<div style={{
							position: 'absolute',
							bottom: '8px',
							left: '8px',
							fontSize: '10px',
							color: 'rgba(255, 255, 255, 0.9)',
							textShadow: '0 1px 3px rgba(0,0,0,0.5)',
							background: 'rgba(0,0,0,0.3)',
							padding: '2px 6px',
							borderRadius: '3px'
						}}>
							Preview
						</div>
					</>
				) : (
					<div style={{
						fontSize: '12px',
						color: '#a0aec0',
						textAlign: 'center'
					}}>
						Select a layer to preview
					</div>
				)}
			</div>

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

				{/* Depth */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718096', marginBottom: '6px' }}>
						<span>Depth</span>
						<span>{depth}</span>
					</div>
					<input
						type="range"
						min={1}
						max={100}
						value={depth}
						onChange={(e) => setDepth(Number((e.target as HTMLInputElement).value))}
						style={{ width: '100%' }}
					/>
				</div>

				{/* Dispersion */}
				<div>
					<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#718096', marginBottom: '6px' }}>
						<span>Dispersion</span>
						<span>{dispersion}%</span>
					</div>
					<input
						type="range"
						min={0}
						max={100}
						value={dispersion}
						onChange={(e) => setDispersion(Number((e.target as HTMLInputElement).value))}
						style={{ width: '100%' }}
					/>
				</div>

				{/* Lighting Controls */}
				<div style={{
					padding: '12px',
					borderRadius: '8px',
					background: '#f7fafc',
					border: '1px solid #edf2f7',
					display: 'flex',
					flexDirection: 'column',
					gap: '12px'
				}}>
					<div style={{ fontSize: '11px', fontWeight: 600, color: '#4a5568' }}>Lighting</div>

					{/* Light Intensity */}
					<div>
						<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#718096', marginBottom: '4px' }}>
							<span>Intensity</span>
							<span>{lightIntensity}%</span>
						</div>
						<input
							type="range"
							min={0}
							max={100}
							value={lightIntensity}
							onChange={(e) => setLightIntensity(Number((e.target as HTMLInputElement).value))}
							style={{ width: '100%' }}
						/>
					</div>

					{/* Light Angle */}
					<div>
						<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#718096', marginBottom: '4px' }}>
							<span>Angle</span>
							<span>{lightAngle}°</span>
						</div>
						<input
							type="range"
							min={0}
							max={360}
							value={lightAngle}
							onChange={(e) => setLightAngle(Number((e.target as HTMLInputElement).value))}
							style={{ width: '100%' }}
						/>
					</div>
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
