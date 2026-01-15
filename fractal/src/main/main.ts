import { showUI } from '@create-figma-plugin/utilities';
import { generateEffect, getDefaultSettings } from './effectGenerator';
import type { GlassSettings } from './effectGenerator';

export default function main() {
	showUI({ width: 320, height: 500 });

	// Send initial selection state
	postSelectionState();

	// Keep UI in sync with selection changes
	figma.on('selectionchange', () => {
		postSelectionState();
	});

	figma.ui.onmessage = (msg: { type: string; settings?: GlassSettings }) => {
		if (msg.type === 'apply-effect') {
			const selection = figma.currentPage.selection;

			if (selection.length === 0) {
				figma.ui.postMessage({
					type: 'error',
					message: 'Please select a layer to apply the effect',
				});
				return;
			}

			const targetNode = selection[0];

			if (targetNode.type !== 'FRAME' && targetNode.type !== 'GROUP') {
				figma.ui.postMessage({
					type: 'error',
					message: 'Effect can only be applied to frames or groups',
				});
				return;
			}

			const settings = msg.settings ?? getDefaultSettings();

			try {
				const group = generateEffect(targetNode, settings);
				// Position over target
				if ('x' in targetNode && 'y' in targetNode) {
					group.x = targetNode.x;
					group.y = targetNode.y;
				}

				figma.ui.postMessage({
					type: 'success',
					message: 'Effect applied! Press Cmd/Ctrl+Z to undo.',
				});
			} catch (error) {
				figma.ui.postMessage({
					type: 'error',
					message: `Error applying effect: ${error instanceof Error ? error.message : 'Unknown error'
						}`,
				});
			}
		}
	};
}

function postSelectionState() {
	const hasSelection = figma.currentPage.selection.length > 0;

	// Send selection state immediately
	figma.ui.postMessage({
		type: 'selection-changed',
		hasSelection,
	});

	// Export preview image asynchronously (don't block)
	if (hasSelection) {
		const node = figma.currentPage.selection[0];
		if ('exportAsync' in node) {
			node.exportAsync({
				format: 'PNG',
				constraint: { type: 'SCALE', value: 0.5 },
			}).then(imageBytes => {
				// Convert to base64 using Figma's built-in function
				const base64 = figma.base64Encode(imageBytes);
				figma.ui.postMessage({
					type: 'preview-image',
					previewImage: base64,
				});
			}).catch(error => {
				console.error('Failed to export preview:', error);
			});
		}
	}
}
