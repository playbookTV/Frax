// Glass Overlay Effect Generator
// Uses Figma's native GLASS effect

export type QualityMode = 'draft' | 'standard' | 'high';

export interface GlassSettings {
	// Pattern Generation
	stripeDensity: number; // 20-200 vertical divisions
	widthVariation: number; // 0-100% (uniform vs chaotic)

	// Glass Properties
	frosting: number; // 0-100% frost radius
	clarity: number; // 0-100% base transparency
	refractionIntensity: number; // 0-100% refraction distortion
	depth: number; // 1-100 glass depth
	dispersion: number; // 0-100% chromatic aberration

	// Lighting
	lightIntensity: number; // 0-100% highlight brightness
	lightAngle: number; // 0-360 degrees

	// Advanced
	blurZoneCount: number; // Not used
	quality: QualityMode;
	randomSeed: number;
}

export function getDefaultSettings(): GlassSettings {
	return {
		stripeDensity: 80,
		widthVariation: 30,
		frosting: 50,
		clarity: 70,
		refractionIntensity: 30,
		depth: 50,
		dispersion: 20,
		lightIntensity: 50,
		lightAngle: 45,
		blurZoneCount: 5,
		quality: 'standard',
		randomSeed: Date.now(),
	};
}

export function generateEffect(
	targetNode: SceneNode,
	settings: GlassSettings,
): FrameNode {
	const bounds = {
		width: 'width' in targetNode ? targetNode.width : 0,
		height: 'height' in targetNode ? targetNode.height : 0,
		x: 'x' in targetNode ? targetNode.x : 0,
		y: 'y' in targetNode ? targetNode.y : 0,
	};

	// Quality profiles
	const qualityProfile =
		settings.quality === 'draft'
			? { stripeMult: 0.5 }
			: settings.quality === 'high'
				? { stripeMult: 1.75 }
				: { stripeMult: 1.0 };

	const container = figma.createFrame();
	container.name = 'Glass Overlay';
	container.resize(bounds.width, bounds.height);
	container.x = bounds.x;
	container.y = bounds.y;
	container.fills = [];
	container.clipsContent = false;

	// Generate glass panes (frames with GLASS effect)
	const stripeCount = Math.floor(settings.stripeDensity * qualityProfile.stripeMult);
	const panes = generateGlassPanes(
		bounds,
		stripeCount,
		settings.widthVariation,
		settings.frosting,
		settings.refractionIntensity,
		settings.depth,
		settings.dispersion,
		settings.lightIntensity,
		settings.lightAngle,
		settings.randomSeed,
	);
	panes.forEach((pane) => container.appendChild(pane));

	// Composite settings
	container.opacity = settings.clarity / 100;

	return container;
}

// Generate glass panes using Figma's native GLASS effect
function generateGlassPanes(
	bounds: { width: number; height: number },
	count: number,
	variation: number,
	frosting: number,
	refractionIntensity: number,
	depth: number,
	dispersion: number,
	lightIntensity: number,
	lightAngle: number,
	seed: number,
): FrameNode[] {
	// Calculate stripe widths
	const stripes: { x: number; width: number }[] = [];
	const baseWidth = bounds.width / count;
	let currentX = 0;

	for (let i = 0; i < count; i++) {
		let width = baseWidth;
		if (variation > 0) {
			const vary = (random(seed + i) - 0.5) * (variation / 100) * 2;
			width = baseWidth * (1 + vary);
		}
		stripes.push({ x: currentX, width });
		currentX += width;
	}

	// Normalize to fit exactly
	const totalWidth = stripes.reduce((sum, s) => sum + s.width, 0);
	const scale = bounds.width / totalWidth;
	currentX = 0;
	for (const stripe of stripes) {
		stripe.width *= scale;
		stripe.x = currentX;
		currentX += stripe.width;
	}

	return stripes.map((stripe, i) => {
		const pane = figma.createFrame();
		pane.name = `Glass Pane ${i + 1}`;
		pane.x = stripe.x;
		pane.y = 0;
		pane.resize(Math.max(1, stripe.width), bounds.height);

		// Transparent fill (required for glass effect to work)
		pane.fills = [];
		pane.clipsContent = false;

		// Apply GLASS effect with user-controlled parameters
		pane.effects = [
			{
				type: 'GLASS',
				visible: true,
				lightIntensity: lightIntensity / 100, // 0-1
				lightAngle: lightAngle + random(seed + i * 2) * 10 - 5, // Slight variation ±5°
				refraction: (refractionIntensity / 100) * 1.0, // 0-1
				depth: 1 + (depth / 100) * 99, // 1-100
				dispersion: dispersion / 100, // 0-1
				radius: (frosting / 100) * 50, // 0-50px
			},
		];

		return pane;
	});
}

// Utility: Seeded random
function random(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}
