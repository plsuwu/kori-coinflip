// this doesnt have to be super complex so we just fuck
const flipped = () => {
	return Math.random() > 0.5 ? 1 : 0;
};

// chains mutation observers to allow DOM changes to occur (e.g await popups) before trying to query nonexistent DOM elements
// could (and probably should) be refactored a reasonable amount
//
// this can be done via the GraphQL API but i dont think twitch would like that very much :)
export const predict = (pointsOnly: boolean = false) => {
	let stageDObserving: boolean = false;

	const res = new Promise((resolve, reject) => {
		const startA = (noObserve: boolean = false) => {
			// if the channel points popup is already visible, we call funcA() directly as we
			// won't trigger the observer if no DOM mutations are actually occurring
			const observerA = new MutationObserver((_) => {
				observerA.disconnect();
				funcA();
			});

			const funcA = () => {
				const channelPointsQuery = document.querySelector(
					'button[aria-label*="Click to learn how to earn more"]'
				) as HTMLButtonElement;

				if (channelPointsQuery) {
					const attr = channelPointsQuery.getAttribute('aria-label');
					const matched = attr?.match(/[0-9,]+/);
					const points = matched
						?.filter((val) => val != '')[0]
						.replace(/,/g, '');

					console.info('Channel points:', points);
					console.info('[+] A okay -> starting B');

					if (pointsOnly) {
						let close = document.querySelector(
							'button[aria-label="Close"]'
						) as HTMLButtonElement;
						if (close) {
							close.click();

							console.info(
								'[*] All stages executed without issue.'
							);
							return resolve(points);
						}
					}

					// backend prop drilling: pass point count const all the way down through the mutation observer chain
					startB(points as string); // points COULD be `<string | undefined>` here but SURELY this wont cause problems
				} else {
					reject(
						'Cannot find the required DOM element for Observer A.'
					);
				}
			};

			if (!noObserve) {
				// we might prefer to specifically observe the popup, but we work with document.body for now to avoid
				// adding too much upfront complexity
				// similarly, i dont think we have to configure observation for all of those options,
				// but it doesn't seem to be causing issues and i don't really know what they are lol
				observerA.observe(document.body, {
					childList: true,
					subtree: true,
					attributes: true,
				});
			} else {
				// start immediate if already mutated
				funcA();
			}
		};

		const startB = (channelPoints: string) => {
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
					startC(channelPoints);
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
		const startC = (channelPoints: string) => {
			const observerC = new MutationObserver((_) => {
				observerC.disconnect();

				// <button data-test-selector="prediction-checkout-active-footer__input-type-toggle"
				const customButton = document.querySelector(
					'button[data-test-selector*="prediction-checkout-active-footer"]'
				) as HTMLButtonElement;
				if (customButton) {
					customButton.click();

					console.info('[+] C okay -> starting D');
					startD(channelPoints);
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

		const startD = (channelPoints: string) => {
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
					input.value = channelPoints; // AHHHHHHHHHHH
					// input.value = '666'; // avoid gramble all my tob points while debugging

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
						resolve(channelPoints);
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
			reject('Cannot find channel points toggle popup button.');
		}

		const alreadyOpen = document.querySelector(
			'div[aria-labelledby="channel-points-reward-center-header"]'
		) as HTMLDivElement;

		console.log('BUTTONS ON SCREEN?: ', alreadyOpen, channelPointsButton);

		if (!alreadyOpen) {
			channelPointsButton.click();
		}

		startA(alreadyOpen ? true : false); // start the observer chain

		// we should be able to run the required functions in like, a handful
		// of seconds at most, if time to run > 10 seconds we reject and stop trying
		setTimeout(() => {
			reject(
				'(10 seconds elapsed since DOM interaction start) -> Timeout exceeded: DOM mutations expected to occur much faster :('
			);
		}, 10_000);
	});

	return res;
};

chrome.runtime.onMessage.addListener((req, _sender, next) => {
	if (req.action === 'get_points') {
		predict(true)
			.then((res) => {
                console.log('got res: ', res);
				next({ status: 'complete', channelPoints: res });
			})
			.catch((err) => {
				if (err.message !== 'document is not defined') {
					console.error('[-] Error in predict fn:', err);
					next({ status: 'error', message: err });
				}
			});
	}

	if (req.action === 'predict') {
		// delay DOM interaction so that the chat message can trigger the streamelements
		// function (or whatever happens on kori's backend idk)
		setTimeout(() => {
			predict()
				.then((res) => {
					next({ status: 'complete', channelPoints: res });
				})
				.catch((error) => {
					console.error('[-] Error in predict fn:', error);
					next({ status: 'error', message: error });
				});
		}, 1500);
	}

	return true;
});
