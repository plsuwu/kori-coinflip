import { createSignal } from 'solid-js';
import { openWebsocket, closeWebsocket } from './socket/socket';

const VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';
const REVOKE_URL = 'https://id.twitch.tv/oauth2/revoke';
const CLIENT_ID = 'hzjlx3hy3h0f863czefkivrlfs3f6a';

export interface UserInfo {
	client_id: string;
	expires_in: number;
	login: string;
	scopes: string[];
	user_id: string;
}

export const [oauth, setOauth] = createSignal<string>('');
export const [nickname, setNickname] = createSignal<UserInfo | string>('');

chrome.runtime.onInstalled.addListener(() => {
	// if `enabled` is undefined in localstorage, init with `false`
	chrome.storage.local.get(['enabled'], (res) => {
		if (res.enabled == null) {
			chrome.storage.local.set({ enabled: false });
		} else if (res.enabled) {
			const auth = { user_info: nickname() as UserInfo, token: oauth() };
			openWebsocket(auth);
		}
	});
});

export const revoke = async (token: string) => {
	// curl -X POST 'https://id.twitch.tv/oauth2/revoke' \
	// -H 'Content-Type: application/x-www-form-urlencoded' \
	// -d 'client_id=<client id goes here>&token=<access token goes here>'

	let revoked = await fetch(REVOKE_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: new URLSearchParams({
			client_id: CLIENT_ID,
			token: token,
		}),
	});

	console.log('[-] Attempting to revoke token: ', token);

	const res = revoked; // double defl llmao
	if (revoked.status !== 200) {
		console.log('[-] There was an issue revoking an access token:', res);

		return;
	}

	console.log('[+] Successfully revoked access token: ', res);
	return;
};

// nested function to get a validation state.
// for some reason this doesn't work from the UI..?
export const verify = async (token: string) => {
	let v = await fetch(VALIDATE_URL, {
		headers: {
			Authorization: token,
		},
	});

	if (v.status !== 200) {
		// clear storage, return ...
		console.log('[-] Invalid OAuth, need to re-log.');
		chrome.storage.local.set({ valid: false });

		return;
	}

	const data = await v.json();

	console.log('verification:', data);
	chrome.storage.local.set({ user_info: data, valid: true });
};

export const debugClicker = async () => {
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((t) => {
			if (t.url === 'https://www.twitch.tv/kori') {
				console.log('[*] kori tab found:', t);

				if (!t.id) {
					console.error(
						"[?] Found a kori tab but the tab's id could not be found."
					);
					return;
				}

				chrome.tabs.sendMessage(t.id, { action: 'predict' }, (res) => {
					if (chrome.runtime.lastError) {
						console.error(
							'Error sending message:',
							chrome.runtime.lastError
						);
						return;
					}

					if (res.status === 'complete') {
						chrome.storage.local.get(['favors'], (result) => {
							console.log('Favors:', result.favors);
						});
					} else if (res.status === 'error') {
						console.error('Predict error:', res.message);
					}
				});
			}
		});
	});
};

chrome.action.onClicked.addListener((tab) => {
	if (!tab.id) {
		console.error('[?] No tab valid tab id found');
		return;
	}

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		files: ['coin-logic.tsx'],
	});
});

chrome.storage.onChanged.addListener((changes, loc) => {
	if (loc === 'local') {
		// if the `enabled` state is changed
		if (changes.enabled) {
			if (changes.enabled.newValue) {
				// enabled => start a websocket client
				console.log('[+] Ext. enabled, activate worker tasks:');
				const nick = nickname();
				const token = oauth();

				console.log(token, nick);

				const auth = {
					user_info: nickname() as UserInfo,
					token: oauth(),
				};
				openWebsocket(auth);
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

				// make sure the change isnt trigged from a localdata clearing fn prior to making a validation attempt
				if (result.oauth_token) {
					const token_string = `OAuth ${result.oauth_token}`;
					verify(token_string);

					setOauth(result.oauth_token);
				}
			});
		}

		if (changes.user_info) {
			// DEBUG: pull the localstorage `user_info` json data to check that it exists.
			chrome.storage.local.get(['user_info'], (result) => {
				console.log(
					'[debug] Changed `user_info`, now set to:',
					result.user_info,
					oauth()
				);

				if (result.user_info === undefined && oauth() !== undefined) {
					revoke(oauth());
				} else if (result.user_info) {
					setNickname(result.user_info);
				}
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
