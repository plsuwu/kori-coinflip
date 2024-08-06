import { createSignal } from 'solid-js';

export const [predict, setPredict] = createSignal<number | undefined>(undefined);

// this doesnt have to be super complex so we just fuck
export const flipped = () => {
	// should either be undefined, 0, 1, or 2
	const result = chrome.storage.local.get(['prediction'], (res) => {
		const preset = res.prediction;

		// undefined or set to 'random' (preset === 2)
		if (preset === undefined || preset > 1) {
			setPredict(Math.random() >= 0.5 ? 1 : 0);
		}

		// set to always predict heads (0) or tails (1), so we can
		// directly return that value.
		setPredict(preset);
	});

	return result;
};
