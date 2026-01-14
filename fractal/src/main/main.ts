import { generateEffect, getDefaultSettings, type EffectSettings } from './effectGenerator';

export default function () {
	figma.showUI(__html__, { width: 320, height: 500, themeColors: true });

	// Send initial selection state
	postSelectionState();

	// Keep UI in sync with selection changes
	figma.on('selectionchange', () => {
		postSelectionState();
	});

	figma.ui.onmessage = async (msg: { type: string; settings?: EffectSettings }) => {
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

			try {
				const settings = msg.settings ?? getDefaultSettings();

				const group = await generateEffect(targetNode, settings);

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
					message: `Error applying effect: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`,
				});
			}
		}
	};
}

function postSelectionState() {
	const hasSelection = figma.currentPage.selection.length > 0;
	figma.ui.postMessage({
		type: 'selection-changed',
		hasSelection,
	});
}

