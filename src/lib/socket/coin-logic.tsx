import { createSignal } from 'solid-js';

// this doesnt have to be super complex so we just fuck
export const flipped = () => {
	return Math.random() > 0.5 ? 1 : 0;
};

const I_DEBUGGED_THIS_ON_TOBS_STREAM = 'CHAT GRAMBLE'; // idk what kori's break gramble is called, cleanup when break over!!

// chains mutation observers to allow DOM changes to occur (e.g await popups) before trying to query nonexistent DOM elements
// DESPERATELY needs optimization
export const predict = async () => {
	return new Promise((resolve, reject) => {
		// waits for the first DOM mutation (channel points popup) before querying
		// for clickable elements and performing clicks, then offloads to the next
		// handler to wait next mutations
		const startA = () => {
			const observerA = new MutationObserver((mutations) => {
				mutations.forEach((mut) => {
					if (mut.type === 'childList' || mut.type === 'attributes') {
						const channelPointsQuery = document.querySelector(
							'button[aria-label*="Click to learn how to earn more"]'
						) as HTMLButtonElement;

						if (channelPointsQuery) {
							const attr =
								channelPointsQuery.getAttribute('aria-label');
							const matched = attr?.match(/([0-9,]*)/g);
							const favors = matched?.[0].replace(/,/g, '');

							chrome.storage.local.set({ favors });

							observerA.disconnect();

							// prop drilling 2.0(tm): drill the mutation observer chain
							startB(favors as string);
						} else {
							reject(
								'[-] Cannot find the required DOM element for Observer A.'
							);
						}
					}
				});
			});

			observerA.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		};

		const startB = (favors: string) => {
			const observerB = new MutationObserver((mutations) => {
				mutations.forEach((mut) => {
					if (mut.type === 'childList' || mut.type === 'attributes') {
						const coinflipButton = document.querySelector(
							`p[title="${I_DEBUGGED_THIS_ON_TOBS_STREAM}"]`
						);

						if (coinflipButton) {
							const clickable = coinflipButton.closest('button');
							if (clickable) {
								clickable.click();

								observerB.disconnect();
								startC(favors);
							} else {
								reject(
									'[-] Cannot find the required DOM element (stage inner) for Observer B.'
								);
							}
						} else {
							reject(
								'[-] Cannot find the required DOM element (stage outer) for Observer B.'
							);
						}
					}
				});
			});

			observerB.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		};

		const startC = (favors: string) => {
			const observerC = new MutationObserver((mutations) => {
				mutations.forEach((mut) => {
					if (mut.type === 'childList' || mut.type === 'attributes') {
						// <button data-test-selector="prediction-checkout-active-footer__input-type-toggle"
						const customButton = document.querySelector(
							'button[data-test-selector*="prediction-checkout-active-footer"]'
						) as HTMLButtonElement;
						if (customButton) {
							customButton.click();

							observerC.disconnect();
							startD(favors);
						} else {
							reject(
								'[-] Cannot find the required DOM element for Observer C.'
							);
						}
					}
				});
			});

			observerC.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		};

		const startD = (favors: string) => {
			const observerD = new MutationObserver((mutations) => {
				mutations.forEach((mut) => {
					if (mut.type === 'childList' || mut.type === 'attributes') {
						// i think we are running some possibly insane, just completely fucked compute to bind this
						const outer = document.querySelectorAll(
							'div[class*="custom-prediction-button"]'
						);
						const side = outer[flipped()];

						console.log(outer, side);

						if (side) {
							const input = side.querySelector('input');
							if (input) {
								input.value = Number(favors).toString();
								// input event to display changed value in input field
								const event = new Event('input', {
									bubbles: true,
								});
								input.dispatchEvent(event);

								observerD.disconnect();
								resolve(favors);
							} else {
								reject(
									'[-] Cannot find the required DOM element (input stage) for Observer D.'
								);
							}
						} else {
							reject(
								'[-] Cannot find the required DOM element (side stage) for Observer D.'
							);
						}
					}
				});
			});

			observerD.observe(document.body, {
				childList: true,
				subtree: true,
				attributes: true,
			});
		};

		// grab the initial button to click from its aria-label attr
		const channelPointsButton = document.querySelector(
			'button[aria-label="Bits and Points Balances"]'
		) as HTMLButtonElement;

		if (!channelPointsButton) {
			return reject('[-] Cannot find channel points toggle button.');
		}
		channelPointsButton.click();
		startA(); // start the observer chain

		setTimeout(() => {
			reject(
				'[-] Timeout exceeded: DOM mutations expected to occur faster :('
			);
		}, 10000); // 10_000ms
	});
};

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
	if (req.action === 'predict') {
		predict()
			.then((res) => {
				sendResponse({ status: 'complete', favors: res });
				// chrome.storage.local.set({ favors: res }, () => {
				// });
			})
			.catch((error) => {
				console.error('[-] Error in predict:', error);
				sendResponse({ status: 'error', message: error.message });
			});

		// indicate that we will send a response asynchronously
		return true;
	}
});

