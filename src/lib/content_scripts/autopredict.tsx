// this doesnt have to be super complex so we just fuck
const flipped = () => {
	return Math.random() > 0.5 ? 1 : 0;
};

// chains mutation observers to allow DOM changes to occur (e.g await popups) before trying to query nonexistent DOM elements
// could (and probably should) be refactored a reasonable amount
export const predict = () => {
	let stageDObserving: boolean = false;

	const res = new Promise((resolve, reject) => {
		const startA = () => {
			const observerA = new MutationObserver((_) => {
				observerA.disconnect();

				const channelPointsQuery = document.querySelector(
					'button[aria-label*="Click to learn how to earn more"]'
				) as HTMLButtonElement;

				if (channelPointsQuery) {
					const attr = channelPointsQuery.getAttribute('aria-label');
					const matched = attr?.match(/[0-9,]+/);
					const points = matched
						?.filter((val) => val != '')[0]
						.replace(/,/g, '');

					console.info('[+] A okay -> starting B');

					// prop drilling 2.0(tm): drill the points count down through the mutation observer chain
					startB(points as string); // points COULD be `<string | undefined>` here but SURELY this wont cause problems
				} else {
					reject(
						'Cannot find the required DOM element for Observer A.'
					);
				}
			});

			// we might prefer to specifically observe the popup, but we work with document.body for now to avoid
			// adding too much complexity similarly, i dont think we have to configure observation for all of those options,
			// but it doesn't seem to be causing issues
			observerA.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		};

		const startB = (favors: string) => {
			const observerB = new MutationObserver((_mutations) => {
				const coinflipButton = document
					.querySelector(
						'p[data-test-selector="predictions-list-item__title"]'
					)
					?.closest('button');

				if (coinflipButton) {
					coinflipButton.click();
					observerB.disconnect();

					console.info('[+] B okay -> starting C');
					startC(favors);
				} else {
					// failing here means there is likely no current or recent predictions
					observerB.disconnect();
					reject(
						'Cannot find the required DOM element (stage outer) for Observer B (no current OR recent predictions to toggle?)'
					);
				}
			});

			observerB.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		};

		// failing here likely means that there WAS a prediction, but the gramble period has ended
		const startC = (favors: string) => {
			const observerC = new MutationObserver((_) => {
				observerC.disconnect();

				// <button data-test-selector="prediction-checkout-active-footer__input-type-toggle"
				const customButton = document.querySelector(
					'button[data-test-selector*="prediction-checkout-active-footer"]'
				) as HTMLButtonElement;
				if (customButton) {
					customButton.click();

					console.info('[+] C okay -> starting D');
					startD(favors);
				} else {
					reject(
						'Cannot find the required DOM element for Observer C (did we miss the coinflip cutoff?)'
					);
				}
			});

			observerC.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		};

		const startD = (favors: string) => {
			// i think this is fixed and so this guard shouldn't be needed anymore
			if (stageDObserving) {
				console.warn(
					'[x] Tried to start another stage D while we were already observing the DOM.'
				);
				return;
			}

			const observerD = new MutationObserver((_) => {
				observerD.disconnect();
				const outer = document.querySelectorAll(
					'div[class*="custom-prediction-button"]:not([class*="custom-prediction-button__interactive"])'
				);
				const vote = document.querySelectorAll(
					'div[class*="custom-prediction-button__interactive"]'
				);

				const random = flipped();
				const input = outer[random].querySelector(
					'input'
				) as HTMLInputElement;
				const voteButton = vote[random].closest(
					'button'
				) as HTMLButtonElement;

				if (input && voteButton) {
					// input.value = favors; // AHHHHHHHHHHH
					input.value = '666'; // avoid gramble all my tob points while debugging

					const ev = new Event('input', {
						bubbles: true,
					});

					input.dispatchEvent(ev);
					voteButton.click();

					let close = document.querySelector(
						'button[aria-label="Close"]'
					) as HTMLButtonElement;
					if (close) {
						close.click();

						console.info('[*] All stages executed without issue.');
						resolve(favors);
					}
				} else {
					if (!input) {
						reject(
							'Cannot find the required DOM elements (input field) for Observer D.'
						);
					}

					if (!voteButton) {
						reject(
							'Cannot find the required DOM elements (vote button) for Observer D.'
						);
					}
				}
			});

			stageDObserving = true;
			observerD.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		};

		const channelPointsButton = document.querySelector(
			'button[aria-label="Bits and Points Balances"]'
		) as HTMLButtonElement;

		if (!channelPointsButton) {
			// guard by returning the rejection
			return reject('Cannot find channel points toggle popup button.');
		}

		channelPointsButton.click();
		startA(); // start the observer chain

		// we should be able to run the required functions in like, a handful
        // of seconds at most
		setTimeout(() => {
			reject(
				'Timeout exceeded: DOM mutations expected to occur much faster :('
			);
		}, 10_000);
	});

	return res;
};

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
	if (req.action === 'predict') {
		predict()
			.then((res) => {
				sendResponse({ status: 'complete', favors: res });
			})
			.catch((error) => {
				console.error('[-] Error in predict fn:', error);
				sendResponse({ status: 'error', message: error });
			});
	}

	return true;
});
