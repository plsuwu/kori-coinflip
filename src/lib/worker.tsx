import { createSignal } from 'solid-js';
import { validate, revoke } from './socket/requests';

export interface UserInfo {
	client_id: string;
	expires_in: number;
	login: string;
	scopes: string[];
	user_id: string;
}

chrome.runtime.onInstalled.addListener(() => {
	// on extension install, clear any existing data and re-init
	chrome.storage.local.clear();
	chrome.storage.local.set({ enabled: false });
});

export const gramble = async () => {
	chrome.tabs.query({}, (tabs) => {
		tabs.forEach((t) => {
			if (t.url === 'https://www.twitch.tv/tobs') {
				console.log('[+] Kori tab found:', t);

				if (!t.id) {
					console.error("[!] Unable to fetch the ID of Kori's tab.");
					return;
				}

				chrome.tabs.sendMessage(t.id, { action: 'predict' }, (res) => {
					if (chrome.runtime.lastError) {
						console.error('Error sending message:', chrome.runtime.lastError);
						return;
					}

					if (res.status === 'complete') {
						console.log('[+] Gramble observer chain completed without issue.');
						return;
					} else if (res.status === 'error') {
						console.error(
							'[-] Gramble observer chain encountered an issue and returned without completing:',
							res.message
						);
						return;
					} else {
						console.error(
							'[-] Idk what happened but we fell all the way through (maybe cry about it).'
						);
						return;
					}
				});
			}
		});
	});
};

chrome.storage.onChanged.addListener((changes, loc) => {
	if (loc === 'local') {
		// if the `enabled` state is changed
		// if (changes.enabled) {
		// 	if (changes.enabled.newValue) {
		// 		// enabled => start a websocket client
		// 		console.log('[+] Ext. enabled, activate worker tasks:');
		// 		const nick = nickname();
		// 		const token = oauth();
		//
		// 		console.log(token, nick);
		//
		// 		const auth = {
		// 			user_info: nickname() as UserInfo,
		// 			token: oauth(),
		// 		};
		//
		// 	} else {
		// 		// disabled => kill any active websocket clients
		// 		console.log('[-] Ext. disabled, kill worker tasks:');
		// 	}
		// }
		// // if the user's auth state changes
		// if (changes.oauth_token) {
		// 	chrome.storage.local.get(['oauth_token'], (result) => {
		// 		// create an `Authorization: OAuth <token>` string to send to twitch's validation uri
		// 		// so that we can validate the fetched token: https://dev.twitch.tv/docs/authentication/validate-tokens/
		//
		// 		// make sure the change isnt triggered from a localdata clearing fn prior to making a validation attempt
		// 		if (result.oauth_token) {
		// 			const token_string = `OAuth ${result.oauth_token}`;
		// 			validate(token_string);
		//
		// 			setOauth(result.oauth_token);
		// 		}
		// 	});
		// }
		//
		// if (changes.user_info) {
		// 	// DEBUG: pull the localstorage `user_info` json data to check that it exists.
		// 	chrome.storage.local.get(['user_info'], (result) => {
		// 		console.log(
		// 			'[debug] Changed `user_info`, now set to:',
		// 			result.user_info,
		// 			oauth()
		// 		);
		//
		// 		if (result.user_info === undefined && oauth() !== undefined) {
		// 			revoke(oauth());
		// 		} else if (result.user_info) {
		// 			setNickname(result.user_info);
		// 		}
		// 	});
		// }
		//
		if (changes.favors) {
			chrome.storage.local.get(['favors'], (result) => {
				console.log('[+] Changed favors:', result.favors);
			});
		}
	}
});

chrome.runtime.onMessage.addListener((message, sender, sendRes) => {
	if (message.action === 'RETRIEVE_INIT') {
		// process data...
	}
	// if (msg.type === 'STATE_UPDATED') {
	// }
});