// <button class="ScInteractableBase-sc-ofisyf-0 ScInteractableDefault-sc-ofisyf-1 dsnvLR etibmD tw-interactable"><div class="Layout-sc-1xcs6mc-0 dnxIGn predictions-list-item__body"><div class="InjectLayout-sc-1i43xsx-0 gQdfNm" style="background-color: rgb(56, 122, 255);"><div class="Layout-sc-1xcs6mc-0 ldtZWJ"><div class="ScFigure-sc-wkgzod-0 gCsoOa tw-svg"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M3 9c0-.621.08-1.223.233-1.796l1.122.441.654 1.663a5 5 0 1 0 5.3-5.299l-1.664-.654-.441-1.122a7 7 0 0 1 5.014 12.985L14 16a2 2 0 0 1 2 2H4a2 2 0 0 1 2-2l.782-.782A7 7 0 0 1 3 9z"></path><path d="M7.489 4.511 10 5.5l-2.511.989L6.5 9l-.989-2.511L3 5.5l2.511-.989L6.5 2l.989 2.511zM12 9l-1.435-.565L10 7l-.565 1.435L8 9l1.435.565L10 11l.565-1.435L12 9z"></path></svg></div></div></div><div class="Layout-sc-1xcs6mc-0 fWgWaP"><p title="CHAT GRAMBLE" data-test-selector="predictions-list-item__title" class="CoreText-sc-1txzju1-0 jkvzDO">CHAT GRAMBLE</p><p data-test-selector="predictions-list-item__subtitle" class="CoreText-sc-1txzju1-0 EBRKY">1:57 left to predict</p></div><div class="Layout-sc-1xcs6mc-0 gQJtcM"><div class="Layout-sc-1xcs6mc-0 xxjeD"><div class="Layout-sc-1xcs6mc-0 fNPBjU"><div class="Layout-sc-1xcs6mc-0 gfgICc channel-points-icon channel-points-icon--xsmall"><img class="channel-points-icon__image tw-image" alt="tob points" srcset="https://static-cdn.jtvnw.net/channel-points-icons/598826002/c9895682-6de0-4be9-98f8-b8210c907baf/icon-1.png 1x,https://static-cdn.jtvnw.net/channel-points-icons/598826002/c9895682-6de0-4be9-98f8-b8210c907baf/icon-2.png 2x,https://static-cdn.jtvnw.net/channel-points-icons/598826002/c9895682-6de0-4be9-98f8-b8210c907baf/icon-4.png 4x" src="https://static-cdn.jtvnw.net/channel-points-icons/598826002/c9895682-6de0-4be9-98f8-b8210c907baf/icon-1.png"></div></div><p data-test-selector="predictions-list-item__total-points" class="CoreText-sc-1txzju1-0 jkurzn">1</p></div><p class="CoreText-sc-1txzju1-0 predictions-list-item__subtitle" data-test-selector="predictions-list-item__points-subtitle">In the pool</p><div class="Layout-sc-1xcs6mc-0 cVmNmw predictions-list-item__outcomes"><div class="predictions-list-item__outcomes--bar" style="background-color: rgb(56, 122, 255); width: 100%; min-width: 3px;"></div></div></div></div></button>
// <div data-a-target="tw-core-button-label-text" class="Layout-sc-1xcs6mc-0 bFxzAY">Predict with Custom Amount</div>
// <input type="number" class="ScInputBase-sc-vu7u7d-0 ScInput-sc-19xfhag-0 iebopU fTyccL InjectLayout-sc-1i43xsx-0 eRDdjS tw-input" autocapitalize="off" autocorrect="off" data-a-target="tw-input" value="">
//
// <button>
//      <div class="InjectLayout-sc-1i43xsx-0 custom-prediction-button__interactive jpJwfP" style="background-color: rgb(56, 122, 255); border-color: rgb(56, 122, 255); color: rgb(255, 255, 255);">
//          <p class="CoreText-sc-1txzju1-0 kZSndW">
//              Vote
//          </p>
//      </div>
// </button>
