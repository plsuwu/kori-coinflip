import { createSignal } from 'solid-js';
import { NICK, PASS, JOIN } from './socket/debug';
import { openWebsocket, closeWebsocket } from './socket/socket';

const VALIDATE_URL = 'https://id.twitch.tv/oauth2/validate';
const REVOKE_URL = 'https://id.twitch.tv/oauth2/revoke';
const CLIENT_ID = 'hzjlx3hy3h0f863czefkivrlfs3f6a';

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

const [oauth, setOauth] = createSignal<string>('');

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

	const res = revoked;
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
					result.user_info, oauth()
                );

                if (result.user_info === undefined && oauth() !== undefined) {
                    revoke(oauth());
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
