// Core effect generation for Fractal Glass
// Creates vertical stripe gradients and optional blur overlay

export interface RGB {
	r: number;
	g: number;
	b: number;
	a?: number;
}

export type WidthMode = 'uniform' | 'random';

export interface BlurLayer {
	radius: number;
	opacity: number; // 0-100
}

export type QualityMode = 'draft' | 'standard' | 'high';
export type ColorMode = 'custom' | 'extract';

export interface EffectSettings {
	// Pattern
	stripeCount: number;
	stripeWidthMode: WidthMode;
	widthVariation: number; // 0-100
	gradientOffset: number; // 0-100

	// Color
	colorMode: ColorMode;
	palette: RGB[];

	// Glass
	blurLayers: BlurLayer[];
	blendMode: BlendMode;
	opacity: number; // 0-100

	// Performance
	quality: QualityMode;
	randomSeed: number;
}

// Default settings aligned with PRD/TRD concepts (simplified MVP)
export function getDefaultSettings(): EffectSettings {
	return {
		stripeCount: 80,
		stripeWidthMode: 'uniform',
		widthVariation: 20,
		gradientOffset: 0,
		colorMode: 'custom',
		palette: [
			{ r: 0.4, g: 0.3, b: 0.9, a: 1 },
			{ r: 0.2, g: 0.6, b: 1, a: 1 },
			{ r: 0, g: 0.8, b: 0.6, a: 1 },
		],
		blurLayers: [
			{ radius: 20, opacity: 80 },
			{ radius: 40, opacity: 40 },
		],
		blendMode: 'OVERLAY',
		opacity: 70,
		quality: 'standard',
		randomSeed: Date.now(),
	};
}

export async function generateEffect(
	targetNode: SceneNode,
	settings: EffectSettings,
): Promise<GroupNode> {
	// Get bounds from the target node
	const bounds = {
		width: 'width' in targetNode ? targetNode.width : 0,
		height: 'height' in targetNode ? targetNode.height : 0,
		x: 'x' in targetNode ? targetNode.x : 0,
		y: 'y' in targetNode ? targetNode.y : 0,
	};

	// Apply simple quality-based overrides
	const qualityProfile =
		settings.quality === 'draft'
			? { stripes: 40, blurScale: 0.7 }
			: settings.quality === 'high'
			? { stripes: 140, blurScale: 1.3 }
			: { stripes: 80, blurScale: 1.0 };

	const stripeCount = Math.max(
		4,
		Math.floor(settings.stripeCount || qualityProfile.stripes),
	);
	const frame = figma.createFrame();
	frame.name = 'Fractal Glass Effect';
	frame.resize(bounds.width, bounds.height);
	frame.x = bounds.x;
	frame.y = bounds.y;
	frame.fills = [];

	// Compute stripes across the width
	const stripes: { x: number; width: number }[] = [];
	const baseWidth = bounds.width / stripeCount;
	let currentX = 0;

	for (let i = 0; i < stripeCount; i++) {
		let width = baseWidth;

		if (settings.stripeWidthMode === 'random' && settings.widthVariation > 0) {
			const variation =
				(random(settings.randomSeed + i) - 0.5) *
				(settings.widthVariation / 100) *
				2; // -1..1 scaled by variation
			width = baseWidth * (1 + variation);
		}

		stripes.push({ x: currentX, width });
		currentX += width;
	}

	// Normalize stripes to fit exactly into the frame width
	const scale = bounds.width / currentX;
	for (const stripe of stripes) {
		stripe.x *= scale;
		stripe.width *= scale;
	}

	// Choose palette: either preset/custom or extracted from target
	const basePalette =
		settings.colorMode === 'extract'
			? extractPaletteFromNode(targetNode) ?? settings.palette
			: settings.palette;

	const palette = basePalette.length ? basePalette : getDefaultSettings().palette;

	for (let i = 0; i < stripes.length; i++) {
		const stripe = stripes[i];

		const t0 =
			((i / Math.max(1, stripes.length - 1)) +
				settings.gradientOffset / 100) %
			1;
		const t1 = (t0 + 0.25) % 1;

		const colorStart = samplePalette(palette, t0);
		const colorEnd = samplePalette(palette, t1);

		const rect = figma.createRectangle();
		rect.x = stripe.x;
		rect.y = 0;
		rect.resize(stripe.width, bounds.height);

		const gradientFill: GradientPaint = {
			type: 'GRADIENT_LINEAR',
			gradientTransform: [
				[1, 0, 0],
				[0, 1, 0],
			],
			gradientStops: [
				{
					position: 0,
					color: {
						r: colorStart.r,
						g: colorStart.g,
						b: colorStart.b,
						a: colorStart.a ?? 1,
					},
				},
				{
					position: 1,
					color: {
						r: colorEnd.r,
						g: colorEnd.g,
						b: colorEnd.b,
						a: colorEnd.a ?? 1,
					},
				},
			],
		};

		rect.fills = [gradientFill];
		frame.appendChild(rect);
	}

	// If blurLayers specified, create grouped blur overlay
	let resultGroup: GroupNode;
	if (settings.blurLayers.length > 0) {
		const group = figma.group([], figma.currentPage);

		// Base (no blur)
		const baseClone = frame.clone();
		group.appendChild(baseClone);

		for (const layer of settings.blurLayers) {
			if (layer.opacity <= 0) continue;
			const clone = frame.clone();
			clone.effects = [
				{
					type: 'LAYER_BLUR',
					blurType: 'NORMAL',
					radius: layer.radius * qualityProfile.blurScale,
					visible: true,
				},
			];
			clone.opacity = layer.opacity / 100;
			group.appendChild(clone);
		}

		resultGroup = group;
	} else {
		resultGroup = figma.group([frame], figma.currentPage);
	}

	resultGroup.blendMode = settings.blendMode;
	resultGroup.opacity = settings.opacity / 100;

	return resultGroup;
}

function samplePalette(palette: RGB[], t: number): RGB {
	if (palette.length === 1) return palette[0];
	const clamped = Math.max(0, Math.min(1, t));
	const scaled = clamped * (palette.length - 1);
	const i = Math.floor(scaled);
	const j = Math.min(i + 1, palette.length - 1);
	const localT = scaled - i;
	const c1 = palette[i];
	const c2 = palette[j];
	return {
		r: lerp(c1.r, c2.r, localT),
		g: lerp(c1.g, c2.g, localT),
		b: lerp(c1.b, c2.b, localT),
		a: lerp(c1.a ?? 1, c2.a ?? 1, localT),
	};
}

function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

function random(seed: number): number {
	// Simple deterministic pseudo-random generator (0..1)
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

function extractPaletteFromNode(node: SceneNode): RGB[] | null {
	// Very small, cheap extraction: sample solid fills on the node itself
	if ('fills' in node) {
		const fills = node.fills;
		if (Array.isArray(fills)) {
			const colors: RGB[] = [];
			for (const fill of fills) {
				if (fill.type === 'SOLID') {
					colors.push({
						r: fill.color.r,
						g: fill.color.g,
						b: fill.color.b,
						a: 'opacity' in fill ? fill.opacity ?? 1 : 1,
					});
				}
			}
			if (colors.length) return colors;
		}
	}

	// If selection is a frame/group, also try immediate children
	if ('children' in node) {
		for (const child of node.children) {
			const childPalette = extractPaletteFromNode(child as SceneNode);
			if (childPalette && childPalette.length) return childPalette;
		}
	}

	return null;
}


