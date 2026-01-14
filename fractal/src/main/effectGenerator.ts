// Glass Overlay Effect Generator
// Creates procedural glass texture using white/transparent fills only

export type WidthMode = 'uniform' | 'random' | 'fibonacci' | 'fractal';
export type QualityMode = 'draft' | 'standard' | 'high';

export interface GlassSettings {
	// Pattern Generation
	stripeDensity: number; // 20-200 vertical divisions
	widthVariation: number; // 0-100% (uniform vs chaotic)

	// Glass Properties
	frosting: number; // 0-100% blur amount
	clarity: number; // 0-100% base transparency
	refractionIntensity: number; // 0-100% refraction line visibility

	// Advanced
	blurZoneCount: number; // 3-10 frosted regions
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
			? { stripeMult: 0.5, lineMult: 0.5, zones: 3 }
			: settings.quality === 'high'
				? { stripeMult: 1.75, lineMult: 1.75, zones: 8 }
				: { stripeMult: 1.0, lineMult: 1.0, zones: 5 };

	const container = figma.createFrame();
	container.name = 'Glass Overlay';
	container.resize(bounds.width, bounds.height);
	container.x = bounds.x;
	container.y = bounds.y;
	container.fills = [];

	// Layer 1: Displacement Stripes
	const stripeCount = Math.floor(settings.stripeDensity * qualityProfile.stripeMult);
	const stripes = generateDisplacementStripes(
		bounds,
		stripeCount,
		settings.widthVariation,
		settings.randomSeed,
	);
	stripes.forEach((s) => container.appendChild(s));

	// Layer 2: Refraction Lines
	const lineCount = Math.floor(stripeCount * 0.5 * qualityProfile.lineMult);
	const lines = generateRefractionLines(
		bounds,
		lineCount,
		settings.refractionIntensity,
		settings.randomSeed,
	);
	lines.forEach((l) => container.appendChild(l));

	// Layer 3: Blur Zones
	const zoneCount = qualityProfile.zones;
	const zones = generateBlurZones(
		bounds,
		zoneCount,
		settings.frosting,
		settings.randomSeed,
	);
	zones.forEach((z) => container.appendChild(z));

	// Composite settings
	container.blendMode = 'OVERLAY';
	container.opacity = settings.clarity / 100;

	return container;
}

// Layer 1: Displacement Stripes
function generateDisplacementStripes(
	bounds: { width: number; height: number },
	count: number,
	variation: number,
	seed: number,
): RectangleNode[] {
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
		const rect = figma.createRectangle();
		rect.x = stripe.x;
		rect.y = 0;
		rect.resize(Math.max(0.1, stripe.width), bounds.height);

		// White-to-transparent gradient (vertical)
		const opacityTop = 0.05 + random(seed + i * 2) * 0.15;
		const opacityMid = 0.15 + random(seed + i * 3) * 0.10;
		const opacityBot = 0.05 + random(seed + i * 4) * 0.15;

		rect.fills = [
			{
				type: 'GRADIENT_LINEAR',
				gradientTransform: [
					[1, 0, 0],
					[0, 1, 0],
				],
				gradientStops: [
					{ position: 0, color: { r: 1, g: 1, b: 1, a: opacityTop } },
					{ position: 0.5, color: { r: 1, g: 1, b: 1, a: opacityMid } },
					{ position: 1, color: { r: 1, g: 1, b: 1, a: opacityBot } },
				],
			},
		];

		return rect;
	});
}

// Layer 2: Refraction Lines
function generateRefractionLines(
	bounds: { width: number; height: number },
	count: number,
	intensity: number,
	seed: number,
): RectangleNode[] {
	const spacing = calculateFibonacciSpacing(count, bounds.width, seed);

	return spacing.map((x, i) => {
		const line = figma.createRectangle();
		const thickness = 1 + random(seed + i * 5) * 2; // 1-3px
		line.resize(thickness, bounds.height);
		line.x = x;
		line.y = 0;

		line.fills = [
			{
				type: 'SOLID',
				color: { r: 1, g: 1, b: 1 },
				opacity: (intensity / 100) * 0.1, // 0-0.1
			},
		];

		line.effects = [
			{
				type: 'BACKGROUND_BLUR',
				radius: 8,
				visible: true,
			},
		];

		return line;
	});
}

// Layer 3: Blur Zones
function generateBlurZones(
	bounds: { width: number; height: number },
	count: number,
	frosting: number,
	seed: number,
): RectangleNode[] {
	const zones: RectangleNode[] = [];

	for (let i = 0; i < count; i++) {
		const zone = figma.createRectangle();

		// Random size and position
		const width = bounds.width * (0.2 + random(seed + i * 6) * 0.3);
		const height = bounds.height * (0.3 + random(seed + i * 7) * 0.4);
		zone.resize(width, height);
		zone.x = random(seed + i * 8) * (bounds.width - width);
		zone.y = random(seed + i * 9) * (bounds.height - height);

		// Subtle white fill
		zone.fills = [
			{
				type: 'SOLID',
				color: { r: 1, g: 1, b: 1 },
				opacity: 0.03 + random(seed + i * 10) * 0.05,
			},
		];

		// Heavy blur for frosting
		zone.effects = [
			{
				type: 'BACKGROUND_BLUR',
				radius: (frosting / 100) * 40, // 0-40px
				visible: true,
			},
		];

		zones.push(zone);
	}

	return zones;
}

// Utility: Fibonacci-based spacing
function calculateFibonacciSpacing(
	count: number,
	totalWidth: number,
	seed: number,
): number[] {
	const positions: number[] = [];
	const phi = (1 + Math.sqrt(5)) / 2;

	for (let i = 0; i < count; i++) {
		// Use golden ratio for natural spacing
		const t = (i * phi) % 1;
		const x = t * totalWidth;
		positions.push(x);
	}

	return positions.sort((a, b) => a - b);
}

// Utility: Seeded random
function random(seed: number): number {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}
