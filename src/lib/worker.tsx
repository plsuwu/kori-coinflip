import { NICK, PASS, JOIN } from './socket/debug';
import { openWebsocket, closeWebsocket } from './socket/socket';

const VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';

chrome.runtime.onInstalled.addListener(() => {
    // if `enabled` is undefined in localstorage, init with `false`
	chrome.storage.local.get(['enabled'], (res) => {
		if (res.enabled === undefined) {
			chrome.storage.local.set({ enabled: false });
		} else if (res.enabled) {
			openWebsocket();
		}
	});
});

chrome.storage.onChanged.addListener((changes, loc) => {
	if (loc === 'local') {
		// if the `enabled` state is changed
		if (changes.enabled) {
			if (changes.enabled.newValue) {

				// enabled => start a websocket client
				console.log('[+] Ext. enabled, activate worker tasks:');
				openWebsocket();
			} else {

				// disabled => kill any active websocket clients
				console.log('[-] Ext. disabled, kill worker tasks:');
				closeWebsocket();
			}
		}
		// if the user's auth state changes
		if (changes.oauth_token) {
			chrome.storage.local.get(['oauth_token'], (result) => {

				// create an `Authorization: OAuth <token>` string to send to twitch's validation uri
                // so that we can validate the fetched token: https://dev.twitch.tv/docs/authentication/validate-tokens/
				const token_string = `OAuth ${result.oauth_token}`;

				// nested function to get a validation state.
				// for some reason this doesn't work from the UI..?
				const verify = async () => {
					let v = await fetch(VALIDATE_URL, {
						headers: {
							Authorization: token_string,
						},
					});

					const data = await v.json();

					console.log('verification:', data);
					chrome.storage.local.set({ user_info: data });
				};

				// make sure the change isnt trigged from a localdata clearing fn prior to making a validation attempt
				if (result.oauth_token) {
					verify();
				}
			});

            // DEBUG: pull the localstorage `user_info` json data to check that it exists.
			chrome.storage.local.get(['user_info'], (result) => {
				console.log('[debug] Changed `user_info`, now set to:', result.user_info);
			});
		}
	}
});

// chrome.runtime.onMessage.addListener((msg, sender, sendRes) => {
// 	if (msg.type === 'STATE_UPDATED') {
// 		if (msg.enabled) {
// 			openWebsocket();
// 		} else {
// 			closeWebsocket();
// 		}
// 	}
// });
